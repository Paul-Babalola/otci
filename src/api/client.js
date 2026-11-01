// Low-level HTTP client for the OTCI API.
//
// - Reads the base URL from VITE_API_BASE_URL.
// - Unwraps the { success, message, data } envelope.
// - Normalises paginated lists, whichever key the backend uses
//   (`pagination` per the collection overview, `meta` per its examples).
// - Throws ApiError on any non-2xx or `success: false` response.
// - Keeps the citizen token and the admin token separately.

const env = import.meta.env || {};

export const API_BASE_URL = String(env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
export const API_PREFIX = '/api/v1';
/** See .env.example: the collection writes /admin/submissions/* without /api/v1. */
export const SUBMISSIONS_PREFIX = String(env.VITE_API_SUBMISSIONS_PREFIX || '').replace(/\/+$/, '');

// ---------------------------------------------------------------- tokens

const TOKEN_KEYS = { user: 'otci.user_token', admin: 'otci.admin_token' };
const memory = { user: null, admin: null };

function store() {
  try { return window.localStorage; } catch (_) { return null; }
}

/** @param {'user'|'admin'} kind */
export function getToken(kind) {
  if (memory[kind]) return memory[kind];
  try { memory[kind] = store()?.getItem(TOKEN_KEYS[kind]) || null; } catch (_) { /* blocked storage */ }
  return memory[kind];
}

/** @param {'user'|'admin'} kind @param {string|null} token */
export function setToken(kind, token) {
  memory[kind] = token || null;
  try {
    if (token) store()?.setItem(TOKEN_KEYS[kind], token);
    else store()?.removeItem(TOKEN_KEYS[kind]);
  } catch (_) { /* blocked storage: the in-memory copy still works */ }
}

/** @param {'user'|'admin'} kind */
export const clearToken = (kind) => setToken(kind, null);

// Called whenever the API answers 401 for an authenticated call, so the app
// can send the user back to a login screen.
let unauthorizedHandler = null;
/** @param {(kind: 'user'|'admin', error: ApiError) => void} fn */
export function onUnauthorized(fn) { unauthorizedHandler = fn; }

// ---------------------------------------------------------------- errors

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status: number, errors?: Record<string, string[]>|null, body?: any }} info
   */
  constructor(message, { status, errors = null, body = null }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;          // 0 means a network failure
    this.errors = errors;          // Laravel-style field errors on 422
    this.body = body;
  }
  get isValidation() { return this.status === 422; }
  get isUnauthorized() { return this.status === 401; }
  get isNotFound() { return this.status === 404; }
  get isConflict() { return this.status === 409; }
  /** First error message for a field, if any. */
  fieldError(name) {
    const e = this.errors && this.errors[name];
    return Array.isArray(e) ? e[0] : e || null;
  }
}

// ---------------------------------------------------------------- helpers

/** Drops undefined/null/'' so optional filters don't hit the query string. */
function toQuery(params) {
  if (!params) return '';
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) v.forEach((x) => q.append(`${k}[]`, x));
    else q.append(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

/**
 * Builds multipart form data. Booleans become 1/0, arrays become key[].
 * @param {Record<string, any>} fields
 */
export function toFormData(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) v.forEach((x) => fd.append(`${k}[]`, x));
    else if (typeof v === 'boolean') fd.append(k, v ? '1' : '0');
    else fd.append(k, v);
  }
  return fd;
}

/** Encodes a path segment such as a submission code. */
export const seg = (v) => encodeURIComponent(String(v));

/**
 * Normalises any paginated response to { items, page }.
 * Handles `pagination`, `meta`, and the admin unified list which nests
 * { stats, data, meta } inside `data`.
 * @returns {import('./types.js').Paginated<any>}
 */
export function toPage(body) {
  let items = body?.data;
  let meta = body?.pagination || body?.meta || null;
  let extra = {};
  if (items && !Array.isArray(items) && Array.isArray(items.data)) {
    const { data, meta: m, pagination: p, ...rest } = items;
    meta = p || m || meta;
    extra = rest;
    items = data;
  }
  items = Array.isArray(items) ? items : [];
  const page = {
    total: meta?.total ?? items.length,
    perPage: meta?.per_page ?? items.length,
    currentPage: meta?.current_page ?? 1,
    lastPage: meta?.last_page ?? 1,
    from: meta?.from ?? (items.length ? 1 : 0),
    to: meta?.to ?? items.length,
  };
  return { items, page, links: body?.links || null, message: body?.message || '', ...extra };
}

// ---------------------------------------------------------------- request

/**
 * @typedef {Object} RequestOptions
 * @property {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [method]
 * @property {Record<string, any>} [query]
 * @property {any} [body]                    JSON body, or a FormData instance
 * @property {'user'|'admin'|null} [auth]    which token to send
 * @property {'json'|'blob'|'raw'} [as]      what to return
 * @property {AbortSignal} [signal]
 */

/**
 * Sends a request and returns the full parsed body (envelope included).
 * Most callers want `call()` instead, which returns just `data`.
 * @param {string} path  path from the host root, e.g. /api/v1/public/lgas
 * @param {RequestOptions} [opts]
 */
export async function request(path, opts = {}) {
  // An empty VITE_API_BASE_URL means same origin (e.g. behind a reverse proxy).
  const { method = 'GET', query, body, auth = null, as = 'json', signal } = opts;

  const headers = { Accept: as === 'blob' ? '*/*' : 'application/json' };
  let payload;
  if (body instanceof FormData) payload = body;      // browser sets the boundary
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (auth) {
    const t = getToken(auth);
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let res;
  try {
    res = await fetch(API_BASE_URL + path + toQuery(query), { method, headers, body: payload, signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the OTCI service. Check your connection and try again.', { status: 0 });
  }

  if (as === 'raw') return res;

  if (res.ok && as === 'blob') {
    const cd = res.headers.get('Content-Disposition') || '';
    const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
    return { blob: await res.blob(), filename: m ? decodeURIComponent(m[1]) : null };
  }

  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON error page */ }

  if (!res.ok || (json && json.success === false)) {
    const err = new ApiError(json?.message || defaultMessage(res.status), {
      status: res.ok ? 400 : res.status,
      errors: json?.errors || null,
      body: json ?? text,
    });
    if (err.status === 401 && auth) {
      clearToken(auth);
      unauthorizedHandler?.(auth, err);
    }
    throw err;
  }
  return json ?? {};
}

/** Like request(), but returns the envelope's `data`. */
export async function call(path, opts) {
  const body = await request(path, opts);
  return body && 'data' in body ? body.data : body;
}

/** Like request(), but returns a normalised page for list endpoints. */
export async function list(path, opts) {
  return toPage(await request(path, opts));
}

function defaultMessage(status) {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'Not found.';
  if (status === 409) return 'That conflicts with existing data.';
  if (status === 422) return 'Please check the highlighted fields.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The OTCI service had a problem. Please try again later.';
  return `Request failed (${status}).`;
}

/** Saves a blob returned by an export endpoint. */
export function saveBlob({ blob, filename }, fallbackName = 'download') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
