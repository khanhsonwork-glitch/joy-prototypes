# FR86 · Referral rewards by order value tiers — decision ledger

Every scope decision Alex made, word for word, one per line. Check each screen against this before building it.

- 29/10 · "oke mình cần backlog lại cái này. Tạo /prd cho chức năng này đi nghĩ kĩ hơn về mặt functional, UI UX. Có vẽ Html protoptype UI ra theo flows nhé và để chung ở 1 URl prototype chung kia"
- 29/10 16:02 · Prototype sits on the real Joy admin screen (Joy menu → Reward programs → Referrals, same control types); the link opens straight on the changed screen, hash kept in sync.
- 29/10 16:58 · "Hmm phần UI UX chưa ổn lắm. B nghĩ nên sắp xếp ntn. có nên ở trong referer và referee k hay ntn?"
- 29/10 17:00 · Drop the separate "Order value tiers" block on the Referrals page. Tiers live INSIDE each side's Edit page:
  - Rewards for referrers gets a new Reward method "by the friend's first order value" (table: orders from $X → Y points; tier 1 = the minimum).
  - Rewards for referees does the same in release 2.
  - The Referrals page only shows a one-line summary.
- 29/10 17:00 · "ok fix đi cả tận gốc vấn đề đầy đủ nhé. triệt để nhé"
- 29/10 17:46 · (screenshot of the Reward method list) "2 cái này tên giống nhau nhỉ"
- 29/10 17:53 · Referrer: NO separate line in Reward method. Merge into the existing "Points based on order value": picking it shows "Calculate points" with "Per $1 spent" (as today) and "Fixed points by order amount" (new table, "Order from $50 → 100 points"). Drop the word "tiers" everywhere in FR86, say "order amount", so it never reads as VIP tiers.
- 29/10 17:53 · "ok nhưng mà phải nói dễ hiểu để MC biết phân biệt hoặc là có help text dynamic rõ ràng"

## Rules this ledger implies

| Merchant action | Rewards for referrers | Referrals page summary | Rewards for referees | Storefront |
|---|---|---|---|---|
| Picks "Points based on order value" → "Fixed points by order amount" | the rate card gives way to the order-amount table, seeded with tier 1 = today's points from today's friend minimum | "100–200 points · by order amount" | unchanged | widget lists the tiers, "Up to 200 points" |
| Adds / removes a tier | max 5; the last tier can't be removed | count and range follow | same amounts follow when linked | follows |
| Changes tier 1 amount | it is the minimum: an order below it keeps the referral Pending | range follows | linked amounts follow | note "from $X" follows |
| Switches to another method | tiers hidden, kept until Save | back to the method's summary | linked option disappears | single reward |
| Release 2: ticks "Set the discount by the friend's order value" (amount or %) | — | "$5–$10 off coupon · by order amount" | Reward value gives way to the tier table; minimum order requirement shows "Set by tier 1"; order discounts can't combine | popup lists the tiers |
| Release 2: "Use the same order amounts as Rewards for referrers" | — | — | amounts read-only, copied from the referrer tiers | one list for both sides |
