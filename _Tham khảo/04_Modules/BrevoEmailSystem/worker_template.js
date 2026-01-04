import { corsHeaders } from '../utils/cors';

export async function handleAuthWebhook(request, env) {
    // 1. Verify Environment Variables
    if (!env.BREVO_API_KEY) {
        console.error('Missing BREVO_API_KEY');
        return new Response(JSON.stringify({ error: 'Config error' }), { status: 500, headers: corsHeaders });
    }

    try {
        const payload = await request.json();

        // Basic validation for Supabase Auth Webhook (INSERT to auth.users)
        if (payload.type !== 'INSERT' || !payload.record || !payload.record.email) {
            return new Response(JSON.stringify({ status: 'Ignored' }), { headers: corsHeaders });
        }

        const userEmail = payload.record.email;
        const meta = payload.record.raw_user_meta_data || {};
        const fullName = meta.full_name || userEmail.split('@')[0];
        const userName = meta.username || fullName;
        const phone = meta.phone || '';
        const referralCode = meta.referral_code || '';
        const appOrigin = meta.app_origin || 'yt-tracker'; // 'yt-tracker' or 'aicreative'

        // 2. Select Template based on Origin
        let emailData = {
            sender: {
                name: env.BREVO_SENDER_NAME || 'Ksmart Ecosystem',
                email: env.BREVO_SENDER_EMAIL || 'no-reply@ksmart.com.es',
            },
            to: [{ email: userEmail, name: fullName }]
        };

        // CUSTOMIZE YOUR TEMPLATES HERE
        if (appOrigin === 'aicreative') {
            emailData.subject = 'Chào mừng bạn đến với AI Creative! 🎨';
            emailData.htmlContent = `
                <div style="font-family: sans-serif;">
                    <h1>Chào ${userName}!</h1>
                    <p>Cảm ơn bạn đã tham gia hệ sinh thái sáng tạo AI Creative.</p>
                    <p>Hãy bắt đầu tạo những thiết kế Poster và Video đầu tiên của bạn nhé.</p>
                </div>
            `;
        } else if (appOrigin === 'yt-tracker') {
            emailData.subject = 'Chào mừng tới YT Tracker - Ksmart Ecosystem 🚀';
            emailData.htmlContent = `
                <div style="font-family: sans-serif;">
                    <h1>Chào ${userName}!</h1>
                    <p>Tài khoản Ksmart của bạn đã sẵn sàng để tối ưu kênh YouTube.</p>
                    <p>Hệ thống đang bắt đầu phân tích dữ liệu cho bạn.</p>
                </div>
            `;
        } else {
            // Generic Template
            emailData.subject = 'Chào mừng bạn đến với Ksmart Ecosystem! 🌟';
            emailData.htmlContent = `<h1>Chào mừng ${userName}!</h1><p>Chúng tôi rất vui vì bạn đã tham gia.</p>`;
        }

        // 3. Send via Brevo API
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': env.BREVO_API_KEY,
                'content-type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Brevo Error:', error);
            return new Response(JSON.stringify({ error: 'Mail delivery failed' }), { status: 502, headers: corsHeaders });
        }

        // 4. Sync to Brevo Contacts (Optional)
        // Ensure you have Lists created in Brevo with these IDs
        const listIds = appOrigin === 'app-2' ? [3] : [2];

        try {
            await fetch('https://api.brevo.com/v3/contacts', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': env.BREVO_API_KEY,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    attributes: {
                        FULLNAME: fullName,
                        USERNAME: userName,
                        PHONE: phone,
                        REFERRAL: referralCode,
                        ORIGIN: appOrigin.toUpperCase()
                    },
                    listIds: listIds,
                    updateEnabled: true
                }),
            });
        } catch (contactErr) {
            console.warn('Contact sync failed:', contactErr);
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

    } catch (err) {
        console.error('Webhook Error:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
}
