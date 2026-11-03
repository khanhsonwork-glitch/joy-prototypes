# Quyết định phạm vi (FR88)

- 30/10 Alex: "Nghĩa là muốn là phần form input cho tạo nhiều đúng k? có cho bắt buộc hoặc k" → nhiều ô, mỗi ô chọn bắt buộc/không.
- 30/10 Alex: "ok mỗi một input thì cho add tag riêng là dc nhỉ?" → tag theo từng lựa chọn của ô chọn + tag cho cả form; không tag theo ô chữ tự do.
- 30/10 Alex: "ok nhưng làm cho nó flexible và hợp lí nhất có thể nhé."
- 30/10 điều phối (Alex ok): tag gắn lúc shop duyệt, không lúc khách gửi; dùng lại phần câu hỏi + gắn tag của Quiz; câu trả lời hiện theo ô ở trang duyệt, xuất CSV.
- 30/10 sổ chốt dòng 14: hub công khai chỉ màn admin; màn khách thấy dựng trên store brand thật chỉ ở link nội bộ.
- 03/11 dev đề xuất chia hai phase, PO chốt. Phase 1 (làm trước): 5 kiểu ô (Short text, Paragraph, Number, Email, File upload), bắt buộc/không bắt buộc, 1–10 ô, tối đa 1 File upload, kiểu ô không bị khoá (trừ ô Paragraph gốc), xoá ô là mất ngay (không hỏi lại), tag chung cho cả form.
- 03/11 Phase 2 (tuần sau): thêm Link, Date, Single choice, Multiple choice; tag riêng cho từng lựa chọn; ký hiệu đứng trước ô Number; điền sẵn email khách đã đăng nhập; khoá kiểu ô đã có câu trả lời; hỏi lại khi xoá ô.
- 03/11 PO bỏ: dòng gợi ý Quiz dưới "Form fields" (mọi phase); cột "Answers" (giữ tên "Content"); panel bên phải và link "View all N answers"; nút Export; tìm theo câu trả lời (về tìm theo email như master); nhóm tag theo trạng thái; nút "Try again" cho tag ghi lỗi; câu dưới Customer tags đổi theo cấu hình (nay là một câu cố định).
- 03/11 Trang duyệt (cả hai phase): ô Content hiện câu trả lời đầu "Nhãn: giá trị", rê chuột hiện tất cả, có nút copy; ô không ghi được tag hiện "Tags not added" (Phase 2 thêm "Some tags not added: this customer already has 250 tags in Shopify"). Form gửi trước khi có tính năng giữ nguyên một Content như hôm nay.
- 03/11 Ô gốc ("root"): một ô Paragraph, là ô chữ duy nhất của form cũ nên không đổi kiểu được; nhãn có thể trống (hiện "Your answer" màu xám); xoá được. Hình dạng cũ = ô gốc là ô chữ duy nhất, bắt buộc, tuỳ chọn thêm một File upload; form đã xoá ô gốc không bao giờ là hình dạng cũ.
- 03/11 Dòng cảnh báo dưới "Form fields" chỉ hiện khi form khác hình dạng cũ: chương trình chỉ hiện trên Widget V4 và Loyalty page V2. Nếu shop chưa dùng Widget V4 (công tắc trong panel Prototype, `?v4=off`), banner cảnh báo thay cho dòng xám.
- 03/11 Mẫu Quick-start: chương trình MỚI nhận đúng 2 ô (Paragraph gốc bắt buộc + File upload không bắt buộc, Image only); chương trình ĐÃ CÓ chỉ đổi chữ như hôm nay (nhãn + placeholder ô gốc, nhãn upload, chữ ở tab Design), giữ danh sách ô, Required và cài đặt upload; ô gốc đã xoá thì thêm lại ở đầu (trừ khi đã đủ 10 ô). Công tắc "Program" trong panel Prototype (`?program=new`) để xem chương trình mới.
- 03/11 Tag (cả tag chung và tag từng lựa chọn): không cho tag bắt đầu bằng "Joy:", "Joy " hay "joy_", hoặc trùng 5 tag thành viên mặc định của Joy (không phân biệt hoa thường); trùng nhãn/tag cũng không phân biệt hoa thường và bỏ khoảng trắng đầu cuối.
- 03/11 Link: `?version=today|phase1|phase2` (trước hoặc sau dấu #); không có thì mở Phase 1. Link cũ `?v=today` vẫn mở Today, `?v=new` mở Phase 1.
