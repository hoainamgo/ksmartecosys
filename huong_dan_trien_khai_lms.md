# HƯỚNG DẪN TRIỂN KHAI KSMART ACADEMY (LMS)

Tài liệu này tổng hợp toàn bộ giải pháp tối ưu để sếp tự xây dựng học viện khóa học với chi phí thấp nhất nhưng chuyên nghiệp nhất.

---

## 1. KIẾN TRÚC TỔNG THỂ
*   **Video Hosting:** YouTube Unlisted (0 đồng phí lưu trữ & băng thông).
*   **Video Player:** Plyr.io (Tăng tính chuyên nghiệp, ẩn logo YouTube).
*   **Hạ tầng:** Cloudflare Pages (Frontend) & Cloudflare Workers (Backend).
*   **Database & Auth:** Supabase (Quản lý User, Bài học, Quyền truy cập).
*   **Thanh toán:** SePay (Tự động hóa ngân hàng VN).

---

## 2. BƯỚC 1: THIẾT LẬP DATABASE (SUPABASE)
Sếp copy và chạy script SQL này trong phần SQL Editor của Supabase:

```sql
-- 1. Bảng lưu quyền Admin và Profile
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  is_admin boolean default false,
  updated_at timestamp with time zone default now()
);

-- 2. Bảng Khóa học
create table courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price_vnd numeric not null,
  thumbnail_url text,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. Bảng Chương học (Modules)
create table course_modules (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  order_index int default 0
);

-- 4. Bảng Bài học (Lessons)
create table lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references course_modules(id) on delete cascade,
  title text not null,
  youtube_video_id text, -- Chỉ lưu ID, ví dụ dQw4w9WgXcQ
  content_markdown text,
  order_index int default 0,
  is_free_preview boolean default false
);

-- 5. Bảng Quyền truy cập (Enrollments)
create table enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  course_id uuid references courses(id),
  purchased_at timestamp with time zone default now(),
  unique(user_id, course_id)
);

-- BẢO MẬT (RLS Policies)
alter table lessons enable row level security;

-- Policy: Chỉ ai mua khóa học mới xem được YouTube ID của bài học đó
create policy "User can view enrolled lessons" 
on lessons for select
using (
  exists (
    select 1 from enrollments e
    join course_modules m on m.course_id = e.course_id
    where m.id = lessons.module_id 
    and e.user_id = auth.uid()
  ) or is_free_preview = true
);
```

---

## 3. BƯỚC 2: QUẢN TRỊ (ADMIN PANEL)
Sếp sẽ xây dựng một giao diện quản trị với các tính năng:
*   **Xác thực:** Kiểm tra field `is_admin` trong bảng `profiles`. Nếu true mới hiện Menu Admin.
*   **Thêm video:** Chỉ cần dán Link YouTube, dùng Regex để tách lấy `Video ID` trước khi lưu vào database.
*   **Quản lý học viên:** Tra cứu bảng `enrollments`.

---

## 4. BƯỚC 3: TỰ ĐỘNG HÓA THANH TOÁN (SEPAY)
1.  **Cloudflare Worker:** Tạo một Worker nhận Webhook từ SePay.
2.  **Logic:** 
    *   Nhận thông tin: `Hoc vien | Email | Ten Khoa Hoc`.
    *   Worker kiểm tra chữ ký SePay để đảm bảo an toàn.
    *   Worker lệnh cho Supabase: `insert into enrollments (user_id, course_id) values (...)`.
    *   Gửi một Email thông báo cho học viên (Dùng Brevo hoặc Mailgun).

---

## 5. BƯỚC 4: HIỂN THỊ VIDEO (PLAYER)
Dùng đoạn code mẫu này để nhúng YouTube một cách chuyên nghiệp (Plyr.io):

```html
<!-- Include Plyr CSS -->
<link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />

<!-- Video Container -->
<div class="plyr__video-embed" id="player">
  <iframe
    src="https://www.youtube.com/embed/YOUTUBE_ID?origin=https://ksmart.com.es&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1"
    allowfullscreen
    allowtransparency
    allow="autoplay"
  ></iframe>
</div>

<!-- Include Plyr JS -->
<script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>
<script>
  const player = new Plyr('#player', {
    settings: ['quality', 'speed'],
    invertTime: false,
    youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
  });
</script>
```

---

## 6. LỜI KHUYÊN KHI TRIỂN KHAI
1.  **Tên khóa học trên SePay:** Hãy đặt mã chuyển khoản đơn giản (Ví dụ: `KM01`, `KM02`) để Worker dễ nhận diện.
2.  **Mobile First:** Học viên học trên điện thoại rất nhiều, hãy đảm bảo giao diện Cloudflare Pages hiển thị tốt trên di động.
3.  **Dự phòng:** Luôn backup nội dung khóa học ra Drive hoặc ổ cứng ngoài.

---
**Người soạn thảo:** *Antigravity AI*
**Ngày soạn:** *09/01/2026*
