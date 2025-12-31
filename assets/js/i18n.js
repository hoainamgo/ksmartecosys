document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('ksmart_lang');
    let langData = {};

    // DOM Elements
    const langToggle = document.getElementById('lang-toggle');
    const elements = document.querySelectorAll('[data-i18n]');

    // Load Language Data with GeoIP Fallback
    fetch('assets/js/lang.json')
        .then(response => response.json())
        .then(data => {
            langData = data;

            // Strategy: 
            // 1. If user has manually selected preference (localStorage), use it.
            // 2. If no preference, default to 'en' (Global SEO).
            // 3. BUT, try to detect if user is in Vietnam. If proper VN IP -> switch to 'vi'.

            if (currentLang) {
                // User already chose a language, respect it.
                updateContent();
            } else {
                // Default to English first (so crawlers see EN, and fast load is EN)
                currentLang = 'en';

                // Then try async check
                fetch('https://ipapi.co/json/')
                    .then(res => res.json())
                    .then(geo => {
                        // Only switch to VI if explicitly in Vietnam
                        if (geo.country_code === 'VN') {
                            currentLang = 'vi';
                        }
                        updateContent();
                    })
                    .catch(err => {
                        // Fallback/Error -> Stay on English
                        updateContent();
                    });

                // Initial render with English immediately
                updateContent();
            }
        })
        .catch(err => console.error('Error loading language file:', err));

    // Update Content Function
    function updateContent() {
        if (!langData[currentLang]) return;

        // Update elements that might have been dynamically loaded since last time
        const allElements = document.querySelectorAll('[data-i18n]');
        allElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (langData[currentLang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = langData[currentLang][key];
                } else {
                    el.innerHTML = langData[currentLang][key];
                }
            }
        });

        // Update Toggle Button UI
        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            if (currentLang === 'vi') {
                toggleBtn.innerHTML = '<span style="font-size: 1.2rem; line-height: 1;">🇻🇳</span><span style="font-weight: 600; font-size: 0.9rem; color: white;">VI</span>';
            } else {
                toggleBtn.innerHTML = '<span style="font-size: 1.2rem; line-height: 1;">🇺🇸</span><span style="font-weight: 600; font-size: 0.9rem; color: white;">EN</span>';
            }
        }

        // Save preference
        localStorage.setItem('ksmart_lang', currentLang);
        document.documentElement.lang = currentLang;
    }

    // Attach Event Listener (Delegation or Direct)
    function attachToggleListener() {
        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            // Remove old listener to avoid duplicates if called multiple times (though replaceWith clone is cleaner, setting onclick is easiest for simple logic)
            toggleBtn.onclick = (e) => {
                e.preventDefault();
                currentLang = currentLang === 'vi' ? 'en' : 'vi';
                updateContent();
            };
        }
    }

    // Initialize UI when components are ready
    document.addEventListener('ksmart-components-loaded', () => {
        attachToggleListener();
        updateContent(); // Update header content once loaded
    });

    // Also try immediately in case it's static
    attachToggleListener();
});
