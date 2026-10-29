# Guideline dựng prototype Joy

Đọc file này trước khi sửa một demo, dù bạn là người hay AI. Mục tiêu: người review mở link là thấy **đúng app Joy trong Shopify admin**, bấm được, đủ trạng thái, và không có thứ gì không được public.

Xem mẫu chuẩn đang chạy: https://joy-prototypes.web.app/starter/ (dựng từ `templates/demo/`, cũng là thứ `npm run new` chép ra).

## 1. Khung có sẵn: đừng dựng lại

| Phần | File | Dùng để |
|---|---|---|
| Khung admin | `src/shell/AdminChrome.jsx` | Thanh trên Shopify, menu trái (thành drawer trên điện thoại), header app Joy. Đổi tên app/menu ở `src/demo.config.js` và mảng menu trong file này |
| Điều hướng | `src/shell/router.jsx` | Routing bằng hash: `#/demo`, `#/demo/<id>`. Dùng `url: '/demo/x'` của Polaris hoặc `useNavigate()` |
| Thông báo | `src/shell/ShellContext.jsx` | `notify('Reward saved')`, `notify('Couldn’t save', {error: true})` |
| 9 trạng thái | `src/kit/scenario.jsx`, `src/kit/ProtoControls.jsx` | `useScenario().state` + nút **Prototype** góc dưới để đổi trạng thái; `?state=empty` trong URL để gửi link đúng trạng thái |
| Rỗng / đang tải / lỗi | `src/kit/StateView.jsx` | `EmptyView`, `LoadingView`, `ErrorView`: mọi màn dùng chung, nhìn giống nhau |
| Drawer | `src/kit/Drawer.jsx` | Bảng trượt bên phải cho chi tiết phụ (lịch sử, bộ lọc). Polaris không có drawer; cái này giữ focus, Esc đóng, trả focus |
| Dữ liệu giả | `src/data/index.js`, `src/state/*.jsx` | Shop giả Pomelo Park, thành viên `@example.com`; tạo/sửa/xoá sống trong bộ nhớ tới khi tải lại |
| Màn mẫu | `src/pages/RewardsList.jsx`, `RewardEdit.jsx` | Danh sách (tabs, tìm kiếm, bảng, phân trang) và form tạo/sửa (validate, toast, modal xoá, drawer). Thay "rewards" bằng tính năng của bạn, **giữ cấu trúc** |
| Bảng component | `src/pages/KitPage.jsx` (`#/kit`) | Nút, badge, banner, form, tabs, bảng, overlay, token: xem trước khi tự chế |

Component: **Polaris 12** (`@shopify/polaris`) là bộ duy nhất. Thứ Polaris có (Page, Card, IndexTable, Modal, Toast, Banner, Tabs, TextField…) thì dùng Polaris, không tự vẽ.

## 2. Token

- Màu, khoảng cách, chữ, bo góc: `var(--p-…)` của Polaris. Không viết mã màu hex trong component.
- Màu không có trong Polaris (khung admin, nút Prototype, thương hiệu shop giả) nằm một chỗ: `src/styles/tokens.css`.
- Font Inter tự host (`src/fonts/`, SIL OFL). Không link Google Fonts hay CDN: prototype không gọi ra ngoài.

## 3. Chín trạng thái: màn nào cũng phải có

| Trạng thái | Cách xem | Màn phải làm gì |
|---|---|---|
| Default | mở bình thường | Dữ liệu mẫu đủ để hiểu tính năng |
| Empty | `?state=empty` | `EmptyView`: một câu nói vì sao trống + nút tạo |
| Loading | `?state=loading` | `LoadingView` (skeleton), nút chính bị khoá |
| Error | `?state=error` | `ErrorView` nói chuyện gì xảy ra, dữ liệu có mất không, nút **Try again** |
| Disabled | `?state=disabled` | Banner nói **vì sao** bị khoá (gói, quyền); field và nút khoá theo |
| Hover | rê chuột | Dòng bảng, nút đổi màu (Polaris tự làm, đừng tắt) |
| Focus | phím Tab | Mọi control tới được bằng Tab, có viền focus nhìn thấy |
| Overflow | `?state=overflow` | Tên dài nhất, số lớn nhất: không vỡ khung, không cuộn ngang |
| Worst | `?state=worst` | Overflow + nhiều dòng + lỗi đồng bộ cùng lúc |

Thêm trạng thái riêng của tính năng vào `STATES` trong `src/kit/scenario.jsx`.

## 4. Giống app thật

- **Đúng chỗ thật, bản mới nhất.** Trước khi vẽ, tra code Joy nhánh `avada/master` (không phải bản cũ, không phải prototype cũ) để biết thay đổi nằm ở đâu: menu → trang → panel/field. Đặt thay đổi đúng vào chỗ đó, cùng loại control. Đã có trang hay panel thật cho việc này thì sửa ở đó, không đẻ khối cài đặt mới ở trang khác. Ví dụ sai (29/10/2026): khối "Order value tiers" riêng ở trang Referrals, trong khi phần thưởng của từng bên nằm ở trang Edit của bên đó.
- Ghi bản đồ đó vào `demos/<slug>/REFERENCE.md` (`npm run new` tạo sẵn): `Menu:` đường menu nối bằng ›, `Màn thật:` tên màn và đã xem ở đâu, `Ảnh so sánh:` ảnh màn thật (staging hoặc ảnh chụp) để reviewer đặt cạnh ảnh prototype. Ảnh màn thật để trong repo phải qua cổng §5 như mọi ảnh khác; không qua được thì ghi "ngoài repo" + ai giữ.
- **Link mở thẳng màn có thay đổi.** `reviewUrl` của thẻ là `#/<màn>` của đúng màn đó (kèm `?state=` nếu cần), hash đổi theo khi bấm, và màn vẫn tới được bằng menu. `npm run check` đỏ nếu demo mới thiếu `REFERENCE.md` hay link không mở thẳng một màn.
- Mở màn tham chiếu của Joy (staging hoặc ảnh chụp) **trước** khi vẽ. Giữ khung admin, chữ tiếng Anh như app, cùng loại control app đang dùng.
- Reviewer so ảnh prototype (`npm run shot`) với ảnh màn thật trong `REFERENCE.md`. "Không giống app thật" hay "sai chỗ" là lỗi chặn, không phải góp ý.
- Một nút chính mỗi màn. Thao tác xoá/không hoàn tác được thì hỏi lại bằng Modal.
- Lỗi form: hiện dưới field, nói cách sửa; bấm Save khi có lỗi thì focus nhảy tới field sai.
- Điện thoại (375px), tablet (768px), desktop (1440px): không cuộn ngang; bảng nhiều cột thành khối xếp dọc trên điện thoại.
- Phần chỉ dành cho người review (nút Prototype, ghi chú) dùng màu hổ phách, nhìn ra ngay là không phải sản phẩm.

## 5. Điều cấm (máy chặn trong `npm run check`)

- Không dữ liệu thật: tên merchant, email khách, chat, ticket, số liệu doanh nghiệp. Email chỉ `@example.com` hoặc `*.example`.
- Không code hay asset nội bộ của Joy/Avada: không import `packages/`, không copy file từ repo Joy, không ảnh chụp ghi chú nội bộ. Ảnh thẻ hub là ảnh màn prototype (`npm run shot`).
- Không secret, không `.env`, không link Notion/GitLab/Google Docs/Slack, không mã task nội bộ trong chữ hay trong ảnh (ảnh được OCR).
- Không gọi backend hay dịch vụ ngoài. Prototype chạy hoàn toàn trên trình duyệt.
- Dependency mới phải có license mở đã duyệt (MIT, ISC, BSD, Apache-2.0…); font chỉ SIL OFL và để file OFL cạnh font. Xem `THIRD_PARTY_LICENSES.md`.
- Không chữ giữ chỗ (lorem, TODO, `undefined`), không ảnh hỏng, không ô xám thay ảnh.
- Thẻ hub không còn dùng thì **xoá khỏi** `hub/data/registry.json`, không giữ link "để sau": repo public nên link vẫn lộ.

## 6. Xong là khi

1. `npm run check` xanh (đúng bộ kiểm CI chạy), kể cả cổng màn thật (`REFERENCE.md` + link mở thẳng màn).
2. Đã tự bấm mọi nút trên link xem thử của PR, ở cả điện thoại và desktop, qua đủ 9 trạng thái.
3. Ảnh thẻ chụp lại sau lần sửa cuối: `npm run shot -- <slug> --replace`.
