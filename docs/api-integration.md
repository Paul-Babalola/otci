# OTCI API integration

The API layer lives in `src/api/`. It covers all 78 requests in the Postman
collection (`otci-api.md`). No page uses it yet: the site's forms still run
client-side only.

## Setup

```bash
cp .env.example .env.local
```

| Variable | What it is |
|---|---|
| `VITE_API_BASE_URL` | Backend origin, no trailing slash, e.g. `https://api.example.gov.ng`. Empty means same origin. |
| `VITE_API_SUBMISSIONS_PREFIX` | Prefix for `/admin/submissions/*`. Empty follows the collection (no `/api/v1`). Set to `/api/v1` if the backend serves them there. |

Restart `npm run dev` after editing env files. `.env.local` is git-ignored.

The backend must allow CORS from the site's origin (and `http://localhost:5173`
in development) for `Authorization` and `Content-Type` headers.

## Files

| File | Contents |
|---|---|
| `client.js` | `fetch` wrapper: base URL, envelope unwrapping, `ApiError`, token storage, pagination normalising, blob downloads |
| `public.js` | Citizen / civil servant: auth, reference data, forms, media upload, invitation accept |
| `admin.js` | Admin: session, submissions (list, stats, export, comments, previews, single and bulk actions), sectors, MDAs, LGAs, events, fields, history, users, admins, invitations |
| `types.js` | JSDoc types for editor autocomplete. Each shape is marked *documented* or *assumed* |
| `index.js` | Import everything from here |

## Usage

```js
import { api, ApiError, onUnauthorized, saveBlob } from './api';

// Public
await api.public.auth.login({ email, password });          // stores the user token
const form = await api.public.forms.current();              // null if no active form
const up = await api.public.forms.upload(file);
await api.public.forms.submit(form.code, {
  answers: [{ field_code: 'FLD-…', answer: uploadedPath(up) }],
});

// Admin
await api.admin.session.login({ email, password });         // stores the admin token
const { items, page } = await api.admin.submissions.list({ status: 'pending', page: 1 });
const preview = await api.admin.submissions.preview('SUB-2026-0001', 'reject'); // response shape undocumented
await api.admin.submissions.reject('SUB-2026-0001', 'Out of scope', {
  custom_subject: preview.subject, custom_body: preview.body,
});
saveBlob(await api.admin.submissions.export({ format: 'xlsx', select_all: true }), 'ideas.xlsx');

// Errors
try { await api.public.forms.submit(code, body); }
catch (e) {
  if (e instanceof ApiError && e.isValidation) showErrors(e.errors);
  else toast(e.message);
}

// Send people back to sign-in when a token expires
onUnauthorized((kind) => { location.hash = kind === 'admin' ? '#admin-login' : '#login'; });
```

Behaviour worth knowing:

- Every call returns the envelope's `data`. List calls return
  `{ items, page: { total, perPage, currentPage, lastPage, from, to }, links }`,
  whether the backend sends `pagination` or `meta`. The unified admin list also
  returns `stats`.
- A `success: false` body is treated as an error even with HTTP 200.
- A 401 clears that token and calls the `onUnauthorized` handler.
- User and admin tokens are kept separately (`localStorage`, falling back to
  memory if storage is blocked), so one browser can hold both.
- Every call takes an optional last `opts` argument; pass `{ signal }` to cancel.
- Single actions use the primary routes (`mark-eligible`, not the `eligible` alias).

## Problems in the spec (confirm with the backend)

1. **Pagination key.** The overview says `pagination`; the examples show `meta` (plus `links`). The client accepts both.
2. **`/admin/submissions` has no `/api/v1`.** Every other route does. Probably a mistake in the collection. Configurable via `VITE_API_SUBMISSIONS_PREFIX`.
3. **Accept invitation has two bodies.** `full_name` in one request, `first_name` + `last_name` in another, with different response shapes. `accept()` passes through whichever you send.
4. **Admin login uses the public login URL.** There's no way to tell from the response alone whether the account is an admin. The client stores the token as admin, and the first admin call will 401/403 if it isn't.
5. **No `file` field type.** Submit Idea describes file-upload fields, but the field types for Add Field are `short_text | long_text | radio | checkbox | dropdown | multi_select | date | number`.
6. **Upload response undocumented.** Submit needs the uploaded path; `uploadedPath()` guesses `path`, `file_path` or `relative_path`.
7. **ID type enums differ.** Citizens: `national_id | passport | drivers_license | voters_card`. Civil servants send `staff_id`, which isn't listed anywhere.
8. **Filters differ between list and export.** List takes one `status`; export takes `statuses[]`. List has `form_code` and `search`; export has neither. Export has dates; list doesn't.
9. **Date formats differ.** Most dates are ISO 8601; admin rows use `"May 10, 2026"` and invitation preview uses `"Monday, 12 October 2026"`. Display strings can't be sorted or localised.
10. **Duplicate fields.** `pending_invites` and `pending_invitations` in admin stats; `by_status` and `status_counts` in submission stats; `default_body` and `preview_body` in invitation preview.
11. **Single and batch invite share a URL** with different bodies and response shapes.
12. **Response bodies missing** for most endpoints: register, login, me, reference lists, current form, submit, upload, message previews, submission detail, comments, every single/bulk action, admin profile, events, fields, history and public users. Types for these are marked *assumed* in `types.js`.
13. **Invalid invitation token body** isn't visible in the collection.

## Missing APIs

Things the current site or an idea platform needs that the collection doesn't provide:

**Forms already on the site, with nowhere to send them**
- Citizen feedback on an MDA (BOS feedback modal and the floating "Share feedback" button).
- Contact Management Services request.
- Newsletter sign-up in the footer.

**Idea submission mismatch.** The site's idea form is anonymous (title, area, description, email). The API needs a signed-in user and a dynamic form from `forms/current`. Either the site gets register/login screens, or the backend needs an anonymous submission endpoint. This is a product decision.

**Public users**
- List my submissions and their status (there's no way to track an idea after submitting).
- Update profile, change password, replace ID document.
- Email verification / resend verification.

**Public content** (currently hard-coded in the site)
- News and updates, gallery photos and videos, highlights, impact statistics.
- Public Idea Day details (date, venue) and past events or winners.

**Admin**
- Single public-user detail, and deactivate / flag a public user.
- Delete or deactivate for sectors and MDAs (only create/update exist).
- Edit / delete a comment.
- Preview a history snapshot before restoring (the collection says this is deliberately not exposed).
- An audit log across submissions.
- A dedicated admin login endpoint, or an `is_admin` flag in the login response.

**Auth generally**
- Token lifetime / refresh. The client assumes a token is valid until a 401.
