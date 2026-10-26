// The data an email is previewed with: a picked member's real values, else the sample member.
import {useMemo} from 'react';
import {useEmailHost} from './host.js';
import {resolveText, sampleValues, SAMPLE_MEMBER} from './variables.js';

/** usePreviewBase(emailId, customer|null) -> {emailId, member, values, resolve} */
export default function usePreviewBase(emailId, customer) {
  const {giveaway, leftFor} = useEmailHost();
  return useMemo(() => {
    const member = customer || SAMPLE_MEMBER;
    const left = customer && leftFor ? leftFor(customer) : undefined;
    const values = sampleValues({emailId, giveaway, customer: member, left});
    return {emailId, member, values, resolve: (text) => resolveText(text, values, emailId)};
  }, [emailId, customer, giveaway, leftFor]);
}
