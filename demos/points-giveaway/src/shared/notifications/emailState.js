// The two emails a points giveaway sends. Each giveaway keeps its own copy of both (subject, blocks, on/off), so a BFCM
// thank-you and a win-back can say different things. A giveaway's `emails` = {gift: {enabled, doc, ...}, reminder: {...}}.
import {STORE} from '../../data/index.js';

export const EMAIL_DEFS = [
  {id: 'gift', name: 'Points received', trigger: 'Sent when the points are added to a member.'},
  {id: 'reminder', name: 'Points expiring', trigger: 'Sent before the points expire, only to members who still have some left.'},
];

export const emailDef = (id) => EMAIL_DEFS.find((e) => e.id === id) || null;

export const FROM_ADDRESS = 'joyio_noreply@send.avada.io';

/** A stored email with its defaults filled in. A missing doc means "default Clean document, never edited". */
export const emailWithDefaults = (stored = {}) => ({
  enabled: stored.enabled ?? true,
  doc: stored.doc || null,
  replyTo: stored.replyTo || '',
  senderName: stored.senderName ?? STORE.name,
  cssOn: !!stored.cssOn,
  css: stored.css || '',
  voice: stored.voice || null,
  editedAt: stored.editedAt || null,
});
