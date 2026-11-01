import { useEffect } from 'react';

/** Cursor-following photo preview over the highlights rows. Ported verbatim. */
export default function useHighlightPreview() {
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0, cur = null;
    const pv = () => document.querySelector('.hl-prev');

    const loop = () => {
      const p = pv(); if (!p) { raf = 0; return; }
      x += (tx - x) * (RM ? 1 : .16); y += (ty - y) * (RM ? 1 : .16);
      const r = Math.max(-8, Math.min(8, (tx - x) * .06));
      p.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${r.toFixed(2)}deg) scale(${p.classList.contains('on') ? 1 : .85})`;
      raf = (Math.abs(tx - x) > .3 || Math.abs(ty - y) > .3) ? requestAnimationFrame(loop) : 0;
    };

    const move = (e) => {
      const row = e.target.closest && e.target.closest('.hli .hr'), p = pv();
      if (!p) return;
      ty = e.clientY;
      if (row) {
        const R = row.getBoundingClientRect();
        tx = R.right - 330 + (e.clientX - (R.left + R.width / 2)) * .06;
        if (row !== cur) {
          cur = row;
          const v = p.querySelector('.hl-pv');
          v.className = 'hl-pv ph img ' + row.dataset.img;
          if (!p.classList.contains('on')) { x = tx; y = ty; }
          p.classList.add('on');
        }
      } else if (cur) { cur = null; p.classList.remove('on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const scroll = () => { const p = pv(); if (p && cur) { cur = null; p.classList.remove('on'); } };

    document.addEventListener('pointermove', move, { passive: true });
    addEventListener('scroll', scroll, { passive: true });
    return () => {
      document.removeEventListener('pointermove', move);
      removeEventListener('scroll', scroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
