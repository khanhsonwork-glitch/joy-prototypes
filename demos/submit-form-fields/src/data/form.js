// Submit form sample data for Pomelo Park (fictional). Field types, the five quick-start templates, the sample form
// of each version and the submissions shown on the Submit Form Activities tab. Every name and email is made up.
//
// Versions: 'today' = avada/master now · 'phase1' = what ships first (4 field types, customer tags, no choice
// fields) · 'phase2' = phase 1 plus the 5 other field types, per-option tags and locked types.

export const VERSIONS = ['today', 'phase1', 'phase2'];

// `phase` = the first version that offers the type in the Add field menu.
export const FIELD_TYPES = [
  {value: 'short', label: 'Short text', help: 'One line, like an order ID', phase: 1},
  {value: 'paragraph', label: 'Paragraph', help: 'A few sentences', phase: 2},
  {value: 'number', label: 'Number', help: 'Digits only, like an order total', phase: 1},
  {value: 'email', label: 'Email', help: 'Checked for a valid address', phase: 1},
  {value: 'link', label: 'Link', help: 'Checked for a web address', phase: 2},
  {value: 'date', label: 'Date', help: 'Picked from a calendar', phase: 2},
  {value: 'single', label: 'Single choice', help: 'Customer picks one option', phase: 2},
  {value: 'multi', label: 'Multiple choice', help: 'Customer picks one or more', phase: 2},
  {value: 'upload', label: 'File upload', help: 'Image or video proof', phase: 1},
];
/** The field types a version offers: 4 in phase 1, all 9 in phase 2. */
export const typesFor = (version) => FIELD_TYPES.filter((t) => version === 'phase2' || t.phase === 1);
export const typeLabel = (value) => FIELD_TYPES.find((t) => t.value === value)?.label ?? value;
export const isChoice = (type) => type === 'single' || type === 'multi';

export const MAX_FIELDS = 10;
export const MAX_OPTIONS = 20;
export const MAX_FORM_TAGS = 5;

let seq = 0;
export const newId = (prefix = 'f') => `${prefix}${Date.now().toString(36)}${(seq += 1)}`;

const opt = (label, tag = label) => ({id: newId('o'), label, tag});

/** The program's name: the sample program of phases 1 and 2 is new; "today" keeps the program shown on master. */
export const LEGACY_PROGRAM = 'Bought elsewhere? Get points';
export const PROGRAM_NAME = {today: LEGACY_PROGRAM, phase1: 'Submit Amazon order', phase2: 'Submit Amazon order'};

/** Sample form of a version. Phase 2 adds a choice field, a "$" before the total and the email prefill. */
export function sampleFields(version) {
  const two = version === 'phase2';
  return [
    {id: newId(), type: 'short', label: 'Order ID', placeholder: 'e.g. 113-4829104-5512', required: true},
    ...(two ? [{id: newId(), type: 'single', label: 'What did you buy?', required: true, options: [opt('Off-road lights'), opt('LED bulbs')]}] : []),
    {id: newId(), type: 'number', label: 'Order total before tax', placeholder: '0.00', required: true, ...(two ? {prefix: '$'} : {})},
    {id: newId(), type: 'email', label: 'Email used for the order', placeholder: 'you@example.com', required: true, ...(two ? {prefill: true} : {})},
    {id: newId(), type: 'upload', label: 'Order screenshot', format: 'image', required: true},
  ];
}

/** Phase 2 demo: customers have already answered this field, so its type is locked. */
export const ANSWERED_LABELS = ['Order ID'];

/**
 * Today's copy of each quick-start template, as in avada/master (submitFormUseCaseTemplates.js): the text box label and
 * placeholder, and the upload field label. Templates only fill copy; they do not touch the upload settings.
 */
export const TEMPLATE_COPY = {
  social: {inputLabel: 'Post link / Username', inputPlaceholder: 'Paste your post URL or handle here…', uploadLabel: 'Upload your screenshot'},
  review: {inputLabel: 'Reviewer name / Link', inputPlaceholder: 'Enter your name used on the review site…', uploadLabel: 'Upload your review screenshot'},
  unboxing: {inputLabel: 'Video link (TikTok / Reels / Drive)', inputPlaceholder: 'Paste your video link here…', uploadLabel: 'Upload your video'},
  receipt: {inputLabel: 'Order number / Store', inputPlaceholder: 'Enter order number or where you bought it…', uploadLabel: 'Upload your receipt'},
  custom: {inputLabel: 'Your answer', inputPlaceholder: 'Enter your proof here...', uploadLabel: 'Upload Image'},
};

/**
 * What a template fills in: exactly 2 fields, like production today. One required Short text with the template's text
 * box label + placeholder, and one File upload with its upload label. The upload keeps the format and "required" of the
 * form's current File upload field (production templates leave those settings alone); with none, image and required.
 */
export function templateFields(key, current = []) {
  const copy = TEMPLATE_COPY[key];
  const upload = current.find((f) => f.type === 'upload');
  return [
    {id: newId(), type: 'short', label: copy.inputLabel, placeholder: copy.inputPlaceholder, required: true},
    {id: newId(), type: 'upload', label: copy.uploadLabel, format: upload?.format ?? 'image', required: upload?.required ?? true},
  ];
}

export const TEMPLATES = [
  {key: 'social', emoji: '📣', label: 'Share on Social Media', subtitle: 'UGC · Instagram, TikTok'},
  {key: 'review', emoji: '⭐', label: 'Submit Review Screenshot', subtitle: 'Review proof · Trustpilot, Google'},
  {key: 'unboxing', emoji: '📦', label: 'Upload Unboxing Video', subtitle: 'Video · TikTok, Reels, Drive'},
  {key: 'receipt', emoji: '🧾', label: 'Submit Purchase Receipt', subtitle: 'Offline purchase proof'},
  {key: 'custom', emoji: '✏️', label: 'Custom Form', subtitle: 'Default · flexible proof'},
];

/** Today: one text box (label set on the Design tab) + the upload settings. */
export const TODAY = {inputLabel: TEMPLATE_COPY.receipt.inputLabel, inputPlaceholder: TEMPLATE_COPY.receipt.inputPlaceholder, uploadLabel: TEMPLATE_COPY.receipt.uploadLabel};

export const FORM_TAGS = ['Amazon'];

/**
 * The "old shape" of a form: exactly one required Short text, optionally followed by one File upload. Only this shape
 * shows on every widget and on the Loyalty Hub; any other shape shows on Widget V4 and Loyalty page V2 only.
 */
export function isOldShape(fields) {
  if (fields.length < 1 || fields.length > 2) return false;
  if (fields[0].type !== 'short' || !fields[0].required) return false;
  return fields.length === 1 || fields[1].type === 'upload';
}

/* ------------------------------------------------------------------ submissions */

// Row shape: answers = [[label, value]] saved with the submission (files excluded: the file sits in the Image column);
// content = the single text of a submission made before the feature (legacy rows and the whole "today" list).
// optionTags = the tag of the option the customer picked (phase 2). tagIssue: 'failed' = Shopify refused the tag
// write, 'cap' = the customer already has 250 tags.
const PEOPLE = [
  {id: 's1', at: '2026-10-30 09:42', name: 'Ava Nguyen', email: 'ava@example.com', status: 'pending', orderId: '113-4829104-5512', kind: 'LED bulbs', total: '64.90', orderEmail: 'ava@example.com', file: 'order-113.png'},
  {id: 's2', at: '2026-10-30 08:15', name: 'Ben Carter', email: 'ben@example.com', status: 'pending', orderId: '22-91055-73810', kind: 'Off-road lights', total: '38.00', orderEmail: 'ben.carter@example.com', file: 'IMG_2201.jpg'},
  {id: 's3', at: '2026-10-29 17:03', name: 'Chloe Martin', email: 'chloe@example.com', status: 'approved', orderId: '114-7730012-8841', kind: 'LED bulbs', total: '22.50', orderEmail: 'chloe@example.com', file: 'receipt.jpg'},
  {id: 's4', at: '2026-10-29 11:20', name: 'Daniel Okafor', email: 'daniel@example.com', status: 'disapproved', orderId: '111-0000000-0000000', kind: 'Off-road lights', total: '12.00', orderEmail: 'daniel@example.com', file: 'screenshot.png'},
  {id: 's5', at: '2026-10-28 15:30', name: 'Eli Brooks', email: 'eli@example.com', status: 'approved', tagIssue: 'failed', orderId: '112-5504410-3392', kind: 'LED bulbs', total: '87.25', orderEmail: 'eli@example.com', file: 'order-112.png'},
  {id: 's6', at: '2026-10-28 09:10', name: 'Grace Kim', email: 'grace@example.com', status: 'approved', tagIssue: 'cap', phase2Only: true, orderId: '113-9021177-6640', kind: 'Off-road lights', total: '129.00', orderEmail: 'grace@example.com', file: 'order-113b.png'},
];
// Made before the feature, under the old program: one Content text, shown exactly as on master today.
const LEGACY = {id: 's7', at: '2026-10-27 18:45', program: LEGACY_PROGRAM, name: 'Hana Lee', email: 'hana@example.com', status: 'approved', content: 'ebay order 2291-55 total 38', file: 'IMG_0912.jpg'};

const answersOf = (p, version) => (version === 'phase2'
  ? [['Order ID', p.orderId], ['What did you buy?', p.kind], ['Order total before tax', `$${p.total}`], ['Email used for the order', p.orderEmail]]
  : [['Order ID', p.orderId], ['Order total before tax', p.total], ['Email used for the order', p.orderEmail]]);

/** Submissions of a version, newest first. */
export function submissionsFor(version) {
  if (version === 'today') {
    return [
      {id: 't1', at: '2026-10-30 09:42', program: LEGACY_PROGRAM, name: 'Ava Nguyen', email: 'ava@example.com', status: 'pending', content: '113-4829104-5512 Amazon $64.90', file: 'order-113.png'},
      {id: 't2', at: '2026-10-30 08:15', program: LEGACY_PROGRAM, name: 'Ben Carter', email: 'ben@example.com', status: 'pending', content: 'ebay order 2291-55 total 38', file: 'IMG_2201.jpg'},
      {id: 't3', at: '2026-10-29 17:03', program: LEGACY_PROGRAM, name: 'Chloe Martin', email: 'chloe@example.com', status: 'approved', content: 'Walmart #7731', file: 'receipt.jpg'},
      {id: 't4', at: '2026-10-29 11:20', program: LEGACY_PROGRAM, name: 'Daniel Okafor', email: 'daniel@example.com', status: 'disapproved', content: 'Amazon', file: 'screenshot.png'},
    ];
  }
  const program = PROGRAM_NAME[version];
  const rows = PEOPLE.filter((p) => !p.phase2Only || version === 'phase2')
    .map(({orderId, kind, total, orderEmail, phase2Only, ...p}) => ({...p, program, answers: answersOf({orderId, kind, total, orderEmail}, version), optionTags: version === 'phase2' ? [kind] : []}));
  return [...rows, LEGACY];
}

/** Overflow / worst case: the longest values a merchant could see. */
export function overflowSubmission(version) {
  const long = {
    id: 's9', at: '2026-10-30 10:01', program: 'Bought on a marketplace, a pop-up market or in one of our partner stores? Send us the receipt',
    name: 'Maximiliana Alexandra Fitzgerald-Rodriguez', email: 'maximiliana.fitzgerald.rodriguez@example.com', status: 'pending',
    file: 'very-long-file-name-of-the-receipt-photo-2026-10-30.png',
  };
  if (version === 'today') return {...long, content: '113-4829104-5512113-4829104-5512 bought at the Saturday market in the old town square, paid cash, receipt attached'};
  return {
    ...long,
    answers: answersOf({orderId: '113-4829104-5512113-4829104-5512113-4829104', kind: 'Off-road lights', total: '12,450.00', orderEmail: 'maximiliana.fitzgerald.rodriguez@example.com'}, version),
    optionTags: version === 'phase2' ? ['Off-road lights'] : [],
  };
}
