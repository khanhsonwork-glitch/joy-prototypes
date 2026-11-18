# VIP & membership prototype reference

Source reviewed: inventory of the Joy admin (Membership, VIP tiers, deals, subscription membership, partner tier), master branch 18/11/2026; visual yardstick: real new-admin Membership screen.

| New route | Production route / screen |
| --- | --- |
| \`#/vip\` | Membership landing \`/membership\` |
| \`#/vip/tiers\` | VIP tiers > Tiers \`/membership/vip\` |
| \`#/vip/tiers/<id|new>\` | VIP tier accordion and legacy \`/programs/tier/:id\` / create |
| \`#/vip/tiers/settings\` | VIP tiers > Tier configuration, Tier demotion, Design, Notification, Launch, Sync |
| \`#/vip/deals\` and editor | Member-exclusive deal list and Create/Edit |
| \`#/vip/paid\` and editor | Membership Plans V2 list and Create/Edit |
| \`#/vip/partners\` and editor | Partner tier programs \`/wholesale/vip\` |

The legacy subscription membership model still exists in production: one Shopify product per row, with repeating frequency cards per product. This prototype uses Plans V2, where a plan can cover multiple products and frequencies. The two models need a migration and orphaned-plan review before implementation.

Partner company profile links use \`#/customers/companies/<id>\`; VIP notification links use \`#/settings/notifications/<id>\`. The related modules own those destinations.
