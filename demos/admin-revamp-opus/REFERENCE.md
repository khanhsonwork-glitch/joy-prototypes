# Màn thật mà demo này sửa

Bản Opus dựng lại TOÀN BỘ admin Joy Loyalty trên Polaris 2 (giao diện admin Shopify mới), độc lập với bản 6 Codex
(`demos/admin-revamp/`). Alex 18/11/2026: «rethink redesign lại toàn bộ admin UI của app theo polaris V2… sáng tạo và phá
cách… miễn là hợp lí và vẫn đủ các trường» và «tôi muốn 1 bản nữa do Opus dựng ngoài codex ra».

Menu: Joy: Loyalty Program › Programs (All programs · Points · Referrals · Milestones · Quizzes) › VIP & membership › On your store › Customers › Analytics › Integrations › Settings › Wishlist › Subscription; Home mở bằng dòng tên app, không có mục riêng
Màn thật: toàn bộ admin Joy đọc trên code `avada/master` (Joy-loyalty) ngày 17–18/11/2026 qua 4 bảng kê trong `output/2026-11-18-admin-revamp/inventory/` (A Reward programs, B Membership + B2B, C Home + Customers + Analytics, D Settings + Integrations + On-site), menu đã duyệt trên joy-admin-revamp-map.vercel.app 18/11
Ảnh so sánh: ngoài repo — ảnh production giao diện Polaris 2 (16–17/11) trong feature map của Alex, ảnh bản mới trong `output/2026-11-18-admin-revamp/opus/` (Jerry giữ)

## Mở thử

`npm run dev` trong thư mục này rồi mở `#/home`. Dữ liệu mẫu là shop North Bloom (skincare, store demo chung, northbloom.com,
@northbloom; email mẫu dùng `@northbloom.example` vì kiểm nguồn của repo chỉ cho email giả), lưu một chỗ trong
localStorage `joy-admin-revamp-opus-v2` (v2 từ 18/11 khi đổi tên shop, để bản lưu cũ không giữ tên Pomelo Park); bảng
điều khiển prototype › Reset sample data đưa về ban đầu. Thêm `?state=empty|loading|error|disabled|overflow|worst`
vào route bất kỳ để xem trạng thái tương ứng (`empty` ở Home = shop vừa cài).

## Màn production → màn mới

| Màn production (route cũ) | Màn mới (route) | Đổi gì |
|---|---|---|
| Home `/`, Set up `/set-up` | Home `#/home` | Màn đầu đúng 4 khối: lời chào + một dòng tình trạng; «Needs your attention» (duyệt, cảnh báo, tối đa 2 + Show all); Setup guide 21 bước production (checkout chỉ hiện khi Shopify Plus), Basic/Advanced, tự tích theo dữ liệu, hiện 3 bước kế tiếp; kết quả 30 ngày. Bên dưới: On your store, hoạt động gần đây, New in Joy, Learn and get help (Ask Joy AI), More from Joy (Wishlist, Subscription, Refer a merchant) |
| Reward programs `/programs` (tab Earning/Redeeming) | Programs › Points `#/programs/points` | Một bảng giá đọc trong 5 giây theo thứ tự Joy: dải «100 points = $1» + «khách nhận lại 5%» + Name / Expiry / Rounding có ảnh 3D ví + đồng xu của Joy; dưới là hai cột kiếm (Points per spend, Ways to earn) cạnh đổi (Rewards), mỗi dòng tên + một giá trị |
| (production không có màn gộp) | Programs › All programs `#/programs` | Mọi thứ khách có thể nhận, chia mục theo loại (earn, reward, referral, milestone, quiz, perk VIP, deal, paid plan), ô tìm luôn hiện; cột phải: trạng thái chương trình Live / Sandbox / Paused và «See it as» một hạng |
| Earning create/edit `/programs/:event/new`, `/programs/point/:id` | `#/programs/points/earn/:id`, `…/earn/new?type=` | 34 loại earn với field riêng từng loại, câu hệ quả sống («khách chi $100 được 500 điểm, đáng $5»), nhắc khi quá hào phóng, xem trước trên store |
| Redeeming create/edit | `#/programs/points/rewards/:id`, `…/rewards/new?type=` | 8 loại reward, luật mã giảm giá, giá theo hạng, giá trị trên 100 điểm |
| Point expiration `/programs?type=point_expiration` + đặt tên điểm | Programs › Points › Point settings `#/programs/points/settings` | Tên điểm, giá trị 1 điểm kèm bảng «order rules đang trả lại bao nhiêu», hết hạn (never / không hoạt động / ngày cố định + nhắc), làm tròn |
| Referrals `/programs?type=referral` + 2 màn reward | Programs › Referrals `#/programs/referrals` | Một màn: người giới thiệu nhận gì, bạn nhận gì, luật chống gian lận, xem trước |
| Milestones `/programs?type=milestone` + milestone reward | Programs › Milestones `#/programs/milestones/:id` | 8 loại, mẫu dựng sẵn, bậc thang các mốc, cấp cho khách đã đạt |
| Quizzes `/programs?type=quest`, `/quests/:id` | Programs › Quizzes `#/programs/quizzes/:id` | 7 mẫu, builder có Set up / Analytics, điều hướng câu hỏi, xem trước |
| Membership `/membership`, VIP Tiers `/membership/vip`, tier create/edit, tier reward | VIP & membership `#/vip`, `#/vip/tiers`, `#/vip/tiers/:id`, `#/vip/tiers/settings?tab=` | Thang hạng đặt cạnh nhau (mốc, hệ số, perk), câu luật lên hạng; Rules / Demotion / Launch / Sync / Design / Emails |
| Member-exclusive deal | `#/vip/deals` | List + editor |
| Subscription membership + Membership Plans V2 | `#/vip/paid` | Plans V2: giá, chu kỳ, trial, perk, đẩy lên hạng, khi huỷ thì sao, người đang đăng ký |
| Partner tier `/wholesale/vip`, partner perk | `#/vip/partners` | List + editor |
| On-site content `/storefront` (7 tab) và các editor con | On your store `#/store`, `#/store/:surface` | 7 nơi khách thấy chương trình, mỗi nơi một bản đồ nhỏ của trang + 1 công tắc; editor = sections (hiện / ẩn / xếp) + field riêng + xem trước theo màu brand. Gộp vào editor: Point calculator, Redeem in cart, Loyalty hub, Ways to earn/redeem (đổi tên hiển thị, ẩn), FAQs (thêm / xoá / xếp, Joy AI viết), Donation, Signup block, Checkout quick redeem |
| Generate pass wallet, Apple/Google wallet, Export QR, QR widget `/customers/wallet…` | On your store › Wallet pass `#/store/wallet` | Một màn, vì đó là chỗ khách thấy chương trình, không phải dữ liệu khách |
| Customers `/customers`, profile `/customers/profile/:id` | Customers `#/customers`, `#/customers/:id` | Tab All / Members / Guests / Left program / B2B, tìm, lọc hạng, sắp xếp, cột tuỳ chọn, chọn nhiều; profile có timeline, coupon, referral, milestone, câu trả lời quiz, chỉnh điểm có «cũ → mới» |
| Activities + Reviews + Google Maps reviews + Submit receipt / form | Customers › To review `#/customers/review`, Activity `#/customers/activity` | Mọi thứ chờ duyệt về một hàng đợi (duyệt / từ chối / chọn nhiều, xem ảnh hoá đơn); log hoạt động lọc theo loại và ngày |
| Import history, Migration, Referral whitelist, Merge customer | Customers › ⋯ (Migration, Merge, Whitelist, Import history) | Migration 5 bước; giữ đủ, chỉ đưa vào menu phụ vì ít dùng |
| Companies, Company profile | `#/customers/companies` | |
| Analytics, các report con, Analytics V2 | Analytics `#/analytics?tab=` | 6 tab, chọn 7 / 30 / 90 ngày, Customize ẩn widget (nhớ), Export, Funnel |
| Integrations `/integration` | Integrations `#/integrations/:id` | Lọc theo nhóm, tìm, đã kết nối lên đầu, trang chi tiết có đồng bộ gì, kết nối / API key / ngắt có hỏi, MCP |
| Settings `/settings?type=` (General, Colors, Email, Notifications, Before launch, Order, Translations, Subscription, Plans, Developers, Additional) | Settings `#/settings/:section` | Danh sách mục tìm được như Settings của admin mới (điện thoại thành Select); Notifications có editor + xem trước email + gửi thử + log đã gửi; Plans tháng / năm, đổi gói có xác nhận |
| Wishlist `/joy-wishlist`, Subscription `/joy-subscriptions` | `#/wishlist`, `#/subscription` | Màn giới thiệu cross-app |

## Cố ý chưa dựng và vì sao

- Mode hết hạn thứ ba «tính từ ngày kiếm điểm» (khoá Ultimate): chưa thêm vào Point settings, vì cần thống nhất cách
  nói với merchant khi hai luật hết hạn chồng nhau. Dev giữ nguyên logic production.
- Editor dịch từng chuỗi (`/settings/translations/editor`): màn Translations chỉ có danh sách ngôn ngữ và trạng thái, vì
  nội dung từng chuỗi là bảng dữ liệu, không có quyết định thiết kế mới.
- Metric builder của Analytics V2 (Ultimate): chỉ có lối vào «Create metric» trong ⋯, mở toast.
- Bản cũ (Classic widget V1/V3, Loyalty page V1, Referral widget V1/V2, Redeem inline, Signup widget cũ): chỉ có dòng báo
  «shop dùng bản cũ vẫn giữ editor», vì bản mới thay hẳn và shop mới không thấy chúng.
- Popups Visit website / Reward reminder: production đã lọc khỏi menu (deprecated), nên không dựng.
- Voucher đối tác tuỳ chỉnh (chỉ thị trường VN) và các reward POS cũ: không đưa vào bộ chọn loại reward.
- Orphaned plans của Membership V2: là màn sửa dữ liệu lỗi cho support, chỉ ghi chú cho dev.
- Mô hình subscription theo từng sản phẩm cũ (`/membership/subscription-membership/...`): Plans V2 thay; dev giữ route
  cũ cho shop chưa chuyển.

## Vòng gu 18/11 15:00 (sau lời Alex chê bản Codex «lung tung xấu khó nhìn thừa thãi»)

Bản này thành bản chính. Ưu tiên đổi sang gu: mỗi màn chỉ hiện cái merchant cần quyết ngay, trường ít dùng gập lại, đủ
trường nhưng không bày hết. Khung dùng chung cho mọi editor (`ui/parts.jsx`: `EditorHero`, `EditorShell`, `Panel`,
`MoreSettings`, `ListRow`):

- Đầu màn là **một câu hệ quả to** làm điểm nhìn («Customers get 5 points per $1 they spend») + 3–4 số chính + công tắc bật tắt.
  Trước đó cột phải có 5–6 thẻ nhỏ (Status, Summary, Who, When, How often, Email), đúng lỗi phản ví dụ.
- Phần chính chỉ còn 1–2 thẻ trường cần quyết; còn lại vào một thẻ **More settings** gập, dòng phụ liệt kê những gì bên
  trong để vẫn tìm được (ví dụ Place an order: How it looks in the widget · Which orders count · Rounding · VIP tiers · When it runs · How often · Email).
- Cột phải chỉ còn bản xem trước (widget, thẻ hạng có ảnh thật, thẻ gói trả phí, email, ảnh chia sẻ referral).
- Danh sách (Points, Home, Settings) theo hàng của bản xem trước: tên, một giá trị bên phải, mũi tên; bỏ công tắc và menu
  trên từng hàng (bật tắt nằm ở đầu editor, đổi thứ tự reward bằng nút Change order).
- Home một cột: dòng tình trạng mảnh, việc cần làm gom một thẻ (thay 3 băng cảnh báo), Setup guide chỉ hiện 4 bước kế tiếp,
  kết quả 30 ngày, tính năng mới có ảnh, Learn + Help + Ask Joy AI gộp một thẻ. Biểu đồ vẽ đúng cỡ thật (trước bị phóng chữ).
- Points của shop chưa cài: **một quyết định** 3% / 5% / 8% như bản xem trước Alex khen, Joy tự đổi ra số điểm mỗi $1.
- VIP: dải chọn hạng trên đầu editor hạng, thẻ màu có ảnh cho từng hạng trong bảng hạng.
- Thẻ một kiểu viền nhẹ ở mọi màn; băng báo lỗi sửa chữ trắng trên nền hồng nhạt (không đọc được).

Cách so: chụp Home, Gold, bảng hạng, shop mới, Referrals ở 1440 và 390, đặt cạnh 5 ảnh bản xem trước
(`output/2026-11-18-admin-revamp/shots/{home,program-tier-gold,program-overview,program-state-empty,referrals}`), sửa
màn nào nhiều khối hơn. Phản ví dụ đã đối chiếu: `full/gate-r2/{settings_general,programs_points_earn_e-order,vip_tiers_t-gold,home}-1440.png`.

## Vòng sạch 18/11 15:30 (sau lời Alex «nhìn rối quá k đẹp k clean được như essen»)

Làm theo skill /design (tham chiếu trước, một hướng, cổng máy + bảy câu) và bản giao `opus/spec-clean.md`. Báo cáo tham
chiếu và lý do từng thay đổi: `output/2026-11-18-admin-revamp/opus/clean/references.md`. Màn Points làm trước, Hermes
duyệt hướng 15:42, rồi áp cho mọi màn bằng bộ khối chung `ui/clean.jsx` (`CSection`, `CRow`, `CProps`, `CCols`, `CSide`,
`CSearch`) và lớp CSS `pt-*`:

- **Dòng danh sách = icon xám không nền + tên chữ thường + MỘT giá trị xám + mũi tên.** Tắt = tên xám + nhãn «Off». Không
  công tắc, không dòng phụ, không nút Xoá trên dòng: bật tắt, nhân bản, xoá ở đầu màn sửa.
- **Thêm = nút nhỏ «+ X» cạnh tiêu đề mục** (+ Way to earn, + Reward, + Milestone, + Quiz, + Tier, + Deal, + Plan…). Thanh
  tiêu đề tối đa 1 nút chính + 1 nút phụ, còn lại vào ⋯ (Programs, Points, Milestones, Quizzes, VIP, On your store chỉ còn ⋯).
- **Thanh chuyển trong trang = tab viên của Polaris 2** (viên chọn xám, không ray, như màn thật Joy Partner tier programs) ở
  Programs, VIP, Customers, On your store, Analytics. Khác luật 3 của bản giao: giữ vì menu app chỉ một cấp, bỏ thì
  Referrals / Milestones / Quizzes / Member deals… mất lối vào.
- **Một cột nội dung + cột phải hẹp 300px** (khuôn chính + «Summary» của Shopify admin) cho trạng thái và vài lựa chọn;
  tablet đưa cột phải lên trên (hoặc xuống dưới với All programs, Milestones, hồ sơ khách, On your store), điện thoại xếp chồng.
- **Số thống kê 30 ngày rời khỏi màn cài đặt**: bỏ 4 ô số ở All programs, số «friends referred / revenue» ở Referrals, «members
  per tier» ở VIP, cột «sent / open rate» ở Notifications, các số «redeemed / reached / subscribers…» ở đầu màn sửa
  (`EditorHero` lọc chúng). Số vẫn ở Analytics.
- **Dòng mô tả dưới tiêu đề tối đa 6 chữ**: `shortNote()` trong `FormCard`, `Panel`, `Block`, `Section` bỏ dòng dài hơn.
- **Một điểm màu mỗi màn**: ảnh 3D Joy ở Points; huy hiệu xanh «Member», «Connected», số +/− xanh đỏ, băng tím «Program
  health» đổi sang chữ xám.
- Home: màn đầu còn 4 khối (lời chào + tình trạng, Needs your attention, Setup guide 3 bước kế tiếp, Last 30 days).
- Integrations: danh sách dòng thay lưới thẻ logo nhiều màu; nhóm ở cột phải (điện thoại là ô chọn).
- Hồ sơ khách: số dư to ở đầu, Activity / Coupons / Referrals / Milestones / Quiz answers thành danh sách; cột phải 2 thẻ.
- Biểu đồ: nhãn ngày theo bề rộng thật (khoảng 72px một nhãn), không chồng nhau ở điện thoại.

Cách so: mỗi màn chụp 1440 + 390 vào `opus/clean/shots/`, đặt cạnh 4 ảnh Essent và ảnh Alex chê, hỏi «nhìn đâu trước, có gì
thừa»; bảng màn × kết quả máy kiểm ở `opus/clean/done.txt`.

### Lượt bản sắc Joy 18/11 15:59 (Alex: «cái này hay cái nào tốt nhất thì học chứ k làm giống họ 100%»)

Essent chỉ còn là nơi học nguyên tắc (một giá trị mỗi dòng, ít điểm màu, khoảng thở, nút thêm cạnh tiêu đề mục). Học gì /
không chép gì cho từng tham chiếu, thêm Joy thật Polaris 2, Polaris 2 look, Stripe, Linear: `opus/clean/references.md`.

- Points bỏ khuôn «danh sách + thẻ và dòng thuộc tính ở cột phải» của Essent: câu hỏi số 1 (điểm đáng bao nhiêu) thành dải
  trên cùng có ảnh 3D ví + đồng xu của Joy, rồi kiếm | đổi đặt cạnh nhau như một bảng giá (thứ tự cài của Joy).
- Thanh chuyển từ kiểu ray xám + viên trắng (Essent) sang tab viên của Polaris 2.
- Chữ trong vùng app là near-black ấm `#1C0E12` (Joy Brand 2.0 §8); Joy Red chỉ ở logo, nút chính giữ đen Polaris.
- A5: ô tìm là Polaris TextField, «See it as» và nhóm Integrations là Polaris ChoiceList; trạng thái Off / Scheduled là Badge.
- A6: bỏ các câu đứng trơ cuối trang (VIP, Analytics, To review). All programs thêm dòng «Point value» ở thẻ trạng thái.

## Quyết định thiết kế chính và vì sao khác bản cũ

1. **Mọi con số đổi ra tiền và công sức.** Bản cũ hỏi «bao nhiêu điểm» mà không nói điểm đáng bao nhiêu, nên merchant đặt
   1 điểm/$1 và reward 1.000 điểm mà không thấy khách phải chi $1.000 mới đổi được. Bản mới đặt cạnh mỗi số «đáng $5»,
   «trả lại 5%», «≈ 2 đơn», và một câu hệ quả đổi ngay khi gõ.
2. **All programs: một bảng mọi thứ khách có thể nhận, xem như một hạng.** Production rải earn, reward, referral, milestone,
   perk VIP, deal ở 6 màn, nên merchant không trả lời được «khách Gold nhận được gì». Bảng gộp + «See it as Gold» trả lời
   trong 1 cú bấm.
3. **Points là một bảng giá, không phải hai tab.** Ways to earn và Rewards nằm cạnh nhau với tỉ giá ở đầu, vì earn và
   redeem chỉ có nghĩa khi nhìn cùng nhau (kiếm 5%/đơn mà reward rẻ nhất cần 4 đơn là chương trình ít ai đổi).
4. **Nhắc, không cấm.** Khi quá hào phóng (trả lại >10%) hay reward quá xa (rẻ nhất >5 đơn) thì hiện câu nhắc cạnh field,
   vẫn cho lưu, vì merchant có lý do riêng (ra mắt, BFCM).
5. **Mỗi editor có «Customers see» theo màu brand.** Merchant thấy ngay khách đọc gì; On your store dùng bản đồ trang nhỏ
   để chỉ chỗ khối nằm trên trang thay cho tên kỹ thuật (app embed, app block).
6. **Home cho người đang chạy chương trình, Setup guide cho shop mới.** Shop mới thấy lời mời + 20 bước từ 0, không có số
   liệu rỗng; shop đang chạy thấy câu tình trạng, việc cần duyệt và kết quả. Bỏ khỏi Home cũ: banner quảng cáo xếp chồng
   (thành 1 hàng «New in Joy») và bảng thống kê lặp lại Analytics.

## Kiểm đã chạy (18/11/2026, sau vòng sạch)

- 87 route × 1440 / 768 / 390: 0 lỗi console, 0 tràn ngang; 15 màn chính × 6 trạng thái × 2 cỡ: 0 lỗi, 0 tràn.
- `render_check` từng màn (63 route): 0 FAIL; WARN còn lại là nút 30px và logo của khung admin chung. `slop_check --palette
  polaris` cả `src`: 0 FAIL.
- 13 luồng bấm thật (Playwright): tạo earn → lưu → tải lại còn; câu hệ quả sống; bật tắt trong editor lưu được; More
  settings mở ra và trường bên trong lưu được; xoá reward có hỏi; All programs tìm + xem như Gold; Customers tìm + chỉnh
  điểm có xem trước; duyệt submission cộng điểm; Settings lưu; rời trang khi chưa lưu có hỏi; thêm hạng VIP; Analytics
  Customize nhớ; Home bỏ cảnh báo nhớ.
- `npm run build` trong thư mục PASS; `node scripts/check-source.mjs` và `node scripts/check-reference.mjs` ở gốc repo PASS.
