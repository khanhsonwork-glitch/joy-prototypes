# Real screens this demo changes

Menu: Joy: Loyalty Program › Settings › Subscription › View plans (Plans page: Calculate your price › banner slot above the cards › plan cards) · Onboarding V2 › step 6 Plan selection · Joy: Loyalty Program › Home (Dashboard) › promotional banner slot after Overview
Màn thật: Plans page and Home captured from production admin (Alex's dev store) 03/11/2026 with the see-production runner; the onboarding plan step only shows to a shop that has not finished setup, so it is built from code on avada/master b335a1e513 (pages/Wizard/V2/OnboardingV2.js + steps/PlanSelection.js); card, banner and price rules from components/molecules/PricingPlan, JoyAiCopilotBanner, PromotionalBanner/templates/PromotionalBackgroundBanner, pages/Home/HomeWorkingColumn.js, helpers/subscriptionPaidAction.js, config/subscription/plans.js
Ảnh so sánh: ngoài repo — Jerry giữ trong Alex Brain: output/prototypes/bfcm-2026-pricing/ref/real-plans-page-prod-2026-11-03.png, output/prototypes/bfcm-2026-pricing/ref/real-dashboard-prod-2026-11-03.png (they show the store's own app list and test program names, so they stay out of the public repo)

## Where each change sits on the real screen

- Plans page: the Black Friday words go in the banner slot between "Calculate your price" and the cards — the slot that shows "Joy AI Copilot is live. To celebrate the launch, new brands get 3 months at launch pricing…" today. Same Polaris banner shape (icon square, one paragraph, close button); only the icon and words change.
- Plan cards: Advanced and Ultimate use the discount lines the card already has (big discounted price, struck-through price, amber "-N% · N months" tag, ⓘ tooltip, "From month 4: $X/month"). Today only the launch promo used them and Ultimate never had a promo.
- Onboarding plan step: same cards (same component as the Plans page in the real app); the banner goes where "Referral discount applied" sits when a referral applies, above "Calculate your price". Starter shows "Continue as Free".
- Dashboard: the cross-app promotional banner slot (Dev Zone › Promotional Banner Manager, page "dashboard", template "Promotional (Background image)") in the left column after Overview. Words, image and button come from Dev Zone.

## Known differences from the real screens

- Card prices stay at the base fee when the order slider moves (the real card adds the per-order fee).
- Paid cards sit in a 3-column grid; the real page uses a carousel that shows 3 cards at this width.
- Dashboard: the shop-specific "needs attention" alert and the activity/program cards are left out; opening #/dashboard scrolls to the banner.
- Shopify admin shell is the hub's shared starter shell (grey sidebar); today's admin has a dark sidebar with search on the left. Same for every hub demo.
