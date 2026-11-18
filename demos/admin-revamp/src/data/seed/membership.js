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
    "used": 0,
    "limit": 1,
    "countdown": true,
    "badgeText": "Members only",
    "saleChannels": "Online store",
    "orderMinimum": 0,
    "combines": false,
    "dateMode": "static"
    ,"dynamicDate": "birth_month"
    ,"actionText": "Members only"
    ,"cta": "Shop member deals"
    ,"availableSpot": "Member account"
    ,"textFont": "Default"
    ,"textSize": 14
    ,"textColor": "#303030"
    ,"iconColor": "#a9dffd"
    ,"backgroundColor": "#e6e6e6"
    ,"gradient": false
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
    "used": 88,
    "limit": 1,
    "countdown": false,
    "badgeText": "Member deal",
    "saleChannels": "Online store",
    "orderMinimum": 0,
    "combines": false,
    "dateMode": "static"
    ,"dynamicDate": "birth_month"
    ,"actionText": "Member deal"
    ,"cta": "Shop member deals"
    ,"availableSpot": "Member account"
    ,"textFont": "Default"
    ,"textSize": 14
    ,"textColor": "#303030"
    ,"iconColor": "#a9dffd"
    ,"backgroundColor": "#e6e6e6"
    ,"gradient": false
  }
];

export const paidPlans = [
  {
    "id": "pp-club",
    "name": "Pomelo Club",
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
    "subscribers": 214,
    "monthlyBonus": 100,
    "freeShipping": true,
    "dealsAccess": true,
    "multiplier": 2,
    "cancelBehavior": "keep",
    "products": ["Glow Getter Set"],
    "frequencies": [{"id":"freq-month","type":"payg","every":1,"unit":"month","discountType":"percent","discount":10,"title":"Monthly","description":"Save 10% every month","minOrders":1,"maxOrders":150,"tierId":"t-gold","priority":1,"start":"","end":"","tag":"joy-club"}],
    "widget": {"reverse": false, "defaultOption": "payg"},
    "subscribersList": [{"id":"sub-ava","customerId":"c-ava","name":"Ava Nguyen","email":"ava@example.com","status":"active"},{"id":"sub-ben","customerId":"c-ben","name":"Ben Carter","email":"ben@example.com","status":"trial"}],
    "orphanedPlans": [{"id":"orphan-1","name":"Legacy facial box","detected":"2026-11-12","frequencies":2,"tag":"joy-legacy-box"}]
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
    "catalog": "Wholesale catalog",
    "threshold": 5000,
    "minimumOrder": 250,
    "companyIds": ["co-1", "co-2"],
    "perks": ["Early catalog access", "Dedicated support"],
    "privileges": [{"id":"priv-salon","type":"discount_percent","name":"Salon wholesale discount","value":20,"code":"SALON20","expires":"never"}],
    "icon": "silver"
  }
];

