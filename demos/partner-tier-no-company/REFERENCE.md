# Real screens this demo changes

Joy hides the whole "B2B programs" section (the Partner tier card) on the Membership page once it has counted 0
Shopify B2B companies for the shop (`shop.hasB2bCompanies === false`). Merchants who tick "Exclude B2B customers"
grant the company scopes, Joy counts 0, and the card disappears, so it looks like a bug. With 0 companies that
checkbox also excludes nobody. The change: always show the card, and warn instead of hiding, in the three places
below. Nothing moves; every screen keeps its place, shell and controls.

Menu: Joy › Membership › B2B programs › Partner tier card · Joy › Membership › Partner tier › Set up › Partner tier programs › Tiers tab · Joy › Settings › General › Membership enrollment › Exclude B2B customers
Màn thật: Membership, Partner tier programs and Settings › General, opened read-only in the production admin of Joy's own demo store on 17/11/2026 (shop on the Advanced plan), and checked against Joy code avada/master 70b503d796 read the same day (files below)
Ảnh so sánh: ngoài repo — real-membership.png, real-partner-tier-programs.png, real-settings-general.png (1600×1200, 17/11/2026), kept by Jerry in Alex Brain under output/2026-11-17-partner-tier-no-company/real/ (they show other installed apps and the store owner, so they stay out of this public repo)

## Screen map (menu › page › section › field › control)

| Deep link | Menu path | Page › section › field | Control today | Change (state `no-company`) | Joy file (avada/master) |
|---|---|---|---|---|---|
| `#/membership` | Joy › Membership | Membership › "B2B programs" › Partner tier card (image, title + status badge, subtitle, Set up / Learn more) | `s-section` card; the whole section renders only when `isShopifyB2BAvailable(shop.shopifyPlan) && shop.hasB2bCompanies !== false` | Card always shown; warning banner inside the card under the subtitle, above Set up. Set up still opens `#/wholesale/vip` | `pages/Membership/Membership.js` (line ~236), `pages/Membership/MemberShip.scss`, strings `locale/input/Membership.json` |
| `#/wholesale/vip` | Joy › Membership › Partner tier › Set up | Partner tier programs › Tiers tab › first item of the tab content, above "Tier configuration settings" | `WcTabs` (Tiers, and Design for V3-widget shops) + `TierB2bSettings`; title actions "Sync B2B data from Shopify" and "Launch"; Summary panel on the right | Same warning banner at the top of the Tiers tab content only; the Design tab (`?type=design`) has none. Launch stays enabled and launches | `pages/VIPTiers/B2bVipTiers.js`, `pages/VIPTiers/SubMenu/B2bSubMenu/TierB2bSettings.js`, `pages/VIPTiers/Preview/PreviewTierB2b.js`, strings `locale/input/B2bVipTiers.json` |
| `#/settings/general` | Joy › Settings › General (app URL `/settings?type=general`) | Membership enrollment › "Exclude B2B customers" | `WcChoiceList` (Auto-enroll / Customer opt-in / Manually assigned; the last two disabled with `AvailableBadge` "Available on Advanced" below Advanced), divider, `WcCheckbox` with help text (hidden in Manually assigned), no plan lock today | 1) Ticked + 0 companies: a warning right below the unchanged help text, with the "Create company in Shopify" link. 2) Below Advanced (PO decision 17/11): the checkbox is locked like opt-in / manual, disabled with the same clickable "Available on Advanced" badge; a shop that ticked it before the release keeps it ticked and enabled and can untick it, after which it is locked | `pages/Setting/Details/MembershipEnrollmentSettings.js`, `pages/Setting/Details/General.js`, `pages/Setting/Setting.js`, `const/listSettings.js`, strings `locale/input/SettingDetails.json` (`MembershipEnrollment`) |

Prototype states (Prototype panel or the URL):
- `?state=no-company` (default: Joy counted 0 companies) / `?state=has-company` (screens exactly as today, no warning). Every screen; follows in-app links.
- Settings › General only: no `plan` = Advanced; `?plan=essential` = below Advanced, box not ticked (locked);
  `?plan=essential&excluded=1` = below Advanced, ticked before the release (kept, can untick, then locked). The plan
  states stay on Settings: Membership and Partner tier programs below Advanced are as today (plan badge, upgrade card)
  and are not drawn. The company warning follows the same rule on every plan (ticked + 0 companies), so
  `?plan=essential&excluded=1` shows it; add `&state=has-company` for the same shop with companies.

## New copy (English, exactly as briefed)

- Banner title: "No B2B companies in Shopify yet"
- Banner body: "Partner tiers rank Shopify B2B companies. Create a company in Shopify so its customers can join a Partner tier. You can set up tiers now."
- Settings warning: "Your store has no B2B companies yet, so no customers are excluded. Joy treats a customer as B2B only when they belong to a Shopify company."
- Link in all three: "Create company in Shopify" with an external-link icon: it opens Shopify admin › Companies › Add company in a new tab (the prototype shows a toast saying so).
- Plan lock badge (existing component, existing copy): "Available on Advanced"; a click opens the upgrade dialog on Advanced.

Banner control: the Polaris warning banner Joy already uses (`s-banner tone="warning"`, as in the "Convert existing
members to guests" warning on the same Settings card), with the link on its own line under the text, like Joy's
"Go to Auto-tag customers" banner.

## What the real code does today that this demo keeps

- Shop on the Advanced plan: no "Available on Advanced" badge on any Membership card (`AvailableBadge` returns only
  its children when the shop already has the plan); the Partner tier status badge (Inactive / Active / Editing) shows
  only on Advanced (`planTier1.includes(shop.plan)`). On a lower plan the card shows "Available on Advanced" and no
  status badge, and Partner tier programs shows the upgrade card instead of the tabs; this demo does not draw that.
- Partner tier programs on a widget V4 shop shows the Tiers tab only (as in the real screenshot); the Design tab is for
  V3-widget shops (`useNewWidget && !useWidgetV4`). The demo draws both tabs so the reviewer sees the warning stay on
  Tiers; the Design tab body is only its "Partner Tier Display" heading and a simple account-page card preview.
  There is no Notification tab on the B2B page (`optionVIPTiersB2B` = tiers, design).
- Default partner tiers: Standard Partner $0, Premium Partner $200, Elite Partner $500 spent (`defaultTiersB2B`).
- Membership enrollment: the three radio labels and help texts, the checkbox hidden in Manually assigned, the opt-in
  info banner and the "Convert existing members to guests" block for opt-in / manual, all from
  `MembershipEnrollmentSettings.js`. The permission modal on ticking the box is not drawn: both shops already granted
  the company scopes (that is how Joy got to count 0).
- Left out: the remote promotional banners on Membership, the card artwork (Shopify CDN images, redrawn here as plain
  red illustrations so the prototype loads nothing from outside), the language switcher in the title bar.
