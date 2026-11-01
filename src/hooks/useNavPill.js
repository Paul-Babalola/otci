import { useEffect } from 'react';

/** Sliding pill that follows the hovered/focused nav item. Ported verbatim. */
export default function useNavPill() {
  useEffect(() => {
    const nl = document.querySelector('header.top .navlinks');
    if (!nl || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    const pill = document.createElement('span');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nl.prepend(pill);
    nl.classList.add('pill');

    const items = [...nl.querySelectorAll(':scope>a,:scope>.dd>button')];
    const mv = (el) => {
      if (innerWidth < 861) return;
      const a = nl.getBoundingClientRect(), b = el.getBoundingClientRect();
      pill.style.width = b.width + 'px';
      pill.style.height = b.height + 'px';
      pill.style.transform = `translate(${b.left - a.left}px,${b.top - a.top}px)`;
      pill.style.opacity = 1;
    };
    const enter = [], focus = [];
    items.forEach((el) => {
      const a = () => mv(el), b = () => mv(el);
      el.addEventListener('pointerenter', a); el.addEventListener('focus', b);
      enter.push([el, a]); focus.push([el, b]);
    });
    const leave = () => { pill.style.opacity = 0; };
    const out = (e) => { if (!nl.contains(e.relatedTarget)) pill.style.opacity = 0; };
    nl.addEventListener('pointerleave', leave);
    nl.addEventListener('focusout', out);

    return () => {
      enter.forEach(([el, h]) => el.removeEventListener('pointerenter', h));
      focus.forEach(([el, h]) => el.removeEventListener('focus', h));
      nl.removeEventListener('pointerleave', leave);
      nl.removeEventListener('focusout', out);
      nl.classList.remove('pill');
      pill.remove();
    };
  }, []);
}
