// Settings sections. Owned by the Settings module.
export const general = {
  "enrollment": "auto",
  "excludeB2b": false,
  "language": "en-US",
  "showLanguageSelector": true,
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "24h",
  "currencyWithCode": false,
  "discountPrefix": "JOY-",
  "applyDiscount": "cart_page",
  "afterRedeem": "auto_apply",
  "afterFreeGift": "manual",
  "calculatorGuest": "login",
  "showVipRewardsToGuests": false,
  "reviewDefault": "pending",
  "googleReviewDefault": "pending"
};

export const brand = {
  "primary": "#e86a5a",
  "secondary": "#fbcac3",
  "accent": "#5b7a4a"
};

export const email = {
  "logo": true,
  "address": "88 Market St, San Francisco, CA 94103",
  "sender": {
    "name": "North Bloom",
    "email": "hello@northbloom.example",
    "verified": true
  },
  "smtp": "avada",
  "weeklyReport": true,
  "reportTo": [
    "rosa@northbloom.example"
  ]
};

export const notifications = [
  {
    "id": "n-signup",
    "group": "reward",
    "event": "Sign up reward",
    "on": true,
    "subject": "Welcome to North Bloom Rewards — 100 points are yours",
    "sent": 6104,
    "opened": 58.2
  },
  {
    "id": "n-earn",
    "group": "reward",
    "event": "Earn points",
    "on": true,
    "subject": "You just earned {{points}} points",
    "sent": 18420,
    "opened": 41.0
  },
  {
    "id": "n-redeem",
    "group": "reward",
    "event": "Reward redeemed",
    "on": true,
    "subject": "Your {{reward}} is ready",
    "sent": 4280,
    "opened": 66.4
  },
  {
    "id": "n-bday",
    "group": "reward",
    "event": "Birthday reward",
    "on": true,
    "subject": "Happy birthday, {{first_name}} 🎂",
    "sent": 1408,
    "opened": 71.9
  },
  {
    "id": "n-ref",
    "group": "referral",
    "event": "Friend used your link",
    "on": true,
    "subject": "{{friend}} just joined — 500 points for you",
    "sent": 611,
    "opened": 62.0
  },
  {
    "id": "n-tierup",
    "group": "vip",
    "event": "Tier achieved",
    "on": true,
    "subject": "Welcome to {{tier}}",
    "sent": 1407,
    "opened": 69.3
  },
  {
    "id": "n-tierdown",
    "group": "vip",
    "event": "Tier downgraded",
    "on": false,
    "subject": "Your tier changed",
    "sent": 0,
    "opened": null
  },
  {
    "id": "n-expire",
    "group": "expiry",
    "event": "Points about to expire",
    "on": true,
    "subject": "{{points}} points expire in 14 days",
    "sent": 2930,
    "opened": 48.7
  },
  {
    "id": "n-coupon",
    "group": "coupon",
    "event": "Unused coupon reminder",
    "on": false,
    "subject": "Your {{reward}} is waiting",
    "sent": 0,
    "opened": null
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
  "excludeSegments": []
};

export const translations = {
  "primary": "en",
  "detect": "storefront",
  "languages": [
    "en",
    "fr",
    "es"
  ]
};

export const developers = {
  "apiKey": "pk_live_••••••••3f9a",
  "mcpUrl": "https://mcp.joy.example/northbloom",
  "clients": [
    "Claude"
  ]
};

export const additional = {
  "widgetSso": {
    "shop": true,
    "google": false,
    "facebook": false,
    "multipass": false
  },
  "showMetafields": true,
  "autoTag": {
    "redeemer": true,
    "member": true,
    "engaged": false
  },
  "pendingPoints": {
    "on": false,
    "value": 14,
    "unit": "days"
  },
  "selfRevoke": {
    "on": true,
    "limit": {
      "on": false
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
    "per": "month"
  },
  "freeProductLimit": 1,
  "pointsInOrderEmail": false,
  "webmcp": {
    "on": true,
    "redeem": false
  }
};

