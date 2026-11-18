// Every earning event, redeem block, milestone type and quiz template in the current admin
// (inventory of avada/master, 18/11/2026). Sample values are for the fictional shop Pomelo Park.

export const EARN_GROUPS = {
  "orders": "Earn points by placing orders",
  "account": "Account and profile",
  "engagement": "Engagement",
  "social": "Social media"
};

export const EARN_CATALOG = [
  {
    "id": "place_order",
    "name": "Place order",
    "group": "orders",
    "reward": "5 points per $1",
    "status": "on",
    "plan": "free"
  },
  {
    "id": "place_order_sub",
    "name": "Place order for subscriptions",
    "group": "orders",
    "reward": "8 points per $1",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "sign_up",
    "name": "Sign up",
    "group": "account",
    "reward": "100 points",
    "status": "on",
    "plan": "free"
  },
  {
    "id": "newsletter",
    "name": "Sign up newsletters",
    "group": "account",
    "reward": "150 points",
    "status": "on",
    "plan": "free"
  },
  {
    "id": "sms",
    "name": "Subscribe to SMS marketing",
    "group": "account",
    "reward": "150 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "birthday",
    "name": "Birthday reward",
    "group": "account",
    "reward": "300 points",
    "status": "on",
    "plan": "free"
  },
  {
    "id": "anniversary",
    "name": "Member anniversary",
    "group": "account",
    "reward": "200 points",
    "status": "off",
    "plan": "essential"
  },
  {
    "id": "review",
    "name": "Write review",
    "group": "engagement",
    "reward": "50 points",
    "status": "on",
    "plan": "free"
  },
  {
    "id": "google_review",
    "name": "Google reviews",
    "group": "engagement",
    "reward": "100 points",
    "status": "off",
    "plan": "essential"
  },
  {
    "id": "visit",
    "name": "Visit website",
    "group": "engagement",
    "reward": "5 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "streak",
    "name": "Streak bonus challenge",
    "group": "engagement",
    "reward": "10 points a day",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "survey",
    "name": "Fill out a survey",
    "group": "engagement",
    "reward": "100 points",
    "status": "off",
    "plan": "essential"
  },
  {
    "id": "receipt",
    "name": "Submit receipt",
    "group": "engagement",
    "reward": "5 points per $1",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "form",
    "name": "Submit form",
    "group": "engagement",
    "reward": "100 points",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "custom",
    "name": "Custom program",
    "group": "engagement",
    "reward": "100 points",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "mobile_app",
    "name": "Mobile app engagement",
    "group": "engagement",
    "reward": "200 points",
    "status": "off",
    "plan": "ultimate"
  },
  {
    "id": "follow_on_facebook",
    "name": "Follow on Facebook",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "follow_on_instagram",
    "name": "Follow on Instagram",
    "group": "social",
    "reward": "75 points",
    "status": "on",
    "plan": "free"
  },
  {
    "id": "comment_on_instagram_post",
    "name": "Comment on Instagram post",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "comment_on_facebook_post",
    "name": "Comment on Facebook post",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "mention_us_in_instagram_story",
    "name": "Mention us in Instagram Story",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "reply_to_instagram_story",
    "name": "Reply to Instagram Story",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "comment_on_instagram_live",
    "name": "Comment on Instagram Live",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "advanced"
  },
  {
    "id": "follow_on_x_twitter",
    "name": "Follow on X (Twitter)",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "follow_on_pinterest",
    "name": "Follow on Pinterest",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "share_a_facebook_link",
    "name": "Share a Facebook link",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "share_on_x_twitter",
    "name": "Share on X (Twitter)",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "follow_on_tiktok",
    "name": "Follow on TikTok",
    "group": "social",
    "reward": "75 points",
    "status": "on",
    "plan": "free"
  },
  {
    "id": "subscribe_on_youtube",
    "name": "Subscribe on Youtube",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "join_telegram",
    "name": "Join Telegram",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "join_whatsapp",
    "name": "Join Whatsapp",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "join_discord",
    "name": "Join Discord",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "join_reddit",
    "name": "Join Reddit",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  },
  {
    "id": "join_line",
    "name": "Join Line",
    "group": "social",
    "reward": "75 points",
    "status": "off",
    "plan": "free"
  }
];

export const REDEEM_BLOCKS = [
  {
    "id": "discount",
    "title": "Discount program",
    "programs": [
      {
        "type": "Discount amount",
        "name": "$5 off",
        "cost": "500 points",
        "status": "on"
      },
      {
        "type": "Discount percentage",
        "name": "10% off",
        "cost": "1,000 points",
        "status": "on"
      },
      {
        "type": "Buy X get Y",
        "name": "Buy 2 get 1 free",
        "cost": "2,500 points",
        "status": "off"
      }
    ]
  },
  {
    "id": "store_credit",
    "title": "Store credit",
    "programs": [
      {
        "type": "Store credit",
        "name": "$10 store credit",
        "cost": "1,000 points",
        "status": "on"
      }
    ]
  },
  {
    "id": "impact",
    "title": "Environmental impact program",
    "programs": [
      {
        "type": "Environmental impact",
        "name": "Plant 1 tree",
        "cost": "300 points",
        "status": "off"
      }
    ]
  },
  {
    "id": "free_gift",
    "title": "Free gift program",
    "programs": [
      {
        "type": "Free product",
        "name": "Free Cloud Cream mini",
        "cost": "1,800 points",
        "status": "on"
      }
    ]
  },
  {
    "id": "free_shipping",
    "title": "Free shipping program",
    "programs": [
      {
        "type": "Free shipping",
        "name": "Free shipping",
        "cost": "800 points",
        "status": "off"
      }
    ]
  },
  {
    "id": "gift_card",
    "title": "Gift card program",
    "programs": [
      {
        "type": "Gift card",
        "name": "$25 gift card",
        "cost": "2,500 points",
        "status": "off"
      }
    ]
  }
];

export const MILESTONE_TYPES = ["Mixed milestone", "Number of orders", "Number of referrals", "Subscription cycles", "Amount spent", "Earned points", "Number of reviews", "Inactivity"];

export const QUIZ_TEMPLATES = ["Build your own", "Welcome to the club", "Skin routine finder", "Gift finder", "Style finder", "Flavor finder", "Room finder"];

// Legacy POS discounts and custom partner vouchers stay in the production code paths; the prototype lists them as notes.
export const REDEEM_NOTES = ['POS amount discount', 'POS percentage off', 'Custom partner voucher (VN shops only)'];
