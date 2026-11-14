// CMS public API for the OTCI public site.
//
// All endpoints are unauthenticated (no token required).
// Uses VITE_CMS_API_BASE_URL (otci-cms-api.mydeslynkpartners.com) —
// separate from the OTCI reference data API (VITE_API_BASE_URL).
// /api/pages/*, /api/gallery/*, /api/feedback, /api/newsletter/*, /api/contact/*, /api/charters/*
//
// Usage:
//   import { cmsPages, cmsGallery, cmsFeedback, cmsNewsletter, cmsContact, cmsCharters } from './api';
//   const page  = await cmsPages.get('bos');
//   await cmsFeedback.submit({ mda_code: 'MDA-001', message: 'Great service' });
//   await cmsNewsletter.subscribe('user@example.com');

import { ApiError, toPage, seg } from './client.js';

const env = import.meta.env || {};
const CMS_BASE = String(env.VITE_CMS_API_BASE_URL || '').replace(/\/+$/, '');

async function cmsReq(path, opts = {}) {
  const { method = 'GET', body, query, signal } = opts;
  const headers = { Accept: 'application/json' };
  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let url = CMS_BASE + path;
  if (query) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    }
    const s = q.toString();
    if (s) url += '?' + s;
  }
  let res;
  try {
    res = await fetch(url, { method, headers, body: payload, signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the server. Check your connection.', { status: 0 });
  }
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  if (!res.ok) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, {
      status: res.status,
      errors: json?.errors || null,
      body: json ?? text,
    });
  }
  return json && 'data' in json ? json.data : json;
}

const cmsCall = (path, opts) => cmsReq(path, opts);
const cmsList = (path, opts) => cmsReq(path, opts).then(toPage);

// ---- pages ----

export const cmsPages = {
  /** Fetch a full page object by its slug. Known slugs: home, about, bos, ci, reforms, msd, non-technical. */
  get: (slug, opts) => cmsCall(`/api/pages/${seg(slug)}`, opts),
};

// ---- gallery ----

export const cmsGallery = {
  list: (opts) => cmsCall('/api/gallery', opts),
  get: (id, opts) => cmsCall(`/api/gallery/${seg(id)}`, opts),
};

export const cmsMediaUrl = (u) => { const s = String(u || '').trim(); return !s ? '' : /^https?:\/\//i.test(s) ? s : CMS_BASE + '/' + s.replace(/^\/+/, ''); };

// ---- citizen feedback ----

export const cmsFeedback = {
  /**
   * Submit feedback about an MDA or the BOS programme.
   * `data` can be a plain object (JSON) or FormData (with file attachment).
   */
  submit: (data, opts) =>
    cmsCall('/api/feedback', { method: 'POST', body: data, ...opts }),
};

// ---- newsletter ----

export const cmsNewsletter = {
  subscribe: (email, opts) =>
    cmsCall('/api/newsletter/subscribe', { method: 'POST', body: { email, source: 'footer' }, ...opts }),
  unsubscribe: (token, opts) =>
    cmsCall('/api/newsletter/unsubscribe', { query: { token }, ...opts }),
};

// ---- contact MCSD ----

export const cmsContact = {
  /** Submit a Management Consulting Services Division contact request. */
  submit: (data, opts) =>
    cmsCall('/api/contact', { method: 'POST', body: data, ...opts }),
};

// ---- service charters ----

export const cmsCharters = {
  list: (query, opts)     => cmsList('/api/charters', { query, ...opts }),
  get: (id, opts)         => cmsCall(`/api/charters/${seg(id)}`, opts),
  departments: (opts)     => cmsCall('/api/departments', opts),
};
