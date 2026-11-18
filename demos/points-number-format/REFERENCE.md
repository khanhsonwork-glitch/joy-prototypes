# Màn thật mà demo này sửa

Một cài đặt mới "Number format" (cách viết số điểm: 1,125 / 1.125 / 1'125 / 1 125) đặt đúng chỗ các cài đặt định dạng
khác đang nằm, và làm giống hệt cách "Custom point label" đang làm: một danh sách radio ba lựa chọn, lựa chọn thứ ba
dẫn sang Translations bằng banner info, và ở Translations mỗi ngôn ngữ có một dòng chọn định dạng ngay dưới hai dòng
nhãn điểm. Không thêm trang hay khối cài đặt mới ở chỗ khác.

Menu: Joy › Settings › General › card "Number format" (mới, ngay sau "Date format", trước "Currency format") · Joy › Settings › Translations › (một ngôn ngữ) › Unified widget › Points & Description · Points display › dòng "Number format" (mới, ngay sau "Point plural") · Joy › Settings › Translations › Unified widget › Activity history · Activity messages › dòng "Points added via API" (mới, mặc định "Received {{loyalty_point}}")
Màn thật: Settings › General xem ở ảnh chụp admin production giao diện mới 17/11/2026 (tới card Date format); thứ tự card, chữ, loại control dựng theo code avada/master 7ac5cbb894 đọc 18/11/2026: pages/Setting/Setting.js, Details/General.js, Details/SelectDateFormat.js, Details/CustomPointLabel.js, Details/Generals/CurrencyFormatSettings.js, const/listSettings.js; Translations theo pages/Translations/Translation.js, Sections/DefaultLanguageCard.js, Sections/AdditionalLanguageCard.js, Parts/TranslationEditorTable.js, Sections/index.js, Sections/WidgetDesign.js, Parts/translationsWidgetV4.js (mục activity_history), sidekick/editableTranslationFields.js; menu app theo helpers/getAppNavigation.js + config/appMenu.js; chữ tiếng Anh lấy từ locale/input/*.json cùng nhánh
Ảnh so sánh: ngoài repo — real-settings-general.png (17/11/2026, giao diện admin mới), Jerry giữ trong Alex Brain (output/2026-11-17-partner-tier-no-company/real/); màn Translations › Unified widget dựng theo code (không có ảnh màn thật trong lượt này)

## Đường dẫn trong demo

| Link | Màn |
|---|---|
| `#/settings` | Settings › General, cuộn tới card Number format (mặc định "Follow each language") |
| `#/settings?mode=same` | Đã chọn "Same format for all languages", định dạng 1'125.50 |
| `#/settings?mode=translation` | Đã chọn "Set per language in Translations" (banner + link sang Translations) |
| `#/settings/translations` | Settings › Translations (bảng ngôn ngữ, bấm "Unified widget") |
| `#/translations?state=per-language&lang=it&field=number_format` | Unified widget, tiếng Ý, mở thẳng dòng Number format |
| `#/translations?field=points_api` | Unified widget, mở thẳng dòng Points added via API |

`?state=` nhận thêm `empty`, `loading`, `error`, `disabled`, `overflow`, `worst` (nút Prototype góc dưới).
