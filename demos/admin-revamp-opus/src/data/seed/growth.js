// Referrals, milestones, quizzes. Owned by the Programs module.
export const referral = {
  "status": "active",
  "name": "Give $10, get 500 points",
  "referrer": {
    "type": "points",
    "value": 500,
    "after": "first_order"
  },
  "friend": {
    "type": "amount",
    "value": 10,
    "minOrder": 30,
    "expiresDays": 30
  },
  "regions": [],
  "maxPerCustomer": {
    "on": true,
    "times": 20
  },
  "redirectUrl": "/",
  "linkPrefix": "northbloom.com/r/",
  "antiFraud": {
    "blockSameIp": true,
    "blockSameAddress": true,
    "requireNewCustomer": true
  },
  "stats": {
    "referred": 842,
    "orders": 611,
    "revenue": 38420,
    "conversion": 72.6
  }
};

export const milestones = [
  {
    "id": "ms-orders",
    "type": "orders",
    "name": "Order 3 times",
    "status": "active",
    "steps": [
      {
        "at": 3,
        "reward": {
          "type": "points",
          "value": 300
        }
      },
      {
        "at": 6,
        "reward": {
          "type": "amount",
          "value": 10
        }
      }
    ],
    "reached": 1240
  },
  {
    "id": "ms-spent",
    "type": "spent",
    "name": "Spend $500",
    "status": "active",
    "steps": [
      {
        "at": 500,
        "reward": {
          "type": "free_product",
          "value": "Cloud Cream mini"
        }
      }
    ],
    "reached": 402
  },
  {
    "id": "ms-reviews",
    "type": "reviews",
    "name": "Leave 5 reviews",
    "status": "inactive",
    "steps": [
      {
        "at": 5,
        "reward": {
          "type": "points",
          "value": 250
        }
      }
    ],
    "reached": 0
  }
];

export const milestoneTypes = [
  "mixed",
  "orders",
  "referrals",
  "subscription_cycles",
  "spent",
  "points",
  "reviews",
  "inactivity"
];

export const quizzes = [
  {
    "id": "qz-skin",
    "template": "Skin routine finder",
    "name": "Find your routine",
    "status": "active",
    "reward": {
      "type": "points",
      "value": 100
    },
    "eligibility": {
      "mode": "all"
    },
    "questions": 5,
    "completions": 1310
  },
  {
    "id": "qz-gift",
    "template": "Gift finder",
    "name": "Holiday gift finder",
    "status": "scheduled",
    "reward": {
      "type": "percent",
      "value": 10
    },
    "eligibility": {
      "mode": "all"
    },
    "questions": 4,
    "completions": 0,
    "schedule": {
      "start": "2026-12-01",
      "end": "2026-12-24"
    }
  }
];

export const quizTemplates = [
  "Build your own",
  "Welcome to the club",
  "Skin routine finder",
  "Gift finder",
  "Style finder",
  "Flavor finder",
  "Room finder"
];

