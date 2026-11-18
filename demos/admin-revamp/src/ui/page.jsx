// Page frame for the new Shopify admin. In the new admin an embedded app's page title, its badge and its
// page actions live in the thin app title bar above the white panel (App Bridge title bar), not in a big
// heading inside the content. A screen declares them once with <PageFrame>; AdminChrome renders the bar.
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {Box} from '@shopify/polaris';

const TitleContext = createContext({bar: null, setBar: () => {}});

export function TitleBarProvider({children}) {
  const [bar, setBar] = useState(null);
  const value = useMemo(() => ({bar, setBar}), [bar]);
  return <TitleContext.Provider value={value}>{children}</TitleContext.Provider>;
}

export const useTitleBar = () => useContext(TitleContext).bar;

/**
 * <PageFrame title="Points" backUrl="/programs" badge={<StatusBadge status="live" />}
 *   primaryAction={{content: 'Add program', onAction}} secondaryActions={[{content: 'Export', onAction}]}
 *   width="default|narrow|wide">…</PageFrame>
 * Actions show in the title bar on desktop and collapse into the ⋯ menu on phones.
 */
export function PageFrame({title, backUrl, badge, primaryAction, secondaryActions, width = 'default', children}) {
  const {setBar} = useContext(TitleContext);
  // Re-register when the visible parts change; functions are read through a ref-free closure each render.
  const key = JSON.stringify({
    title, backUrl, badge: Boolean(badge),
    p: primaryAction && [primaryAction.content, primaryAction.disabled, primaryAction.loading],
    s: (secondaryActions ?? []).map(a => [a.content, a.disabled]),
  });
  useEffect(() => {
    setBar({title, backUrl, badge, primaryAction, secondaryActions});
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => setBar(null), [setBar]);
  return (
    <div className={`rv-page rv-page--${width}`}>
      <Box paddingBlockStart="500" paddingBlockEnd="1600" paddingInline={{xs: '300', sm: '500'}}>
        {children}
      </Box>
    </div>
  );
}
