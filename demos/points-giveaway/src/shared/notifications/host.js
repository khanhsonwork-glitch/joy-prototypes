// What the host page (a giveaway) tells the email editor: the giveaway the email belongs to, the members it can be previewed as,
// and this email's send numbers. Set by <EmailEditor> through EmailHostProvider; read by usePreviewBase, Toolbar and Preview & test.
import {createContext, createElement, useContext} from 'react';

const EmailHost = createContext({giveaway: {name: 'Points giveaway', points: 150, expiresOn: null, given: false}, members: [], stats: null, leftFor: null});

export function EmailHostProvider({value, children}) {
  return createElement(EmailHost.Provider, {value}, children);
}

/** useEmailHost() -> {giveaway: {name, points, expiresOn, given}, members: [{id, name, email, balance}], stats: {sent, opened, clicked}|null, leftFor: (member) => unused giveaway points | null} */
export const useEmailHost = () => useContext(EmailHost);
