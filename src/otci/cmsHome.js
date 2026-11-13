// Home page content from the CMS (GET /api/pages/home), keyed by section type:
// hero, metrics_bar, what_we_do, transformation_highlights, citizen_engagement_cta,
// news_updates. Hidden sections are dropped. Null until loaded; the engine
// templates fall back to their built-in copy when a field is missing.

import { cmsPages } from '../api/index.js';

let cache = null, promise = null;

export function getCmsHome() { return cache; }

export function loadCmsHome() {
  if (cache) return Promise.resolve(cache);
  if (!promise) {
    promise = cmsPages.get('home')
      .then((d) => {
        const page = d && d.page ? d.page : d;
        const out = {};
        ((page && page.sections) || []).forEach((s) => {
          if (s && s.type && s.is_visible !== false) out[s.type] = s.content || {};
        });
        cache = out;
        return out;
      })
      .catch(() => { promise = null; return null; });
  }
  return promise;
}
