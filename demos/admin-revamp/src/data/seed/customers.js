// Customers, activity, items waiting for approval, B2B companies. Owned by the Customers module.
export const customers = [
  {
    "id": "c-ava",
    "name": "Ava Nguyen",
    "email": "ava@example.com",
    "type": "member",
    "tierId": "t-gold",
    "points": 1240,
    "tierProgress": 1060,
    "birthday": "1994-03-12",
    "joined": "2025-04-03",
    "orders": 14,
    "spent": 1060,
    "updated": "2026-11-17",
    "tierUpdated": "2026-08-14",
    "storeCredit": 18,
    "instagram": "@avaskincare",
    "phone": "+1 415 555 0132",
    "locale": "English",
    "marketMode": "auto",
    "emailConsent": true,
    "smsConsent": false,
    "facebook": "Ava Nguyen",
    "lastOrder": "2026-11-16",
    "pendingPoints": 45,
    "impactTrees": 2,
    "pendingRewards": [{"id":"pr-ava","name":"Birthday treat","points":300}],
    "referralHistory": [{"id":"rh-ava","name":"Tara Lin","status":"Completed","at":"2026-10-09"}],
    "referralsCompleted": 3,
    "referralsPending": 1,
    "milestonesReached": 2,
    "notes": [{"id":"n-ava","text":"Prefers fragrance-free products.","at":"2026-11-12T11:00"}],
    "whitelisted": true,
    "tags": [
      "vip-prospect"
    ]
  },
  {
    "id": "c-ben",
    "name": "Ben Carter",
    "email": "ben@example.com",
    "type": "member",
    "tierId": "t-silver",
    "points": 320,
    "tierProgress": 420,
    "birthday": "",
    "joined": "2025-06-21",
    "orders": 5,
    "spent": 420,
    "updated": "2026-11-15",
    "tierUpdated": "2026-07-01",
    "storeCredit": 0,
    "quizAnswers": ["Skin type: dry", "Routine: evening"],
    "tags": []
  },
  {
    "id": "c-chloe",
    "name": "Chloe Martin",
    "email": "chloe@example.com",
    "type": "member",
    "tierId": "t-member",
    "points": 0,
    "tierProgress": 60,
    "birthday": "1999-11-30",
    "joined": "2026-10-02",
    "orders": 1,
    "spent": 60,
    "updated": "2026-11-10",
    "tags": []
  },
  {
    "id": "c-dev",
    "name": "Dev Patel",
    "email": "dev@example.com",
    "type": "member",
    "tierId": "t-vip",
    "points": 5210,
    "tierProgress": 2840,
    "birthday": "1988-07-08",
    "joined": "2025-04-01",
    "orders": 41,
    "spent": 2840,
    "updated": "2026-11-18",
    "tierUpdated": "2026-09-01",
    "storeCredit": 42,
    "companyId": "co-1",
    "whitelisted": true,
    "tags": [
      "wholesale"
    ]
  },
  {
    "id": "c-emma",
    "name": "Emma Rossi",
    "email": "emma@example.com",
    "type": "guest",
    "tierId": null,
    "points": 0,
    "tierProgress": 0,
    "birthday": "",
    "joined": "",
    "orders": 2,
    "spent": 88,
    "updated": "2026-11-02",
    "tags": []
  },
  {
    "id": "c-finn",
    "name": "Finn Okafor",
    "email": "finn@example.com",
    "type": "left",
    "tierId": null,
    "points": 0,
    "tierProgress": 0,
    "birthday": "",
    "joined": "2025-08-14",
    "orders": 3,
    "spent": 140,
    "updated": "2026-09-30",
    "tags": []
  },
  {
    "id": "c-gia",
    "name": "Gia Tran",
    "email": "gia@example.com",
    "type": "member",
    "tierId": "t-silver",
    "points": 780,
    "tierProgress": 560,
    "birthday": "1997-01-25",
    "joined": "2025-05-11",
    "orders": 8,
    "spent": 560,
    "updated": "2026-11-16",
    "tierUpdated": "2026-06-10",
    "referralsCompleted": 1,
    "tags": []
  },
  {
    "id": "c-hana",
    "name": "Hana Sato",
    "email": "hana@example.com",
    "type": "member",
    "tierId": "t-member",
    "points": 150,
    "tierProgress": 120,
    "birthday": "",
    "joined": "2026-11-01",
    "orders": 1,
    "spent": 120,
    "updated": "2026-11-12",
    "tags": []
  },
  {"id":"c-iris","name":"Iris Bell","email":"iris@example.com","type":"member","tierId":"t-gold","points":920,"tierProgress":840,"birthday":"1992-09-18","joined":"2025-12-06","orders":12,"spent":840,"updated":"2026-11-14","tags":[],"storeCredit":0},
  {"id":"c-jules","name":"Jules Park","email":"jules@example.com","type":"guest","tierId":null,"points":0,"tierProgress":0,"birthday":"","joined":"","orders":1,"spent":42,"updated":"2026-11-13","tags":[]},
  {"id":"c-kai","name":"Kai Morgan","email":"kai@example.com","type":"member","tierId":"t-silver","points":410,"tierProgress":380,"birthday":"1995-12-20","joined":"2026-01-15","orders":6,"spent":380,"updated":"2026-11-11","tags":[]},
  {"id":"c-lena","name":"Lena Flores","email":"lena@example.com","type":"member","tierId":"t-member","points":90,"tierProgress":90,"birthday":"","joined":"2026-09-08","orders":2,"spent":90,"updated":"2026-11-09","tags":[]}
];

export const activity = [
  {
    "id": "ac1",
    "customerId": "c-ava",
    "kind": "earned",
    "program": "Place an order",
    "points": 95,
    "at": "2026-11-17T14:12"
  },
  {
    "id": "ac2",
    "customerId": "c-dev",
    "kind": "redeemed",
    "program": "Free Glow Getter Set",
    "points": -4000,
    "at": "2026-11-17T09:40"
  },
  {
    "id": "ac3",
    "customerId": "c-ben",
    "kind": "earned",
    "program": "Review a product",
    "points": 50,
    "at": "2026-11-16T18:02"
  },
  {
    "id": "ac4",
    "customerId": "c-gia",
    "kind": "tier",
    "program": "Silver → Gold upgrade pending",
    "points": 0,
    "at": "2026-11-16T11:20"
  },
  {
    "id": "ac5",
    "customerId": "c-hana",
    "kind": "earned",
    "program": "Create an account",
    "points": 100,
    "at": "2026-11-12T08:15"
  },
  {
    "id": "ac6",
    "customerId": "c-chloe",
    "kind": "expired",
    "program": "Points expired",
    "points": -120,
    "at": "2026-11-10T00:00"
  },
  {"id":"ac7","customerId":"c-ava","kind":"referral","program":"Refer a friend","points":200,"at":"2026-11-08T10:00","status":"Completed","source":"Referral link"},
  {"id":"ac8","customerId":"c-iris","kind":"review","program":"Review a product","points":75,"at":"2026-11-07T16:00","status":"Approved","content":"Cloud Cream review with a photo","media":1},
  {"id":"ac9","customerId":"c-dev","kind":"google_review","program":"Review us on Google","points":100,"at":"2026-11-06T12:00","status":"Approved","source":"Google Maps"},
  {"id":"ac10","customerId":"c-gia","kind":"receipt","program":"Bought in store? Upload the receipt","points":180,"at":"2026-11-05T13:20","status":"Approved","content":"Store receipt · $36","media":1},
  {"id":"ac11","customerId":"c-hana","kind":"form","program":"Skin quiz form","points":100,"at":"2026-11-04T09:35","status":"Approved","content":"Skin type: combination"},
  {"id":"ac12","customerId":"c-ava","kind":"impact","program":"Plant a tree","points":-300,"at":"2026-11-03T10:00","status":"Confirmed","impact":"1 tree"},
  {"id":"ac13","customerId":"c-kai","kind":"launch_tier","program":"VIP tier launch","points":0,"at":"2026-11-02T12:00","status":"Completed","content":"Silver tier granted at launch"}
];

export const reviewQueue = [
  {
    "id": "q1",
    "kind": "review",
    "customerId": "c-ben",
    "program": "Review a product",
    "content": "Cloud Cream fixed my dry patches in a week. Smells like pomelo!",
    "media": 1,
    "points": 75,
    "submitted": "2026-11-17T20:41",
    "status": "pending"
  },
  {
    "id": "q2",
    "kind": "receipt",
    "customerId": "c-gia",
    "program": "Bought in store? Upload the receipt",
    "content": "Receipt · $64.00 · Pomelo Park Union Square",
    "media": 1,
    "points": 320,
    "submitted": "2026-11-17T16:05",
    "status": "pending"
  },
  {
    "id": "q3",
    "kind": "google_review",
    "customerId": "c-ava",
    "program": "Review us on Google",
    "content": "maps.example/review/pomelo-park-ava",
    "media": 0,
    "points": 100,
    "submitted": "2026-11-16T10:30",
    "status": "pending"
  },
  {
    "id": "q4",
    "kind": "form",
    "customerId": "c-hana",
    "program": "Skin quiz form",
    "content": "Skin type: combination · Concern: redness",
    "media": 0,
    "points": 100,
    "submitted": "2026-11-15T12:00",
    "status": "pending"
  }
];

export const companies = [
  {
    "id": "co-1",
    "name": "Glow Studio Salon",
    "contacts": 2,
    "partnerTierId": "pt-salon",
    "orders": 18,
    "spent": 6420
  },
  {
    "id": "co-2",
    "name": "Bloom & Co Spa",
    "contacts": 1,
    "partnerTierId": "pt-salon",
    "orders": 7,
    "spent": 2210
  }
];

