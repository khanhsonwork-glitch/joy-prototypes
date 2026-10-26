# Joy Prototypes

Hub All-in-one và các prototype HTML của Joy. Repo này chỉ chứa prototype tĩnh với dữ liệu giả: không có code production của Joy, không có dữ liệu merchant/khách, không có secret.

- **Link chung (live):** https://joy-prototypes.web.app — chỉ đổi khi một Pull Request được merge vào `main`.
- **Link xem thử:** mỗi Pull Request có link riêng `https://joy-prototypes--pr<số>-….web.app`, bot tự comment vào PR và cập nhật sau mỗi lần push.

Prototype khác trong hub là link tới trang riêng của chúng (khai báo trong `hub/data/registry.json`); source của chúng không nằm ở đây.

## Cài một lần

Cần Node 22.12 trở lên (`node -v`; thiếu thì `nvm install 22 && nvm use 22`) và quyền push vào repo (nhờ người giữ hub mời làm collaborator).

```sh
git clone https://github.com/khanhsonwork-glitch/joy-prototypes.git
cd joy-prototypes
npm ci          # cài cả hub lẫn từng demo
```

## Sửa → xem thử → lên link chung

```sh
git switch main && git pull               # lấy bản mới nhất
git switch -c <tên-việc>                  # nhánh riêng, ví dụ birthday-reward
npm run dev -- hub                        # hoặc: npm run dev -- points-giveaway  (danh sách: npm run dev)
#   ... sửa, trình duyệt tự tải lại ...
npm run check                             # đúng bộ kiểm CI sẽ chạy
git add -A && git commit -m "<sửa gì>"
git push -u origin <tên-việc>             # GitHub in sẵn link mở Pull Request
```

1. **Mở Pull Request vào `main`.** CI chạy `npm run check` rồi dựng link xem thử riêng cho PR, comment vào PR. Push thêm commit thì link tự cập nhật.
2. **Gửi link xem thử cho người duyệt.** Link chung chưa đổi.
3. **Merge khi check xanh.** CI chạy lại toàn bộ kiểm rồi cập nhật link chung. Không ai đẩy thẳng lên `main` hay deploy tay: `main` bị khoá, chỉ nhận PR có check xanh.

Hai merge sát nhau: deploy chạy lần lượt, bản mới nhất thắng.

### Khi bị xung đột

GitHub báo PR "This branch has conflicts" khi hai người sửa cùng chỗ một file. Chỗ hay gặp nhất là `hub/data/registry.json` (danh sách thẻ hub).

1. Ở nhánh của mình: `git pull origin main`.
2. Mở file git báo, giữ phần của cả hai người (với `registry.json`: giữ cả hai thẻ, không xoá thẻ của người kia).
3. `npm run check`, rồi `git add`, `git commit`, `git push`. PR tự chạy lại check và link xem thử.

`npm run new-demo` chèn thẻ mới theo thứ tự tên chứ không dồn vào cuối file, nên hai người cùng thêm demo mới thường không xung đột.

## Thêm một demo mới

```sh
npm run new-demo -- birthday-reward "Birthday reward"
npm run dev -- birthday-reward
npm run shot -- birthday-reward       # chụp ảnh thẻ cho hub (check báo lỗi nếu thiếu)
```

Lệnh tạo `demos/birthday-reward/` từ `templates/demo/` và thêm một thẻ "Đang review" vào hub. Quy ước (dữ liệu giả, không import code production, routing bằng hash) nằm trong [`templates/demo/README.md`](templates/demo/README.md). Tuỳ chọn: `--product wishlist`, `--area "Membership"`.

Đổi tên, khu vực, trạng thái, ảnh của thẻ: sửa đúng record đó trong `hub/data/registry.json`. Ảnh thẻ ở `hub/public/shots/`, tối đa 1600×900.

## `npm run check` kiểm gì

1. Quét toàn bộ file trong repo: secret/token, link nội bộ (Notion, GitLab, Google Docs…), email thật (chỉ cho `@example.com`), tên merchant thật trong `privacy/blocklist.json` (lưu dạng mã băm; thêm tên: `npm run privacy:add -- "<tên>"`).
2. Build `dist/` (hub + demo + `dist/firebase.json` sinh từ registry), quét lại bundle công khai.
3. Test trình duyệt cho hub: thẻ, tìm kiếm, redirect, trang 404, font, ảnh. Ảnh chụp ở `evidence/` (không đưa lên Git; trên CI nằm trong artifact `evidence`).

Xem bản build hoàn chỉnh như trên Firebase: `npm run build`, rồi `npm run serve`.

## Cấu trúc

```text
hub/                    Hub All-in-one (React + Vite). Dữ liệu thẻ: hub/data/registry.json
demos/<slug>/           Mỗi demo một app Vite riêng; hub dựng nó ở /<product>/<slug>/
templates/demo/         Mẫu cho demo mới
privacy/blocklist.json  Mã băm tên merchant/brand thật cần chặn
scripts/                build, dev, serve, new-demo, shot, check
test/                   Test trình duyệt của hub
.github/workflows/      pull-request.yml: check + link xem thử · live.yml: merge vào main → link chung
```

## Người giữ hub

- Firebase project `joy-prototypes` (gói Spark miễn phí). CI deploy bằng service account lưu trong GitHub Secret `FIREBASE_SERVICE_ACCOUNT_JOY_PROTOTYPES`; không ai cần đăng nhập Firebase để làm việc hằng ngày.
- `main` được bảo vệ: bắt buộc PR, bắt buộc check `check_and_preview` xanh, áp cả cho admin, cấm force-push.
- PR từ fork vẫn được check nhưng không có link xem thử (fork không đọc được secret): mời người đó làm collaborator.

## Khi bị lỗi

- `Cần Node 22.12 trở lên`: `nvm install 22 && nvm use 22`, rồi `npm ci` lại.
- `Thiếu Vite` hoặc lỗi module: chạy lại `npm ci`.
- Port đang bận: `npm run serve -- hub 4180` (số cuối là port).
- PR không có link xem thử: mở tab Checks của PR xem bước nào đỏ; check đỏ thì không deploy.
