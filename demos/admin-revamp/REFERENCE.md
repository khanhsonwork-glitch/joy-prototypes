# Màn thật mà demo này thay

Demo dựng lại TOÀN BỘ admin Joy Loyalty trên Polaris 2 (Alex 18/11/2026: «rethink lại redesign lại theo polaris v2 chuẩn
bỏ qua cái cũ hết đi»). Khung menu và chỗ của từng màn/field theo bảng đối chiếu Alex đã duyệt 18/11:
https://joy-admin-revamp-map.vercel.app — đọc từ code admin Joy nhánh master ngày 17–18/11/2026.

Menu: Joy: Loyalty Program › (tên app → Home #/home) · Programs (#/programs: All programs, Points, Referrals, Milestones, Quizzes) · VIP & membership (#/vip) · On your store (#/store) · Customers (#/customers) · Analytics (#/analytics) · Integrations (#/integrations) · Settings (#/settings) · Wishlist (#/wishlist) · Subscription (#/subscription)
Màn thật: Home `/`, Reward programs `/programs?type=earning|redeem|referral|milestone|quiz|point-expiration`, Membership `/membership` (VIP Tiers, Member-exclusive deal, Subscription membership, Partner tier), On-site content, Customers, Activities, Analytics (Classic + V2), Integrations, Settings (10 mục); ảnh production giao diện Polaris 2, 16–17/11/2026
Ảnh so sánh: ngoài repo — ảnh màn thật giao diện mới (Membership, Settings General, Partner tier) trong output 17/11 của Alex (Jerry giữ)

## Chỗ khác bản production (đã duyệt trong bảng đối chiếu)

| Production | Bản mới | Vì sao |
|---|---|---|
| (chưa có) | Programs › All programs | Một bảng mọi chương trình (kiếm, đổi, referral, milestone, quiz, quyền lợi VIP, member deal, paid membership); lọc theo hạng ra mọi thứ khách hạng đó được hưởng |
| Reward programs › Earning + Redeeming + Point expiration, Settings › Points exchange rate + point label | Programs › Points | Kiếm và tiêu điểm cùng một màn, cạnh giá trị điểm và luật hết hạn |
| Membership | VIP & membership | Chữ VIP là chữ merchant tìm; VIP vẫn là module riêng (~1/4 shop bật) |
| Customers › Activities (duyệt review/receipt/form/Google review) | Customers › To review + Home › Needs your attention | Đang cách 3 lần bấm; khách chưa nhận điểm khi chưa duyệt |
| Customers › Activities 9 tab | Customers › Activity (1 danh sách + bộ lọc loại) | |
| Customers › Generate pass wallet | On your store › Wallet pass | Thẻ ví là thứ khách cầm |
| Customers › Notifications (log email) | Settings › Notifications › Sent log | Để cạnh mẫu email |
| Reward programs › Subscription and Membership (trang quảng bá) | bỏ | Không có trường nào để sửa |
| Analytics Classic | bỏ, dựng V2 | Số Classic có trong V2 |
| Popups, Custom pricing, Billing dashboard | không dựng | Production không còn đường vào / trang nội bộ |

## Kỹ thuật
- Một kho dữ liệu (`src/state/store.jsx`, lưu localStorage `joy-admin-revamp-v2`, nút Reset sample data trong bảng Prototype).
- Mỗi module một thư mục `src/modules/<module>/`, dữ liệu mẫu `src/data/seed/<module>.js`.
- Thanh lưu kiểu admin mới (`src/ui/SaveBar.jsx`): sửa gì thanh tiêu đề thành "Unsaved changes · Discard · Save"; rời trang khi chưa lưu thì hỏi.
- File cũ của bản 4 màn đầu (`src/pages/Home|Others|Program*|Reward*`, `src/state/program|rewards`, `src/components/parts`) không còn được dùng; giữ lại để xoá khi Alex duyệt.
- VIP chi tiết từng field: `src/modules/vip/REFERENCE.md`.
