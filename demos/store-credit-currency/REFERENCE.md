# Màn thật mà demo này sửa

Menu: Joy › Customers › bấm một khách › trang chi tiết khách › cột phải, card tab "Points | Store credit" (tab Store credit: số dư từng ví, "Store credit added", "Store credit deducted", nút "Adjust store credit") › modal "Adjust store credit" (dòng "Current balance", hàng ba ô Adjustment · Currency · Amount, ô Expiration + câu luật)
Màn thật: trang chi tiết khách của Joy Loyalty, dựng theo code avada/master 6242ed8e6b (03/11/2026): pages/Customer/Edit.js (khung trang, cột trái Overview/Referrals/Activities, cột phải card số dư/Tags/Notes), pages/Customer/Details/Point.js (card tab, dòng số dư từng ví), pages/Customer/Details/useAdjustStoreCreditModal.js (modal), components/Atoms/ExpirationDatePopover (ô Expiration), locale CustomerDetails.json + EditCustomer.json + Banner.json (chữ). Đối chiếu ảnh chụp admin production của một merchant ngày 02/11/2026 (shop tiền USD, khách trả SGD).
Ảnh so sánh: reference/real-store-credit-tab.png — chỉ cắt card "Points | Store credit" từ ảnh production, không có tên/email/SĐT khách. Ảnh nguyên trang (có dữ liệu khách thật) để ngoài repo, Jerry giữ trong Alex Brain (output/2026-11-03-store-credit-currency-prd/ref/merchant-joy-customer-detail.png). Modal "Adjust store credit": không có ảnh màn thật trong tay, dựng theo code useAdjustStoreCreditModal.js.

## Thay đổi so với màn thật (PRD mục A–D, bản sau review QA 03/11/2026)

- Ví gợi ý = bước đầu tiên ra kết quả, chỉ trong các tiền shop đang bán: (1) tiền khách trả nhiều đơn nhất trong 12 tháng (hoà → đơn gần nhất), (2) tiền khách xem storefront lần cuối, (3) tiền của market chứa địa chỉ mặc định, (4) tiền shop. Shop chỉ bán một loại tiền → luôn là loại đó.
- Tab Store credit: mọi số tiền có mã tiền đúng một lần ("$20.00 USD", "+$20.00 USD"), kể cả shop một loại tiền. Khách chưa có ví nào có số dư → một dòng 0 bằng ví gợi ý. Gợi ý từ bước 1–3 và có ví khác ví gợi ý còn số dư → một dòng chữ nhạt dưới số dư (một ví lệch / nhiều ví lệch), vẫn hiện sau khi đã cộng vào ví gợi ý. Bước 4 → không hiện.
- Modal: mỗi lần mở (kể cả ngay sau khi lưu) về Credit, ví gợi ý, Amount 0, Expiration theo cài đặt chung. Đang tính ví gợi ý → ô Currency đang tải, ô Currency và Confirm khoá. Shop một loại tiền → ô Currency khoá, không dòng nào.
- Modal, Credit: Currency = mọi tiền shop bán, ví gợi ý có "(suggested)". Đang chọn ví gợi ý → dòng nhạt nêu lý do (bước 1/2/3) hoặc câu trung tính (bước 4). Gợi ý từ bước 1–3 mà chọn tiền khác → dòng cảnh báo vàng, vẫn Confirm được; từ bước 4 → không dòng nào. Không tính được gợi ý → tiền shop + cảnh báo "We couldn't check…".
- Modal, Debit: chỉ các ví có số dư > 0 (tiền shop trước); ví đang chọn trống → Joy tự chọn ví có tiền đầu tiên; không dòng nào. Quay lại Credit: tiền do Joy tự đổi → về ví gợi ý; tiền merchant tự chọn → giữ nếu shop còn bán.
- Activities: badge +/- và câu "Admin credited $10.00 SGD store credit" ghi mã tiền đúng một lần.
- Phần còn lại của trang và modal giữ nguyên như màn thật.
