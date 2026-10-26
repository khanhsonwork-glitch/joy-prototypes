import useEditorKeyboard from '../fullscreen/useEditorKeyboard.js';
// The fullscreen frame for the email editor. FullscreenEditor (shared/fullscreen, Astra's) is a two-pane settings/preview frame
// with a search rail, so the email editor cannot sit inside it; this wraps the SAME look (its .fs-editor / .fs-titlebar classes
// and the Shopify max-modal geometry) and the SAME behaviour: Esc and the X close it, a dirty editor asks "Leave page with unsaved
// changes?" (also for browser back and hash navigation through the prototype:before-navigate event), and the save bar swaps the title
// for "Unsaved changes" with Discard / Save, like the Shopify save bar over a max modal.
import React, {useEffect, useRef, useState} from 'react';
import {Button, Modal, Text} from '@shopify/polaris';
import {XIcon} from '@shopify/polaris-icons';
import '../fullscreen/fullscreen.css';
import './notifications.css';

export default function EditorFrame({title, dirty, onSave, onDiscard, onBack, onEscape, actions, children}) {
  const [leave, setLeave] = useState(null);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const escRef = useRef(onEscape);
  escRef.current = onEscape;
  const close = () => (dirty ? setLeave(() => onBack) : onBack());
  const editorRef = useEditorKeyboard({onClose: close, onEscape: () => !dirtyRef.current && escRef.current?.()});

  useEffect(() => {
    const before = (event) => {
      if (event.detail.history) {
        event.preventDefault();
        if (dirtyRef.current) setLeave(() => onBack);
        else onBack();
        return;
      }
      if (!dirtyRef.current) return;
      event.preventDefault();
      setLeave(() => event.detail.proceed);
    };
    const unload = (event) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('prototype:before-navigate', before);
    window.addEventListener('beforeunload', unload);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('prototype:before-navigate', before);
      window.removeEventListener('beforeunload', unload);
    };
  }, [onBack]);

  return (
    <div ref={editorRef} tabIndex={-1} className="fs-editor ee-frame" role="region" data-polaris-layer aria-label={title}>
      <header className="fs-titlebar ee-titlebar">
        <Text as="h1" variant="headingMd">
          {dirty ? 'Unsaved changes' : title}
        </Text>
        <div className="fs-titlebar__actions">
          {dirty ? (
            <>
              <Button onClick={onDiscard}>Discard</Button>
              <Button variant="primary" onClick={onSave}>
                Save
              </Button>
            </>
          ) : (
            actions
          )}
          <Button variant="tertiary" icon={XIcon} accessibilityLabel="Close editor" onClick={close} />
        </div>
      </header>
      {children}
      <Modal
        open={!!leave}
        onClose={() => setLeave(null)}
        title="Leave page with unsaved changes?"
        primaryAction={{
          content: 'Leave page',
          destructive: true,
          onAction: () => {
            dirtyRef.current = false;
            const action = leave;
            setLeave(null);
            action();
          },
        }}
        secondaryActions={[{content: 'Stay', onAction: () => setLeave(null)}]}
      >
        <Modal.Section>Leaving this page will delete all unsaved changes.</Modal.Section>
      </Modal>
    </div>
  );
}
