document.addEventListener('DOMContentLoaded', async () => {
    // Helper to load component
    async function loadComponent(id, file) {
        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Could not load ${file}`);
            const html = await response.text();
            const el = document.getElementById(id);
            if (el) el.innerHTML = html;
        } catch (err) {
            console.error(err);
        }
    }

    // Load Header & Footer
    try {
        await Promise.all([
            loadComponent('app-header', 'components/header.html'),
            loadComponent('app-footer', 'components/footer.html')
        ]);
    } catch (err) {
        console.error('Critical components failed to load:', err);
    } finally {
        // Dispatch event even if something failed to prevent total JS hang
        window.ksmartComponentsLoaded = true;
        document.dispatchEvent(new Event('ksmart-components-loaded'));
        window.ksmartUIReady = true;
        document.dispatchEvent(new Event('KSMART_UI_READY'));
    }

    // Highlight active link
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        if (path.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });

    // Re-init any header related scripts here if needed
});
