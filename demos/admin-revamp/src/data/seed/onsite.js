// Storefront surfaces, wallet passes, theme status. Owned by the On your store module.
export const surfaces = [
  {
    "id": "widget",
    "name": "Loyalty widget",
    "where": "Every page, bottom corner",
    "status": "live",
    "version": "V4"
  },
  {
    "id": "page",
    "name": "Loyalty page",
    "where": "pomelopark.com/pages/rewards",
    "status": "live",
    "version": "V2"
  },
  {
    "id": "account",
    "name": "Account page",
    "where": "Customer account",
    "status": "live",
    "version": "Loyalty hub"
  },
  {
    "id": "product",
    "name": "Product page",
    "where": "Point calculator under the price",
    "status": "off"
  },
  {
    "id": "cart",
    "name": "Cart drawer",
    "where": "Redeem in cart",
    "status": "live",
    "version": "New"
  },
  {
    "id": "checkout",
    "name": "Checkout",
    "where": "Shopify Plus only",
    "status": "locked"
  },
  {
    "id": "thankyou",
    "name": "Thank you page",
    "where": "After checkout",
    "status": "off"
  }
];

export const wallet = {
  "apple": true,
  "google": false,
  "qrWidget": true,
  "passes": 1820,
  "passLanguage": "en", "header": "Pomelo Rewards", "logoText": "Pomelo Park", "background": "#e86a5a", "foreground": "#ffffff", "appleStyle": "store-card",
  "fields": [{"label":"Points balance","value":"points"},{"label":"VIP tier","value":"tier"}],
  "notifications": {"earned": true, "tier": true, "expiry": false}, "qrFields": ["name", "points", "tier"], "qrEmail": ""
};

export const theme = {
  "embedOn": true,
  "blocks": 3,
  "themeName": "Dawn"
};

export const surfaceSettings = {
  widget: {extra:{showBalance:true,hideGuests:false,popupOnOpen:false,customCss:"",width:"medium"}, title: "Your rewards", subtitle: "Earn more with every order", launcher: "bottom-right", showGuests: true, sections: ["Balance", "Ways to earn", "Ways to redeem", "Referral", "VIP tiers", "FAQ"], hidden: [], version: "V4"},
  page: {extra:{preset:"minimal",layout:"grid",heroSize:"large",customCss:""}, title: "Rewards made for you", subtitle: "Small rituals, better rewards", launcher: "bottom-right", showGuests: true, sections: ["Hero", "How it works", "Ways to earn", "Ways to redeem", "Referral", "VIP tiers", "FAQ"], hidden: [], version: "V2"},
  account: {extra:{borderWidth:"thin",borderStyle:"solid",radius:"medium",density:"default",couponsVisible:4,heroSize:"medium"}, title: "Your rewards", subtitle: "Everything you've earned", launcher: "bottom-right", showGuests: false, sections: ["Balance", "Impact", "Rewards", "Earn", "Redeem", "VIP", "Referral", "Wallet", "Activity"], hidden: [], version: "Loyalty hub"},
  product: {extra:{fontSize:14,iconSize:16,showGuests:true}, title: "Earn points on this product", subtitle: "Join to collect rewards", launcher: "below-price", showGuests: true, sections: ["Point calculator"], hidden: [], version: "New"},
  cart: {extra:{hideGuests:true,hideInsufficient:false,showEarnBack:true,allowCancellation:true,showPointsInput:false,preferHigherValue:false,collapseAfterRedeem:true,positionMode:"automatic",cssSelector:""}, title: "Use your points", subtitle: "Redeem before checkout", launcher: "cart-drawer", showGuests: false, sections: ["Available rewards", "Points balance", "Earn-back message"], hidden: [], version: "New"},
  checkout: {extra:{quickRedeem:true,availableRewards:true,referral:true}, title: "Your rewards at checkout", subtitle: "Use points on this order", launcher: "checkout", showGuests: false, sections: ["Quick redeem", "Available rewards", "Referral"], hidden: [], version: "New"},
  thankyou: {extra:{signup:true,referral:true,celebration:true,vipProgress:true}, title: "Thanks for your order", subtitle: "Your points are on the way", launcher: "after-checkout", showGuests: true, sections: ["Sign up", "Referral", "Reward celebration", "VIP progress"], hidden: [], version: "New"}
};

// Keep each editor's initial values inside db.onsite.surfaces, the slice imported by the shared store.
surfaces.forEach(surface => { surface.settings = surfaceSettings[surface.id]; });

