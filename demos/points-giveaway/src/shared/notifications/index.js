// Notifications: the giveaway's two emails and their editor (a replica of Joy's Email editor V2). Import from here:
//   import {EmailEditor, EMAIL_DEFS} from '../shared/notifications';
export {default as EmailEditor} from './EmailEditor.jsx';
export {EMAIL_DEFS, emailDef, emailWithDefaults} from './emailState.js';
export {defaultDoc} from './templates.js';
export {EmailDocument, makeCtx} from './render.jsx';
export {sampleValues, resolveText, emailDate} from './variables.js';
