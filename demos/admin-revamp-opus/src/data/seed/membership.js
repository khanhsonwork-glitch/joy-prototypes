// Member deals, paid membership, partner tiers (tiers live in shop.js). Owned by the VIP & membership module.
export const deals = [
  {
    "id": "d-early",
    "name": "Members-only early access: Winter edit",
    "status": "active",
    "discount": {
      "type": "percent",
      "value": 15
    },
    "eligibility": {
      "mode": "tiers",
      "tiers": [
        "t-gold",
        "t-vip"
      ]
    },
    "schedule": {
      "start": "2026-11-20",
      "end": "2026-11-30"
    },
    "products": "Winter edit collection",
    "used": 0
  },
  {
    "id": "d-serum",
    "name": "Serum bundle for members",
    "status": "inactive",
    "discount": {
      "type": "amount",
      "value": 12
    },
    "eligibility": {
      "mode": "members"
    },
    "schedule": {
      "start": "",
      "end": ""
    },
    "products": "Serums",
    "used": 88
  }
];

export const paidPlans = [
  {
    "id": "pp-club",
    "name": "Bloom Club",
    "status": "active",
    "price": 9,
    "interval": "month",
    "trialDays": 14,
    "perks": [
      "2× points on every order",
      "Free shipping",
      "Members-only deals"
    ],
    "tierId": "t-gold",
    "subscribers": 214
  }
];

export const partnerTiers = [
  {
    "id": "pt-salon",
    "name": "Salon partner",
    "status": "active",
    "companies": 12,
    "discount": 20,
    "paymentTerms": "Net 30",
    "catalog": "Wholesale catalog"
  }
];

