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
  "accessByTags": {"on": false, "tags": []},
  "autoRevoke": false,
  "maxPerCustomer": {
    "on": true,
    "times": 20
  },
  "redirectUrl": "/",
  "linkPrefix": "pomelopark.com/r/",
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
    "goal": "Find a simple skincare routine",
    "questions": [
      {"id":"qz-skin-1","text":"How does your skin feel by midday?","description":"Choose the closest answer.","multiple":false,"options":[{"id":"a-skin-11","text":"Dry or tight"},{"id":"a-skin-12","text":"Balanced"},{"id":"a-skin-13","text":"Oily or shiny"}]},
      {"id":"qz-skin-2","text":"What is your main skin goal?","description":"","multiple":false,"options":[{"id":"a-skin-21","text":"More hydration"},{"id":"a-skin-22","text":"A brighter look"},{"id":"a-skin-23","text":"Calmer skin"}]},
      {"id":"qz-skin-3","text":"Which products do you already use?","description":"Select all that apply.","multiple":true,"options":[{"id":"a-skin-31","text":"Cleanser"},{"id":"a-skin-32","text":"Serum"},{"id":"a-skin-33","text":"Moisturizer"}]},
      {"id":"qz-skin-4","text":"How much time do you have in the morning?","description":"","multiple":false,"options":[{"id":"a-skin-41","text":"Under five minutes"},{"id":"a-skin-42","text":"Five to ten minutes"}]},
      {"id":"qz-skin-5","text":"What texture do you prefer?","description":"","multiple":false,"options":[{"id":"a-skin-51","text":"Lightweight"},{"id":"a-skin-52","text":"Rich and creamy"}]}
    ],
    "display": {"where":"widget","trigger":"on_open"},
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
    "goal": "Help shoppers choose a thoughtful gift",
    "questions": [
      {"id":"qz-gift-1","text":"Who is the gift for?","description":"","multiple":false,"options":[{"id":"a-gift-11","text":"A friend"},{"id":"a-gift-12","text":"Family"},{"id":"a-gift-13","text":"Myself"}]},
      {"id":"qz-gift-2","text":"What do they enjoy most?","description":"","multiple":false,"options":[{"id":"a-gift-21","text":"Skincare"},{"id":"a-gift-22","text":"Bath and body"}]},
      {"id":"qz-gift-3","text":"What is your budget?","description":"","multiple":false,"options":[{"id":"a-gift-31","text":"Under $25"},{"id":"a-gift-32","text":"$25 to $50"},{"id":"a-gift-33","text":"Over $50"}]},
      {"id":"qz-gift-4","text":"What should the gift feel like?","description":"","multiple":false,"options":[{"id":"a-gift-41","text":"Everyday useful"},{"id":"a-gift-42","text":"A special treat"}]}
    ],
    "display": {"where":"popup","trigger":"delay"},
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

