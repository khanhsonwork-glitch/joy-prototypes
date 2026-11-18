// Extra sample data for the Opus build: a fuller activity history (every type the Activity filter offers),
// per-customer details the profile shows, the referral whitelist and import history. Fictional; @inbox.example only.
export const moreActivity = [
  {id: 'ac7', customerId: 'c-gia', kind: 'earned', type: 'points', program: 'Place an order', points: 320, at: '2026-11-15T19:44'},
  {id: 'ac8', customerId: 'c-ava', kind: 'referral', type: 'referral', program: 'Friend Mia placed a first order', points: 500, at: '2026-11-15T13:02'},
  {id: 'ac9', customerId: 'c-dev', kind: 'earned', type: 'review', program: 'Review a product (photo bonus)', points: 75, at: '2026-11-14T21:10'},
  {id: 'ac10', customerId: 'c-ben', kind: 'refunded', type: 'points', program: 'Order #1042 refunded', points: -60, at: '2026-11-14T09:30'},
  {id: 'ac11', customerId: 'c-ava', kind: 'earned', type: 'google_review', program: 'Review us on Google', points: 100, at: '2026-11-13T16:00'},
  {id: 'ac12', customerId: 'c-hana', kind: 'earned', type: 'form', program: 'Skin quiz form', points: 100, at: '2026-11-13T11:25'},
  {id: 'ac13', customerId: 'c-gia', kind: 'earned', type: 'receipt', program: 'Receipt · Union Square store', points: 220, at: '2026-11-12T17:40'},
  {id: 'ac14', customerId: 'c-dev', kind: 'redeemed', type: 'impact', program: 'Plant a tree', points: -300, at: '2026-11-12T10:05'},
  {id: 'ac15', customerId: 'c-ava', kind: 'tier', type: 'tier', program: 'Silver → Gold', points: 0, at: '2026-11-11T08:00'},
  {id: 'ac16', customerId: 'c-ben', kind: 'adjusted', type: 'points', program: 'Adjusted by Rosa: sorry for the late parcel', points: 100, at: '2026-11-10T15:15'},
  {id: 'ac17', customerId: 'c-chloe', kind: 'tier', type: 'launch', program: 'Relaunch: placed in Member', points: 0, at: '2026-11-01T02:00'},
  {id: 'ac18', customerId: 'c-dev', kind: 'tier', type: 'launch', program: 'Relaunch: placed in VIP', points: 0, at: '2026-11-01T02:00'},
  {id: 'ac19', customerId: 'c-gia', kind: 'redeemed', type: 'points', program: '$5 off', points: -500, at: '2026-10-30T12:12'},
  {id: 'ac20', customerId: 'c-ava', kind: 'redeemed', type: 'points', program: 'Free shipping', points: -800, at: '2026-10-28T18:30'},
];

export const profiles = {
  'c-ava': {instagram: '@ava.glows', credit: 12, coupons: [{code: 'JOY-8F2K4Q', reward: '$5 off', status: 'Used', date: 'Oct 12, 2026'}, {code: 'JOY-3MZ71C', reward: 'Free shipping', status: 'Unused', date: 'Oct 28, 2026'}], referred: 6, referralLink: 'northbloom.com/r/ava10', notes: [{at: 'Nov 2, 2026', text: 'Asked about the Glow Getter Set restock.'}], quiz: [['How does your skin feel by midday?', 'Tight and dry'], ['What would you like to change?', 'Redness, Fine lines']]},
  'c-dev': {instagram: '', credit: 40, coupons: [{code: 'JOY-VIP4000', reward: 'Free Glow Getter Set', status: 'Used', date: 'Nov 17, 2026'}], referred: 2, referralLink: 'northbloom.com/r/dev5', notes: [], quiz: []},
};

export const whitelist = [
  {id: 'w1', customerId: 'c-dev', added: '2026-09-02', reason: 'Salon owner, refers clients in person'},
];

export const imports = [
  {id: 'im1', file: 'smile-export-2025-03.csv', source: 'Smile.io', rows: 4120, ok: 4096, failed: 24, at: '2025-03-30'},
  {id: 'im2', file: 'pos-members.csv', source: 'CSV file', rows: 310, ok: 310, failed: 0, at: '2026-02-14'},
];

// The rest of the production integration cards (Integrations page lists ~45 apps in 15 categories).
const app = (id, name, category, desc) => ({id, name, category, connected: false, desc});
export const moreApps = [
  app('theme', 'Theme integration', 'Theme', 'Add Joy blocks to your theme'),
  app('swym', 'Swym Wishlist Plus', 'Wishlist', 'Give points for wishlist adds'),
  app('wishlistking', 'Wishlist King', 'Wishlist', 'Give points for wishlist adds'),
  app('chatty', 'Chatty', 'Chat', 'Show points in the chat window'),
  app('airreviews', 'Air Reviews', 'Product reviews', 'Reward reviews with points'),
  app('seguno', 'Seguno Email Marketing', 'Email marketing', 'Points and tier in your emails'),
  app('facebookpage', 'Facebook Page', 'Social media', 'Points for page follows and comments'),
  app('orderlimits', 'Avada Order Limits Quantity', 'Reporting', 'Respect order limits on rewards'),
  app('intercom', 'Intercom', 'Chat', 'See loyalty data in conversations'),
  app('transcy', 'Transcy', 'Translations', 'Translate the widget and emails'),
  app('drip', 'Drip', 'Email marketing', 'Sync points and tier to Drip'),
  app('fera', 'Fera Product Reviews', 'Product reviews', 'Reward reviews with points'),
  app('reviewrocket', 'Review Rocket', 'Product reviews', 'Reward reviews with points'),
  app('pushowl', 'PushOwl', 'Email marketing', 'Push notifications about points'),
  app('stamped', 'Stamped', 'Product reviews', 'Reward reviews with points'),
  app('loox', 'Loox', 'Product reviews', 'Reward photo reviews'),
  app('hydrogen', 'Hydrogen', 'Theme', 'Use Joy on a headless store'),
  app('shopifysubs', 'Shopify Subscriptions', 'Subscriptions', 'Points for subscription orders'),
  app('sendlane', 'Sendlane', 'Email marketing', 'Sync loyalty data to Sendlane'),
  app('okendo', 'Okendo', 'Product reviews', 'Reviews through Shopify Flow'),
  app('zigpoll', 'Zigpoll', 'Shopify Flow', 'Points for survey answers'),
  app('reviewsio', 'Reviews.io', 'Product reviews', 'Reviews through Shopify Flow'),
  app('reporttoaster', 'Report Toaster', 'Reporting', 'Loyalty data in your reports'),
  app('tidio', 'Tidio', 'Chat', 'Show points in the chat window'),
  app('shopifyforms', 'Shopify Forms', 'Shopify Flow', 'Points for form sign-ups'),
  app('bold', 'BOLD Subscriptions', 'Subscriptions', 'Points for subscription orders'),
  app('seal', 'Seal Subscriptions', 'Subscriptions', 'Points for subscription orders'),
  app('skio', 'Skio Subscriptions', 'Subscriptions', 'Points for subscription orders'),
];
