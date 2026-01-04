// 1. In your supabase.js or auth helper file

/**
 * Enhanced Sign Up function supporting Ksmart Ecosystem & Multi-Flow Origins
 * @param {string} email 
 * @param {string} password 
 * @param {object} userData - { fullName, username, phone, referralCode }
 * @param {string} appOrigin - The identifier for the app (e.g., 'yt-tracker', 'aicreative')
 */
export const signUp = async (email, password, userData, appOrigin = 'yt-tracker') => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: userData.fullName,
                username: userData.username,
                phone: userData.phone,
                referral_code: userData.referralCode,
                // Critical: This metadata tells the backend which email template to use
                app_origin: appOrigin
            },
        },
    });
    return { data, error };
};

// 2. Usage in Register Component
/*
import { signUp } from '../lib/supabase';

const handleRegister = async () => {
    // ...
    const { error } = await signUp(
        email, 
        password, 
        fullName, 
        'youtube-tracker' // <-- Pass your specific App Origin here
    );
    // ...
}
*/
