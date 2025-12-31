// Blog Loader for Ksmart
// Uses Blogger JSON API

const BLOG_FEED_URL = 'https://ksmartecosys.blogspot.com/feeds/posts/default?alt=json-in-script&callback=renderBlogPosts&max-results=3';

function loadBlogPosts() {
    const script = document.createElement('script');
    script.src = BLOG_FEED_URL;
    document.body.appendChild(script);
}

function renderBlogPosts(data) {
    const container = document.getElementById('blog-container');
    if (!container) return; // Guard clause

    if (!data.feed || !data.feed.entry) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted);">Đang cập nhật bài viết...</p>';
        return;
    }

    const posts = data.feed.entry;
    let html = '';

    posts.forEach(post => {
        // Extract Title
        const title = post.title.$t;

        // Extract Link
        const link = post.link.find(l => l.rel === 'alternate').href;

        // Extract Thumbnail (Try to find media$thumbnail, else fallback)
        let thumbUrl = 'https://via.placeholder.com/300x200?text=Ksmart+Blog'; // Default fallback
        if (post.media$thumbnail) {
            thumbUrl = post.media$thumbnail.url.replace('s72-c', 'w400-h250-c'); // Get higher res image
        } else {
            // Try to parse from content content
            const content = post.content ? post.content.$t : '';
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
                thumbUrl = imgMatch[1];
            }
        }

        // Extract Date
        const date = new Date(post.published.$t).toLocaleDateString('vi-VN');

        // Extract Snippet (Simple text strip)
        let snippet = '';
        if (post.summary) {
            snippet = post.summary.$t.substring(0, 100) + '...';
        } else if (post.content) {
            const div = document.createElement('div');
            div.innerHTML = post.content.$t;
            snippet = div.textContent.substring(0, 100) + '...';
        }

        html += `
            <div class="blog-card">
                <div class="blog-thumb" style="background-image: url('${thumbUrl}')"></div>
                <div class="blog-content">
                    <div class="blog-date"><i class="far fa-calendar-alt"></i> ${date}</div>
                    <a href="${link}" target="_blank" class="blog-title"><h3>${title}</h3></a>
                    <p class="blog-excerpt">${snippet}</p>
                    <a href="${link}" target="_blank" class="read-more">Đọc thêm <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Init load
document.addEventListener('DOMContentLoaded', loadBlogPosts);
