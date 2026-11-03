# Quyết định phạm vi (FR88)

- 30/10 Alex: "Nghĩa là muốn là phần form input cho tạo nhiều đúng k? có cho bắt buộc hoặc k" → nhiều ô, mỗi ô chọn bắt buộc/không.
- 30/10 Alex: "ok mỗi một input thì cho add tag riêng là dc nhỉ?" → tag theo từng lựa chọn của ô chọn + tag cho cả form; không tag theo ô chữ tự do.
- 30/10 Alex: "ok nhưng làm cho nó flexible và hợp lí nhất có thể nhé."
- 30/10 điều phối (Alex ok): tag gắn lúc shop duyệt, không lúc khách gửi; dùng lại phần câu hỏi + gắn tag của Quiz; câu trả lời hiện theo ô ở trang duyệt, xuất CSV.
- 30/10 sổ chốt dòng 14: hub công khai chỉ màn admin; màn khách thấy dựng trên store brand thật chỉ ở link nội bộ.
- 03/11 dev đề xuất chia hai phase, PO chốt. Phase 1 (làm trước): 4 kiểu ô (Short text, Number, Email, File upload), bắt buộc/không bắt buộc, 1–10 ô, tối đa 1 File upload, kiểu ô không bị khoá, xoá ô là mất ngay (không hỏi lại), tag chung cho cả form, mẫu Quick-start điền đúng 2 ô như hôm nay.
- 03/11 Phase 2 (tuần sau): thêm Paragraph, Link, Date, Single choice, Multiple choice; tag riêng cho từng lựa chọn; ký hiệu đứng trước ô Number; điền sẵn email khách đã đăng nhập; khoá kiểu ô đã có câu trả lời; hỏi lại khi xoá ô.
- 03/11 PO bỏ: dòng gợi ý Quiz dưới "Form fields" (mọi phase); cột "Answers" (giữ tên "Content"); panel bên phải và link "View all N answers"; nút Export; tìm theo câu trả lời (về tìm theo email như master); nhóm tag theo trạng thái; nút "Try again" cho tag ghi lỗi; câu dưới Customer tags đổi theo cấu hình (nay là một câu cố định).
- 03/11 Trang duyệt (cả hai phase): ô Content hiện câu trả lời đầu "Nhãn: giá trị", rê chuột hiện tất cả, có nút copy; ô không ghi được tag hiện "Tags not added" (Phase 2 thêm "Some tags not added: this customer already has 250 tags in Shopify"). Form gửi trước khi có tính năng giữ nguyên một Content như hôm nay.
- 03/11 Dòng cảnh báo dưới "Form fields" chỉ hiện khi form khác hình dạng cũ (đúng một Short text bắt buộc, tuỳ chọn thêm một File upload): chương trình chỉ hiện trên Widget V4 và Loyalty page V2.
- 03/11 Link: `?version=today|phase1|phase2` (trước hoặc sau dấu #); không có thì mở Phase 1. Link cũ `?v=today` vẫn mở Today, `?v=new` mở Phase 1.
