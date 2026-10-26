# Mẫu demo (templates/demo)

Khung một prototype admin Joy: thanh Shopify admin, menu trái, một trang Polaris và dữ liệu giả.
Tạo demo mới từ mẫu này bằng lệnh ở thư mục gốc của repo:

```sh
npm run new-demo -- <slug> "<Tên tính năng>"
```

## Quy ước cho người và AI sửa demo

- **Chỉ dữ liệu giả.** Shop là Pomelo Park, email dạng `@example.com`. Không dán tên merchant, chat, ticket hay số liệu thật.
- **Không import code production.** Chỉ dùng React, Polaris và code trong chính thư mục demo. Không import từ `packages/`, không thêm package riêng của Avada.
- **Không secret.** Không có `.env`, token hay API key. Demo chạy hoàn toàn trên trình duyệt, không gọi backend.
- **Routing bằng hash** (`#/demo`), `base: './'` trong `vite.config.js`. Hub phục vụ demo ở `/<product>/<slug>/`, nên đường dẫn ảnh viết `img/...` (không có `/` đầu).
- **Giống app thật.** Mở màn tham chiếu của Joy trước khi vẽ. Giữ khung admin, chữ tiếng Anh như app.
- **Ảnh** đặt trong `public/img/`. Ảnh chụp cho hub đặt ở `hub/public/shots/`, tối đa 1600×900.
- Sửa xong chạy `npm run check` ở thư mục gốc trước khi mở Pull Request.
