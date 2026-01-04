# 📄 BÁO CÁO ĐỒNG BỘ HỆ SINH THÁI KSMART (SSO & METADATA)
> **Dự án áp dụng:** YT Tracker (Đã xong) & AICreative (Cần cập nhật)

Báo cáo này liệt kê các thay đổi cần thiết để đưa tất cả các sản phẩm của Ksmart về một tiêu chuẩn quản trị User duy nhất.

---

## 1. Cấu trúc Database (Supabase)
Sếp cần chạy script [upgrade_ecosystem.sql](file:///c:/JP/Qu%E1%BA%A3n%20tr%E1%BB%8B%20k%C3%AAnh%20youtube/03_WebApp/upgrade_ecosystem.sql) vào SQL Editor của Supabase để:
- Thêm các trường: `phone`, `username`, `referral_code`, `origin_platform`, `ksmart_tier`.
- Đồng bộ Trigger `handle_new_user` để tự động nhặt dữ liệu từ mọi app.

---

## 2. Tiêu chuẩn Metadata khi Đăng ký
Để hệ thống nhận diện đúng, hàm `signUp` ở mọi App cần gửi kèm metadata theo đúng định dạng sau:

```javascript
// Cấu trúc Data chuẩn gửi lên Supabase Auth
{
  full_name: string,       // Họ tên đầy đủ
  username: string,        // Tên đăng nhập
  phone: string,           // Số điện thoại (dạng chuỗi)
  referralCode: string,    // Mã giới thiệu (Viết hoa)
  origin_platform: string  // Định danh app: 'yt-tracker' hoặc 'aicreative'
}
```

---

## 3. Thay đổi cần thực hiện bên AICreative
Để AICreative khớp với bộ máy mới, sếp hãy dặn AI cập nhật file `supabase.js` (hoặc lib tương đương):

```javascript
// Sửa hàm signUp bên AICreative
export const signUp = async (email, password, fullName, username, phone, referralCode) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                username: username,
                phone: phone,
                referralCode: referralCode,
                origin_platform: 'aicreative' // 🔑 Quan trọng: Đổi thành aicreative
            },
        },
    });
    return { data, error };
};
```

---

## 4. Lợi ích sau khi đồng bộ
- **Marketing:** Sếp biết chính xác User A đăng ký lần đầu từ App nào.
- **Support:** Có số điện thoại để hỗ trợ trực tiếp.
- **SSO:** User đăng nhập 1 bên, tự động nhận profile bên kia.
- **Tier:** Sếp chỉ cần set `ksmart_tier = 'pro'` trong bảng Profile là user đó sẽ là Pro trên mọi App của sếp.

---
**Trạng thái YT Tracker:** `Hàm signUp đã được nâng cấp + Form Register đã bổ sung đủ trường.`
