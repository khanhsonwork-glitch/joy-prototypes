// Settings sections. Owned by the Settings module.
export const general = {
  "enrollment": "auto",
  "excludeB2b": false,
  "timezone": "(UTC-08:00) Pacific Time",
  "language": "en-US",
  "showLanguageSelector": true,
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "24h",
  "currencyWithCode": false,
  "discountPrefix": "JOY-",
  "cartDrawerSelector": "#cart-drawer",
  "freeShippingUrl": "",
  "applyDiscount": "cart_page",
  "afterRedeem": "auto_apply",
  "afterFreeGift": "manual",
  "calculatorGuest": "login",
  "showVipRewardsToGuests": false,
  "reviewDefault": "pending",
  "googleReviewDefault": "pending",
  "billing": {"ordersUsed": 1380, "plans": [
    {"id":"free","name":"Starter","orders":250,"features":["Basic loyalty page","Sign-up and order points","Basic rewards"]},
    {"id":"essential","name":"Essential","orders":1000,"features":["VIP tiers","Unlimited points programs","Analytics"]},
    {"id":"advanced","name":"Advanced","orders":2500,"features":["Advanced rewarding rules","Advanced analytics","Loyalty Hub"]},
    {"id":"ultimate","name":"Ultimate","orders":10000,"features":["APIs and webhooks","Hydrogen and headless","POS Pro and customization"]}
  ]}
};

export const brand = {
  "primary": "#e86a5a",
  "secondary": "#fbcac3",
  "accent": "#5b7a4a",
  "button": "#e86a5a", "buttonText": "#ffffff", "hover": "#c94e41", "background": "#fff8f4", "heading": "#202020", "body": "#4a4a4a",
  "pagePalette": {"background": "#fff8f4", "heading": "#202020", "button": "#e86a5a"}
};

export const email = {
  "logo": true,
  "address": "88 Market St, San Francisco, CA 94103",
  "sender": {
    "name": "Pomelo Park",
    "email": "hello@pomelopark.com",
    "verified": true
  },
  "smtp": "avada",
  "weeklyReport": true,
  "social": {"facebook": "", "instagram": "", "youtube": "", "tiktok": "", "x": ""},
  "domain": {"root": "", "subdomain": "rewards", "verified": false},
  "smtpCustom": {"host": "", "port": "587", "auth": "login", "username": "", "password": ""},
  "reportTo": [
    "rosa@pomelopark.com"
  ]
};

export const notifications = [
  {
    "id": "n-signup",
    "group": "reward",
    "event": "Sign up reward",
    "on": true,
    "subject": "Welcome to Pomelo Rewards — 100 points are yours",
    "sent": 6104,
    "opened": 58.2, "clicked": 1100,
    "preview": "Your rewards start here", "heading": "Welcome to Pomelo Park", "body": "Thanks for joining. Your points are ready to use.", "buttonText": "Explore rewards", "buttonLink": "https://pomelopark.com/pages/rewards", "footer": "Pomelo Park rewards", "language": "en", "showBanner": true, "showHeading": true, "showButton": true, "showFooter": true, "sendBefore": 14
  },
  {
    "id": "n-earn",
    "group": "reward",
    "event": "Earn points",
    "on": true,
    "subject": "You just earned {{points}} points",
    "sent": 18420,
    "opened": 41.0, "clicked": 2180
  },
  {
    "id": "n-redeem",
    "group": "reward",
    "event": "Reward redeemed",
    "on": true,
    "subject": "Your {{reward}} is ready",
    "sent": 4280,
    "opened": 66.4, "clicked": 1012
  },
  {
    "id": "n-bday",
    "group": "reward",
    "event": "Birthday reward",
    "on": true,
    "subject": "Happy birthday, {{first_name}} 🎂",
    "sent": 1408,
    "opened": 71.9, "clicked": 480
  },
  {"id":"n-milestone","group":"reward","event":"Milestone achieved","on":true,"subject":"You reached a new milestone","sent":804,"opened":54.2,"clicked":188},
  {"id":"n-milestone-claim","group":"reward","event":"Milestone reward claimed","on":true,"subject":"Your milestone reward is ready","sent":602,"opened":63.1,"clicked":157},
  {
    "id": "n-ref",
    "group": "referral",
    "event": "Friend used your link",
    "on": true,
    "subject": "{{friend}} just joined — 500 points for you",
    "sent": 611,
    "opened": 62.0, "clicked": 202
  },
  {
    "id": "n-tierup",
    "group": "vip",
    "event": "Tier achieved",
    "on": true,
    "subject": "Welcome to {{tier}}",
    "sent": 1407,
    "opened": 69.3, "clicked": 392
  },
  {
    "id": "n-tierdown",
    "group": "vip",
    "event": "Tier downgraded",
    "on": false,
    "subject": "Your tier changed",
    "sent": 0,
    "opened": null, "clicked": 0
  },
  {"id":"n-pretier","group":"vip","event":"Almost at the next tier","on":true,"subject":"Your next tier is close","sent":920,"opened":57.6,"clicked":224},
  {"id":"n-tierreset","group":"vip","event":"Tier reset","on":false,"subject":"Your new tier period starts","sent":0,"opened":null,"clicked":0},
  {"id":"n-tierassessment","group":"vip","event":"Tier assessment reminder","on":true,"subject":"Keep your VIP benefits","sent":760,"opened":49.8,"clicked":120},
  {
    "id": "n-expire",
    "group": "expiry",
    "event": "Points about to expire",
    "on": true,
    "subject": "{{points}} points expire in 14 days",
    "sent": 2930,
    "opened": 48.7, "clicked": 460
  },
  {
    "id": "n-coupon",
    "group": "coupon",
    "event": "Unused coupon reminder",
    "on": false,
    "subject": "Your {{reward}} is waiting",
    "sent": 0,
    "opened": null, "clicked": 0
  }
];

export const order = {
  "rewardOn": "paid",
  "showAwaiting": false,
  "freezeRules": false,
  "tagSync": true,
  "tag": "joy-order"
};

export const prelaunch = {
  "syncSignups": "done",
  "syncNewsletter": "idle",
  "syncOrders": "idle",
  "excludeSegments": [], "syncedCustomers": 0
};

export const translations = {
  "primary": "en",
  "detect": "storefront",
  "embedLanguages": ["en", "fr"],
  "content": {"widget-v4": {"en": {"title": "Your rewards", "earn": "Ways to earn", "redeem": "Ways to redeem"}, "fr": {"title": "Vos récompenses", "earn": "Comment gagner", "redeem": "Comment échanger"}}},
  "languages": [
    "en",
    "fr",
    "es"
  ]
};

export const developers = {
  "apiKey": "pk_live_••••••••3f9a",
  "mcpUrl": "https://mcp.joy.example/pomelopark",
  "allowWrites": false, "multiStore": false, "headlessSecret": "••••••••••••", "deeplink": "?joy-open=1", "republishAt": "2026-11-12",
  "clients": [
    "Claude"
  ]
};

export const additional = {
  "widgetSso": {
    "shop": true,
    "google": false,
    "facebook": false,
    "multipass": false,
    "googleClientId": "", "googleSecret": "", "multipassSecret": ""
  },
  "showMetafields": true,
  "metafieldAccess": false, "syncMetafields": false, "metafieldNamespace": "joy", "metafieldMapping": [{"name":"Birthday","field":"Birthday"}], "memberTagSync": true,
  "autoTag": {
    "redeemer": true,
    "member": true,
    "engaged": false,
    "redeemerTag": "joy-redeemer", "nonRedeemerTag": "joy-non-redeemer", "memberTag": "joy-member", "nonMemberTag": "joy-guest", "engagedTag": "joy-engaged"
  },
  "pendingPoints": {
    "on": false,
    "value": 14,
    "unit": "days"
  },
  "selfRevoke": {
    "on": true,
    "limit": {
      "on": false, "value": 2, "per": "month"
    },
    "window": {
      "on": true,
      "value": 24,
      "unit": "hours"
    }
  },
  "loginUrls": {
    "on": false,
    "login": "",
    "signup": ""
  },
  "globalLimit": {
    "on": false,
    "max": 5000,
    "per": "month", "rollingDays": 30, "startDate": "2026-11-18", "perTier": false
  },
  "freeProductLimit": 1,
  "magicTags": ["joy-member", "joy-redeemer"],
  "pointsInOrderEmail": false,
  "webmcp": {
    "on": true,
    "redeem": false
  }
};

