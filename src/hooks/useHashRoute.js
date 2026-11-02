import { useEffect, useState } from 'react';
import { setNavHandler } from '../otci/engine.js';

export const ROUTES = ['home', 'about', 'bos', 'ci', 'reforms', 'ms', 'non-technical', 'gallery'];

/**
 * Small hash router, only so the demo app in App.jsx behaves like the original
 * artifact. Delete it and route these pages with your own router instead —
 * each page component is independent.
 *
 * It also takes over in-page `#...` links and points window.__nav at itself,
 * which is what the gallery tabs and a few CTAs call.
 */
export default function useHashRoute() {
  const parse = () => {
    const [r, sub] = (location.hash.slice(1) || 'home').split('/');
    return { route: ROUTES.includes(r) ? r : 'home', sub };
  };
  const [loc, setLoc] = useState(parse);

  useEffect(() => {
    const go = (hash) => {
      if (location.hash !== hash) history.pushState(null, '', hash);
      setLoc(parse());
    };
    setNavHandler(go);

    const onHash = () => setLoc(parse());
    const onClick = (e) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const h = a.getAttribute('href');
      if (h.length < 2) return;
      e.preventDefault();
      go(h);
    };

    addEventListener('hashchange', onHash);
    addEventListener('popstate', onHash);
    document.addEventListener('click', onClick);
    return () => {
      removeEventListener('hashchange', onHash);
      removeEventListener('popstate', onHash);
      document.removeEventListener('click', onClick);
      setNavHandler(null);
    };
  }, []);

  // in-page anchors (e.g. #bos/standards)
  useEffect(() => {
    if (!loc.sub || loc.route === 'gallery') return;
    const t = setTimeout(() => {
      const el = document.getElementById(loc.sub);
      if (el) el.scrollIntoView();
    }, 80);
    return () => clearTimeout(t);
  }, [loc.route, loc.sub]);

  return loc;
}
