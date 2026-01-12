/**
 * Ecosystem Map Configuration
 * Chỉnh sửa các thông số ở đây để thay đổi giao diện Bản Đồ Tổng Thể
 */

const EcosystemConfig = {
    // Container dimensions
    container: {
        width: 650,      // Chiều rộng (px)
        height: 450,     // Chiều cao (px) - Giảm 30% từ 650
        margin: '0 auto'
    },

    // Core (Mặt trời Ksmart)
    core: {
        size: 120,       // Kích thước (px)
        label: 'Ksmart',
        glowIntensity: 0.7,  // 0-1
        pulseAnimation: true
    },

    // Floating Shapes (Các khung nổi)
    shapes: [
        {
            id: 'shape-1',
            width: 180,     // Chiều rộng 
            height: 400,    // Chiều cao (dạng mobile)
            top: '50%',
            left: '35%',
            rotation: -15,
            borderOpacity: 0.3
        },
        {
            id: 'shape-2',
            width: 350,     // Chiều rộng
            height: 350,    // Chiều cao (dạng tablet)
            top: '55%',
            left: '60%',
            rotation: 10,
            borderOpacity: 0.15
        }
    ],

    // Planets (Các hành tinh)
    planets: [
        { id: 'mindset', label: 'AI Identity', icon: 'fas fa-id-badge', top: '15%', left: '15%', rotation: -15, url: 'https://edu.ksmart.com.es' },
        { id: 'aicreative', label: 'AICreative', icon: 'fas fa-magic', top: '5%', left: '50%', rotation: 8, url: 'https://ai.ksmart.com.es' },
        { id: 'fb-assistant', label: 'FB Assistant', icon: 'fab fa-facebook-messenger', top: '25%', right: '10%', rotation: -5, url: 'https://fb.ksmart.com.es' },
        { id: 'me-assistant', label: 'Me Assistant', icon: 'fas fa-fingerprint', bottom: '25%', left: '5%', rotation: 10, url: 'https://me.ksmart.com.es' },
        { id: 'yt-tracker', label: 'YT Tracker', icon: 'fab fa-youtube', bottom: '5%', left: '55%', rotation: -8, url: 'https://yt.ksmart.com.es' },
        { id: 'automation', label: 'Automation Flow', icon: 'fas fa-robot', bottom: '30%', right: '15%', rotation: -10, url: 'https://edu.ksmart.com.es' }
    ]
};

// Apply configuration to DOM
function applyEcosystemConfig() {
    const container = document.querySelector('.ecosystem-container');
    if (!container) return;

    // Apply container size
    container.style.width = EcosystemConfig.container.width + 'px';
    container.style.height = EcosystemConfig.container.height + 'px';
    container.style.margin = EcosystemConfig.container.margin;

    // Apply core size
    const core = document.querySelector('.core-node');
    if (core) {
        core.style.width = EcosystemConfig.core.size + 'px';
        core.style.height = EcosystemConfig.core.size + 'px';
    }

    // Apply shapes
    EcosystemConfig.shapes.forEach(shape => {
        const el = document.querySelector(`.${shape.id}`);
        if (el) {
            el.style.width = shape.width + 'px';
            el.style.height = shape.height + 'px';
            if (shape.top) el.style.top = shape.top;
            if (shape.left) el.style.left = shape.left;
            el.style.transform = `translate(-50%, -50%) rotate(${shape.rotation}deg)`;
            el.style.borderColor = `rgba(255, 184, 0, ${shape.borderOpacity})`;
        }
    });

    // Apply planets
    EcosystemConfig.planets.forEach(planet => {
        const el = document.querySelector(`.planet-${planet.id}`);
        if (el) {
            if (planet.top) el.style.top = planet.top;
            if (planet.bottom) el.style.bottom = planet.bottom;
            if (planet.left) el.style.left = planet.left;
            if (planet.right) el.style.right = planet.right;

            // Handle transform based on position type
            if (planet.left === '50%' || planet.right === '50%') {
                el.style.transform = `translateX(-50%) rotate(${planet.rotation}deg)`;
            } else if (planet.top === '50%' || planet.bottom === '50%') {
                el.style.transform = `translateY(-50%) rotate(${planet.rotation}deg)`;
            } else {
                el.style.transform = `rotate(${planet.rotation}deg)`;
            }

            // ADDED: Navigation on click
            if (planet.url) {
                el.style.cursor = 'pointer';
                el.title = `Go to ${planet.label}`;
                el.onclick = () => window.location.href = planet.url;
            }
        }
    });

    console.log('Ecosystem config applied:', EcosystemConfig);
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', applyEcosystemConfig);
