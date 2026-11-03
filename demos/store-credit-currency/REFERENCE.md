# Màn thật mà demo này sửa

Menu: Joy › Customers › bấm một khách › trang chi tiết khách › cột phải, card tab "Points | Store credit" (tab Store credit: số dư từng ví, "Store credit added", "Store credit deducted", nút "Adjust store credit") › modal "Adjust store credit" (dòng "Current balance", hàng ba ô Adjustment · Currency · Amount, ô Expiration + câu luật)
Màn thật: trang chi tiết khách của Joy Loyalty, dựng theo code avada/master 6242ed8e6b (03/11/2026): pages/Customer/Edit.js (khung trang, cột trái Overview/Referrals/Activities, cột phải card số dư/Tags/Notes), pages/Customer/Details/Point.js (card tab, dòng số dư từng ví), pages/Customer/Details/useAdjustStoreCreditModal.js (modal), components/Atoms/ExpirationDatePopover (ô Expiration), locale CustomerDetails.json + EditCustomer.json + Banner.json (chữ). Đối chiếu ảnh chụp admin production của một merchant ngày 02/11/2026 (shop tiền USD, khách trả SGD).
Ảnh so sánh: reference/real-store-credit-tab.png — chỉ cắt card "Points | Store credit" từ ảnh production, không có tên/email/SĐT khách. Ảnh nguyên trang (có dữ liệu khách thật) để ngoài repo, Jerry giữ trong Alex Brain (output/2026-11-03-store-credit-currency-prd/ref/merchant-joy-customer-detail.png). Modal "Adjust store credit": không có ảnh màn thật trong tay, dựng theo code useAdjustStoreCreditModal.js.

## Thay đổi so với màn thật (luật A1–A2, B3–B8 của PRD)

- Tab Store credit: mọi số tiền có mã tiền sau số ("$20.00 USD", "+$20.00 USD", "-$0.00 USD"), cùng kiểu Shopify và dòng "Current balance" của modal đang ghi.
- Tab Store credit: tiền khách trả gần đây không có ví nào còn số dư mà ví khác có → một dòng chữ mờ dưới số dư ("Recent orders are paid in SGD. This balance can only be used on orders paid in USD.").
- Modal: lựa chọn Currency = tiền shop + mọi ví của khách + tiền khách trả gần đây (bỏ trùng). Mở modal thì chọn sẵn tiền khách trả; khách chưa có đơn thì ví đầu tiên còn số dư, không có nữa thì tiền shop.
- Modal: chọn tiền khác tiền khách trả → một dòng cảnh báo ngay dưới hàng Adjustment · Currency · Amount; vẫn bấm Confirm được.
- Phần còn lại của trang và modal giữ nguyên như màn thật.
