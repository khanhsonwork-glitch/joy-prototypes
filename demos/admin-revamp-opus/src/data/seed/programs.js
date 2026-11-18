// Earn and redeem programs of the sample shop. Owned by the Points module.
// The 34 ways to earn the current admin offers (avada/master, 18/11/2026): 16 + 18 social.
export const EARN_TYPES = [
  {type: 'place_order', name: "Place order", group: 'orders', plan: 'free'},
  {type: 'place_order_sub', name: "Place order for subscriptions", group: 'orders', plan: 'advanced'},
  {type: 'sign_up', name: "Sign up", group: 'account', plan: 'free'},
  {type: 'newsletter', name: "Sign up newsletters", group: 'account', plan: 'free'},
  {type: 'sms', name: "Subscribe to SMS marketing", group: 'account', plan: 'free'},
  {type: 'birthday', name: "Birthday reward", group: 'account', plan: 'free'},
  {type: 'anniversary', name: "Member anniversary", group: 'account', plan: 'essential'},
  {type: 'review', name: "Write review", group: 'engagement', plan: 'free'},
  {type: 'google_review', name: "Google reviews", group: 'engagement', plan: 'essential'},
  {type: 'visit', name: "Visit website", group: 'engagement', plan: 'free'},
  {type: 'streak', name: "Streak bonus challenge", group: 'engagement', plan: 'advanced'},
  {type: 'survey', name: "Fill out a survey", group: 'engagement', plan: 'essential'},
  {type: 'receipt', name: "Submit receipt", group: 'engagement', plan: 'advanced'},
  {type: 'form', name: "Submit form", group: 'engagement', plan: 'advanced'},
  {type: 'custom', name: "Custom program", group: 'engagement', plan: 'advanced'},
  {type: 'mobile_app', name: "Mobile app engagement", group: 'engagement', plan: 'ultimate'},
  {type: 'social_follow_on_facebook', name: "Follow on Facebook", group: 'social', plan: 'free'},
  {type: 'social_follow_on_instagram', name: "Follow on Instagram", group: 'social', plan: 'free'},
  {type: 'social_comment_on_instagram_post', name: "Comment on Instagram post", group: 'social', plan: 'advanced'},
  {type: 'social_comment_on_facebook_post', name: "Comment on Facebook post", group: 'social', plan: 'advanced'},
  {type: 'social_mention_us_in_instagram_story', name: "Mention us in Instagram Story", group: 'social', plan: 'advanced'},
  {type: 'social_reply_to_instagram_story', name: "Reply to Instagram Story", group: 'social', plan: 'advanced'},
  {type: 'social_comment_on_instagram_live', name: "Comment on Instagram Live", group: 'social', plan: 'advanced'},
  {type: 'social_follow_on_x_twitter', name: "Follow on X (Twitter)", group: 'social', plan: 'free'},
  {type: 'social_follow_on_pinterest', name: "Follow on Pinterest", group: 'social', plan: 'free'},
  {type: 'social_share_a_facebook_link', name: "Share a Facebook link", group: 'social', plan: 'free'},
  {type: 'social_share_on_x_twitter', name: "Share on X (Twitter)", group: 'social', plan: 'free'},
  {type: 'social_follow_on_tiktok', name: "Follow on TikTok", group: 'social', plan: 'free'},
  {type: 'social_subscribe_on_youtube', name: "Subscribe on Youtube", group: 'social', plan: 'free'},
  {type: 'social_join_telegram', name: "Join Telegram", group: 'social', plan: 'free'},
  {type: 'social_join_whatsapp', name: "Join Whatsapp", group: 'social', plan: 'free'},
  {type: 'social_join_discord', name: "Join Discord", group: 'social', plan: 'free'},
  {type: 'social_join_reddit', name: "Join Reddit", group: 'social', plan: 'free'},
  {type: 'social_join_line', name: "Join Line", group: 'social', plan: 'free'}
];

export const EARN_GROUPS = [
  {id: 'orders', label: 'Orders'},
  {id: 'account', label: 'Account and profile'},
  {id: 'engagement', label: 'Engagement'},
  {id: 'social', label: 'Social media'},
];

// Types that may exist more than once (production: Custom, Submit form, Google reviews; social can repeat per account).
export const REPEATABLE = ['custom', 'form', 'google_review', 'place_order'];

export const REDEEM_TYPES = [
  {type: 'amount', name: "Amount discount", group: 'discount', plan: 'free'},
  {type: 'percent', name: "Percentage discount", group: 'discount', plan: 'free'},
  {type: 'bxgy', name: "Buy X get Y", group: 'discount', plan: 'advanced'},
  {type: 'store_credit', name: "Store credit", group: 'credit', plan: 'advanced'},
  {type: 'impact', name: "Plant a tree", group: 'impact', plan: 'essential'},
  {type: 'free_product', name: "Free product", group: 'gift', plan: 'free'},
  {type: 'free_shipping', name: "Free shipping", group: 'shipping', plan: 'free'},
  {type: 'gift_card', name: "Gift card", group: 'gift_card', plan: 'advanced'}
];

export const earn = [
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-order",
    "type": "place_order",
    "name": "Place an order",
    "status": "active",
    "reward": {
      "kind": "per_money",
      "points": 5,
      "per": 1
    },
    "rounding": "down",
    "excludeTax": true,
    "excludeShipping": true,
    "minOrder": 0,
    "tierRates": true,
    "completions": 18420
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-signup",
    "type": "sign_up",
    "name": "Create an account",
    "status": "active",
    "reward": {
      "kind": "fixed",
      "points": 100
    },
    "completions": 6104
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-newsletter",
    "type": "newsletter",
    "name": "Join our newsletter",
    "status": "active",
    "reward": {
      "kind": "fixed",
      "points": 150
    },
    "completions": 2210
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-birthday",
    "type": "birthday",
    "name": "Birthday treat",
    "status": "active",
    "reward": {
      "kind": "fixed",
      "points": 300
    },
    "collectFrom": "widget",
    "tierRates": true,
    "completions": 1408
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": true,
      "times": 5,
      "per": "month"
    },
    "id": "e-review",
    "type": "review",
    "name": "Review a product",
    "status": "active",
    "reward": {
      "kind": "fixed",
      "points": 50
    },
    "photoBonus": 25,
    "approval": "manual",
    "minChars": 30,
    "completions": 932
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-instagram",
    "type": "social_follow_on_instagram",
    "name": "Follow @northbloom",
    "status": "active",
    "reward": {
      "kind": "fixed",
      "points": 75
    },
    "url": "https://instagram.com/northbloom",
    "completions": 1876
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-tiktok",
    "type": "social_follow_on_tiktok",
    "name": "Follow us on TikTok",
    "status": "active",
    "reward": {
      "kind": "fixed",
      "points": 75
    },
    "url": "https://tiktok.com/@northbloom",
    "completions": 640
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-anniv",
    "type": "anniversary",
    "name": "Member anniversary",
    "status": "inactive",
    "reward": {
      "kind": "fixed",
      "points": 200
    },
    "completions": 0
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-receipt",
    "type": "receipt",
    "name": "Bought in store? Upload the receipt",
    "status": "active",
    "reward": {
      "kind": "per_money",
      "points": 5,
      "per": 1
    },
    "approval": "manual",
    "completions": 212
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "2026-12-01",
      "end": "2026-12-31"
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-streak",
    "type": "streak",
    "name": "7-day skincare streak",
    "status": "scheduled",
    "reward": {
      "kind": "fixed",
      "points": 10
    },
    "completions": 0
  },
  {
    "eligibility": {
      "mode": "all"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "limit": {
      "on": false,
      "times": 1,
      "per": "lifetime"
    },
    "id": "e-google",
    "type": "google_review",
    "name": "Review us on Google",
    "status": "inactive",
    "reward": {
      "kind": "fixed",
      "points": 100
    },
    "approval": "manual",
    "completions": 0
  }
];

export const redeem = [
  {
    "id": "r-5off",
    "type": "amount",
    "name": "$5 off",
    "status": "active",
    "cost": 500,
    "value": 5,
    "minOrder": 0,
    "appliesTo": "order",
    "combines": [
      "shipping"
    ],
    "expiresDays": 90,
    "eligibility": {
      "mode": "all"
    },
    "redemptions": 1284
  },
  {
    "id": "r-10pct",
    "type": "percent",
    "name": "10% off your order",
    "status": "active",
    "cost": 1000,
    "value": 10,
    "maxDiscount": 30,
    "minOrder": 40,
    "appliesTo": "order",
    "combines": [],
    "expiresDays": 90,
    "eligibility": {
      "mode": "all"
    },
    "redemptions": 642
  },
  {
    "id": "r-ship",
    "type": "free_shipping",
    "name": "Free shipping",
    "status": "active",
    "cost": 800,
    "maxShipping": 15,
    "minOrder": 0,
    "expiresDays": 60,
    "eligibility": {
      "mode": "all"
    },
    "redemptions": 2210
  },
  {
    "id": "r-credit",
    "type": "store_credit",
    "name": "$10 store credit",
    "status": "active",
    "cost": 1000,
    "value": 10,
    "expiresDays": 365,
    "eligibility": {
      "mode": "members"
    },
    "redemptions": 318
  },
  {
    "id": "r-mini",
    "type": "free_product",
    "name": "Free Cloud Cream mini",
    "status": "active",
    "cost": 1800,
    "product": "Cloud Cream mini",
    "photo": "miniJar",
    "minOrder": 30,
    "expiresDays": 60,
    "eligibility": {
      "mode": "tiers",
      "tiers": [
        "t-gold",
        "t-vip"
      ]
    },
    "redemptions": 204
  },
  {
    "id": "r-set",
    "type": "free_product",
    "name": "Free Glow Getter Set",
    "status": "active",
    "cost": 4000,
    "product": "Glow Getter Set",
    "photo": "giftSet",
    "minOrder": 0,
    "expiresDays": 60,
    "eligibility": {
      "mode": "tiers",
      "tiers": [
        "t-vip"
      ]
    },
    "redemptions": 31
  },
  {
    "id": "r-tree",
    "type": "impact",
    "name": "Plant a tree",
    "status": "inactive",
    "cost": 300,
    "value": 1,
    "eligibility": {
      "mode": "all"
    },
    "redemptions": 0
  },
  {
    "id": "r-gift",
    "type": "gift_card",
    "name": "$25 gift card",
    "status": "inactive",
    "cost": 2500,
    "value": 25,
    "eligibility": {
      "mode": "all"
    },
    "redemptions": 0
  },
  {
    "id": "r-bxgy",
    "type": "bxgy",
    "name": "Buy 2 serums, get 1 free",
    "status": "inactive",
    "cost": 2500,
    "buy": 2,
    "get": 1,
    "collection": "Serums",
    "eligibility": {
      "mode": "all"
    },
    "redemptions": 0
  }
];
