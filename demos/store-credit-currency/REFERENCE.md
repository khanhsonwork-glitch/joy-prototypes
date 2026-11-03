# Màn thật mà demo này sửa

Menu: Joy › Customers › bấm một khách › trang chi tiết khách › cột phải, card tab "Points | Store credit" (tab Store credit: số dư từng ví, "Store credit added", "Store credit deducted", nút "Adjust store credit") › modal "Adjust store credit" (dòng "Current balance", hàng ba ô Adjustment · Currency · Amount, ô Expiration + câu luật)
Màn thật: trang chi tiết khách của Joy Loyalty, dựng theo code avada/master 6242ed8e6b (03/11/2026): pages/Customer/Edit.js (khung trang, cột trái Overview/Referrals/Activities, cột phải card số dư/Tags/Notes), pages/Customer/Details/Point.js (card tab, dòng số dư từng ví), pages/Customer/Details/useAdjustStoreCreditModal.js (modal), components/Atoms/ExpirationDatePopover (ô Expiration), locale CustomerDetails.json + EditCustomer.json + Banner.json (chữ). Đối chiếu ảnh chụp admin production của một merchant ngày 02/11/2026 (shop tiền USD, khách trả SGD).
Ảnh so sánh: reference/real-store-credit-tab.png — chỉ cắt card "Points | Store credit" từ ảnh production, không có tên/email/SĐT khách. Ảnh nguyên trang (có dữ liệu khách thật) để ngoài repo, Jerry giữ trong Alex Brain (output/2026-11-03-store-credit-currency-prd/ref/merchant-joy-customer-detail.png). Modal "Adjust store credit": không có ảnh màn thật trong tay, dựng theo code useAdjustStoreCreditModal.js.

## Thay đổi so với màn thật (bản sửa UI nhỏ, Alex cắt phạm vi 03/11/2026)

- Mọi số store credit trên trang khách có mã tiền đúng một lần ở cuối: số dư, Store credit added/deducted, Current balance trong modal, dòng Activities ("$20.00 USD", "$0.00 SGD").
- Modal, Credit: Currency = mọi loại tiền shop đang bán (không chỉ tiền shop + ví khách đã có). Mở modal chọn sẵn tiền của đơn gần nhất nếu shop còn bán; khách chưa có đơn → luật hiện tại (ví có số dư đầu tiên, tiền shop trước).
- Dưới hàng Adjustment · Currency · Amount (Credit, khách có đơn): chữ nhạt "This customer's last order was paid in SGD."; chọn tiền khác → thêm dòng cảnh báo "Store credit in USD can only be spent on orders paid in USD.", vẫn Confirm được.
- Debit, tab Store credit (trừ mã tiền) và phần còn lại của trang giữ nguyên như màn thật.
