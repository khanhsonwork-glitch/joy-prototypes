// Submit form sample data for Pomelo Park (fictional). Field types, the five quick-start templates with the fields
// each one fills in, and the submissions shown on the Submit Form Activities tab. Every name and email is made up.

export const FIELD_TYPES = [
  {value: 'short', label: 'Short text', help: 'One line, like an order ID'},
  {value: 'paragraph', label: 'Paragraph', help: 'A few sentences'},
  {value: 'number', label: 'Number', help: 'Digits only, like an order total'},
  {value: 'email', label: 'Email', help: 'Checked for a valid address'},
  {value: 'link', label: 'Link', help: 'Checked for a web address'},
  {value: 'date', label: 'Date', help: 'Picked from a calendar'},
  {value: 'single', label: 'Single choice', help: 'Customer picks one option'},
  {value: 'multi', label: 'Multiple choice', help: 'Customer picks one or more'},
  {value: 'upload', label: 'File upload', help: 'Image or video proof'},
];
export const typeLabel = (value) => FIELD_TYPES.find((t) => t.value === value)?.label ?? value;
export const isChoice = (type) => type === 'single' || type === 'multi';

export const MAX_FIELDS = 10;
export const MAX_OPTIONS = 20;

let seq = 0;
export const newId = (prefix = 'f') => `${prefix}${Date.now().toString(36)}${(seq += 1)}`;

const opt = (label, tag = label) => ({id: newId('o'), label, tag});

/** Fields each quick-start template fills in (the "after" version). */
export const TEMPLATE_FIELDS = {
  receipt: () => [
    {id: newId(), type: 'short', label: 'Order ID', placeholder: 'e.g. 113-4829104-5512', required: true},
    {id: newId(), type: 'single', label: 'Where did you buy?', required: true, options: [opt('Amazon'), opt('eBay'), opt('Walmart'), opt('In a store', 'Retail store')]},
    {id: newId(), type: 'number', label: 'Order total before tax', placeholder: '0.00', prefix: '$', required: true},
    {id: newId(), type: 'email', label: 'Email used for the order', placeholder: 'you@example.com', required: true, prefill: true},
    {id: newId(), type: 'upload', label: 'Order screenshot', format: 'image', required: true},
  ],
  social: () => [
    {id: newId(), type: 'link', label: 'Post link', placeholder: 'Paste your post URL', required: true},
    {id: newId(), type: 'single', label: 'Where did you post?', required: true, options: [opt('Instagram'), opt('TikTok'), opt('Facebook')]},
    {id: newId(), type: 'upload', label: 'Upload your screenshot', format: 'image', required: false},
  ],
  review: () => [
    {id: newId(), type: 'short', label: 'Reviewer name', placeholder: 'The name on your review', required: true},
    {id: newId(), type: 'link', label: 'Review link', placeholder: 'Paste the review URL', required: false},
    {id: newId(), type: 'upload', label: 'Upload your review screenshot', format: 'image', required: true},
  ],
  unboxing: () => [
    {id: newId(), type: 'link', label: 'Video link (TikTok / Reels / Drive)', placeholder: 'Paste your video link', required: true},
    {id: newId(), type: 'upload', label: 'Upload your video', format: 'video', required: false},
  ],
  custom: () => [
    {id: newId(), type: 'short', label: 'Your answer', placeholder: 'Enter your proof here…', required: false},
    {id: newId(), type: 'upload', label: 'Upload Image', format: 'image', required: false},
  ],
};

export const TEMPLATES = [
  {key: 'social', emoji: '📣', label: 'Share on Social Media', subtitle: 'UGC · Instagram, TikTok'},
  {key: 'review', emoji: '⭐', label: 'Submit Review Screenshot', subtitle: 'Review proof · Trustpilot, Google'},
  {key: 'unboxing', emoji: '📦', label: 'Upload Unboxing Video', subtitle: 'Video · TikTok, Reels, Drive'},
  {key: 'receipt', emoji: '🧾', label: 'Submit Purchase Receipt', subtitle: 'Offline purchase proof'},
  {key: 'custom', emoji: '✏️', label: 'Custom Form', subtitle: 'Default · flexible proof'},
];

/** Today: one text box (label set on the Design tab) + the upload settings. */
export const TODAY = {inputLabel: 'Order number / Store', inputPlaceholder: 'Enter order number or where you bought it…', uploadLabel: 'Upload your receipt'};

export const FORM_TAGS = ['receipt-reward'];

/** Submissions on the Submit Form Activities tab. `answers` are keyed by field label (stored with the submission). */
export const SUBMISSIONS = [
  {
    id: 's1', at: '2026-10-30 09:42', program: 'Bought elsewhere? Get points', name: 'Ava Nguyen', email: 'ava@example.com', status: 'pending',
    today: '113-4829104-5512 Amazon $64.90',
    answers: [['Order ID', '113-4829104-5512'], ['Where did you buy?', 'Amazon'], ['Order total before tax', '$64.90'], ['Email used for the order', 'ava@example.com'], ['Order screenshot', 'order-113.png']],
    optionTags: ['Amazon'],
  },
  {
    id: 's2', at: '2026-10-30 08:15', program: 'Bought elsewhere? Get points', name: 'Ben Carter', email: 'ben@example.com', status: 'pending',
    today: 'ebay order 2291-55 total 38',
    answers: [['Order ID', '22-91055-73810'], ['Where did you buy?', 'eBay'], ['Order total before tax', '$38.00'], ['Email used for the order', 'ben.carter@example.com'], ['Order screenshot', 'IMG_2201.jpg']],
    optionTags: ['eBay'],
  },
  {
    id: 's3', at: '2026-10-29 17:03', program: 'Bought elsewhere? Get points', name: 'Chloe Martin', email: 'chloe@example.com', status: 'approved',
    today: 'Walmart #7731',
    answers: [['Order ID', '7731'], ['Where did you buy?', 'Walmart'], ['Order total before tax', '$22.50'], ['Email used for the order', 'chloe@example.com'], ['Order screenshot', 'receipt.jpg']],
    optionTags: ['Walmart'],
  },
  {
    id: 's4', at: '2026-10-29 11:20', program: 'Bought elsewhere? Get points', name: 'Daniel Okafor', email: 'daniel@example.com', status: 'disapproved',
    today: 'Amazon',
    answers: [['Order ID', '111-0000000-0000000'], ['Where did you buy?', 'Amazon'], ['Order total before tax', '$12.00'], ['Email used for the order', 'daniel@example.com'], ['Order screenshot', 'screenshot.png']],
    optionTags: ['Amazon'],
  },
];

export const OVERFLOW_SUBMISSION = {
  id: 's9', at: '2026-10-30 10:01', program: 'Bought on a marketplace, a pop-up market or in one of our partner stores? Send us the receipt', name: 'Maximiliana Alexandra Fitzgerald-Rodriguez', email: 'maximiliana.fitzgerald.rodriguez@example.com', status: 'pending',
  today: '113-4829104-5512113-4829104-5512 bought at the Saturday market in the old town square, paid cash, receipt attached',
  answers: [['Order ID', '113-4829104-5512113-4829104-5512113-4829104'], ['Where did you buy?', 'In a store'], ['Order total before tax', '$12,450.00'], ['Email used for the order', 'maximiliana.fitzgerald.rodriguez@example.com'], ['Order screenshot', 'very-long-file-name-of-the-receipt-photo-2026-10-30.png']],
  optionTags: ['Retail store'],
};
