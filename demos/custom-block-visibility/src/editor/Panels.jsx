// Middle column of the Widget editor: the settings of the selected Body entry.
// Custom blocks follow the real CustomBlockConfig (same fields, same control types); "Who can see this block" is the new select at the
// top of each. Built-in sections follow the real SectionPanel; only the help text of "Show to guests" changed.
import React from 'react';
import {BlockStack, Checkbox, Divider, Icon, RangeSlider, Select, Text, TextField} from '@shopify/polaris';
import {DragHandleIcon, EditIcon, HideIcon, UploadIcon, ViewIcon, DeleteIcon} from '@shopify/polaris-icons';
import {CUSTOM_LABELS, SECTION_META, SHOW_TO_GUESTS_HELP, SHOW_TO_HELP, SHOW_TO_LABEL, SHOW_TO_OPTIONS, THEME_PRIMARY, isCustom, typeOf} from '../data/widget.js';
import {useEditor} from '../state/editor.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {cx, useSortable} from './bits.jsx';

const SIZE_OPTIONS = [
  {label: 'Small', value: 'sm'},
  {label: 'Medium', value: 'md'},
  {label: 'Large', value: 'lg'},
];
const ALIGN_OPTIONS = [
  {label: 'Left', value: 'left'},
  {label: 'Center', value: 'center'},
  {label: 'Right', value: 'right'},
];
const ICON_OPTIONS = [
  ['external', 'External link'],
  ['chevron-right', 'Arrow right'],
  ['cart', 'Cart'],
  ['star', 'Star'],
  ['heart', 'Heart'],
  ['gift', 'Gift'],
  ['share', 'Share'],
  ['mail', 'Mail'],
  ['chat', 'Chat'],
  ['settings', 'Settings'],
  ['trophy', 'Trophy'],
  ['percent', 'Percent'],
  ['truck', 'Truck'],
  ['home', 'Home'],
  ['users', 'Users'],
  ['notification', 'Notification'],
  ['camera', 'Camera'],
].map(([value, label]) => ({value, label}));
const IMAGE_SOURCE_OPTIONS = [
  {label: 'Blank', value: 'blank'},
  {label: 'Upload your image', value: 'image'},
];
const HOVER_OPTIONS = [
  {label: 'Off', value: 'none'},
  {label: 'Subtle zoom', value: 'zoom'},
  {label: 'Pan up', value: 'pan-up'},
  {label: 'Brightness lift', value: 'brightness'},
];

function Heading({children}) {
  return (
    <>
      <Text as="h2" variant="headingMd">
        {children}
      </Text>
      <Divider />
    </>
  );
}

function Pair({children}) {
  return <div className="we-pair">{children}</div>;
}

/** NEW on every custom block: who can see it. Same position as the built-in sections' "Show to guests": first under the heading. */
function ShowTo({section}) {
  const ed = useEditor();
  return (
    <Select
      label={SHOW_TO_LABEL}
      options={SHOW_TO_OPTIONS}
      value={section.audience || 'everyone'}
      onChange={(value) => ed.patch(section.id, {audience: value})}
      helpText={SHOW_TO_HELP}
    />
  );
}

/** Image source select + upload card, as the real SelectOptionsUpload + TemplateUploadCardV2. */
function ImageField({section, label, aspect, size, sourceKey = 'bannerType', imageKey = 'image'}) {
  const ed = useEditor();
  const source = section[sourceKey] || (imageKey === 'image' ? 'image' : 'blank');
  const image = section[imageKey];
  const pick = (event) => {
    const file = event.target.files?.[0];
    if (file) ed.patch(section.id, {[imageKey]: URL.createObjectURL(file), [sourceKey]: 'image'});
    event.target.value = '';
  };
  return (
    <BlockStack gap="300">
      <Select
        label={label || 'Image'}
        labelHidden={!label}
        options={IMAGE_SOURCE_OPTIONS}
        value={source}
        onChange={(value) => ed.patch(section.id, {[sourceKey]: value})}
      />
      {source === 'image' ? (
        <div className="we-upload">
          <label className="we-upload__card" style={image ? {backgroundImage: `url(${image})`} : undefined}>
            <input type="file" accept="image/png,image/jpeg,image/gif" onChange={pick} aria-label="Upload image" />
            {!image ? (
              <span className="we-upload__empty">
                <Icon source={UploadIcon} />
                Upload image
              </span>
            ) : null}
          </label>
          {image ? (
            <button type="button" className="we-upload__remove" onClick={() => ed.patch(section.id, {[imageKey]: ''})}>
              <Icon source={DeleteIcon} />
              Remove
            </button>
          ) : null}
          <Text as="span" tone="subdued">
            {`Recommended image size is ${aspect} ratio ${size} and less than 200KB`}
          </Text>
        </div>
      ) : null}
    </BlockStack>
  );
}

function ColorField({label, value, onChange}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      autoComplete="off"
      prefix={<span className="we-swatch" style={{background: value || 'transparent'}} />}
      labelAction={{content: 'Use primary color', onAction: () => onChange(THEME_PRIMARY)}}
    />
  );
}

const URL_PLACEHOLDER = 'https://example.com or /collections/sale';

function BlockFields({section}) {
  const ed = useEditor();
  const set = (key) => (value) => ed.patch(section.id, {[key]: value});
  const text = (key, label, extra = {}) => (
    <TextField label={label} value={section[key] || ''} onChange={set(key)} autoComplete="off" {...extra} />
  );
  switch (typeOf(section)) {
    case 'CUSTOM_LINK':
      return (
        <>
          {text('title', 'Title')}
          {text('subtitle', 'Subtitle')}
          <Select label="Icon" options={ICON_OPTIONS} value={section.icon || 'external'} onChange={set('icon')} />
          {text('url', 'URL', {placeholder: URL_PLACEHOLDER})}
          <Checkbox label="Open in new tab" checked={section.external !== false} onChange={set('external')} />
        </>
      );
    case 'CUSTOM_CTA':
      return (
        <>
          {text('title', 'Title')}
          {text('subtitle', 'Subtitle')}
          {text('buttonLabel', 'Button label')}
          {text('url', 'Button URL', {placeholder: URL_PLACEHOLDER})}
          <Checkbox label="Full width" checked={section.fullWidth !== false} onChange={set('fullWidth')} />
          {section.fullWidth === false ? <Select label="Alignment" options={ALIGN_OPTIONS} value={section.align || 'center'} onChange={set('align')} /> : null}
          <Pair>
            <ColorField label="Background color" value={section.bgColor || ''} onChange={set('bgColor')} />
            <ColorField label="Text color" value={section.textColor || ''} onChange={set('textColor')} />
          </Pair>
          <Pair>
            <ColorField label="Button background color" value={section.buttonBgColor || ''} onChange={set('buttonBgColor')} />
            <ColorField label="Button text color" value={section.buttonTextColor || ''} onChange={set('buttonTextColor')} />
          </Pair>
        </>
      );
    case 'CUSTOM_BANNER':
      return (
        <>
          <ImageField section={section} label="Banner image" aspect="2:1" size="(800 x 400px)" />
          {text('url', 'Link URL', {placeholder: URL_PLACEHOLDER})}
          <Checkbox label="Open in new tab" checked={section.external !== false} onChange={set('external')} />
        </>
      );
    case 'CUSTOM_BUTTON':
      return (
        <>
          {text('label', 'Label')}
          {text('url', 'URL', {placeholder: '/collections/sale'})}
          <Pair>
            <Select
              label="Variant"
              options={[
                {label: 'Primary', value: 'primary'},
                {label: 'Secondary', value: 'secondary'},
                {label: 'Outline', value: 'outline'},
              ]}
              value={section.variant || 'primary'}
              onChange={set('variant')}
            />
            <Select label="Size" options={SIZE_OPTIONS} value={section.size || 'sm'} onChange={set('size')} />
          </Pair>
          <Checkbox label="Full width" checked={section.fullWidth !== false} onChange={set('fullWidth')} />
          {section.fullWidth === false ? <Select label="Alignment" options={ALIGN_OPTIONS} value={section.align || 'center'} onChange={set('align')} /> : null}
        </>
      );
    case 'CUSTOM_HEADING':
      return (
        <>
          {text('text', 'Heading')}
          {text('subtitle', 'Subtitle')}
          <Pair>
            <Select
              label="Level"
              options={[
                {label: 'H2', value: 'h2'},
                {label: 'H3', value: 'h3'},
                {label: 'H4', value: 'h4'},
              ]}
              value={section.level || 'h3'}
              onChange={set('level')}
            />
            <Select label="Alignment" options={ALIGN_OPTIONS} value={section.align || 'left'} onChange={set('align')} />
          </Pair>
        </>
      );
    case 'CUSTOM_RICHTEXT':
      return (
        <>
          <TextField label="Content" value={section.content || ''} onChange={set('content')} multiline={4} autoComplete="off" />
          <Pair>
            <Select label="Size" options={SIZE_OPTIONS} value={section.size || 'sm'} onChange={set('size')} />
            <Select label="Alignment" options={ALIGN_OPTIONS} value={section.align || 'left'} onChange={set('align')} />
          </Pair>
        </>
      );
    case 'CUSTOM_DIVIDER':
      return (
        <Select
          label="Style"
          options={[
            {label: 'Solid', value: 'solid'},
            {label: 'Dashed', value: 'dashed'},
            {label: 'Dotted', value: 'dotted'},
          ]}
          value={section.variant || 'solid'}
          onChange={set('variant')}
        />
      );
    case 'CUSTOM_IMAGE_TEXT':
      return (
        <>
          <ImageField section={section} label="Image" aspect="1:1" size="(400 x 400px)" />
          {text('title', 'Title')}
          <TextField label="Description" value={section.description || ''} onChange={set('description')} multiline={2} autoComplete="off" />
          <Select
            label="Layout"
            options={[
              {label: 'Image left', value: 'image-left'},
              {label: 'Image right', value: 'image-right'},
              {label: 'Image top', value: 'image-top'},
            ]}
            value={section.layout || 'image-left'}
            onChange={set('layout')}
          />
          {/* NEW: the same two controls Image banner has today, after the content fields. */}
          {text('url', 'Link URL', {placeholder: URL_PLACEHOLDER})}
          <Checkbox label="Open in new tab" checked={section.external !== false} onChange={set('external')} />
        </>
      );
    default:
      return null;
  }
}

function CustomBlockPanel({section}) {
  return (
    <BlockStack gap="400">
      <Heading>{CUSTOM_LABELS[typeOf(section)] || 'Custom block'}</Heading>
      <ShowTo section={section} />
      <Divider />
      <BlockFields section={section} />
    </BlockStack>
  );
}

function ProgramRows() {
  const ed = useEditor();
  const {notify} = useShell();
  const rowProps = useSortable(ed.moveProgram);
  return (
    <div className="we-programs">
      {ed.programs.map((program) => (
        <div key={program.id} className={cx('we-program', program.isShow === false && 'is-hidden')} {...rowProps(program.id)}>
          <span className="we-program__handle" aria-hidden="true">
            <Icon source={DragHandleIcon} tone="subdued" />
          </span>
          <span className="we-program__text">
            <span>{program.title}</span>
            <small>{program.sub}</small>
          </span>
          <button
            type="button"
            className="we-iconbtn"
            aria-label={program.isShow === false ? 'Hidden from widget' : 'Show on widget'}
            onClick={() => ed.patchProgram(program.id, {isShow: program.isShow === false})}
          >
            <Icon source={program.isShow === false ? HideIcon : ViewIcon} />
          </button>
          <button type="button" className="we-iconbtn" aria-label={`Edit ${program.title}`} onClick={() => notify("Editing a program icon isn't part of this prototype.")}>
            <Icon source={EditIcon} />
          </button>
        </div>
      ))}
    </div>
  );
}

function BannerBlock({section}) {
  const ed = useEditor();
  return (
    <>
      <Divider />
      <Text as="p">Banner image</Text>
      <ImageField section={section} aspect="16:9" size="(1200 x 675px)" sourceKey="bannerType" imageKey="bannerImage" />
      <Select
        label="Banner hover effect"
        options={HOVER_OPTIONS}
        value={section.bannerHoverEffect || 'none'}
        onChange={(value) => ed.patch(section.id, {bannerHoverEffect: value})}
      />
    </>
  );
}

function EarnConfig({section}) {
  const ed = useEditor();
  const size = section.iconSize || 0;
  return (
    <>
      <Divider />
      <TextField
        label="Number of items to display"
        type="number"
        min={0}
        value={String(section.maxItems || 0)}
        onChange={(value) => ed.patch(section.id, {maxItems: parseInt(value, 10) || 0})}
        helpText="Set to 0 to show all"
        autoComplete="off"
      />
      <RangeSlider
        label="Program icon size"
        helpText="Size of the icon next to each Earn & Redeem program. Applies to both sections."
        min={0}
        max={80}
        value={size}
        onChange={(value) => ed.patch(section.id, {iconSize: value})}
        output
        suffix={<p className="we-slider__value">{size ? `${size}px` : 'Default'}</p>}
      />
      <Divider />
      <Text as="h2" variant="headingSm">
        Program sort order
      </Text>
      <BlockStack gap="200">
        <Checkbox
          label="Sort completed programs first"
          checked={section.sortOrder === 'complete_first'}
          onChange={(checked) => ed.patch(section.id, {sortOrder: checked ? 'complete_first' : ''})}
        />
        <Checkbox
          label="Sort incomplete programs first"
          checked={section.sortOrder === 'incomplete_first'}
          onChange={(checked) => ed.patch(section.id, {sortOrder: checked ? 'incomplete_first' : ''})}
        />
      </BlockStack>
      <Divider />
      <BlockStack gap="100">
        <Text as="h2" variant="headingSm">
          Customize programs
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          Drag to reorder. Click edit to change the icon and detail image for each program.
        </Text>
      </BlockStack>
      <ProgramRows />
    </>
  );
}

function SectionPanel({section}) {
  const ed = useEditor();
  const meta = SECTION_META[section.id] || {label: section.id, guestOption: true, banner: false};
  return (
    <BlockStack gap="400">
      <Heading>{meta.label}</Heading>
      {section.id === 'VIP_TIERS' ? (
        <Text as="p" tone="subdued">
          Lists every VIP tier and what it takes to reach it. Tapping a tier opens its perks.
        </Text>
      ) : null}
      {meta.guestOption ? (
        <Checkbox
          label="Show to guests"
          helpText={SHOW_TO_GUESTS_HELP}
          checked={section.guestVisible !== false}
          onChange={(checked) => ed.patch(section.id, {guestVisible: checked})}
        />
      ) : null}
      {meta.memberOption ? (
        <Checkbox
          label="Show to members"
          helpText="When on, signed-in members see the list under their membership card, with their current tier marked"
          checked={section.memberVisible === true}
          onChange={(checked) => ed.patch(section.id, {memberVisible: checked})}
        />
      ) : null}
      {meta.banner ? <BannerBlock section={section} /> : null}
      {section.id === 'EARN_TAB' ? <EarnConfig section={section} /> : null}
    </BlockStack>
  );
}

export function Panel({section}) {
  if (!section) {
    return (
      <Text as="p" tone="subdued">
        Pick a section on the left to edit its settings.
      </Text>
    );
  }
  return isCustom(section) ? <CustomBlockPanel section={section} /> : <SectionPanel section={section} />;
}
