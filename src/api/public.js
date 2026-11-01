// Public (citizen / civil servant) endpoints — sections 1–4 of otci-api.md.

import { API_PREFIX, call, setToken, clearToken, getToken, toFormData, seg } from './client.js';

const P = `${API_PREFIX}/public`;

/** Stores the token from an auth response, then returns the data. */
function keepToken(data) {
  if (data && data.token) setToken('user', data.token);
  return data;
}

// ----------------------------------------------------------------- auth

export const auth = {
  /**
   * @param {import('./types.js').CitizenRegistration} input
   * @returns {Promise<import('./types.js').AuthResult>}
   */
  registerCitizen: (input, opts) =>
    call(`${P}/auth/register/citizen`, { method: 'POST', body: toFormData(input), ...opts }).then(keepToken),

  /**
   * @param {import('./types.js').CivilServantRegistration} input
   * @returns {Promise<import('./types.js').AuthResult>}
   */
  registerCivilServant: (input, opts) =>
    call(`${P}/auth/register/civil-servant`, { method: 'POST', body: toFormData(input), ...opts }).then(keepToken),

  /**
   * @param {{ email: string, password: string }} creds
   * @returns {Promise<import('./types.js').AuthResult>}
   */
  login: (creds, opts) =>
    call(`${P}/auth/login`, { method: 'POST', body: creds, ...opts }).then(keepToken),

  /** Revokes the token on the server and forgets it locally, even if the call fails. */
  logout: async (opts) => {
    try { await call(`${P}/auth/logout`, { method: 'POST', auth: 'user', ...opts }); }
    finally { clearToken('user'); }
  },

  /** @returns {Promise<import('./types.js').PublicUser>} */
  me: (opts) => call(`${P}/auth/me`, { auth: 'user', ...opts }),

  /** Always resolves (the API returns 200 to prevent email enumeration). */
  forgotPassword: (email, opts) =>
    call(`${P}/auth/forgot-password`, { method: 'POST', body: { email }, ...opts }),

  /**
   * Token and email come from the reset link: {FRONTEND_URL}/reset-password?token=…&email=…
   * @param {{ token: string, email: string, password: string, password_confirmation: string }} input
   */
  resetPassword: (input, opts) =>
    call(`${P}/auth/reset-password`, { method: 'POST', body: input, ...opts }),

  isSignedIn: () => !!getToken('user'),
};

// ----------------------------------------------------------------- reference data

export const reference = {
  /** @returns {Promise<import('./types.js').Sector[]>} */
  sectors: (opts) => call(`${P}/sectors`, opts),
  /** @returns {Promise<import('./types.js').Lga[]>} */
  lgas: (opts) => call(`${P}/lgas`, opts),
  /** @returns {Promise<import('./types.js').Mda[]>} */
  mdas: (opts) => call(`${P}/mdas`, opts),
};

// ----------------------------------------------------------------- forms & submissions

export const forms = {
  /**
   * The active idea form with its fields. Resolves to null when there is no
   * active form (the API answers 404).
   * @returns {Promise<import('./types.js').IdeaForm|null>}
   */
  current: async (opts) => {
    try { return await call(`${P}/forms/current`, opts); }
    catch (err) { if (err && err.status === 404) return null; throw err; }
  },

  /**
   * Uploads a file for a file-type field. Pass the returned path as that
   * field's `answer` when submitting.
   * @param {File|Blob} file  jpg/jpeg/png/pdf/doc/docx/ppt/pptx, max 10 MB
   * @returns {Promise<any>}  shape unconfirmed; see uploadedPath()
   */
  upload: (file, opts) =>
    call(`${P}/media/upload`, { method: 'POST', body: toFormData({ file }), auth: 'user', ...opts }),

  /**
   * Submits answers. Throws ApiError with status 422 and field errors when
   * required fields are missing.
   * @param {string} eventCode
   * @param {import('./types.js').IdeaSubmission} submission
   */
  submit: (eventCode, submission, opts) =>
    call(`${P}/forms/${seg(eventCode)}/submit`, { method: 'POST', body: submission, auth: 'user', ...opts }),
};

/**
 * Pulls the stored path out of an upload response. The collection doesn't
 * document the response, so this accepts the likely shapes.
 */
export function uploadedPath(data) {
  if (typeof data === 'string') return data;
  return data?.path ?? data?.file_path ?? data?.relative_path ?? null;
}

// ----------------------------------------------------------------- admin invitations (public side)

export const invitations = {
  /** @returns {Promise<import('./types.js').InvitationDetails>} */
  details: (token, opts) => call(`${P}/invitations/${seg(token)}`, opts),

  /**
   * Checks a token from ?invite_token=… or ?token=… on the onboarding page.
   * Resolves with `valid: false` for unknown, expired or used tokens.
   * @returns {Promise<import('./types.js').InvitationValidation>}
   */
  validate: (token, opts) =>
    call(`${P}/invitations/validate`, { method: 'POST', body: { token }, ...opts }),

  /**
   * Sets the invited admin's password. Stores the returned token as the
   * admin token, since the new account is an admin.
   * @param {import('./types.js').AcceptInvitation} input
   * @returns {Promise<{ user: import('./types.js').Admin, token: string }>}
   */
  accept: async (input, opts) => {
    const data = await call(`${P}/invitations/accept`, { method: 'POST', body: input, ...opts });
    if (data && data.token) setToken('admin', data.token);
    return data;
  },
};
