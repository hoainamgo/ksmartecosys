
/**
 * AUTHENTICATION LOGIC
 * Handles Sign Up, Sign In, and Modal Interactions
 */

function initAuth() {

    // --- 1. MODAL CONTROLS ---
    const authModal = document.getElementById('auth-modal');
    const modalTitle = document.getElementById('modal-title');
    const authForm = document.getElementById('auth-form');
    const nameField = document.getElementById('field-fullname');
    const phoneField = document.getElementById('field-phone');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchModeBtn = document.getElementById('auth-switch-mode');
    const closeModalBtn = document.querySelector('.close-modal');

    let isSignUpMode = true;

    // Attach Event Listeners to Header Buttons (delegated or direct)
    document.body.addEventListener('click', (e) => {
        // Handle "Join" or "Register" clicks -> Open Sign Up
        if (e.target.dataset.i18n === 'nav_register' ||
            e.target.dataset.i18n === 'nav_join' ||
            e.target.closest('[data-i18n="nav_register"]') ||
            e.target.closest('[data-i18n="nav_join"]')) {
            e.preventDefault();
            openModal(true); // Open in Sign Up mode
        }

        // Handle "Login" click -> Open Sign In
        if (e.target.dataset.i18n === 'nav_login' || e.target.closest('[data-i18n="nav_login"]')) {
            e.preventDefault();
            openModal(false); // Open in Login mode
        }
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    if (window) {
        window.onclick = function (event) {
            if (event.target == authModal) {
                authModal.style.display = "none";
            }
        }
    }

    if (switchModeBtn) {
        switchModeBtn.addEventListener('click', () => {
            openModal(!isSignUpMode);
        });
    }

    const usernameField = document.getElementById('field-username');
    const referralField = document.getElementById('field-referral');
    const termsField = document.getElementById('field-terms');

    function openModal(signUp) {
        isSignUpMode = signUp;
        if (authModal) authModal.style.display = 'flex';

        if (isSignUpMode) {
            modalTitle.textContent = 'Đăng ký Tài khoản';
            nameField.style.display = 'block';
            usernameField.style.display = 'block';
            phoneField.style.display = 'block';
            referralField.style.display = 'block';
            termsField.style.display = 'flex';

            submitBtn.textContent = 'Đăng ký Ngay';
            switchModeBtn.innerHTML = 'Đã có tài khoản? <span class="text-gold">Đăng nhập</span>';

            // Required inputs
            document.getElementById('input-fullname').required = true;
            document.getElementById('input-phone').required = true;
            document.getElementById('input-username').required = true;
            document.getElementById('input-terms').required = true;
        } else {
            modalTitle.textContent = 'Đăng nhập Hệ thống';
            nameField.style.display = 'none';
            usernameField.style.display = 'none';
            phoneField.style.display = 'none';
            referralField.style.display = 'none';
            termsField.style.display = 'none';

            submitBtn.textContent = 'Đăng nhập';
            switchModeBtn.innerHTML = 'Chưa có tài khoản? <span class="text-gold">Đăng ký</span>';

            // Remove required
            document.getElementById('input-fullname').required = false;
            document.getElementById('input-phone').required = false;
            document.getElementById('input-username').required = false;
            document.getElementById('input-terms').required = false;
        }
    }

    // Toggle Password Visibility
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordInput = document.getElementById('input-password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // --- 2. FORM SUBMISSION ---
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form Submit Triggered. Mode:', isSignUpMode ? 'SignUp' : 'SignIn');

            const email = document.getElementById('input-email').value;
            const password = document.getElementById('input-password').value;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

            try {
                const { data, error } = isSignUpMode
                    ? await handleSignUp(email, password)
                    : await handleSignIn(email, password);

                if (error) {
                    alert('Lỗi: ' + error.message);
                } else {
                    alert(isSignUpMode ? 'Đăng ký thành công! Vui lòng kiểm tra email.' : 'Đăng nhập thành công!');
                    authModal.style.display = 'none';
                    // Trigger UI update
                    checkUserSession();
                }
            } catch (err) {
                console.error(err);
                alert('Có lỗi xảy ra: ' + (err.message || err));
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = isSignUpMode ? 'Đăng ký Ngay' : 'Đăng nhập';
            }
        });
    }

    // --- 3. SUPABASE LOGIC ---
    async function handleSignUp(email, password) {
        const fullName = document.getElementById('input-fullname').value;
        const phone = document.getElementById('input-phone').value;
        const username = document.getElementById('input-username').value;
        const referralInput = document.getElementById('input-referral').value;

        // 1. Get Metadata
        const urlParams = new URLSearchParams(window.location.search);
        // Priority: Input > URL Param
        const refCode = referralInput || urlParams.get('ref') || urlParams.get('referral') || '';
        const origin = 'ksmart_website';

        // 2. Call Supabase
        return await median_signUp(email, password, {
            fullName,
            username,
            phone,
            referralCode: refCode,
            origin
        });
    }

    // --- 3. SUPABASE LOGIC - SIGN IN ---
    async function handleSignIn(email, password) {
        return await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
    }

    // Helper Wrapper
    async function median_signUp(email, password, meta) {
        return await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: meta.fullName,
                    username: meta.username || email.split('@')[0],
                    phone: meta.phone,
                    referral_code: meta.referralCode,
                    origin_platform: meta.origin
                }
            }
        });
    }

    // --- 4. SESSION CHECK ---
    async function checkUserSession() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session) {
            updateHeaderUI(session.user);
        }
    }

    function updateHeaderUI(user) {
        // Target the auth dropdown container
        const authContainer = document.querySelector('.auth-dropdown');
        if (authContainer) {
            const userName = user.user_metadata.full_name || user.email;
            const userInitial = userName.charAt(0).toUpperCase();

            // Replace the entire Login/Join button with User Profile
            authContainer.innerHTML = `
                <!-- User Profile Trigger -->
                <a href="#" class="btn-glass header-btn" style="display:flex; align-items:center; gap:8px; border-radius:50px; padding:0.4rem 1rem;">
                    <div style="width:28px; height:28px; background:var(--gradient-vibrant); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:0.9rem;">
                        ${userInitial}
                    </div>
                    <span style="font-size:0.9rem; color:white; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${userName}</span>
                    <i class="fas fa-chevron-down" style="font-size:0.7rem; opacity:0.8; margin-left:4px;"></i>
                </a>

                <!-- User Dropdown Menu -->
                <div class="auth-dropdown-menu" 
                    style="position:absolute; top:100%; right:0; left:auto; width:180px; transform:none; background:rgba(0,0,0,0.9); border:1px solid rgba(255,255,255,0.15); backdrop-filter:blur(10px); border-radius:12px; padding:0.5rem; opacity:0; visibility:hidden; transition:all 0.3s; display:flex; flex-direction:column; gap:5px; margin-top:10px;">
                    
                    <a href="#" class="dropdown-item" style="color:white; padding:0.6rem 1rem; text-decoration:none; font-size:0.9rem; display:flex; align-items:center; gap:10px; border-radius:8px; transition:background 0.3s;">
                        <i class="fas fa-user-circle text-gradient"></i> Hồ sơ
                    </a>
                    
                    <div style="height:1px; background:rgba(255,255,255,0.1); margin:4px 0;"></div>
                    
                    <a href="#" id="btn-logout" class="dropdown-item" style="color:#ff6b6b; padding:0.6rem 1rem; text-decoration:none; font-size:0.9rem; display:flex; align-items:center; gap:10px; border-radius:8px; transition:background 0.3s;">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </a>
                </div>
            `;

            // Add Logout Listener
            const logoutBtn = document.getElementById('btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await window.supabaseClient.auth.signOut();
                    window.location.reload();
                });
            }
        }
    }

    // Run check on load
    // setTimeout(checkUserSession, 1000); // Wait for connection
}

// Wait for header component to be loaded before initializing
if (window.ksmartUIReady) {
    initAuth();
} else {
    document.addEventListener('KSMART_UI_READY', initAuth);
}
