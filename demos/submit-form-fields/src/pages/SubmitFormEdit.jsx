// Submit form program › Rule tab. "Today" = avada/master on 30/10/2026: quick-start templates, program information,
// reward settings, customer eligibility, Submission requirements (upload settings), Approval settings, Instant reward.
// "New" = Submission requirements starts with Form fields (add, reorder, required, tags per option) and Approval
// settings gains the tags for the whole form. The preview on the right reads the same fields.
import React, {useState} from 'react';
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  ContextualSaveBar,
  Divider,
  Icon,
  InlineStack,
  Layout,
  List,
  Modal,
  Page,
  Popover,
  ActionList,
  Select,
  Tabs,
  Tag,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckboxIcon,
  DeleteIcon,
  EditIcon,
  EmailIcon,
  HashtagIcon,
  LinkIcon,
  ListBulletedIcon,
  PlusIcon,
  TextAlignLeftIcon,
  TextIcon,
  UploadIcon,
} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {FIELD_TYPES, MAX_FIELDS, TEMPLATES, TODAY, isChoice, typeLabel} from '../data/form.js';
import {useForm, useVersion} from '../state/form.jsx';
import {FieldModal} from './FieldModal.jsx';
import {FormPreview} from './FormPreview.jsx';

const TYPE_ICON = {
  short: TextIcon, paragraph: TextAlignLeftIcon, number: HashtagIcon, email: EmailIcon, link: LinkIcon,
  date: CalendarIcon, single: ListBulletedIcon, multi: CheckboxIcon, upload: UploadIcon,
};

function TemplatePicker({version}) {
  const {template, applyTemplate} = useForm();
  const [applied, setApplied] = useState(false);
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="200" blockAlign="center">
          <Text as="h2" variant="headingMd">Quick-start templates</Text>
          <Badge tone="attention">NEW</Badge>
        </InlineStack>
        <Text as="p" tone="subdued">
          {version === 'today'
            ? 'Pick a use-case to auto-fill the default copy in the Design tab. You can still edit each field afterwards.'
            : 'Pick a use-case to fill in the form fields and the default copy. You can still edit each field afterwards.'}
        </Text>
        <div className="sf-templates">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`sf-template${template === t.key ? ' is-on' : ''}`}
              aria-pressed={template === t.key}
              onClick={() => {applyTemplate(t.key); setApplied(true);}}
            >
              <span className="sf-template__emoji" aria-hidden="true">{t.emoji}</span>
              <span className="sf-template__label">{t.label}</span>
              <span className="sf-template__sub">{t.subtitle}</span>
            </button>
          ))}
        </div>
        {applied ? (
          <Banner tone="info">
            {version === 'today'
              ? '✨ Template applied — loaded into the Design tab. Edit anything you want.'
              : '✨ Template applied — form fields and Design copy filled in. Edit anything you want.'}
          </Banner>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function ProgramInfo() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Program information</Text>
        <TextField label="Program name" value="Bought elsewhere? Get points" onChange={() => {}} autoComplete="off" />
        <TextField label="Description" value="Earn {{earning_point_raw}} {{loyalty_point}}" disabled onChange={() => {}} autoComplete="off" helpText={<span>To edit this description text, please go to the <Button variant="plain" onClick={() => {}}>Translation</Button></span>} />
        <InlineStack gap="300" wrap={false}>
          <Box width="50%"><TextField label="Start date" type="date" value="2026-10-30" onChange={() => {}} autoComplete="off" /></Box>
          <Box width="50%"><TextField label="End date" type="date" value="" onChange={() => {}} autoComplete="off" /></Box>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function RewardSettings() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Reward settings</Text>
        <Select label="Reward method" options={[{label: 'Point reward', value: 'point'}]} value="point" onChange={() => {}} />
        <Checkbox label="Apply tier-based reward rates" checked={false} disabled onChange={() => {}} helpText="Please enable VIP Tier to use this feature." />
        <TextField label="Reward value" type="number" value="200" suffix="points" onChange={() => {}} autoComplete="off" />
      </BlockStack>
    </Card>
  );
}

function Eligibility() {
  const [logged, setLogged] = useState(true);
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingMd">Customer eligibility</Text>
        <Checkbox label="Only logged-in customers" checked={logged} onChange={setLogged} />
        <TextField label="Minimum orders" type="number" value="" placeholder="No minimum" helpText="Total orders per Shopify" onChange={() => {}} autoComplete="off" />
      </BlockStack>
    </Card>
  );
}

/* ---------------------------------------------------------------- today: upload settings only */

function SubmissionToday() {
  const [allow, setAllow] = useState(true);
  const [format, setFormat] = useState('image');
  const [req, setReq] = useState(true);
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Submission requirements</Text>
        <Checkbox label="Allow file upload" checked={allow} onChange={setAllow} helpText="Let customers attach an image or video to their submission. Turn this off to hide the upload field." />
        {allow ? (
          <>
            <ChoiceList title="Accepted format" choices={[{label: 'Image only', value: 'image'}, {label: 'Video only', value: 'video'}, {label: 'Both', value: 'both'}]} selected={[format]} onChange={([v]) => setFormat(v)} />
            <Banner tone="info" title="Restrictions:">
              <List><List.Item>Format: JPEG, JPG, PNG</List.Item><List.Item>Max 10MB per file</List.Item><List.Item>Max 5 files per submission</List.Item></List>
            </Banner>
            <Checkbox label="Require upload field" checked={req} onChange={setReq} helpText="Customer must upload an image as proof" />
          </>
        ) : null}
        <Text as="p" tone="subdued">{`The text box “${TODAY.inputLabel}” is set on the Design tab.`}</Text>
      </BlockStack>
    </Card>
  );
}

/* ---------------------------------------------------------------- new: form fields */

function fieldSummary(f) {
  if (isChoice(f.type)) {
    const tags = f.options.map((o) => o.tag).filter(Boolean);
    return `${f.options.length} options${tags.length ? ` · tags: ${tags.slice(0, 3).join(', ')}${tags.length > 3 ? ` +${tags.length - 3}` : ''}` : ' · no tags'}`;
  }
  if (f.type === 'upload') return f.format === 'video' ? 'Video only' : f.format === 'both' ? 'Image or video' : 'Image only';
  if (f.type === 'email' && f.prefill) return 'Filled in for logged-in customers';
  return f.placeholder ? `“${f.placeholder}”` : '';
}

function FormFields({disabled}) {
  const {fields, setFields, answered} = useForm();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const {notify} = useShell();
  const hasUpload = fields.some((f) => f.type === 'upload');
  const full = fields.length >= MAX_FIELDS;

  const move = (i, d) => setFields((list) => {
    const next = [...list];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    return next;
  });

  const addMenu = (
    <Popover
      active={adding}
      activator={<Button icon={PlusIcon} onClick={() => setAdding((v) => !v)} disabled={disabled || full} disclosure>Add field</Button>}
      onClose={() => setAdding(false)}
    >
      <ActionList
        items={FIELD_TYPES.map((t) => ({
          content: t.label,
          helpText: t.value === 'upload' && hasUpload ? 'One upload field per form' : t.help,
          prefix: <Icon source={TYPE_ICON[t.value]} />,
          disabled: t.value === 'upload' && hasUpload,
          onAction: () => {setAdding(false); setEditing({type: t.value});},
        }))}
      />
    </Popover>
  );

  return (
    <BlockStack gap="300">
      <InlineStack align="space-between" blockAlign="center" gap="200">
        <BlockStack gap="050">
          <Text as="h3" variant="headingSm">Form fields</Text>
          <Text as="p" variant="bodySm" tone="subdued">{`${fields.length} of ${MAX_FIELDS} fields · ${fields.filter((f) => f.required).length} required`}</Text>
        </BlockStack>
        {addMenu}
      </InlineStack>

      {fields.length ? (
        <ol className="sf-fields" aria-label="Form fields">
          {fields.map((f, i) => (
            <li key={f.id} className="sf-field">
              <span className="sf-field__move">
                <Button icon={ArrowUpIcon} variant="tertiary" size="slim" accessibilityLabel={`Move ${f.label} up`} disabled={disabled || i === 0} onClick={() => move(i, -1)} />
                <Button icon={ArrowDownIcon} variant="tertiary" size="slim" accessibilityLabel={`Move ${f.label} down`} disabled={disabled || i === fields.length - 1} onClick={() => move(i, 1)} />
              </span>
              <span className="sf-field__icon"><Icon source={TYPE_ICON[f.type]} tone="subdued" /></span>
              <span className="sf-field__body">
                <span className="sf-field__label">{f.label}</span>
                <span className="sf-field__meta">
                  <span>{typeLabel(f.type)}</span>
                  {fieldSummary(f) ? <span className="sf-field__sum">{fieldSummary(f)}</span> : null}
                </span>
              </span>
              <span className="sf-field__badge">{f.required ? <Badge>Required</Badge> : <Badge tone="info">Optional</Badge>}</span>
              <span className="sf-field__actions">
                <Button icon={EditIcon} variant="tertiary" accessibilityLabel={`Edit ${f.label}`} disabled={disabled} onClick={() => setEditing(f)} />
                <Button icon={DeleteIcon} variant="tertiary" tone="critical" accessibilityLabel={`Delete ${f.label}`} disabled={disabled} onClick={() => setRemoving(f)} />
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="sf-fields-empty">
          <Text as="p" fontWeight="semibold">No fields yet</Text>
          <Text as="p" tone="subdued">Customers can’t submit an empty form. Add at least one field, or pick a template above.</Text>
        </div>
      )}
      {full ? <Text as="p" variant="bodySm" tone="subdued">{`A form can have up to ${MAX_FIELDS} fields.`}</Text> : null}

      <FieldModal
        open={Boolean(editing)}
        field={editing}
        locked={Boolean(editing?.id && answered.has(editing.id))}
        hasUpload={hasUpload}
        otherLabels={fields.filter((x) => x.id !== editing?.id).map((x) => x.label.toLowerCase())}
        onClose={() => setEditing(null)}
        onSave={(f) => {
          setFields((list) => (list.some((x) => x.id === f.id) ? list.map((x) => (x.id === f.id ? f : x)) : [...list, f]));
          setEditing(null);
        }}
      />
      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={removing ? `Delete “${removing.label}”?` : ''}
        primaryAction={{
          content: 'Delete field',
          destructive: true,
          onAction: () => {setFields((list) => list.filter((x) => x.id !== removing.id)); notify('Field deleted. Save to apply.'); setRemoving(null);},
        }}
        secondaryActions={[{content: 'Cancel', onAction: () => setRemoving(null)}]}
      >
        <Modal.Section>
          <Text as="p">
            {removing && answered.has(removing.id)
              ? 'New customers won’t see this field. Forms already submitted keep their answer, and tags already added stay on the customer.'
              : 'New customers won’t see this field.'}
          </Text>
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}

function SubmissionNew({disabled}) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Submission requirements</Text>
        <FormFields disabled={disabled} />
      </BlockStack>
    </Card>
  );
}

/* ---------------------------------------------------------------- approval + tags */

function tagLine(fields, formTags) {
  const choice = fields.find((f) => isChoice(f.type) && f.options.some((o) => o.tag));
  const example = choice?.options.find((o) => o.tag);
  const parts = [];
  if (formTags.length) parts.push(formTags.join(', '));
  if (example) parts.push(`the tag of the answer they picked, like “${example.tag}” for ${example.label}`);
  return parts.length ? parts.join(' + ') : null;
}

function Approval({version, disabled}) {
  const {fields, formTags, setFormTags} = useForm();
  const [auto, setAuto] = useState(false);
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState('');
  const addTag = () => {
    const v = draft.trim();
    if (!v) return;
    if (v.includes(',')) return setErr('Add one tag at a time. Tags can’t contain commas.');
    if (formTags.some((t) => t.toLowerCase() === v.toLowerCase())) return setErr(`“${v}” is already added.`);
    if (formTags.length >= 5) return setErr('A form can add up to 5 tags.');
    setFormTags([...formTags, v]);
    setDraft('');
    setErr('');
  };
  const line = tagLine(fields, formTags);
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Approval settings</Text>
        <Checkbox
          label="Auto-approve submissions"
          checked={auto}
          onChange={setAuto}
          helpText="When enabled, customers will earn points immediately upon submission without admin review. When disabled, admin must manually approve each submission."
        />
        {version === 'new' ? (
          <>
            <Divider />
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">Customer tags</Text>
              <InlineStack gap="200" blockAlign="start" wrap={false}>
                <div style={{flex: 1}}>
                  <TextField
                    label="Tags for every approved submission"
                    value={draft}
                    onChange={(v) => {setDraft(v); setErr('');}}
                    autoComplete="off"
                    placeholder="e.g. receipt-reward"
                    maxLength={40}
                    error={err}
                    disabled={disabled}
                    connectedRight={<Button onClick={addTag} disabled={disabled || !draft.trim()}>Add</Button>}
                  />
                </div>
              </InlineStack>
              {formTags.length ? (
                <InlineStack gap="200">
                  {formTags.map((t) => <Tag key={t} onRemove={disabled ? undefined : () => setFormTags(formTags.filter((x) => x !== t))}>{t}</Tag>)}
                </InlineStack>
              ) : null}
              <Text as="p" variant="bodySm" tone="subdued">
                {line
                  ? `${auto ? 'As soon as a customer submits' : 'When you approve a submission'}, Joy adds to the customer in Shopify: ${line}. Disapproved forms add no tags.`
                  : 'No tags yet. Add one here, or give the options of a choice field a tag.'}
              </Text>
            </BlockStack>
          </>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function InstantReward() {
  const [on, setOn] = useState(false);
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingMd">Instant reward</Text>
        <Text as="p" tone="subdued">Give customers an instant reward when they submit their proof. The final approval reward is awarded separately.</Text>
        <Checkbox label="Enable instant reward" checked={on} onChange={setOn} />
      </BlockStack>
    </Card>
  );
}

function Summary({version}) {
  const {fields, formTags} = useForm();
  const tagged = fields.filter((f) => isChoice(f.type) && f.options.some((o) => o.tag)).length;
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between"><Text as="h2" variant="headingSm">Bought elsewhere? Get points</Text><Badge tone="success">Active</Badge></InlineStack>
        <Text as="p" variant="bodySm">Period: Oct 30, 2026 - No end date</Text>
        <Divider />
        <Text as="h3" variant="headingSm">Basic info</Text>
        <List>
          <List.Item>For: Form submissions</List.Item>
          <List.Item>Reward: 200 points per submission</List.Item>
          <List.Item>Approval: Manual approval required</List.Item>
          {version === 'new' ? <List.Item>{`Form: ${fields.length} fields, ${fields.filter((f) => f.required).length} required`}</List.Item> : null}
          {version === 'new' && (formTags.length || tagged) ? (
            <List.Item>{`Tags: ${[formTags.length ? formTags.join(', ') : null, tagged ? 'by answer' : null].filter(Boolean).join(' + ')}`}</List.Item>
          ) : null}
        </List>
        <Divider />
        <Text as="h3" variant="headingSm">Conditions</Text>
        <List><List.Item>Only logged-in customers</List.Item><List.Item>Usage limit: One-time only</List.Item></List>
      </BlockStack>
    </Card>
  );
}

function DesignTab({version}) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">Form content</Text>
        <TextField label="Headline" value="Bought offline? Earn {{earn_reward}} for your receipt" onChange={() => {}} autoComplete="off" />
        <TextField label="Description" multiline={2} value="Upload a photo of your receipt and we'll reward you for the purchase." onChange={() => {}} autoComplete="off" />
        {version === 'today' ? (
          <>
            <TextField label="Input label" value={TODAY.inputLabel} onChange={() => {}} autoComplete="off" />
            <TextField label="Input placeholder" value={TODAY.inputPlaceholder} onChange={() => {}} autoComplete="off" />
            <TextField label="Upload field label" value={TODAY.uploadLabel} onChange={() => {}} autoComplete="off" />
          </>
        ) : (
          <Text as="p" tone="subdued">Labels and placeholders of each field are edited in Form fields on the Rule tab.</Text>
        )}
        <TextField label="Submit button" value="Submit" onChange={() => {}} autoComplete="off" />
      </BlockStack>
    </Card>
  );
}

export function SubmitFormEdit() {
  const {state} = useScenario();
  const [version] = useVersion();
  const {fields, dirty, save, discard} = useForm();
  const {notify} = useShell();
  const [tab, setTab] = useState(0);
  const disabled = state === 'disabled';

  const page = (children) => (
    <Page
      backAction={{content: 'Reward programs', url: '/demo'}}
      title="Submit form"
      titleMetadata={<Badge tone="success">Active</Badge>}
      secondaryActions={[{content: 'Submitted forms', url: '/demo/activities'}]}
      primaryAction={{content: 'Turn off', onAction: () => notify('Program turned off')}}
    >
      {children}
    </Page>
  );

  if (state === 'loading') return page(<Card><LoadingView rows={8} /></Card>);
  if (state === 'error') {
    return page(
      <Card>
        <ErrorView title="We couldn’t load this program" onRetry={() => notify('Trying again…')}>
          Your settings and submissions are safe. Check your connection and try again.
        </ErrorView>
      </Card>,
    );
  }

  return page(
    <>
      {dirty ? (
        <ContextualSaveBar
          message="Unsaved changes"
          saveAction={{
            onAction: () => {
              if (version === 'new' && !fields.length) return notify('Add at least one field before saving', {error: true});
              save();
              notify('Program saved');
            },
          }}
          discardAction={{onAction: discard}}
        />
      ) : null}
      <BlockStack gap="400">
        {disabled ? (
          <Banner tone="warning" title="Customers have answered this form">
            You can rename, reorder, add and delete fields. The type of a field that already has answers can’t change, so old answers stay readable.
          </Banner>
        ) : null}
        <Tabs tabs={[{id: 'rule', content: 'Rule'}, {id: 'design', content: 'Design'}]} selected={tab} onSelect={setTab} />
        <Layout>
          <Layout.Section>
            {tab === 0 ? (
              <BlockStack gap="400">
                <TemplatePicker version={version} />
                <ProgramInfo />
                <RewardSettings />
                <Eligibility />
                {version === 'today' ? <SubmissionToday /> : <SubmissionNew disabled={false} />}
                <Approval version={version} disabled={false} />
                <InstantReward />
              </BlockStack>
            ) : (
              <DesignTab version={version} />
            )}
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <FormPreview version={version} fields={fields} />
              <Summary version={version} />
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </>,
  );
}
