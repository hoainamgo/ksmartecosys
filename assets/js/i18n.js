document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('ksmart_lang');
    let langData = {};

    // 1. Initial Content Update (in case some content is already static)
    // We'll call this multiple times to catch elements as they appear
    function updateContent() {
        if (!langData[currentLang]) return;

        const allElements = document.querySelectorAll('[data-i18n]');
        allElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = langData[currentLang][key];
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            if (currentLang === 'vi') {
                toggleBtn.innerHTML = '<span style="font-size: 1.2rem; line-height: 1;">🇻🇳</span><span style="font-weight: 600; font-size: 0.9rem; color: white;">VI</span>';
            } else {
                toggleBtn.innerHTML = '<span style="font-size: 1.2rem; line-height: 1;">🇺🇸</span><span style="font-weight: 600; font-size: 0.9rem; color: white;">EN</span>';
            }
        }

        localStorage.setItem('ksmart_lang', currentLang);
        document.documentElement.lang = currentLang;
    }

    // 2. Fetch Language Data
    fetch('assets/js/lang.json')
        .then(response => response.json())
        .then(data => {
            langData = data;

            if (currentLang && langData[currentLang]) {
                updateContent();
            } else {
                currentLang = 'en'; // Default
                // Try GeoIP detection if no preference
                fetch('https://ipapi.co/json/')
                    .then(res => res.json())
                    .then(geo => {
                        if (geo.country_code === 'VN' && !localStorage.getItem('ksmart_lang')) {
                            currentLang = 'vi';
                        }
                        updateContent();
                    })
                    .catch(() => updateContent());

                updateContent(); // Immediate render with defaults
            }
        })
        .catch(err => console.error('Error loading language file:', err));

    // 3. Event Listeners for Dynamic UI
    function attachToggleListener() {
        // Use event delegation on body to handle late-loading lang-toggle
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('#lang-toggle');
            if (btn) {
                e.preventDefault();
                currentLang = currentLang === 'vi' ? 'en' : 'vi';
                updateContent();
            }
        });
    }

    // Listen for component load events from layout.js
    document.addEventListener('ksmart-components-loaded', () => {
        updateContent();
    });

    document.addEventListener('KSMART_UI_READY', () => {
        updateContent();
    });

    attachToggleListener();
});
