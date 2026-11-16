# Màn thật mà demo này sửa

Menu: Joy › Settings › Additional features › card mới "Limit Joy reward codes per order" (id limit-reward-codes), ngay sau card "Limit customer earning" (id limit-earning) và trước "Show free product coupon" (id free-product-coupon)
Màn thật: admin production store demo North Bloom, Settings › Additional features, chụp 16/11/2026 bằng phiên đăng nhập của PO (Playwright, khung app joy.avada.io/embed/settings?type=additional-features); đối chiếu code avada/master 6af69757d11 (16/11/2026)
Ảnh so sánh: reference/real.png

## Bản đồ màn (code avada/master 6af69757d11)

| Tầng | Thật | File |
|---|---|---|
| Menu | Joy: Loyalty Program › Settings (`/settings`, mặc định General) › chọn "Additional features" ở cột trái (`?type=additional-features`) | `config/appMenu.js`, `routes/settingRoutes.js`, `const/listSettings.js` |
| Trang | Settings: lưới 1/3 + 2/3, cột trái Search settings… + General, Brand, Email, Notifications, Pre-launch, Order, Translations, Subscription, Developers, Additional features. Tiêu đề nằm ở thanh app: "Joy / Additional features"; phụ đề "Manage additional features and integrations" có trong code nhưng màn thật không hiện | `pages/Setting/Setting.js`, `pages/Setting/Details/AdditionalFeatures.js` |
| Thứ tự card | Sign in directly within Joy widget › customer-metafields › Sync metafields › auto-tag-customers › joy_tag_member › pending-points › revoke-coupon › magic-tags › login-signup-urls (Pre-login URLs) › limit-earning (Limit customer earning) › **limit-reward-codes (mới)** › free-product-coupon (Show free product coupon) › points-in-order-email › webmcp-tools | `AdditionalFeatures.js` |
| Mẫu card chép theo | Limit customer earning: `<s-section>` → `SettingToggle` (heading + badge On/Off, bên phải switch kèm chữ "Turn on"/"Turn off") → dòng phụ màu nhạt → khi bật: `<s-divider/>` rồi các khối con, mỗi khối một `<s-heading>` + field | `Details/GlobalEarningLimit.js`, `components/SettingToggle/SettingToggle.js` |
| Card mới khi bật | Divider · Maximum Joy codes per order (select 1–4) · Message when a code is removed (ô chữ 150 ký tự) · Divider · Joy code formats · Divider · Check against your own codes · Divider · Test a code | demo này |

## Chỗ đặt thay đổi và vì sao

- Alex chốt 16/11: không đặt trong General › Redemption behavior; đặt thành card riêng ở Additional features, cạnh "Limit customer earning" (cùng loại "giới hạn" cho cả shop). Card Redemption behavior ở General giữ y màn thật.
- Lưu cùng thanh "Unsaved changes" của trang Settings như "Limit customer earning".
- "Change prefix" (mã trùng dạng NB-) mở Settings › General `?scroll=prefix-discount` (cách General.js cuộn tới card "Default discount code prefix"), kèm câu nói mã đã phát vẫn bị tính; mã trùng dạng của chương trình khác mở trang chương trình đó (demo chỉ báo toast).
- Link trong demo: `#/settings?type=additional-features&state=<trạng thái>` (thiếu `type` cũng mở Additional features, cuộn tới card mới); `#/settings?type=general` là General.
- Màn checkout (`#/checkout`, hoặc `state=checkout`) là checkout mặc định của Shopify, tên store trung tính "Demo store": không có brand thật nào trên hub.
