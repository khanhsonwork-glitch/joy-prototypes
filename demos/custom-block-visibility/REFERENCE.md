# Real screens this demo changes

Custom blocks in the widget editor (Heading, Rich text, Button, Divider, Image banner, Image with text, Custom link, Custom CTA)
get a "Who can see this block" select (Everyone, Guests, Members), an on/off switch in the Body list next to the trash icon, and
Image with text gets the Link URL + "Open in new tab" controls Image banner already has. The built-in sections keep their
"Show to guests" checkbox; only its help text changes. Nothing moves to a new page or a new block of settings.

Menu: Joy › On-site content › Unified widget (opens the Widget editor full screen) › Sections tab › Body › (a custom block row, e.g. "Rich text" or "Image with text") · Joy › On-site content › Unified widget › Sections tab › Body › Ways to earn › Show to guests
Màn thật: Widget editor V4 (Sections tab, Body group and the block panels), seen on a screenshot of the production editor sent by the team on 17/11/2026 (a shop whose Rich text block was saved as hidden for guests), and rebuilt from Joy code avada/master 70b503d796 read 17/11/2026 (files below)
Ảnh so sánh: ngoài repo — the 1267x923 screenshot of the production editor shows a real merchant's widget, so it is not committed; Jerry keeps it in Alex Brain under output/2026-11-17-custom-block-task/

## Screen map (menu › page › panel › field › control)

| Deep link | Menu path | Panel › field | Control today | Change | Joy file (avada/master) |
|---|---|---|---|---|---|
| `#/rich-text` | Sections › Body | Rich text › (new) Who can see this block | Panel has Content (textarea), Size, Alignment (selects, two per row); no visibility field | Select "Who can see this block": Everyone (default), Guests, Members, help "Guests are visitors who see the Sign in or Join screen in the widget. Everyone else counts as a member." First field under the heading, like "Show to guests" on the built-in sections | `pages/Branding/WidgetDesign/panels/SectionPanel.js` (`CustomBlockConfig`, `CUSTOM_RICHTEXT`) |
| `#/rich-text` | Sections › Body | Body list row of a custom block | Drag handle, icon, label, then the trash icon; the on/off switch is not rendered for removable rows | Trash icon and the switch on the same row (switch stays in the right-hand column like every other row) | `components/WidgetEditorV4/WidgetSettingsMenu.js` (`DraggableMenuItem`: `item.removable && onRemoveBlock ? trash : item.hasStatus ? Toggle`); `pages/Branding/WidgetDesign/useWidgetMenu.js` already sets `hasStatus` and `status` on custom rows and `handleToggleSection` already flips `enabled` for custom ids |
| `#/image-with-text` | Sections › Body | Image with text › Link URL, Open in new tab | Image (upload card), Title, Description (textarea), Layout (select); no link | Same two controls as Image banner, after Layout: text field "Link URL" (placeholder "https://example.com or /collections/sale") and checkbox "Open in new tab"; plus "Who can see this block" at the top. "Open in new tab" is ticked by default, as on Image banner. With a URL the block in the preview is clickable | `SectionPanel.js` (`CUSTOM_IMAGE_TEXT`, compare `CUSTOM_BANNER`); renderer `packages/web-components/src/components/widget/joy-loyalty-widget.ts` `_renderCustomBlock` |
| `#/off` | Sections › Body | Custom block row switched off | The row cannot be switched off today | Row looks like the other off rows (grey switch), trash still there; the preview hides the block for every customer; switching it back on keeps the content | same as above |
| `#/members-only-existing` | Sections › Body | Rich text › Who can see this block | A block saved with `guestVisible: false` has no control to undo it | The same block opens with the select on Members, so it can be set back to Everyone | `SectionPanel.js` (guest checkbox only in the built-in branch); widget side `guestHiddenSections` / `_isSectionHiddenForGuest` in `joy-loyalty-widget.ts` |
| `#/section-help` | Sections › Body | Ways to earn › Show to guests | Checkbox, help "When off, this section is hidden from visitors who are not signed in" | Same checkbox in the same place; help text "When off, this section is hidden from visitors who see the Sign in or Join screen in the widget." | `SectionPanel.js` (`showToGuests`, `showToGuestsHelpText` in `locale/input/WidgetDesignNewTabs.json`) |

The editor shell follows the real one: full-screen App Bridge modal (title "Widget design", "Watch guide", Save bar replaced by
"Unsaved changes" / Discard / Save), 340px menu with the five icon tabs, search and the Header / Body / Profile / Footer groups, a
20px collapse strip, the settings panel, and the 45% preview with "Preview as · Desktop · …" menu, Inspect and "Embed active".

## What the real code does today that this demo keeps

- Row label of a custom block: `title`, else `text`, else `label`, else the first 30 characters of `content` ("Start BLACK WEEK early with co").
- Add block menu groups and icons: Basic (Heading, Rich text, Button, Divider), Media (Image banner, Image with text), Actions (Custom link, Custom CTA).
- Trash removes the block at once (no confirm); Discard in the Save bar is the undo.
- Panel fields of the eight block types are the ones in `CustomBlockConfig`; Image banner already has Link URL and "Open in new tab".
- Built-in sections keep "Show to guests" only where the real panel has it (not My coupons, Recent activity, My QR code, Wallet pass).

## Not drawn

- Profile group custom blocks (Custom link, Button) use the same `CustomBlockConfig`, so they would get the same fields; the group is a stub here.
- The other editor tabs (Settings, On-brand, Content, Extensions), the Header and Footer panels, and Ways to redeem's own display options.
- Deep link warning under Link URL (`#joy…` links) and real image upload: the upload card opens a file picker and shows the picked image on this page only.
- The customer menu in the real preview is "Signed in / Guest". Here it is Guest / Signed in / Member: on an opt-in shop "Signed in" lands on the Join Program screen (counts as Guest), and clicking "Join Program" in the preview moves to the Member screen.
