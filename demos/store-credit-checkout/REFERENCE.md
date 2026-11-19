# Màn thật mà demo này sửa

Menu: On-site content › Checkout page tab › Quick Redeem card
Màn thật: trang Onsite (`On-site content`), tab "Checkout page" (`CHECKOUT_PAGE_TAB_EMBED_CONTENT`), card đầu tiên
trong `checkoutBlock` = Quick Redeem (title `translate('quickRedeem')`, subtitle `quickRedeemBlockSubtitle`,
dùng chung component `CardIntroduction`); đọc `avada/master:packages/assets/src/pages/Onsite/Onsite.js`
(dòng ~536–560, ~1339–1353) và `avada/master:packages/assets/src/components/EmbedContent/CardIntroduction.js`,
19/11/2026 (`git show`, không có ảnh staging — Alex chưa cấp quyền xem staging phiên này).
Ảnh so sánh: ngoài repo, không có ảnh staging phiên này; nguồn tham chiếu là code production (git show) ghi ở trên.

## Thay đổi

PRD: `~/Alex Brain/output/2026-11-19-store-credit-checkout/prd.md` §I (Cài đặt merchant).

Thêm vào ĐÚNG card Quick Redeem hiện có (không đẻ trang/card mới):
- Công tắc "Allow customers to use store credit at checkout" (mặc định tắt).
- Ô "Per-order cap" ($, trống = không trần), chỉ hiện khi bật.
- Shop không phải Shopify Plus: khối mờ (`opacity`) + badge "Requires Shopify Plus" cạnh tiêu đề (PRD §A).
- Thiếu quyền ghi store credit: banner cảnh báo + nút "Reconnect permissions" (PRD §G).
- Bật lần đầu: banner khuyến nghị tắt nút store credit của Shopify, link `Settings → Customer accounts`
  (PRD §G/§I — thật trỏ `/settings/customer_accounts`, cùng pattern `CardIntroduction`'s
  `checkAccountClassic` banner trong Onsite.js dòng ~262–281).
- Lưu ý thuế (PRD §Ảnh hưởng shop đang chạy — credit áp dưới dạng giảm giá, thuế có thể tính khác với
  store credit payment method của Shopify).

## Trạng thái (Prototype panel, góc dưới phải)

| Trạng thái | Ý nghĩa |
|---|---|
| Default | Tắt, shop Plus, chưa có trần |
| Enabled | Merchant đã bật, trần $50 |
| Loading | Đang lưu công tắc |
| Error | Lưu lỗi, banner "Try again" |
| Not Shopify Plus | Khối mờ, badge "Requires Shopify Plus" |
| No write permission | Banner cảnh báo thiếu quyền ghi |
| Overflow | Trần dài nhất ($999,999,999.99) |
| Worst case | Overflow + banner "Sync failed" |

## Chưa làm trong demo này

- Không dựng lại toàn bộ 5 tab On-site content (Widget/Product/Cart/Thank you) — chỉ tab Checkout page,
  đúng phạm vi PRD §I (admin). Card Available Rewards / Referral at Checkout chỉ hiện làm bối cảnh, không
  có setting mới (ngoài phạm vi PRD này).
- Không có ảnh staging thật để so — ghi rõ ở trên, cần Alex hoặc lead chụp khi có quyền truy cập staging.
