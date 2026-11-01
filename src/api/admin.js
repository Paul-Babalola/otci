// Admin endpoints — sections 5–13 of otci-api.md. Every call sends the admin token.

import {
  API_PREFIX, SUBMISSIONS_PREFIX, call, list, request, setToken, clearToken, getToken, seg,
} from './client.js';

const A = `${API_PREFIX}/admin`;
// The collection writes these routes without /api/v1. See VITE_API_SUBMISSIONS_PREFIX.
const S = `${SUBMISSIONS_PREFIX}/admin/submissions`;
const auth = 'admin';

const get = (path, query, opts) => call(path, { auth, query, ...opts });
const post = (path, body, opts) => call(path, { method: 'POST', auth, body, ...opts });
const put = (path, body, opts) => call(path, { method: 'PUT', auth, body, ...opts });
const del = (path, opts) => call(path, { method: 'DELETE', auth, ...opts });
const page = (path, query, opts) => list(path, { auth, query, ...opts });

// ----------------------------------------------------------------- auth (§9)

export const session = {
  /**
   * Same URL as the public login; the backend only lets is_admin accounts
   * through to admin routes. Stores the admin token.
   * @param {{ email: string, password: string }} creds
   */
  login: async (creds, opts) => {
    const data = await call(`${API_PREFIX}/public/auth/login`, { method: 'POST', body: creds, ...opts });
    if (data && data.token) setToken('admin', data.token);
    return data;
  },
  logout: async (opts) => {
    try { await post(`${A}/logout`, undefined, opts); }
    finally { clearToken('admin'); }
  },
  /** @returns {Promise<import('./types.js').Admin>} */
  profile: (opts) => get(`${A}/profile`, undefined, opts),
  isSignedIn: () => !!getToken('admin'),
};

// ----------------------------------------------------------------- submissions (§5–8)

/** Path segment for each single action, using the primary route (not the alias). */
const SINGLE = {
  eligible: 'mark-eligible',
  ineligible: 'mark-ineligible',
  invite_interview: 'invite-interview',
  accept: 'accept',
  reject: 'reject',
  invite_idea_day: 'invite-idea-day',
  winner: 'mark-winner',
};

export const submissions = {
  /**
   * @param {import('./types.js').SubmissionQuery} [query]
   * @returns {Promise<import('./types.js').Paginated<import('./types.js').SubmissionSummary>>}
   */
  list: (query, opts) => page(S, query, opts),

  /**
   * Tab and status-checkbox counts.
   * @param {{ from_date?: string, to_date?: string, form_code?: string }} [query]
   * @returns {Promise<import('./types.js').SubmissionStats>}
   */
  stats: (query, opts) => get(`${S}/stats`, query, opts),

  /** @returns {Promise<import('./types.js').SubmissionDetail>} */
  get: (code, opts) => get(`${S}/${seg(code)}`, undefined, opts),

  /**
   * Downloads a CSV or XLSX file. Use saveBlob() from the client to save it.
   * @param {import('./types.js').ExportRequest} input
   * @returns {Promise<{ blob: Blob, filename: string|null }>}
   */
  export: (input, opts) =>
    request(`${S}/export`, { method: 'POST', auth, body: input, as: 'blob', ...opts }),

  comments: {
    list: (code, opts) => get(`${S}/${seg(code)}/comments`, undefined, opts),
    /** @param {string} code @param {string} body */
    add: (code, body, opts) => post(`${S}/${seg(code)}/comments`, { body }, opts),
  },

  /**
   * Email subject/body to show in an action's confirmation modal.
   * @param {string} code
   * @param {import('./types.js').SubmissionAction} action
   * @param {import('./types.js').MessagePreviewContext} [context]
   */
  preview: (code, action, context, opts) =>
    post(`${S}/${seg(code)}/message-preview`, { action, ...context }, opts),

  /**
   * Bulk version of preview(), with the recipient list.
   * @param {import('./types.js').SubmissionAction} action
   * @param {import('./types.js').BulkSelection & import('./types.js').MessagePreviewContext} input
   */
  bulkPreview: (action, input, opts) =>
    post(`${S}/bulk-message-preview`, { action, ...input }, opts),

  // --- single actions (§7)

  /** @param {string} code @param {import('./types.js').EmailOverride} [email] */
  markEligible: (code, email, opts) => post(`${S}/${seg(code)}/${SINGLE.eligible}`, { ...email }, opts),

  /** @param {string} code @param {string} reason @param {import('./types.js').EmailOverride} [email] */
  markIneligible: (code, reason, email, opts) =>
    post(`${S}/${seg(code)}/${SINGLE.ineligible}`, { reason, ...email }, opts),

  /**
   * @param {string} code
   * @param {{ scheduled_at: string, venue?: string, notes?: string } & import('./types.js').EmailOverride} input
   */
  inviteInterview: (code, input, opts) => post(`${S}/${seg(code)}/${SINGLE.invite_interview}`, input, opts),

  /** @param {string} code @param {string} [notes] @param {import('./types.js').EmailOverride} [email] */
  accept: (code, notes, email, opts) => post(`${S}/${seg(code)}/${SINGLE.accept}`, { notes, ...email }, opts),

  /** @param {string} code @param {string} reason @param {import('./types.js').EmailOverride} [email] */
  reject: (code, reason, email, opts) => post(`${S}/${seg(code)}/${SINGLE.reject}`, { reason, ...email }, opts),

  /**
   * Omitted date/time/venue fall back to the event's Idea Day defaults.
   * @param {string} code
   * @param {{ idea_day_date?: string, idea_day_time?: string, idea_day_venue?: string } & import('./types.js').EmailOverride} [input]
   */
  inviteIdeaDay: (code, input, opts) => post(`${S}/${seg(code)}/${SINGLE.invite_idea_day}`, { ...input }, opts),

  /** @param {string} code @param {import('./types.js').EmailOverride} [email] */
  markWinner: (code, email, opts) => post(`${S}/${seg(code)}/${SINGLE.winner}`, { ...email }, opts),

  /**
   * Any transition listed in the submission's allowed_transitions.
   * @param {string} code @param {import('./types.js').SubmissionStatus} status @param {string} [notes]
   */
  setStatus: (code, status, notes, opts) => put(`${S}/${seg(code)}/status`, { status, notes }, opts),

  // --- bulk actions (§8). `sel` is { submission_codes } or { select_all: true, filter_status }.

  /** @param {import('./types.js').BulkSelection} sel @param {import('./types.js').EmailOverride} [email] */
  bulkMarkEligible: (sel, email, opts) => post(`${S}/bulk-mark-eligible`, { ...sel, ...email }, opts),

  /** @param {import('./types.js').BulkSelection} sel @param {string} reason @param {import('./types.js').EmailOverride} [email] */
  bulkMarkIneligible: (sel, reason, email, opts) => post(`${S}/bulk-mark-ineligible`, { ...sel, reason, ...email }, opts),

  /**
   * @param {import('./types.js').BulkSelection} sel
   * @param {{ scheduled_at: string, venue?: string } & import('./types.js').EmailOverride} input
   */
  bulkInviteInterview: (sel, input, opts) => post(`${S}/bulk-invite-interview`, { ...sel, ...input }, opts),

  /** @param {import('./types.js').BulkSelection} sel @param {string} [notes] @param {import('./types.js').EmailOverride} [email] */
  bulkAccept: (sel, notes, email, opts) => post(`${S}/bulk-accept`, { ...sel, notes, ...email }, opts),

  /** @param {import('./types.js').BulkSelection} sel @param {string} reason @param {import('./types.js').EmailOverride} [email] */
  bulkReject: (sel, reason, email, opts) => post(`${S}/bulk-reject`, { ...sel, reason, ...email }, opts),

  /**
   * @param {import('./types.js').BulkSelection} sel
   * @param {{ idea_day_date?: string, idea_day_time?: string, idea_day_venue?: string } & import('./types.js').EmailOverride} [input]
   */
  bulkInviteIdeaDay: (sel, input, opts) => post(`${S}/bulk-invite-idea-day`, { ...sel, ...input }, opts),

  /** @param {import('./types.js').BulkSelection} sel @param {import('./types.js').EmailOverride} [email] */
  bulkMarkWinner: (sel, email, opts) => post(`${S}/bulk-mark-winner`, { ...sel, ...email }, opts),

  /** @param {import('./types.js').BulkSelection} sel @param {import('./types.js').SubmissionStatus} status */
  bulkSetStatus: (sel, status, opts) => post(`${S}/bulk-status`, { ...sel, status }, opts),
};

// ----------------------------------------------------------------- reference data (§10)

export const sectors = {
  list: (opts) => get(`${A}/sectors`, undefined, opts),
  /** @param {import('./types.js').SectorInput} input */
  create: (input, opts) => post(`${A}/sectors`, input, opts),
  /** @param {string} code @param {import('./types.js').SectorInput} input */
  update: (code, input, opts) => put(`${A}/sectors/${seg(code)}`, input, opts),
};

export const mdas = {
  list: (opts) => get(`${A}/mdas`, undefined, opts),
  /** @param {import('./types.js').MdaInput} input */
  create: (input, opts) => post(`${A}/mdas`, input, opts),
  /** @param {string} code @param {import('./types.js').MdaInput} input */
  update: (code, input, opts) => put(`${A}/mdas/${seg(code)}`, input, opts),
};

/** Read-only; managed by the backend seed. */
export const lgas = {
  list: (opts) => get(`${A}/lgas`, undefined, opts),
};

// ----------------------------------------------------------------- events / forms (§11)

const E = `${A}/events`;

export const events = {
  /** @param {import('./types.js').PageQuery} [query] */
  list: (query, opts) => page(E, query, opts),
  /** @param {import('./types.js').EventInput} input */
  create: (input, opts) => post(E, input, opts),
  /** @returns {Promise<import('./types.js').IdeaForm>} */
  get: (code, opts) => get(`${E}/${seg(code)}`, undefined, opts),
  /** Saves a snapshot of the previous state first. @param {string} code @param {import('./types.js').EventInput} input */
  update: (code, input, opts) => put(`${E}/${seg(code)}`, input, opts),
  /** Throws ApiError with status 409 if the event has submissions. */
  remove: (code, opts) => del(`${E}/${seg(code)}`, opts),

  fields: {
    /** @returns {Promise<import('./types.js').FormField[]>} */
    list: (eventCode, opts) => get(`${E}/${seg(eventCode)}/fields`, undefined, opts),
    /** @param {string} eventCode @param {import('./types.js').FieldInput} input */
    add: (eventCode, input, opts) => post(`${E}/${seg(eventCode)}/fields`, input, opts),
    /** @param {string} eventCode @param {string} fieldCode @param {import('./types.js').FieldInput} input */
    update: (eventCode, fieldCode, input, opts) =>
      put(`${E}/${seg(eventCode)}/fields/${seg(fieldCode)}`, input, opts),
    remove: (eventCode, fieldCode, opts) => del(`${E}/${seg(eventCode)}/fields/${seg(fieldCode)}`, opts),
    /**
     * Pass field codes in their new order; sort_order is 1-based.
     * @param {string} eventCode @param {string[]} fieldCodes
     */
    reorder: (eventCode, fieldCodes, opts) =>
      put(`${E}/${seg(eventCode)}/fields/reorder`, {
        fields: fieldCodes.map((code, i) => ({ code, sort_order: i + 1 })),
      }, opts),
  },

  history: {
    /** Up to 15 snapshots, newest first. */
    list: (eventCode, opts) => get(`${E}/${seg(eventCode)}/history`, undefined, opts),
    restore: (eventCode, snapshotCode, opts) =>
      post(`${E}/${seg(eventCode)}/history/${seg(snapshotCode)}/restore`, undefined, opts),
  },
};

// ----------------------------------------------------------------- public users (§12)

export const users = {
  /**
   * @param {{ user_type?: import('./types.js').UserType, search?: string, page?: number }} [query]
   * @returns {Promise<import('./types.js').Paginated<import('./types.js').PublicUser>>}
   */
  list: (query, opts) => page(`${A}/users`, query, opts),
};

// ----------------------------------------------------------------- admin management (§13)

export const admins = {
  /** @returns {Promise<import('./types.js').AdminStats>} */
  stats: (opts) => get(`${A}/admins/stats`, undefined, opts),

  /**
   * Active admins, invitations and deactivated admins in one table. The
   * returned page also carries `stats`.
   * @param {{ status?: 'all'|'active'|'invited'|'pending'|'deactivated', page?: number, per_page?: number }} [query]
   * @returns {Promise<import('./types.js').Paginated<import('./types.js').AdminRow>>}
   */
  unified: (query, opts) => page(`${A}/admins`, { view: 'unified', status: 'all', ...query }, opts),

  /** Active admins only. @param {import('./types.js').PageQuery} [query] */
  list: (query, opts) => page(`${A}/admins`, query, opts),

  /** @param {string} code @param {import('./types.js').AdminRole} role */
  changeRole: (code, role, opts) => put(`${A}/admins/${seg(code)}/role`, { role }, opts),
  deactivate: (code, opts) => put(`${A}/admins/${seg(code)}/deactivate`, undefined, opts),
  reactivate: (code, opts) => put(`${A}/admins/${seg(code)}/reactivate`, undefined, opts),
};

export const adminInvitations = {
  /** @param {import('./types.js').PageQuery} [query] */
  list: (query, opts) => page(`${A}/invitations`, query, opts),

  /**
   * @param {import('./types.js').AdminRole} role
   * @returns {Promise<import('./types.js').InvitationPreview>}
   */
  preview: (role, opts) => get(`${A}/invitations/preview`, { role }, opts),

  /**
   * @param {{ name: string, email: string, role: import('./types.js').AdminRole }} input
   * @returns {Promise<import('./types.js').Invitation>}
   */
  invite: (input, opts) => post(`${A}/invitations`, input, opts),

  /**
   * @param {{ emails: string[], role: import('./types.js').AdminRole, custom_subject?: string, custom_body?: string }} input
   * @returns {Promise<import('./types.js').BatchInviteResult>}
   */
  inviteMany: (input, opts) => post(`${A}/invitations`, input, opts),

  /** New token, expiry reset to +7 days. */
  resend: (id, opts) => post(`${A}/invitations/${seg(id)}/resend`, undefined, opts),
  revoke: (id, opts) => del(`${A}/invitations/${seg(id)}`, opts),
};
