// Home-only content and persisted dismissals. KPI values live in db.stats.
export const home = {
  dismissed: [], setupMode: 'basic', setupHidden: false,
  usage: {orders: 920, orderLimit: 1000},
  alerts: [
    {id: 'missing-scope', title: 'Check your Shopify permissions', detail: 'Joy needs permission to keep customer points in sync.', route: '/settings?type=general', tone: 'warning'},
    {id: 'pos-migration', title: 'Move to the new Shopify POS extension', detail: 'Keep in-store loyalty available after the legacy extension ends.', route: '/integrations/pos', tone: 'info'},
  ],
  announcements: [
    {id: 'credit', title: 'Give customers store credit', detail: 'A flexible way to turn loyalty into a reason to return.', action: '/programs/point', art: 'credit'},
    {id: 'banner', title: 'Create a loyalty banner with Joy AI', detail: 'Make your loyalty page feel at home on your store.', action: '/store', art: 'banner', ai: true},
    {id: 'wallet', title: 'Keep rewards in their pocket', detail: 'Let customers save their loyalty pass to a wallet.', action: '/customers/wallet', art: 'wallet'},
  ],
  guides: [
    {id:'points', title:'Set up points', detail:'Choose earning rules and rewards customers will understand.', route:'/programs/point'},
    {id:'store', title:'Put loyalty on your store', detail:'Show points and rewards where customers shop.', route:'/store'},
    {id:'results', title:'Understand your results', detail:'See which loyalty actions bring customers back.', route:'/analytics'},
  ],
};
