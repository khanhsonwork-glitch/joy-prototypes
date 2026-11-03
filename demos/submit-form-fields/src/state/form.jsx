// In-memory Submit form program for the prototype: the form fields, the tags for the whole form, the template in use,
// and a saved snapshot so Save / Discard behave like the real Rule tab. Also the Today / Phase 1 / Phase 2 version
// switch, kept in the URL (?version=phase2, before or after the #) so a link opens the version under review.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {ANSWERED_LABELS, FORM_TAGS, MAX_FIELDS, newProgramFields, sampleFields, withTemplateCopy} from '../data/form.js';
import {useScenario} from '../kit/scenario.jsx';
import {useNavigate, useRoute} from '../shell/router.jsx';

const LONG_LABEL = 'Which marketplace, pop-up market or partner store did you buy from? Pick the closest one';

function seedFor(state, version, isNew) {
  if (state === 'empty') return {template: 'custom', fields: [], formTags: []};
  // A new program starts like the default template: the required root Paragraph + a File upload, and no tags yet.
  if (isNew) return {template: 'custom', fields: newProgramFields('custom'), formTags: []};
  const fields = sampleFields(version);
  if (state === 'overflow' || state === 'worst') {
    // The longest label on the second field (a choice field in phase 2, with more options), then a full form.
    fields[1] = {...fields[1], label: LONG_LABEL, ...(fields[1].options ? {options: [...fields[1].options, ...['Target', 'Etsy', 'TikTok Shop', 'Shein', 'Temu', 'Costco'].map((l, i) => ({id: `ox${i}`, label: l, tag: l}))]} : {})};
    while (fields.length < MAX_FIELDS) fields.splice(fields.length - 1, 0, {id: `fx${fields.length}`, type: 'short', label: `Extra detail ${fields.length}`, required: false});
  }
  return {template: null, fields, formTags: FORM_TAGS};
}

const FormContext = createContext(null);

export function FormProvider({children}) {
  const {state} = useScenario();
  const [version] = useVersion();
  const [isNew] = useProgramMode();
  const [saved, setSaved] = useState(() => seedFor(state, version, isNew));
  const [draft, setDraft] = useState(saved);
  // Phase 2 only: fields that customers have already answered keep their type. Fixed by id when the program loads,
  // so renaming or saving never changes which fields are locked. Phase 1 has no locked fields.
  const answeredFrom = (fields) => new Set(version === 'phase2' ? fields.filter((f) => ANSWERED_LABELS.includes(f.label)).map((f) => f.id) : []);
  const [answered, setAnswered] = useState(() => answeredFrom(saved.fields));
  useEffect(() => {
    const seed = seedFor(state, version, isNew);
    setSaved(seed);
    setDraft(seed);
    setAnswered(answeredFrom(seed.fields));
  }, [state, version, isNew]);

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const save = useCallback(() => setSaved(draft), [draft]);
  const discard = useCallback(() => setDraft(saved), [saved]);
  // New program: the template gives 2 fields. Existing program: it only changes text. Nothing is saved until Save.
  // Returns {full: true} when a deleted root could not be added back because the form already has 10 fields.
  const applyTemplate = useCallback((key) => {
    const fields = isNew ? newProgramFields(key) : withTemplateCopy(key, draft.fields);
    setDraft((d) => ({...d, template: key, fields}));
    return {full: !isNew && !fields.some((f) => f.root)};
  }, [isNew, draft.fields]);
  const setFields = useCallback((fn) => setDraft((d) => ({...d, fields: typeof fn === 'function' ? fn(d.fields) : fn})), []);
  const setFormTags = useCallback((tags) => setDraft((d) => ({...d, formTags: tags})), []);
  const value = useMemo(
    () => ({...draft, savedFormTags: saved.formTags, dirty, save, discard, applyTemplate, setFields, setFormTags, answered}),
    [draft, saved.formTags, dirty, save, discard, applyTemplate, setFields, setFormTags, answered],
  );
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

/** {template, fields, formTags, dirty, save(), discard(), applyTemplate(key), setFields(fn|list), setFormTags(list), answered} */
export const useForm = () => useContext(FormContext);

const VERSION_NAMES = new Set(['today', 'phase1', 'phase2']);
// Old links: ?v=today stays Today; ?v=new was the one "with form fields" version, which is Phase 1 now.
const LEGACY_VERSION = {today: 'today', new: 'phase1'};

function readVersion(query) {
  const named = query.get('version');
  if (VERSION_NAMES.has(named)) return named;
  return LEGACY_VERSION[query.get('v')] || null;
}

/**
 * 'today' = the screen on avada/master now · 'phase1' = the first release (the default) · 'phase2' = phase 1 plus the
 * next additions. Read from ?version= after the # (what the panel writes), else before it (what people type by hand).
 */
export function useVersion() {
  const {path, query} = useRoute();
  const navigate = useNavigate();
  const version = readVersion(query) || readVersion(new URLSearchParams(window.location.search)) || 'phase1';
  const setVersion = useCallback(
    (next) => {
      // Always write the version explicitly: it wins over one typed before the #, and navigation carries it forward.
      const q = new URLSearchParams(query);
      q.delete('v');
      q.set('version', next);
      navigate(`${path}?${q.toString()}`, {replace: true});
    },
    [path, query, navigate],
  );
  return [version, setVersion];
}

/** Demo switch "Shop uses Widget V4" (default on), kept in the URL as ?v4=off so a link opens the shop that is not on V4. */
export function useShopV4() {
  const {path, query} = useRoute();
  const navigate = useNavigate();
  const value = query.get('v4') || new URLSearchParams(window.location.search).get('v4');
  const setOn = useCallback(
    (on) => {
      const q = new URLSearchParams(query);
      q.set('v4', on ? 'on' : 'off');
      navigate(`${path}?${q.toString()}`, {replace: true});
    },
    [path, query, navigate],
  );
  return [value !== 'off', setOn];
}

/** Demo switch "Program": the live demo program, or a new program that is not saved yet (?program=new). */
export function useProgramMode() {
  const {path, query} = useRoute();
  const navigate = useNavigate();
  const value = query.get('program') || new URLSearchParams(window.location.search).get('program');
  const setNew = useCallback(
    (isNew) => {
      const q = new URLSearchParams(query);
      q.set('program', isNew ? 'new' : 'demo');
      navigate(`${path}?${q.toString()}`, {replace: true});
    },
    [path, query, navigate],
  );
  return [value === 'new', setNew];
}
