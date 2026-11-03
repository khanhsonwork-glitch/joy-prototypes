# BFCM 2026 — 30% off Advanced & Ultimate — decision ledger

Every scope decision, word for word, one per line. Check each screen against this before building it.

- 29/10/2026 (Alex): "a nghĩ k dưới 30% sẽ k đủ hấp dẫn / mà discount advanced với ult thôi"
- 02/11/2026 (Việt → Alex): "30% trong 3 tháng hả" → "yes như cũ"
- 03/11/2026 (Việt): "có thể test 2 tháng cuối năm / 1 tháng hơi ít"
- 03/11/2026 (Alex): "Giá có bị gạch và -30% đi"

## Rules this ledger implies

| Shop | Black Friday running (to Dec 31, 2026) | After Dec 31, 2026 |
|---|---|---|
| Starter (free) | Advanced $90.30 (was $129) and Ultimate $349.30 (was $499), "-30% · 3 months", "From month 4"; Essential $29 unchanged; banner on Plans page, onboarding step and Dashboard | No banner, no struck price |
| Essential | Same discount on Advanced and Ultimate; Essential = Current plan | No banner, no struck price |
| Advanced | Advanced = Current plan at $129 (no discount on the plan it already pays); Ultimate $349.30 | No banner, no struck price |
| Any shop, Annually tab | Full annual prices, no discount tag (the discount is for monthly charges) | Same |

Open, waiting on Alex (the table above shows the broadest case until he chooses): which shops get the discount — e.g. a shop that already had the 3-month launch promo earlier in 2026, or a shop that left Advanced and comes back.

## Upgrade popup (#/upgrade-popup), 03/11/2026

- Where it opens today (avada/master, reducers/pricingReducer.js): a click on a locked control opens the popup only inside a fullscreen editor (`?fullscreen=true`) or the widget editor. Everywhere else — VIP Tiers, PlanGate, "Available on …" badges on normal pages — it goes to the Plans page, which already shows the Black Friday prices. Since 04/04/2026 ("replace pricing modal with navigation to /settings/subscription/plans").
- The popup triggers found inside fullscreen editors offer Essential (Loyalty page editor › Custom CSS, widget editor order-limit banner): Black Friday does not touch Essential, so that popup stays as it is. No live trigger offers Advanced or Ultimate there today.
- So the screen sits in the one fullscreen editor that has an Advanced-gated control: Widget design › Launcher › "Generate AI Icon · Available on Advanced". In this prototype that link opens the popup; on avada/master it closes the editor and opens the Plans page. This shows how the popup must look whenever it offers Advanced.
- Shop on Advanced: nothing on this screen is locked (Generate AI Icon works), so no popup. Ultimate-gated controls (e.g. Analytics › custom metrics) sit on normal pages and go to the Plans page, where Ultimate shows $349.30. Chosen over inventing an Ultimate-gated control in the editor.
- Popup prices come from the same planView() + PromoLines as the plan cards: Starter and Essential see "Advanced - $90.30/month", struck $129, "-30% · 3 months", ⓘ, "From month 4: $129/month". After Dec 31, 2026: "Advanced - $129/month", no discount lines.
- Seen in the code, not changed here: a popup opened without a plan defaults to the legacy Advanced plan ($99/month); and its button sends only the shop's stored discount code, so the Black Friday price needs the same code the Plans page uses.
