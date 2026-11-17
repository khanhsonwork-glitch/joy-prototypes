# Real screens this demo changes

Store credit becomes an Essential feature for shops that install Joy after the release date. Every control
where a merchant picks store credit as a reward keeps its place and its control type; on a new Free shop it
gets the same "Available on Essential" badge Joy already shows for other paid rewards, and the badge opens
the Plans page. Nothing moves to a new block or page.

Menu: Joy › Reward programs › Redeeming programs › Discount program › Add more › Add new redeem program (row "Store credit") · Joy › Reward programs › Redeeming programs › Store credit program (heading + Add more) · Joy › Reward programs › Earning programs › Purchase rewards › Place an order › Reward settings › Reward type · Joy › Reward programs › Earning programs › Engagement rewards › Sign Up / Sign up for newsletter › Setup rule › Rewarding method / Reward type · Joy › Reward programs › Referrals › Rewards for referrers / Rewards for referees (Edit) › Reward settings › Reward method
Màn thật: Reward programs (Earning, Redeeming tabs) seen on screenshots of the production admin taken 16/09/2026; modal, edit pages and badge rebuilt from Joy code avada/master df087f0 read 17/11/2026 (files below), because the admin was not opened in an automated browser for this round
Ảnh so sánh: ngoài repo — reward-programs-redeeming.png and reward-programs-earning.png (16/09/2026), kept by Jerry in Alex Brain under wiki/joy-loyalty/feature-map/_shots/

## Screen map (menu › page › panel › field › control)

| Deep link | Menu path | Page › panel › field | Control today | Change on a new Free shop | Joy file (avada/master) |
|---|---|---|---|---|---|
| `#/redeem-add` | Reward programs › Redeeming programs | Discount program › Add more › modal "Add new redeem program" › row "Store credit" | Clickable row list (icon, title, subtitle); paid rows show `AvailableBadge isParallel` and open Plans | Store credit row gets the badge; row and badge open Plans | `pages/Program/SubMenu/Point/RedeemProgram.js` (`ModalContent`, `isProgramNotAllowed`), options `config/programOptionsI18n.js` `spendingProgramsI18n` |
| `#/redeem` | Reward programs › Redeeming programs | Store credit program block › heading + Add more | Block heading + Add more button; paid blocks (`forPaidPlans`) show the badge on the heading and disable Add more | Same as the paid blocks: badge on heading, Add more disabled | `RedeemProgram.js` (Store credit block skips the plan check today), `components/Program/RenderListPrograms.js` |
| `#/earning-place-order` | Reward programs › Earning programs › Purchase rewards › Place an order | Reward settings › Reward type | Radio list (`WcChoiceList`): Loyalty Points / Store credit | Store credit radio disabled; badge next to the "Reward type" title (same as the expiry radio group in `UseSelectExpired.js`) | `pages/Program/EarningPrograms/PlaceOrderV2Program.js` (`RewardSettings`) |
| `#/earning-sign-up` | Reward programs › Earning programs › Engagement rewards › Sign Up | Setup rule › Rewarding method | Custom dropdown (`SelectOptions`) whose discount options already carry `proBadge` and open Plans when picked | Store credit option gets the same inline badge and opens Plans when picked | `pages/Program/EarningPrograms/SignUpProgramV2.js`, `components/SelectOptions/SelectOptions.js`, `helpers/program/rewardTypeOptions.js` |
| `#/earning-newsletter` | Reward programs › Earning programs › Engagement rewards › Sign up for newsletter | Setup rule › Reward type | Select (`RewardTypeSelect` → `WcSelect`): Point / Store credit | Store credit option disabled (as in `hooks/modal/useAddTierReward.js`); badge next to the label | `components/StoreCredit/RewardTypeSelect.js` (also used by `RewardRule.js` pages) |
| `#/referral-reward` | Reward programs › Referrals › Rewards for referrers › Edit | Reward settings › Reward method | Select (`WcSelect`) | "Store credit based on order value (Recommend)" and "Store credit" disabled; badge next to the label | `pages/Program/SubMenu/Referral/ReferringCustomerReward.js`, `components/Rewards/RewardSetting.js`, options `customerReferralRewardTypeI18n` |
| `#/referral-friend-reward` | Reward programs › Referrals › Rewards for referees › Edit | Reward settings › Reward method | Select (`WcSelect`) | "Store credit" disabled; badge next to the label | `pages/Program/SubMenu/Referral/ReferredFriendReward.js`, options `discountReferralTypeI18n` |
| `#/plans` | Settings › Plans (where every badge leads) | Plans | Page `/settings/subscription/plans` | Stub only, so a badge click lands somewhere | `reducers/pricingReducer.js` (`openPricingModal` → `/settings/subscription/plans`) |

Badge: `components/Atoms/PlanLimited/AvailableBadge/AvailableBadge.js` → `<s-badge tone="info">Available on {plan}</s-badge>`
inside a clickable wrapper (cursor pointer, 0.8 opacity on hover); English text `AvailableBadge.availableOn` = "Available on {plan}",
plan label "Essential" (`getLabelPlan`).

## What the real code does today that this demo keeps

- The modal list order comes from `spendingProgramsI18n`: Discount amount, Discount percentage, Store credit, Buy X get Y,
  Gift card, Environmental impact (the app names its partner there; the hub's privacy gate blocks the name, so the demo drops it). In that list Gift card has no `proPlan`, so the modal shows the badge on
  Buy X get Y and Environmental impact, not on Gift card (only the functions copy of the list marks Gift card `proPlan`).
  The demo keeps that, so Store credit looks exactly like Buy X get Y.
- Environmental impact, Free gift, Free shipping and Gift card blocks already show the badge and a disabled Add more on
  every Free shop; the demo shows that on both Free states.
- Block illustrations (Shopify CDN images) are left out: the prototype loads nothing from outside.

## Same pattern, not drawn here

- Other earning programs reuse the controls drawn above: `RewardTypeSelect` (Write a review, Google Maps review,
  SMS, Social, Fill survey, Submit form, Submit receipt, Custom, Interact website, Streak, via `RewardRule.js`) and the
  Birthday "Choose reward" select. Same treatment as `#/earning-newsletter`.
- Still a store credit choice, not redrawn: Milestones tab rewards (`EVENT_MILESTONE` is in `storeCreditEarningEvents`),
  VIP tier rewards ("Store credit" and "Bonus store credit" in `TierRewardSettings.js`), Quest rewards, the
  "Store credit cashback" Place order template (`const/placeOrderTemplates.js`), and the Onboarding V2 Cashback and
  Referral steps (`Wizard/V2/steps/CashbackSetup.js`, `ReferralSetup.js`). The Milestones tab in the demo says so.
