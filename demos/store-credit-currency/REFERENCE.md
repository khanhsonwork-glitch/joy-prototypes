# Màn thật mà demo này sửa

Menu: Joy › Customers › bấm một khách › trang chi tiết khách › cột phải, card tab "Points | Store credit" (tab Store credit: số dư từng ví, "Store credit added", "Store credit deducted", nút "Adjust store credit") › modal "Adjust store credit" (dòng "Current balance", hàng ba ô Adjustment · Currency · Amount, ô Expiration + câu luật)
Màn thật: trang chi tiết khách của Joy Loyalty, dựng theo code avada/master 6242ed8e6b (03/11/2026): pages/Customer/Edit.js (khung trang, cột trái Overview/Referrals/Activities, cột phải card số dư/Tags/Notes), pages/Customer/Details/Point.js (card tab, dòng số dư từng ví), pages/Customer/Details/useAdjustStoreCreditModal.js (modal), components/Atoms/ExpirationDatePopover (ô Expiration), locale CustomerDetails.json + EditCustomer.json + Banner.json (chữ). Đối chiếu ảnh chụp admin production của một merchant ngày 02/11/2026 (shop tiền USD, khách trả SGD).
Ảnh so sánh: reference/real-store-credit-tab.png — chỉ cắt card "Points | Store credit" từ ảnh production, không có tên/email/SĐT khách. Ảnh nguyên trang (có dữ liệu khách thật) để ngoài repo, Jerry giữ trong Alex Brain (output/2026-11-03-store-credit-currency-prd/ref/merchant-joy-customer-detail.png). Modal "Adjust store credit": không có ảnh màn thật trong tay, dựng theo code useAdjustStoreCreditModal.js.

## Thay đổi so với màn thật (luật PRD, sửa 03/11/2026 theo chuỗi chọn ví đã chốt ngày 23/09)

- Tiền gợi ý cho khách = bước đầu tiên ra kết quả, chỉ trong các tiền shop đang bán: (a) tiền khách trả nhiều đơn nhất trong 12 tháng (hoà → đơn gần nhất), (b) tiền khách xem storefront lần cuối, (c) tiền của market chứa địa chỉ mặc định, (d) tiền shop.
- Tab Store credit: mọi số tiền có mã tiền một lần sau số ("$20.00 USD", "+$20.00 USD"), như trang khách của Shopify. Khách chưa có ví nào còn số dư → một dòng 0 bằng tiền gợi ý. Ví tiền gợi ý trống mà ví khác có tiền → một dòng chữ mờ dưới số dư ("Store credit in USD can only be spent on orders paid in USD. Suggested currency for this customer: SGD.").
- Modal, Credit: Currency = mọi tiền shop đang bán, tiền gợi ý có nhãn "(suggested)", mở modal là Credit + tiền gợi ý. Đang chọn tiền gợi ý → một dòng mờ nói lý do (bước a/b/c). Chọn tiền khác → một dòng cảnh báo; vẫn Confirm được. Không tính được tiền gợi ý → chọn tiền shop + cảnh báo "We couldn't check which currency this customer pays in…".
- Modal, Debit: Currency = chỉ các ví còn số dư (tiền shop trước); ví đang chọn trống → tự nhảy sang ví có tiền đầu tiên; không có dòng lý do hay cảnh báo.
- Dòng Activities sau Confirm ghi mã tiền một lần ("Admin credited $20.00 SGD store credit").
- Phần còn lại của trang và modal giữ nguyên như màn thật.
