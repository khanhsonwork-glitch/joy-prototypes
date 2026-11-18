// Quizzes: ask, recommend, reward. The builder edits one question at a time with the storefront preview of that
// question beside it, because a quiz is judged by how it feels to answer, not by its settings.
import React, {useEffect, useState} from 'react';
import {Badge, BlockStack, Button, Card, Checkbox, ChoiceList, InlineGrid, InlineStack, Select, Tabs, Text, TextField} from '@shopify/polaris';
import {QuestionCircleIcon} from '@shopify/polaris-icons';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {CCols, CPage, CRow, CSection} from '../../ui/clean.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {EligibilityField, EmptyCard, NumberField, ScheduleField, ScreenState, StatusBadge, eligibilityLabel, money, num, pct, useConfirm} from '../../ui/kit.jsx';
import {BarList, Block, EditorHero, EditorShell, FormCard, KpiRow, MoreSettings, Panel, Row, RowSwitch, TypePicker, realId, useScenarioList} from '../../ui/parts.jsx';
import {Missing, RepeatList, useRecordDraft} from '../../ui/editor.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {useNavigate, useRoute} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {pts} from '../../lib/econ.js';

const TEMPLATES = [
  {id: 'own', name: 'Build your own', cat: 'any', desc: 'Start with one empty question'},
  {id: 'welcome', name: 'Welcome to the club', cat: 'any', desc: 'Get to know new members in 3 questions'},
  {id: 'skin', name: 'Skin routine finder', cat: 'beauty', desc: 'Recommend a routine by skin type and concern'},
  {id: 'gift', name: 'Gift finder', cat: 'any', desc: 'Help shoppers pick a gift for someone'},
  {id: 'style', name: 'Style finder', cat: 'apparel', desc: 'Match outfits to taste and occasion'},
  {id: 'flavor', name: 'Flavor finder', cat: 'food', desc: 'Suggest flavours they will love'},
  {id: 'room', name: 'Room finder', cat: 'home', desc: 'Pick products for each room'},
];
const CATS = [['all', 'All'], ['any', 'Any store'], ['beauty', 'Beauty'], ['apparel', 'Apparel'], ['food', 'Food & drink'], ['home', 'Home & garden']];
const sampleQuestions = tpl => (tpl === 'Gift finder' || tpl === 'gift'
  ? [{id: 'q1', text: 'Who is the gift for?', kind: 'single', options: ['Partner', 'Friend', 'Parent', 'Myself']}, {id: 'q2', text: 'What do they love most?', kind: 'single', options: ['Glowing skin', 'Relaxing', 'Trying new things']}, {id: 'q3', text: 'Your budget', kind: 'single', options: ['Under $30', '$30–$60', 'Over $60']}, {id: 'q4', text: 'Anything to avoid?', kind: 'text', options: []}]
  : [{id: 'q1', text: 'How does your skin feel by midday?', kind: 'single', options: ['Tight and dry', 'Shiny', 'Shiny in some places', 'Comfortable']}, {id: 'q2', text: 'What would you like to change?', kind: 'multi', options: ['Redness', 'Dark spots', 'Fine lines', 'Breakouts']}, {id: 'q3', text: 'How many steps do you like?', kind: 'single', options: ['1–2', '3–4', '5 or more']}, {id: 'q4', text: 'Fragrance?', kind: 'single', options: ['Love it', 'Fragrance-free only']}, {id: 'q5', text: 'Anything else we should know?', kind: 'text', options: []}]);
const normalise = q => ({...q, questions: Array.isArray(q.questions) ? q.questions : sampleQuestions(q.template).slice(0, q.questions || 3), goal: q.goal ?? 'Recommend a routine and collect skin type', display: q.display ?? 'widget', trigger: q.trigger ?? 'manual', syncTags: q.syncTags ?? true});

export function QuizList() {
  const {db, upsert, remove} = useStore();
  const {query} = useRoute();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const items = useScenarioList(db.quizzes);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('all');
  useEffect(() => {if (query.get('create')) {setOpen(true); navigate('/programs/quizzes', {replace: true});}}, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <PageFrame title="Quizzes" backUrl="/programs" moreActions={[{content: 'Create quiz', onAction: () => setOpen(true)}]}>
      <ScreenState>
        {({locked}) => (
          <CPage>
            <SectionNav section="programs" bare />
            <CCols>
              <CSection title="Your quizzes" add="Quiz" onAdd={() => setOpen(true)} locked={locked}>
                {items.length ? items.map(q => (
                  <CRow key={q.id} icon={QuestionCircleIcon} name={q.name} url={`/programs/quizzes/${q.id}`}
                    off={!(q.status === 'active' || q.status === 'scheduled')} tag={q.status === 'scheduled' ? 'Scheduled' : undefined}
                    value={q.reward.type === 'points' ? pts(db, q.reward.value) : q.reward.type === 'percent' ? `${q.reward.value}% off` : money(q.reward.value)} />
                )) : <EmptyCard art="rewards" heading="No quizzes yet" action={{content: 'Create quiz', onAction: () => setOpen(true)}}>Start from a template or from scratch.</EmptyCard>}
              </CSection>
            </CCols>
          </CPage>
        )}
      </ScreenState>
      <TypePicker open={open} onClose={() => setOpen(false)} title="Create a quiz" options={TEMPLATES.filter(t => cat === 'all' || t.cat === cat || t.cat === 'any').map(t => ({...t, icon: QuestionCircleIcon}))}
        intro={<InlineStack gap="200">{CATS.map(([v, l]) => <button key={v} type="button" className="op-pill" aria-pressed={cat === v} onClick={() => setCat(v)}>{l}</button>)}</InlineStack>}
        onPick={id => {setOpen(false); navigate(`/programs/quizzes/new?template=${id}`);}} />
      {confirmModal}
    </PageFrame>
  );
}

function QuestionPreview({q, index, total}) {
  if (!q) return null;
  return (
    <div className="op-store op-quiz">
      <div className="op-quiz__bar"><span style={{width: `${((index + 1) / total) * 100}%`}} /></div>
      <div className="op-store__body">
        <span className="op-store__muted">Question {index + 1} of {total}</span>
        <strong className="op-quiz__q">{q.text || 'Your question'}</strong>
        {q.kind === 'text' ? <div className="op-store__line"><span className="op-store__text op-store__muted">Type your answer</span></div>
          : q.options.map((o, i) => <div key={i} className={`op-store__line op-quiz__opt${i === 0 ? ' is-active' : ''}`}><span className="op-store__text">{o || `Answer ${i + 1}`}</span>{q.kind === 'multi' && <b>{i === 0 ? '✓' : ''}</b>}</div>)}
        <span className="op-store__btn">Next</span>
      </div>
    </div>
  );
}

export function QuizBuilder({id, query}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const [tab, setTab] = useState(0);
  const [current, setCurrent] = useState(0);
  const isNew = id === 'new';
  const fresh = React.useMemo(() => {
    const t = TEMPLATES.find(x => x.id === query.get('template')) ?? TEMPLATES[0];
    return normalise({id: null, template: t.name, name: t.id === 'own' ? 'New quiz' : t.name, status: 'inactive', reward: {type: 'points', value: 100}, eligibility: {mode: 'all'}, schedule: {start: '', end: ''}, completions: 0,
      questions: t.id === 'own' ? [{id: 'q1', text: '', kind: 'single', options: ['', '']}] : sampleQuestions(t.id)});
  }, [query]);
  const found = db.quizzes.find(q => q.id === realId(id));
  const record = isNew ? fresh : found ? normalise(found) : null;
  const memo = React.useMemo(() => record, [JSON.stringify(record)]); // eslint-disable-line react-hooks/exhaustive-deps
  const d = useRecordDraft({record: memo ?? fresh, isNew, backUrl: '/programs/quizzes', prefix: 'qz', save: item => upsert('quizzes', item), urlFor: nid => `/programs/quizzes/${nid}`,
    validate: x => ({name: !x.name?.trim() ? 'Name the quiz' : null, questions: x.questions.some(q => !q.text?.trim()) ? 'Every question needs text' : null})});
  if (!record && !isNew) return <Missing title="Quiz" backUrl="/programs/quizzes" what="quiz" />;
  const x = d.draft;
  const on = x.status === 'active' || x.status === 'scheduled';
  const qs = x.questions;
  const cur = Math.min(current, qs.length - 1);
  const q = qs[cur];
  const setQ = patch => d.set('questions', qs.map((y, i) => (i === cur ? {...y, ...patch} : y)));
  const tabs = [{id: 'setup', content: 'Set up'}, ...(isNew ? [] : [{id: 'analytics', content: 'Analytics'}])];
  return (
    <PageFrame title={isNew ? 'New quiz' : x.name} backUrl="/programs/quizzes" badge={isNew ? undefined : <StatusBadge status={x.status} />}>
      <ScreenState>{({locked}) => (
        <BlockStack gap="400">
          <Card padding="0"><Tabs tabs={tabs} selected={tab} onSelect={setTab} /></Card>
          {tab === 1 ? (
            <BlockStack gap="400">
              <KpiRow items={[{label: 'Started', value: num(Math.round(x.completions * 1.6))}, {label: 'Completed', value: num(x.completions)}, {label: 'Completion rate', value: pct(62.5)}, {label: 'Reward given', value: num(x.completions)}]} />
              {qs.filter(y => y.kind !== 'text').slice(0, 2).map(y => (
                <FormCard key={y.id} title={y.text}>
                  <BarList rows={y.options.map((o, i) => ({label: o, value: Math.round(x.completions * [0.38, 0.27, 0.21, 0.14][i % 4])}))} format={num} />
                </FormCard>
              ))}
            </BlockStack>
          ) : (
            <EditorShell
              hero={<EditorHero icon={QuestionCircleIcon}
                sentence={`${qs.length} questions, about ${Math.max(1, Math.round(qs.length * 0.4))} minute${qs.length > 3 ? 's' : ''}. ${eligibilityLabel(x.eligibility, db)} who finish get ${x.reward.type === 'none' ? 'no reward' : x.reward.type === 'points' ? pts(db, x.reward.value) : x.reward.type === 'percent' ? `${x.reward.value}% off` : `${money(x.reward.value)} off`}.`}
                facts={isNew ? [] : [['Completed', num(x.completions)], ['Shows', x.display === 'popup' ? 'as a popup' : x.display === 'page' ? 'on its own page' : 'in the widget']]}
                status={{on, disabled: locked, label: 'Turn on', note: on ? 'On your store' : 'Off', onChange: v => d.set('status', v ? 'active' : 'inactive')}} />}
              side={<div className="op-panel"><BlockStack gap="300"><Text as="h2" variant="headingSm">Customers see</Text><QuestionPreview q={q} index={cur} total={qs.length} /></BlockStack></div>}
              more={<MoreSettings sections={[
                {title: 'Goal', children: <TextField label="Goal" labelHidden value={x.goal} onChange={v => d.set('goal', v)} autoComplete="off" disabled={locked} helpText="For you. Customers don't see it." />},
                {title: 'Thank-you screen', children: <TextField label="Thank-you heading" value={x.thanks ?? 'Your routine is ready'} onChange={v => d.set('thanks', v)} autoComplete="off" disabled={locked} />},
                {title: 'Where it shows', children: <>
                  <ChoiceList title="Place" titleHidden disabled={locked} selected={[x.display]} onChange={v => d.set('display', v[0])}
                    choices={[{label: 'In the loyalty widget', value: 'widget'}, {label: 'On its own page', value: 'page'}, {label: 'As a popup', value: 'popup'}]} />
                  {x.display === 'popup' && (
                    <Select label="Open the popup" value={x.trigger} onChange={v => d.set('trigger', v)} disabled={locked}
                      options={[{label: 'When the customer clicks a link', value: 'manual'}, {label: 'After 10 seconds on the page', value: 'delay'}, {label: 'When they are about to leave', value: 'exit'}, {label: 'After their first order', value: 'first_order'}]} />
                  )}
                </>},
                {title: 'Answers in Shopify', children: <Checkbox label="Save answers to the customer in Shopify (tag and metafield)" checked={Boolean(x.syncTags)} onChange={v => d.set('syncTags', v)} disabled={locked} />},
                {title: 'When it runs', children: <ScheduleField value={x.schedule} onChange={v => d.set('schedule', v)} disabled={locked} />},
              ]} />}
              danger={isNew ? null : <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: `Delete “${x.name}”?`, action: 'Delete', body: 'The quiz disappears from your store and its answers are deleted.', onConfirm: () => {remove('quizzes', x.id); notify('Quiz deleted'); navigate('/programs/quizzes');}})}>Delete</Button>}>
              <Panel title="Quiz">
                <TextField label="Name" value={x.name} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} />
                <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                  <EligibilityField label="Who sees the quiz" value={x.eligibility} onChange={v => d.set('eligibility', v)} disabled={locked} />
                  <Select label="Reward for finishing" value={x.reward.type} onChange={v => d.set('reward', {...x.reward, type: v})} disabled={locked} options={[{label: 'Points', value: 'points'}, {label: 'Percentage off coupon', value: 'percent'}, {label: 'Amount off coupon', value: 'amount'}, {label: 'No reward', value: 'none'}]} />
                </InlineGrid>
                {x.reward.type !== 'none' && <NumberField label="Reward value" value={x.reward.value} onChange={v => d.set('reward', {...x.reward, value: v})} disabled={locked} suffix={x.reward.type === 'percent' ? '%' : x.reward.type === 'points' ? db.program.point.plural : undefined} prefix={x.reward.type === 'amount' ? '$' : undefined} />}
              </Panel>
              <Panel title="Questions" description="Edit one at a time. The preview shows the one you're on.">
                <div className="op-qnav" role="tablist" aria-label="Questions">
                  {qs.map((y, i) => <button key={y.id} type="button" role="tab" aria-selected={i === cur} onClick={() => setCurrent(i)}>{i + 1}</button>)}
                  <button type="button" disabled={locked || qs.length >= 12} onClick={() => {d.set('questions', [...qs, {id: newId('q'), text: '', kind: 'single', options: ['', '']}]); setCurrent(qs.length);}} aria-label="Add question">＋</button>
                </div>
                {q && <>
                  <TextField label={`Question ${cur + 1}`} value={q.text} onChange={v => setQ({text: v})} autoComplete="off" disabled={locked} error={!q.text?.trim() && d.errors.questions ? 'Write the question' : undefined} />
                  <Select label="Answer type" value={q.kind} onChange={v => setQ({kind: v})} disabled={locked} options={[{label: 'Pick one', value: 'single'}, {label: 'Pick several', value: 'multi'}, {label: 'Free text', value: 'text'}]} />
                  {q.kind !== 'text' && (
                    <RepeatList items={q.options.map((o, i) => ({id: i, text: o}))} onChange={v => setQ({options: v.map(o => o.text)})} disabled={locked} addLabel="Add answer" min={2} max={8}
                      make={() => ({id: Date.now(), text: ''})}
                      render={(o, patch, i) => <TextField label={`Answer ${i + 1}`} labelHidden value={o.text} onChange={v => patch({text: v})} autoComplete="off" disabled={locked} placeholder={`Answer ${i + 1}`} />} />
                  )}
                  <InlineStack gap="200">
                    <Button disabled={locked || cur === 0} onClick={() => {const n = [...qs]; [n[cur - 1], n[cur]] = [n[cur], n[cur - 1]]; d.set('questions', n); setCurrent(cur - 1);}}>Move earlier</Button>
                    <Button disabled={locked || cur === qs.length - 1} onClick={() => {const n = [...qs]; [n[cur + 1], n[cur]] = [n[cur], n[cur + 1]]; d.set('questions', n); setCurrent(cur + 1);}}>Move later</Button>
                    <Button tone="critical" variant="tertiary" disabled={locked || qs.length <= 1} onClick={() => {d.set('questions', qs.filter((_, i) => i !== cur)); setCurrent(Math.max(0, cur - 1));}}>Remove question</Button>
                  </InlineStack>
                </>}
              </Panel>
            </EditorShell>
          )}
        </BlockStack>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}
