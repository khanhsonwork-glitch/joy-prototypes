# Màn thật mà demo này sửa

Menu: Joy › Settings › General › card "Redemption behavior" (id customer-behavior-settings) › mới: khối "Limit Joy reward codes per order" ở cuối card, dưới "Trigger: Point Calculator link (non-login customers)"
Màn thật: admin production store demo North Bloom, Settings › General, chụp 16/11/2026 bằng phiên đăng nhập của PO (Playwright, khung app joy.avada.io/embed/settings); đối chiếu code avada/master 6af69757d11 (16/11/2026)
Ảnh so sánh: reference/real.png

## Bản đồ màn (code avada/master 6af69757d11)

| Tầng | Thật | File |
|---|---|---|
| Menu | Joy: Loyalty Program › Settings (`/settings`, mặc định `?type=general`) | `config/appMenu.js`, `routes/settingRoutes.js` |
| Trang | Settings: lưới 1/3 + 2/3. Cột trái là danh sách chọn mục (Search settings…, General, Brand, Email, Notifications, Pre-launch, Order, Translations, Subscription, Developers, Additional features). Thanh tiêu đề app: "Joy / General" | `pages/Setting/Setting.js`, `const/listSettings.js` |
| Mục | General: Membership enrollment › In-app language › Store timezone › Date format › Currency format › Custom point label › **Default discount code prefix** › **Redemption behavior** › Points exchange rate › Review approval | `pages/Setting/Details/General.js` |
| Card | Redemption behavior: "Control what happens when customers apply discounts or redeem free gifts." | `pages/Setting/Details/CustomerBehaviorSettings.js` |
| Field có sẵn | Trigger: Apply discount (radio, "Open cart drawer" mở ô Cart drawer button selector) · Trigger: After customer redeems a reward in the widget (radio, chỉ shop widget V4) · Trigger: After customer redeem free gift (radio, badge Recommended) · Trigger: After customer redeems free shipping (ô Continue shopping URL) · Trigger: Point Calculator link (banner info + radio) | như trên |
| Loại control | Tiêu đề trigger là heading nhỏ; chọn bằng radio list; ô chữ một dòng; bật/tắt trong Settings dùng switch (`components/Toggle` → `s-switch`, ví dụ card AI shopping assistant tools ở Additional features); lưu bằng thanh "Unsaved changes" của trang | `components/Toggle/Toggle.js`, `pages/Setting/Details/WebmcpSettings.js` |

## Chỗ đặt thay đổi và vì sao

- Khối mới nằm **trong** card Redemption behavior, cuối card, ngăn bằng một đường kẻ: đó là card nói về việc khách áp mã giảm giá, và merchant tìm "giới hạn mã mỗi đơn" ở đó. Không tạo trang hay card cài đặt riêng.
- Công tắc là switch như các bật/tắt khác trong Settings; hai field (Maximum Joy codes per order: select 1–4; Message when a code is removed: ô chữ, tối đa 150 ký tự) chỉ hiện khi bật. Lưu cùng thanh Save của trang General như mọi field khác của card.
- Ba khối con (Joy code formats, Check against your own codes, Test a code) là khung viền nhạt bên trong card, chỉ hiện khi bật: chúng giải thích luật nhận mã của chính công tắc này, không phải cài đặt độc lập.
- "Change prefix" của một mã trùng dạng NB- cuộn tới card "Default discount code prefix" ngay phía trên trên cùng trang (nơi đặt NB- thật); mã trùng dạng của chương trình khác mở trang chương trình đó (demo chỉ báo toast).
- Màn checkout (`#/checkout`, hoặc `#/settings?state=checkout`) là checkout mặc định của Shopify, giống nhau trên mọi store, tên store trung tính "Demo store": không có brand thật nào trên hub.
