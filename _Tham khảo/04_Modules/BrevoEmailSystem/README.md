# Brevo Multi-Flow Email System Module 📧 (Ksmart Ecosystem Ready)

Module này giúp bạn tích hợp hệ thống gửi email tự động (Welcome Email) cho nhiều ứng dụng (Multi-Tenant) sử dụng chung một Supabase Database, thông qua Brevo API và Cloudflare Workers.

## 📂 Cấu trúc Module

- `worker_template.js`: Code xử lý logic gửi mail trên Cloudflare Worker (Đã hỗ trợ **Ecosystem Metadata**).
- `database_trigger.sql`: Script SQL để tạo Webhook Trigger trên Supabase.
- `frontend_snippet.js`: Hướng dẫn code phía Frontend (React) để gửi metadata đồng bộ.

---

## ✨ Cập nhật Ecosystem (2025)
Module đã được nâng cấp để hỗ trợ đồng bộ các trường dữ liệu quan trọng trong hệ sinh thái Ksmart:
- **Username**: Dùng để cá nhân hóa lời chào.
- **Phone**: Đồng bộ vào CRM/Brevo Contacts.
- **Referral Code**: Theo dõi nguồn giới thiệu.
- **Origin Platform**: Phân loại email theo từng App (`yt-tracker`, `aicreative`).

## 🚀 Hướng dẫn tích hợp

### Bước 1: Setup Backend (Cloudflare Worker)
1.  Copy nội dung `worker_template.js` vào file worker của bạn (ví dụ `src/routes/webhooks.js`).
2.  Cấu hình **Environment Variables** (Secrets) trên Cloudflare Dashboard:
    -   `BREVO_API_KEY`: Key API lấy từ Brevo.
    -   `BREVO_SENDER_EMAIL`: Email người gửi (đã verify domain).
    -   `BREVO_SENDER_NAME`: Tên người gửi mặc định (VD: `Ksmart Ecosystem`).
3.  Sửa logic `if (appOrigin === '...')` trong code để khớp với mã định danh app của bạn.

### Bước 2: Setup Database (Supabase)
1.  Mở **SQL Editor** trên Supabase Dashboard.
2.  Copy nội dung `database_trigger.sql`.
3.  **QUAN TRỌNG**: Thay thế URL `'https://your-worker-url.workers.dev/api/webhooks/auth'` bằng URL thực tế của Worker bạn vừa deploy.
4.  Nhấn **Run**.

### Bước 3: Setup Frontend
1.  Khi gọi hàm `signUp`, hãy đảm bảo truyền `userData` chứa đủ: `fullName`, `username`, `phone`, `referralCode`.
2.  Xem chi tiết trong file `frontend_snippet.js`.

### Bước 4: Cấu hình trên Brevo Attributes
Để đồng bộ đầy đủ metadata, bạn cần tạo các **Attributes** sau trong Brevo:
- `FULLNAME` (Text)
- `USERNAME` (Text)
- `PHONE` (Number/Text)
- `REFERRAL` (Text)
- `ORIGIN` (Text)

---

## 💡 Tại sao dùng cách này?
-   **Không bị chặn spam**: Dùng API uy tín của Brevo thay vì SMTP mặc định.
-   **Đa luồng (Multi-Flow)**: 1 Database dùng chung cho nhiều App nhưng vẫn gửi email riêng biệt (YT Tracker, AICreative...).
-   **Tự động hóa CRM**: Sync contact vào danh sách marketing ngay khi đăng ký với đầy đủ thông tin cá nhân.
