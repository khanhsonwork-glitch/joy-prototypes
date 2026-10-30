// In-memory Submit form program for the prototype: the form fields, the tags for the whole form, the template in use,
// and a saved snapshot so Save / Discard behave like the real Rule tab. Also the "Today / New" version switch, kept
// in the URL (?v=today) so a link opens the version under review.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {FORM_TAGS, MAX_FIELDS, SUBMISSIONS, TEMPLATE_FIELDS} from '../data/form.js';
import {useScenario} from '../kit/scenario.jsx';
import {useNavigate, useRoute} from '../shell/router.jsx';

const LONG_LABEL = 'Which marketplace, pop-up market or partner store did you buy from? Pick the closest one';

function seedFor(state) {
  if (state === 'empty') return {template: 'custom', fields: [], formTags: []};
  const fields = TEMPLATE_FIELDS.receipt();
  if (state === 'overflow' || state === 'worst') {
    fields[1] = {...fields[1], label: LONG_LABEL, options: [...fields[1].options, ...['Target', 'Etsy', 'TikTok Shop', 'Shein', 'Temu', 'Costco'].map((l, i) => ({id: `ox${i}`, label: l, tag: l}))]};
    while (fields.length < MAX_FIELDS) fields.splice(fields.length - 1, 0, {id: `fx${fields.length}`, type: 'short', label: `Extra detail ${fields.length}`, required: false});
  }
  return {template: 'receipt', fields, formTags: FORM_TAGS};
}

const FormContext = createContext(null);

export function FormProvider({children}) {
  const {state} = useScenario();
  const [saved, setSaved] = useState(() => seedFor(state));
  const [draft, setDraft] = useState(saved);
  // Fields that customers have already answered (the sample submissions use their labels): type is locked.
  // Fixed by id when the program loads, so renaming or saving never changes which fields are locked.
  const answeredFrom = (fields) => {
    const labels = new Set(SUBMISSIONS.flatMap((x) => x.answers.map(([l]) => l)));
    return new Set(fields.filter((f) => labels.has(f.label)).map((f) => f.id));
  };
  const [answered, setAnswered] = useState(() => answeredFrom(saved.fields));
  useEffect(() => {
    const seed = seedFor(state);
    setSaved(seed);
    setDraft(seed);
    setAnswered(answeredFrom(seed.fields));
  }, [state]);

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const save = useCallback(() => setSaved(draft), [draft]);
  const discard = useCallback(() => setDraft(saved), [saved]);
  const applyTemplate = useCallback((key) => setDraft((d) => ({...d, template: key, fields: TEMPLATE_FIELDS[key]()})), []);
  const setFields = useCallback((fn) => setDraft((d) => ({...d, fields: typeof fn === 'function' ? fn(d.fields) : fn})), []);
  const setFormTags = useCallback((tags) => setDraft((d) => ({...d, formTags: tags})), []);
  const value = useMemo(
    () => ({...draft, dirty, save, discard, applyTemplate, setFields, setFormTags, answered}),
    [draft, dirty, save, discard, applyTemplate, setFields, setFormTags, answered],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

/** {template, fields, formTags, dirty, save(), discard(), applyTemplate(key), setFields(fn|list), setFormTags(list), answered} */
export const useForm = () => useContext(FormContext);

/** 'today' = the screen on avada/master now; 'new' = with form fields and tags. */
export function useVersion() {
  const {path, query} = useRoute();
  const navigate = useNavigate();
  const version = query.get('v') === 'today' ? 'today' : 'new';
  const setVersion = useCallback(
    (next) => {
      // Always write v explicitly: navigation carries the current v forward when the target has none.
      const q = new URLSearchParams(query);
      q.set('v', next);
      navigate(`${path}?${q.toString()}`, {replace: true});
    },
    [path, query, navigate],
  );
  return [version, setVersion];
}
