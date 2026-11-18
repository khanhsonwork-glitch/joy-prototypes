// Customers, activity, items waiting for approval, B2B companies. Owned by the Customers module.
export const customers = [
  {
    "id": "c-ava",
    "name": "Ava Nguyen",
    "email": "ava@inbox.example",
    "type": "member",
    "tierId": "t-gold",
    "points": 1240,
    "tierProgress": 1060,
    "birthday": "1994-03-12",
    "joined": "2025-04-03",
    "orders": 14,
    "spent": 1060,
    "updated": "2026-11-17",
    "tags": [
      "vip-prospect"
    ]
  },
  {
    "id": "c-ben",
    "name": "Ben Carter",
    "email": "ben@inbox.example",
    "type": "member",
    "tierId": "t-silver",
    "points": 320,
    "tierProgress": 420,
    "birthday": "",
    "joined": "2025-06-21",
    "orders": 5,
    "spent": 420,
    "updated": "2026-11-15",
    "tags": []
  },
  {
    "id": "c-chloe",
    "name": "Chloe Martin",
    "email": "chloe@inbox.example",
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
    "email": "dev@inbox.example",
    "type": "member",
    "tierId": "t-vip",
    "points": 5210,
    "tierProgress": 2840,
    "birthday": "1988-07-08",
    "joined": "2025-04-01",
    "orders": 41,
    "spent": 2840,
    "updated": "2026-11-18",
    "tags": [
      "wholesale"
    ]
  },
  {
    "id": "c-emma",
    "name": "Emma Rossi",
    "email": "emma@inbox.example",
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
    "email": "finn@inbox.example",
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
    "email": "gia@inbox.example",
    "type": "member",
    "tierId": "t-silver",
    "points": 780,
    "tierProgress": 560,
    "birthday": "1997-01-25",
    "joined": "2025-05-11",
    "orders": 8,
    "spent": 560,
    "updated": "2026-11-16",
    "tags": []
  },
  {
    "id": "c-hana",
    "name": "Hana Sato",
    "email": "hana@inbox.example",
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
  }
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
  }
];

export const reviewQueue = [
  {
    "id": "q1",
    "kind": "review",
    "customerId": "c-ben",
    "program": "Review a product",
    "content": "Cloud Cream fixed my dry patches in a week. Smells like fresh citrus!",
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
    "content": "Receipt · $64.00 · North Bloom Union Square",
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
    "content": "maps.example/review/north-bloom-ava",
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

