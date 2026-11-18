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
    "where": "northbloom.com/pages/rewards",
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
  "passes": 1820
};

export const theme = {
  "embedOn": true,
  "blocks": 3,
  "themeName": "Dawn"
};

