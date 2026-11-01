import { useEffect } from 'react';

/** Publishes scroll position as the --sp custom property. Ported verbatim. */
export default function useScrollProgress() {
  useEffect(() => {
    let tk = 0;
    const sp = () => {
      tk = 0;
      const h = document.documentElement, m = h.scrollHeight - innerHeight;
      h.style.setProperty('--sp', m > 0 ? (scrollY / m).toFixed(4) : 0);
    };
    const on = () => { if (!tk) { tk = 1; requestAnimationFrame(sp); } };
    addEventListener('scroll', on, { passive: true });
    sp();
    return () => removeEventListener('scroll', on);
  }, []);
}
