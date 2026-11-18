# Màn thật mà demo này sửa

Bốn chỗ hiện hạn store credit cho khách và một chỗ trong admin. Mỗi chỗ chỉ thêm đúng dòng mới, đặt ngay trong khối đang có,
cùng cỡ chữ và kiểu với dòng tương tự đang có (dòng hạn điểm, dòng phụ của một hoạt động, một ô tick trong danh sách trigger).

Menu: Storefront › Widget V4 › thẻ số dư (joy-balance-cards) › thẻ Store credit, dòng mới dưới số dư · Storefront › Widget V4 › bấm thẻ Store credit › màn Store credit (joy-balance-history) › dòng nhận, dòng phụ mới · Shopify customer account › trang Loyalty Hub › ô "Store credit:" › dòng hạn mới dưới mỗi ví · Shopify customer account › Profile › khối Joy › ô "Store credit:" › dòng hạn mới dưới mỗi ví · Joy › Integrations › Klaviyo › Step 3: Set up automation triggers › Select triggers › 3 ô tick mới cuối danh sách
Màn thật: dựng theo code avada/master 19048fdda0 đọc 18/11/2026: packages/web-components/src/components/widget/joy-balance-cards.ts (layout tile, dòng joy-balance-card__expiry), joy-balance-history.ts (_eventLabel, nhãn "Applied store credit to order #{{order}}", "Store credit expired"), joy-activity-item.ts (title/desc/date, màu số tiền), joy-loyalty-widget.styles.ts, styles/tokens.css; extensions/loyalty-hub-page/src/sections/PointsBalanceSection.js ("Store credit:", "Next expiry"); extensions/customer-account-ui/src/Components/CardInfoCustomer.js (StoreCreditBox, Show more sau 2 ví); packages/assets/src/pages/Integration/Details/Klaviyo.js + components/IntegrationDetail/DetailPageLayout.js (WcChoiceList allowMultiple), functions/src/const/integrations.js (LIST_INTEGRATION_KLAVIYO_TRIGGERS), functions/src/helpers/utils/omnisend.js (getEventName/getEventHelpText); chữ tiếng Anh từ locale/input/IntegrationDetail.json, IntegrationApps.json, Modal.json cùng nhánh
Ảnh so sánh: ngoài repo — không có ảnh màn thật trong lượt này; dựng theo code. Ảnh chụp prototype 1440/375 Jerry giữ trong Alex Brain (output/2026-11-18-store-credit-lifecycle-prd/shots/)

## Đường dẫn trong demo

| Link | Màn |
|---|---|
| `#/widget` | Widget V4: thẻ Store credit có dòng "CA$8.00 expires on 31/12/2026" |
| `#/widget/store-credit` | Widget V4: màn Store credit, dòng nhận +CA$20.00 có "Expires on 31/12/2026" |
| `#/account/rewards` | Loyalty Hub page: ô "Store credit:" ví CAD và ví USD mỗi ví một dòng hạn |
| `#/account/profile` | Customer account › Profile: khối Joy, cùng dòng hạn theo ví |
| `#/integrations/klaviyo?triggers=open` | Klaviyo: mở danh sách trigger, cuộn tới 3 lựa chọn store credit (chưa tick) |
| `#/integrations/klaviyo` | Klaviyo: trang chi tiết, Step 3 liệt kê trigger đã chọn |

`?state=` nhận `no-expiry` (không có khoản có hạn → không có dòng), `masked` (Hide balance: dòng hạn che cùng số dư),
`empty`, `loading`, `error`, `disabled` (Klaviyo chưa kết nối), `overflow`, `worst` (3 ví, lịch sử dài, lưu lỗi). Nút Prototype góc dưới.

## Ghi chú cho dev

- Dòng mới dùng một chữ dịch được: `{{amount}} expires on {{date}}`, ngày theo định dạng ngày của shop (demo dùng DD/MM/YYYY).
- Trên customer account, ô "Store credit:" hiện 2 ví đầu rồi "Show more" như hôm nay; mỗi ví mang dòng hạn của chính nó.
- Không đổi: thứ tự thẻ, điều kiện hiện ô số dư, chữ của dòng "Applied store credit…" và "Store credit expired".
