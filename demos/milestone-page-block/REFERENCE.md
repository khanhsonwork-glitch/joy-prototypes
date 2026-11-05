# Màn thật mà demo này sửa

Menu: Joy › On-site content › New loyalty page (mở editor toàn màn) › tab Sections › Page sections / More sections › block mới "Milestones" › panel cài đặt của block (cùng khuôn panel "Ways to earn" và "Refer a friend": thẻ Full width + Show this block to, rồi các thẻ gấp mở, thẻ Edit text) · khung Preview bên phải (Preview as · Desktop/Mobile · Member/Guest)
Màn thật: editor Loyalty page V2 trên admin production (store dev của Alex), chụp 05/11/2026 18:36–18:39 qua session Chrome: tab Sections, panel Ways to earn, panel Refer a friend. Đối chiếu code avada/master 582c99c692 (LoyaltyPageEditorV2Content.js, SectionsMenu.js, SectionContentDetail.js, ProgramsListPanel.js, ProgramsManagerCard.js, SectionSettingCard.js, LoyaltyPagePreviewWrapper.js, sectionLabels.js). Giao diện milestone mượn từ prototype revamp milestone storefront (thẻ "Get your next reward" + "Milestone roadmap"), không vẽ mới.
Ảnh so sánh: ngoài repo — 4 ảnh (real-editor-sections, real-editor-earn, real-editor-referral, ref-3978-milestone-flat) Jerry giữ trong Alex Brain, output/2026-11-05-milestone-block-check/ref/

## Chỗ đặt và loại control (theo màn thật)
- Thêm block: danh sách "More sections" có nút +, giống Loyalty dashboard / Referral management. Bật rồi thì block vào "Page sections" với nút gạt + nút X, kéo để đổi thứ tự.
- Panel: thẻ đầu chung (Checkbox "Full width", Select "Show this block to": Everyone / Members / Guests) giữ nguyên như mọi block.
- Thẻ gấp mở `SectionSettingCard` cho nhóm riêng của block; control là Polaris Select / Checkbox như "Layout" của Ways to earn.
- Danh sách chương trình: cùng kiểu thẻ "Programs" của Ways to earn (tay kéo, mắt ẩn/hiện, bút sửa).
- Chữ tiêu đề / mô tả / nút: KHÔNG có ô trong panel, sửa ở Translations qua thẻ "Edit text", như mọi block.
