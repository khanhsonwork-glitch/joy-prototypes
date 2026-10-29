// Two fictional shops whose wishlists show the problem from both ends: a parts shop where names carry the full
// fitment list (most names are 60-140 characters), and the Pomelo Park skincare shop where most names are short.
// Names, prices and photos are made up for this prototype (the photos are generated, not taken from any shop).

/** The fictional merchant whose admin the prototype shows. */
export const STORE = {name: 'Ridgeline Moto', initials: 'RM'};

export const SHOPS = {
  moto: {
    id: 'moto',
    label: 'Ridgeline Moto (long names)',
    widgetTitle: 'Membership',
    brand: '#FF6A2B',
    brandText: '#1a1a1a',
    items: [
      {id: 'm1', title: 'Rear Swingarm Guard Plate For KTM 250 350 450 EXC-F XC-W 2024-2026 / Husqvarna FE', price: '$89.99', img: 'img/swingarm-guard.jpg', soldOut: true},
      {id: 'm2', title: 'LED Cylinder Head Cam Cover With Light Strip + Plug For Yamaha Raptor 700R 2006-2026', price: '$63.99', variant: 'Blue', img: 'img/led-cam-cover.jpg', soldOut: true},
      {id: 'm3', title: 'Windshield Windscreen For Yamaha Tenere 700 2019-2025', price: '$59.99', img: 'img/windshield.jpg'},
      {id: 'm4', title: 'Right Side Clutch Crankcase Cover Quick Access For Yamaha Banshee 350', price: '$299.99', variant: 'Red · Pre-Order', img: 'img/clutch-cover.jpg'},
      {id: 'm5', title: 'Brake Pedal Tip', price: '$24.99', variant: 'Orange', img: 'img/brake-pedal-tip.jpg'},
      {id: 'm6', title: 'Universal GPS Phone Mount Bracket Mini Fairing Kit For KTM 125-530 SX-F EXC XC-F XC-W Husqvarna 125-501 Honda XR650L Beta GasGas', price: '$129.99', compareAt: '$149.99', variant: 'Black', img: 'img/gps-mount.jpg'},
    ],
  },
  pomelo: {
    id: 'pomelo',
    label: 'Pomelo Park (short names)',
    widgetTitle: 'Pomelo Club',
    brand: '#B5303F',
    brandText: '#ffffff',
    items: [
      {id: 'p1', title: 'Pomelo Cloud Cream', price: '$34.00', variant: '50 ml', img: 'img/pomelo-cloud-cream.jpg'},
      {id: 'p2', title: 'Citrus Gel Cleanser', price: '$22.00', img: 'img/citrus-gel-cleanser.jpg'},
      {id: 'p3', title: 'Vitamin C Glow Serum with 15% Vitamin C & Ferulic Acid', price: '$38.00', variant: '30 ml', img: 'img/vitamin-c-glow-serum.jpg'},
      {id: 'p4', title: 'Sunny Side SPF 40 Daily Mineral Sunscreen', price: '$20.00', img: 'img/sunny-side-spf-40.jpg', soldOut: true},
      {id: 'p5', title: 'Travel Trio', price: '$29.00', img: 'img/travel-trio.jpg'},
      {id: 'p6', title: 'Glow Getter Set: Cleanser, Toner, Serum & Moisturizer (Full Size)', price: '$100.00', compareAt: '$124.00', img: 'img/glow-getter-set.jpg'},
    ],
  },
};

/** Overflow / worst case: the longest names a shop can have, one unbroken model code, many rows. */
export const OVERFLOW_ITEMS = [
  {id: 'o1', title: 'Oversized Water Pump Impeller Cooler Kit For KTM 450 500 EXC-F/XCF-W Husqvarna 450 500 FE/FX 2017-2024 GasGas 450 MC F / EX F / EC F 2021-2024 (Includes Gaskets, O-Rings and Hardware)', price: '$1,249.99', variant: 'Orange / Long-travel / Pre-Order — ships in 4 weeks', img: 'img/clutch-cover.jpg'},
  {id: 'o2', title: 'KTM-HUSQVARNA-GASGAS-SXF250-SXF350-SXF450-EXCF500-COMPLETE-REPLACEMENT-KIT', price: '$12,499.99', compareAt: '$13,999.99', img: 'img/swingarm-guard.jpg', soldOut: true},
];

export const WORST_EXTRA = 24;
