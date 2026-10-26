// Tiny hash router. No dependency. Routes live in the URL hash: #/membership, #/paid-membership/plans/abc?x=1
// The URL *search* (?option=a) is left alone so the prototype controls can own it.
import React, {createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

export const DEFAULT_PATH = '/membership';

function readHash() {
  const raw = (window.location.hash || '').replace(/^#/, '');
  const [pathPart, ...rest] = raw.split('?');
  const cleaned = '/' + pathPart.replace(/^\/+|\/+$/g, '');
  const path = cleaned === '/' ? DEFAULT_PATH : cleaned;
  return {path, search: rest.join('?')};
}

const RouterContext = createContext({
  route: {path: DEFAULT_PATH, segments: ['membership'], query: new URLSearchParams()},
  navigate: () => {}
});

export function RouterProvider({children}) {
  const [loc, setLoc] = useState(readHash);

  const current = useRef(loc);
  current.current = loc;
  const accept = next => {
    setLoc(next);
    window.scrollTo(0, 0);
  };
  const request = (next, proceed, history = false) => {
    const event = new CustomEvent('prototype:before-navigate', {cancelable: true, detail: {proceed, history}});
    window.dispatchEvent(event);
    if (!event.defaultPrevented) proceed();
  };
  useEffect(() => {
    const onChange = () => {
      const next = readHash();
      const old = current.current;
      if (next.path === old.path && next.search === old.search) return;
      // Restore the current route while a fullscreen editor asks whether to discard.
      window.history.replaceState(null, '', `${window.location.search}#${old.path}${old.search ? '?' + old.search : ''}`);
      request(
        next,
        () => {
          window.history.replaceState(null, '', `${window.location.search}#${next.path}${next.search ? '?' + next.search : ''}`);
          accept(next);
        },
        true
      );
      // every route change starts at the top, like a new page in the admin
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  // Make the default route explicit in the URL without adding a history entry.
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.history.replaceState(null, '', `${window.location.search}#${DEFAULT_PATH}`);
    }
  }, []);

  const navigate = useCallback((to, {replace = false} = {}) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    request(target, () => {
      const url = `${window.location.search}#${target}`;
      window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
      accept(readHash());
    });
  }, []);

  const route = useMemo(() => {
    const segments = loc.path.split('/').filter(Boolean);
    return {path: loc.path, segments, query: new URLSearchParams(loc.search)};
  }, [loc]);

  const value = useMemo(() => ({route, navigate}), [route, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

/** {path, segments, query} of the current hash route. */
export const useRoute = () => useContext(RouterContext).route;
/** navigate('/paid-membership/plans', {replace?: boolean}) */
export const useNavigate = () => useContext(RouterContext).navigate;

/**
 * Link component handed to Polaris AppProvider (`linkComponent`).
 * Any Polaris `url="/something"` becomes `href="#/something"`, so Buttons, Breadcrumbs, Tabs and
 * `backAction={{url: '/membership'}}` all navigate without extra wiring.
 */
export const HashLink = forwardRef(function HashLink({url, external, children, target, rel, download, ...rest}, ref) {
  const isRoute = typeof url === 'string' && url.startsWith('/') && !external;
  if (isRoute) {
    return (
      <a ref={ref} href={`#${url}`} {...rest}>
        {children}
      </a>
    );
  }
  const isHttp = typeof url === 'string' && /^https?:/.test(url);
  return (
    <a
      ref={ref}
      href={url}
      target={target || (external || isHttp ? '_blank' : undefined)}
      rel={rel || (external || isHttp ? 'noopener noreferrer' : undefined)}
      download={download}
      {...rest}
    >
      {children}
    </a>
  );
});
