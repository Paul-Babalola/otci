// Page content from the CMS (GET /api/pages/{slug}), keyed by section type.
// Hidden sections are dropped. Null until loaded; the engine templates fall
// back to their built-in copy when a field is missing.
//
// Engine page ids map to CMS slugs: ms → msd, everything else is 1:1.

import { cmsPages } from '../api/index.js';

const SLUGS = { home: 'home', about: 'about', bos: 'bos', ci: 'ci', reforms: 'reforms', ms: 'msd', 'non-technical': 'non-technical' };

const cache = {}, promise = {};

export const cmsSlug = (pid) => SLUGS[pid] || null;

export function getCmsPage(pid) { return cache[pid] || null; }

export function loadCmsPage(pid) {
  const slug = SLUGS[pid];
  if (!slug) return Promise.resolve(null);
  if (cache[pid]) return Promise.resolve(cache[pid]);
  if (!promise[pid]) {
    promise[pid] = cmsPages.get(slug)
      .then((d) => {
        const page = d && d.page ? d.page : d;
        const rawSections = (page && page.sections) || [];
        const sorted = rawSections.slice().sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
        const out = {};
        const hidden = new Set();
        sorted.forEach((s) => {
          if (!s || !s.type) return;
          out[s.type] = s.content || {};
          if (s.is_visible === false) hidden.add(s.type);
        });
        out._order = sorted.filter(s => s && s.type && s.is_visible !== false).map(s => s.type);
        out._hidden = hidden;
        cache[pid] = out;
        return out;
      })
      .catch(() => { promise[pid] = null; return null; });
  }
  return promise[pid];
}

// Back-compat aliases used by the homepage wiring.
export const getCmsHome = () => getCmsPage('home');
export const loadCmsHome = () => loadCmsPage('home');
