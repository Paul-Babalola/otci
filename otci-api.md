# OTCI API — Implementation Reference

> Source: the **OTCI API** Postman collection (Mydeslynk workspace), 78 requests. All content below is transcribed from the collection's requests, descriptions and saved examples. Nothing is inferred. Where the collection does not specify something (e.g. a response shape), this doc says so instead of guessing.

**Collection description:** Office of Transformation, Creativity and Innovation — Idea Submission Platform API.

---

## Global

### Setup (from collection)
1. Import the collection.
2. Import an environment file (`OTCI-API.local.postman_environment.json` or `OTCI-API.prod.postman_environment.json`).
3. Call **Admin › Auth › Login** — the token is saved automatically to `{{admin_token}}`.
4. Call **Public › Auth › Login** — the token is saved automatically to `{{user_token}}`.

### Auth
- Admin endpoints require `Authorization: Bearer {{admin_token}}`.
- Authenticated public endpoints require `Authorization: Bearer {{user_token}}`.

### Response envelope (from collection)
```jsonc
// Success (single item)
{ "success": true, "message": "...", "data": { ... } }
// Success (paginated list)
{ "success": true, "message": "...", "data": [...], "pagination": { "total": 0, "per_page": 15, "current_page": 1, "last_page": 1, "from": 1, "to": 0 } }
// Error
{ "success": false, "message": "...", "errors": { ... } }
```

> ⚠️ **Inconsistency in the collection:** the envelope above says paginated lists use `pagination`, but the saved examples for *List Submissions*, *List Administrators*, *List Invitations* and *List Administrators (Unified)* show `meta` (and `links` for submissions). Confirm with the backend which key is returned.

### Path variables used in the collection
`{{base_url}}`, `{{user_token}}`, `{{admin_token}}`, `{{event_code}}`, `{{form_code}}`, `{{field_code}}`, `{{snapshot_code}}`, `{{sector_code}}`, `{{mda_code}}`, `{{submission_code}}`, `{{admin_code}}`, `{{invitation_id}}`, `{{invitation_token}}`

### URL prefix note
Every endpoint uses `{{base_url}}/api/v1/...` **except** the Admin › Submissions, Single/Bulk Submission Actions and Message Previews groups, which are written in the collection as `{{base_url}}/admin/submissions/...` (no `/api/v1`). Confirm with the backend whether that is intentional.

---

## Table of Contents

1. [Public — Auth](#1-public--auth)
2. [Public — Reference Data](#2-public--reference-data)
3. [Public — Forms & Submissions](#3-public--forms--submissions)
4. [Public — Admin Invitations](#4-public--admin-invitations)
5. [Admin — Message Previews (Modals)](#5-admin--message-previews-modals)
6. [Admin — Submissions](#6-admin--submissions)
7. [Admin — Single Submission Actions](#7-admin--single-submission-actions)
8. [Admin — Bulk Submission Actions](#8-admin--bulk-submission-actions)
9. [Admin — Auth](#9-admin--auth)
10. [Admin — Reference Data](#10-admin--reference-data)
11. [Admin — Events (Forms)](#11-admin--events-forms)
12. [Admin — Users](#12-admin--users)
13. [Admin — Admin Management](#13-admin--admin-management)

---

## 1. Public — Auth

### POST Register — Citizen
`POST {{base_url}}/api/v1/public/auth/register/citizen`

Register a citizen public user. Sends a welcome email asynchronously. Returns auth token + current active form.

Body: `form-data`

| Field | Example | Notes |
|---|---|---|
| `first_name` | Ada | |
| `last_name` | Okafor | |
| `phone` | 08012345678 | |
| `email` | ada@example.com | |
| `date_of_birth` | 1992-06-15 | |
| `gender` | female | `male \| female \| other` |
| `lga_id` | 1 | ID from `GET /public/lgas` |
| `means_of_id_type` | national_id | `national_id \| passport \| drivers_license \| voters_card` |
| `means_of_id` | *(file)* | jpg \| jpeg \| png \| pdf — max 10MB |
| `password` | Password@123 | |
| `password_confirmation` | Password@123 | |

Post-response script on this request:
```js
var res = pm.response.json();
if (res.success && res.data && res.data.token) {
  pm.collectionVariables.set('user_token', res.data.token);
}
```

---

### POST Register — Civil Servant
`POST {{base_url}}/api/v1/public/auth/register/civil-servant`

Register a civil servant public user. Sends a welcome email asynchronously. Returns auth token + current active form.

Body: `form-data`

| Field | Example | Notes |
|---|---|---|
| `first_name` | Emeka | |
| `last_name` | Nwosu | |
| `phone` | 08098765432 | |
| `email` | emeka@example.com | |
| `date_of_birth` | 1988-03-22 | |
| `gender` | male | `male \| female \| other` |
| `lga_id` | 1 | ID from `GET /public/lgas` |
| `mda_id` | 1 | ID from `GET /public/mdas` |
| `account_officer_email` | officer@lagosstate.gov.ng | |
| `account_officer_role` | Director of Finance | |
| `designation` | *(empty in collection)* | |
| `grade_level` | 12 | Integer 1–100 |
| `means_of_id_type` | staff_id | |
| `means_of_id` | *(file)* | jpg \| jpeg \| png \| pdf — max 10MB |
| `password` | Password@123 | |
| `password_confirmation` | Password@123 | |

---

### POST Login
`POST {{base_url}}/api/v1/public/auth/login`

Authenticate a public user (citizen or civil servant). Returns token + current active form so the frontend can redirect immediately after login.

```json
{
  "email": "ada@example.com",
  "password": "Password@123"
}
```

---

### POST Logout
`POST {{base_url}}/api/v1/public/auth/logout`

Revoke the current user token. No body.

---

### GET Me (Profile)
`GET {{base_url}}/api/v1/public/auth/me`

Returns the authenticated user's profile including ID document URL.

---

### POST Forgot Password
`POST {{base_url}}/api/v1/public/auth/forgot-password`

Send a password reset link to the user's email. Always returns 200 to prevent email enumeration. The reset link points to: `{FRONTEND_URL}/reset-password?token=...&email=...`

```json
{
  "email": "ada@example.com"
}
```

---

### POST Reset Password
`POST {{base_url}}/api/v1/public/auth/reset-password`

Reset the user's password using the token received by email. Revokes all existing sessions on success.

```json
{
  "token": "<token-from-reset-email>",
  "email": "ada@example.com",
  "password": "NewPassword@123",
  "password_confirmation": "NewPassword@123"
}
```

---

## 2. Public — Reference Data

### GET List Sectors
`GET {{base_url}}/api/v1/public/sectors`

Returns active sectors for the sector dropdown in the idea form. The entry with `is_others: true` ("Others") allows free-text custom input.

### GET List LGAs
`GET {{base_url}}/api/v1/public/lgas`

Returns all active Lagos State LGAs and LCDAs for the registration form.

### GET List MDAs
`GET {{base_url}}/api/v1/public/mdas`

Returns all active Lagos State MDAs for the civil servant registration form.

---

## 3. Public — Forms & Submissions

### POST Direct Media Upload
`POST {{base_url}}/api/v1/public/media/upload`

Upload a file asynchronously during form filling. Returns the relative file path to be passed in the submit form request. **Requires authentication.**

Body: `form-data`

| Field | Notes |
|---|---|
| `file` | jpg \| jpeg \| png \| pdf \| doc \| docx \| ppt \| pptx — max 10MB |

---

### GET Get Current Active Form
`GET {{base_url}}/api/v1/public/forms/current`

Returns the current active form including all its fields and field options. The frontend uses this to render the idea submission form. **Returns 404 if no active form exists.**

---

### POST Submit Idea
`POST {{base_url}}/api/v1/public/forms/{{event_code}}/submit`

Submit answers for the specified form. **Requires authentication.**

- **Sector field:** If the sector field answer is the code of the "Others" sector (which has `is_others: true`), also pass `"sector_other": "My custom sector name"` at the top level.
- **Array answers:** For `multi_select` and `checkbox` field types, pass `answer` as a JSON array.
- **File upload fields:** File fields no longer accept direct attachments on form submission. First upload the file using Direct Media Upload to get its path (e.g. `submission_files/some_name.pdf`), then submit that path string as the `answer` value.
- **Required fields:** Returns 422 with field-level errors if required fields are missing.
- All active admins receive an email notification when a submission is created.

```json
{
  "answers": [
    { "field_code": "FLD-XXXXXXXX", "answer": "A Smart Waste Collection System" },
    { "field_code": "FLD-YYYYYYYY", "answer": "Using IoT sensors to optimise refuse collection routes." },
    { "field_code": "FLD-ZZZZZZZZ", "answer": "SEC-XXXXXXXX" },
    { "field_code": "FLD-AAAAAAAA", "answer": "Yes" },
    { "field_code": "FLD-BBBBBBBB", "answer": ["Operational", "Service Oriented"] },
    { "field_code": "FLD-CCCCCCCC", "answer": "Individual" },
    { "field_code": "FLD-DDDDDDDD", "answer": "submission_files/ZrZEWkGzk5wfpiXtXhZLfZkW0B1uW7cHSoUFGZss.pdf" },
    { "field_code": "FLD-EEEEEEEE", "answer": ["I accept"] }
  ],
  "sector_other": null
}
```

---

## 4. Public — Admin Invitations

Public endpoints used by invited administrators to inspect tokens and set up their passwords.

### GET Get Invitation Details
`GET {{base_url}}/api/v1/public/invitations/{{invitation_token}}`

Verify and inspect an invitation token on the frontend accept page. Returns invitee name, email, role, and inviter name.

Example response (200 — "Get Details Success"):
```json
{
  "success": true,
  "message": "Invitation details retrieved.",
  "data": {
    "name": "Jane Doe",
    "email": "jane.doe@lagosstate.gov.ng",
    "role": "admin",
    "invited_by": "Super Admin",
    "is_accepted": false,
    "is_expired": false
  }
}
```

---

### POST Accept Invitation & Set Password
`POST {{base_url}}/api/v1/public/invitations/accept`

Accept invitation and set up admin password.
- Creates or activates the user account with `is_admin: true`.
- Marks the invitation accepted.
- Returns the authenticated user object and a Sanctum Bearer token.

Request body (as saved on this request):
```json
{
  "token": "{{invitation_token}}",
  "full_name": "Babajide Sanwo Olu",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
```

Example response (200 — "Accept Invitation Success"):
```json
{
  "success": true,
  "message": "Invitation accepted successfully. Welcome to OTCI Admin!",
  "data": {
    "user": {
      "code": "ADM-401",
      "name": "Jane Doe",
      "email": "jane.doe@lagosstate.gov.ng",
      "is_active": true
    },
    "token": "435|someSanctumPlainTextTokenHere..."
  }
}
```

> ⚠️ **Conflicting body shapes for the same URL.** This request sends `full_name`; the *Admin › Admin Management › Accept Invitation & Onboard Admin* request (see §13) sends `first_name` + `last_name` to the same endpoint, and its example response has a different shape. Confirm with the backend which body is current.

---

## 5. Admin — Message Previews (Modals)

Fetch pre-rendered email subject, body, and placeholders before opening confirmation modals.

### GET Single Message Preview (GET)
`GET {{base_url}}/admin/submissions/{{submission_code}}/message-preview`

Fetches pre-filled recipient email, name, subject, and body template for single-submission action modals.

| Query param | Example | Notes |
|---|---|---|
| `action` | `invite_interview` | **Required.** Options: `invite_interview` (or `interview`) \| `accept` \| `reject` \| `invite_idea_day` (or `idea_day`) \| `eligible` (or `mark_eligible`) \| `ineligible` (or `mark_ineligible`) \| `winner` (or `mark_winner`) |
| `scheduled_at` | `2026-10-30 10:00:00` | Optional for interview |
| `venue` | `Lagos State Secretariat, Alausa, Ikeja` | Optional venue |
| `reason` | `Duplicate idea or outside scope` | Optional for reject / ineligible |

---

### POST Single Message Preview (POST)
`POST {{base_url}}/admin/submissions/{{submission_code}}/message-preview`

POST version of single message preview. Useful when sending complex context payload in the request body.

```json
{
  "action": "invite_interview",
  "scheduled_at": "2026-10-30 10:00:00",
  "venue": "Lagos State Secretariat, Alausa, Ikeja"
}
```

---

### POST Bulk Message Preview (POST)
`POST {{base_url}}/admin/submissions/bulk-message-preview`

Preview bulk email template and list of recipients before executing a bulk action. Supports `select_all=true` with `filter_status`.

```json
{
  "action": "invite_interview",
  "submission_codes": ["{{submission_code}}"],
  "scheduled_at": "2026-10-30 09:00:00",
  "venue": "Lagos State Secretariat, Alausa, Ikeja"
}
```

---

## 6. Admin — Submissions

List submissions with filters, view details, export to CSV, and manage internal comments.

### GET List Submissions (with filters)
`GET {{base_url}}/admin/submissions`

Returns a paginated list of submissions with submitter details, sector, and current status.

**Top-level convenience fields for idea cards (Screens 1 & 2):**
- `title`: Project idea title (extracted automatically from form responses)
- `description`: Project idea summary / description

The frontend can bind card text directly to `title` and `description` without searching the answers array.

| Query param | Example | Notes |
|---|---|---|
| `status` | `pending` | `pending \| in_progress \| eligible \| ineligible \| invited_interview \| accepted \| rejected \| invited_idea_day \| winner` |
| `user_type` | `citizen` | `citizen \| civil_servant` |
| `form_code` | `{{form_code}}` | Filter by form code |
| `per_page` | `15` | |
| `page` | `1` | |
| `search` | *(empty in collection)* | |

Example response (200 — "Paginated Submissions with Title & Description"):
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "code": "SUB-2026-0001",
      "title": "Automated Traffic Decongestion System",
      "description": "An AI-powered traffic optimization solution for Lagos urban corridors.",
      "status": "eligible",
      "status_label": "Eligible",
      "user": {
        "id": 10,
        "first_name": "Babajide",
        "last_name": "Sanwo",
        "full_name": "Babajide Sanwo",
        "email": "user@example.com",
        "user_type": "citizen"
      },
      "sector": { "id": 2, "name": "Transportation" },
      "submitted_at": "2026-03-01T10:00:00.000000Z",
      "comments_count": 2
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta": { "current_page": 1, "from": 1, "last_page": 1, "per_page": 15, "to": 1, "total": 1 }
}
```

---

### GET Get Submission Statistics & Counts (Tabs & Status Breakdown)
`GET {{base_url}}/admin/submissions/stats`

Returns aggregate statistics for ideas tabs (All ideas, Citizens, Civil servants) and dynamic counts for all status checkboxes.

| Query param | Example | Notes |
|---|---|---|
| `from_date` | `2026-01-01` | Optional start date filter (YYYY-MM-DD) |
| `to_date` | `2026-12-31` | Optional end date filter (YYYY-MM-DD) |
| `form_code` | | Optional form code filter |

Example response (200 — "Live Tabs & Status Counts"):
```json
{
  "success": true,
  "message": "Submission statistics retrieved successfully.",
  "data": {
    "total": 120,
    "user_types": { "all": 120, "citizens": 75, "civil_servants": 45 },
    "by_status": {
      "pending":           { "key": "pending",           "label": "Pending",              "count": 15 },
      "in_progress":       { "key": "in_progress",       "label": "In Progress",          "count": 20 },
      "eligible":          { "key": "eligible",          "label": "Eligible",             "count": 35 },
      "ineligible":        { "key": "ineligible",        "label": "Ineligible",           "count": 10 },
      "invited_interview": { "key": "invited_interview", "label": "Invited Interview",    "count": 15 },
      "accepted":          { "key": "accepted",          "label": "Accepted",             "count": 12 },
      "rejected":          { "key": "rejected",          "label": "Rejected",             "count": 8 },
      "invited_idea_day":  { "key": "invited_idea_day",  "label": "Invited for idea day", "count": 3 },
      "winner":            { "key": "winner",            "label": "Winner",               "count": 2 }
    },
    "status_counts": {
      "pending": 15, "in_progress": 20, "eligible": 35, "ineligible": 10,
      "invited_interview": 15, "accepted": 12, "rejected": 8, "invited_idea_day": 3, "winner": 2
    }
  }
}
```

---

### GET Get Single Submission Details
`GET {{base_url}}/admin/submissions/{{submission_code}}`

Returns full details for a submission:
- Submitter profile & metadata
- Form answers mapped with questions
- `allowed_transitions` array (tells frontend which status actions are valid to show)
- Latest interview details and comment count

---

### POST Export Submissions (CSV or XLSX — Selected Codes OR Select All)
`POST {{base_url}}/admin/submissions/export`

Export submissions as CSV or native Excel (.xlsx).

**Two ways to export:**

1. **Specific checked submissions** (default / when individual checkboxes selected) — pass the list of submission codes in `codes`:
   ```json
   { "format": "xlsx", "codes": ["SUB-2026-0001", "SUB-2026-0004"], "select_all": false }
   ```
2. **Select all matching filters** (bulk database export) — pass `"select_all": true` with any optional filters. When `select_all` is true, the `codes` array is ignored and all matching records in the entire database are exported:
   ```json
   {
     "format": "xlsx",
     "select_all": true,
     "statuses": ["eligible", "accepted"],
     "from_date": "2026-01-01",
     "to_date": "2026-12-31",
     "user_type": "citizen"
   }
   ```

**Parameters reference:**
- `format`: `"xlsx"` (Excel) or `"csv"` (default: `"csv"`)
- `codes`: array of submission code strings (required when `select_all` is false)
- `select_all`: boolean. If true, exports all filtered submissions ignoring `codes`
- `statuses`: array of status strings (optional filter)
- `from_date`: start date YYYY-MM-DD (optional filter)
- `to_date`: end date YYYY-MM-DD (optional filter)
- `user_type`: `"citizen"` or `"civil_servant"` (optional filter)

Body saved on the request:
```json
{
  "format": "xlsx",
  "select_all": false,
  "codes": ["SUB-2026-0001", "SUB-2026-0004"],
  "statuses": ["eligible", "accepted"],
  "from_date": "2026-01-01",
  "to_date": "2026-12-31",
  "user_type": "citizen"
}
```

Example response (200): `<Binary XLSX / CSV Spreadsheet Content>`

---

### GET Get Submission Comments
`GET {{base_url}}/admin/submissions/{{submission_code}}/comments`

Retrieve all internal admin comments and action logs for a submission.

---

### POST Add Submission Comment
`POST {{base_url}}/admin/submissions/{{submission_code}}/comments`

Post an internal comment/note on a submission.

```json
{
  "body": "Reviewed submission notes and confirmed eligibility criteria."
}
```

---

## 7. Admin — Single Submission Actions

Endpoints to trigger individual submission lifecycle transitions and dispatch emails.

### POST Mark Eligible
`POST {{base_url}}/admin/submissions/{{submission_code}}/mark-eligible`
Alias: `POST {{base_url}}/admin/submissions/{{submission_code}}/eligible`

Transitions submission to `eligible` status and queues eligibility notification email.

```json
{ "custom_subject": "", "custom_body": "" }
```

---

### POST Mark Ineligible
`POST {{base_url}}/admin/submissions/{{submission_code}}/mark-ineligible`
Alias: `POST {{base_url}}/admin/submissions/{{submission_code}}/ineligible`

Transitions submission to `ineligible` status, records reason in comments, and sends notification email.

```json
{
  "reason": "The proposal does not sufficiently align with the priorities of the Lagos State T.H.E.M.E.S+ Agenda.",
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Invite to Interview
`POST {{base_url}}/admin/submissions/{{submission_code}}/invite-interview`
Alias: `POST {{base_url}}/admin/submissions/{{submission_code}}/interview`

Schedules interview, creates/updates interview record, transitions status to `invited_interview`, and emails concise invitation.

```json
{
  "scheduled_at": "2026-10-30 10:00:00",
  "venue": "Lagos State Secretariat, Alausa, Ikeja",
  "notes": "Bring identity document and presentation slides",
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Accept Idea (Post-Interview)
`POST {{base_url}}/admin/submissions/{{submission_code}}/accept`

Matches Figma `6-modal.png` (Accept idea modal).
- Transitions status to `accepted`.
- Records approval notes into submission comment history.
- Dispatches Acceptance Notification Mail.

```json
{
  "notes": "Excellent presentation and viable implementation model.",
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Reject Idea (Post-Interview)
`POST {{base_url}}/admin/submissions/{{submission_code}}/reject`

Matches Figma `5-modal.png` (Reject idea modal).
- Transitions status to `rejected`.
- Logs rejection feedback reason.
- Dispatches concise Rejection Notice Mail.

```json
{
  "reason": "Not feasible within the current operational scope.",
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Invite to Idea Day
`POST {{base_url}}/admin/submissions/{{submission_code}}/invite-idea-day`
Alias: `POST {{base_url}}/admin/submissions/{{submission_code}}/idea-day`

Matches Figma `4-modal.png`.
- Transitions status to `invited_idea_day`.
- Pulls event defaults if parameters omitted.
- Dispatches Idea Day Invitation Mail.

```json
{
  "idea_day_date": "2026-11-25",
  "idea_day_time": "10:00 AM – 4:00 PM",
  "idea_day_venue": "Adeyemi Bero Auditorium, Alausa, Ikeja",
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Mark as Winner
`POST {{base_url}}/admin/submissions/{{submission_code}}/mark-winner`
Alias: `POST {{base_url}}/admin/submissions/{{submission_code}}/winner`

Transitions submission to `winner` status and queues Winner Announcement Mail.

```json
{ "custom_subject": "", "custom_body": "" }
```

---

### PUT Generic Status Transition
`PUT {{base_url}}/admin/submissions/{{submission_code}}/status`

Directly transition to any valid next status according to `allowed_transitions`.

```json
{
  "status": "eligible",
  "notes": "Direct manual transition"
}
```

---

## 8. Admin — Bulk Submission Actions

Perform batch actions across multiple submissions with a single API call.

### POST Bulk Mark Eligible
`POST {{base_url}}/admin/submissions/bulk-mark-eligible`
Alias: `POST {{base_url}}/admin/submissions/bulk-eligible`

Batch mark multiple submissions as eligible.

```json
{
  "submission_codes": ["{{submission_code}}"],
  "select_all": false,
  "filter_status": "pending",
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Bulk Mark Ineligible
`POST {{base_url}}/admin/submissions/bulk-mark-ineligible`
Alias: `POST {{base_url}}/admin/submissions/bulk-ineligible`

Batch mark multiple submissions as ineligible with a shared reason.

```json
{
  "submission_codes": ["{{submission_code}}"],
  "reason": "Does not align with the priorities of the Lagos State T.H.E.M.E.S+ Agenda.",
  "select_all": false,
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Bulk Invite Interview
`POST {{base_url}}/admin/submissions/bulk-invite-interview`
Alias: `POST {{base_url}}/admin/submissions/bulk-interview`

Batch schedule interviews for shortlisted ideas.

```json
{
  "submission_codes": ["{{submission_code}}"],
  "scheduled_at": "2026-10-30 09:00:00",
  "venue": "Lagos State Secretariat, Alausa, Ikeja",
  "select_all": false,
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Bulk Accept
`POST {{base_url}}/admin/submissions/bulk-accept`

Batch accept multiple submissions after interview stage.

```json
{
  "submission_codes": ["{{submission_code}}"],
  "notes": "Bulk accepted following successful panel interview sessions.",
  "select_all": false,
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Bulk Reject
`POST {{base_url}}/admin/submissions/bulk-reject`

Batch reject multiple submissions after interview stage.

```json
{
  "submission_codes": ["{{submission_code}}"],
  "reason": "Not selected for progression to the next stage.",
  "select_all": false,
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Bulk Invite Idea Day
`POST {{base_url}}/admin/submissions/bulk-invite-idea-day`
Alias: `POST {{base_url}}/admin/submissions/bulk-idea-day`

Batch invite accepted ideas to the Idea Day showcase event.

```json
{
  "submission_codes": ["{{submission_code}}"],
  "idea_day_date": "2026-11-25",
  "idea_day_time": "10:00 AM – 4:00 PM",
  "idea_day_venue": "Adeyemi Bero Auditorium, Alausa, Ikeja",
  "select_all": false,
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Bulk Mark Winner
`POST {{base_url}}/admin/submissions/bulk-mark-winner`
Alias: `POST {{base_url}}/admin/submissions/bulk-winner`

Batch mark winning submissions.

```json
{
  "submission_codes": ["{{submission_code}}"],
  "select_all": false,
  "custom_subject": "",
  "custom_body": ""
}
```

---

### POST Bulk Universal Status
`POST {{base_url}}/admin/submissions/bulk-status`

Universal bulk status transition endpoint supporting any valid status transition.

```json
{
  "status": "eligible",
  "submission_codes": ["{{submission_code}}"],
  "select_all": false
}
```

---

## 9. Admin — Auth

### POST Login
`POST {{base_url}}/api/v1/public/auth/login`

Authenticate an admin user. Returns a Sanctum token. Only accounts with `is_admin = true` can log in here.

```json
{
  "email": "product.mydeslynk@gmail.com",
  "password": "password"
}
```

> Same URL as Public › Auth › Login.

---

### POST Logout
`POST {{base_url}}/api/v1/admin/logout`

Revoke the current admin token.

---

### GET Profile
`GET {{base_url}}/api/v1/admin/profile`

Returns the authenticated admin's profile.

---

## 10. Admin — Reference Data

### GET Sectors — List
`GET {{base_url}}/api/v1/admin/sectors`

Returns all sectors (active and inactive). Admin can see `is_others` flag.

### POST Sectors — Create
`POST {{base_url}}/api/v1/admin/sectors`

Create a new sector. Name must be unique.

```json
{ "name": "Maritime & Ports", "is_active": true }
```

### PUT Sectors — Update
`PUT {{base_url}}/api/v1/admin/sectors/{{sector_code}}`

Update an existing sector.

```json
{ "name": "Maritime, Ports & Shipping", "is_active": true }
```

---

### GET MDAs — List
`GET {{base_url}}/api/v1/admin/mdas`

Returns all MDAs (active and inactive).

### POST MDAs — Create
`POST {{base_url}}/api/v1/admin/mdas`

Create a new MDA. `type` must be one of: `ministry | agency | department`.

```json
{
  "name": "Lagos State Sports Commission",
  "abbreviation": "LSSC",
  "type": "agency",
  "is_active": true
}
```

### PUT MDAs — Update
`PUT {{base_url}}/api/v1/admin/mdas/{{mda_code}}`

Update an existing MDA.

```json
{
  "name": "Lagos State Sports Commission",
  "abbreviation": "LSSC",
  "type": "agency",
  "is_active": false
}
```

---

### GET LGAs — List
`GET {{base_url}}/api/v1/admin/lgas`

Returns all Lagos LGAs and LCDAs. Read-only — LGA data is managed by system seed.

---

## 11. Admin — Events (Forms)

### GET List Events
`GET {{base_url}}/api/v1/admin/events`

Returns a paginated list of all idea forms (events), newest first.

---

### POST Create Event
`POST {{base_url}}/api/v1/admin/events`

Create a new idea form / event.

**Idea Day settings:**
- `idea_day_date` (date, optional): Date of the Ideas Day presentation event (e.g. `2026-11-25`).
- `idea_day_time` (string, optional): Time of Ideas Day (e.g. `09:00 AM`).
- `idea_day_venue` (string, optional): Venue for Ideas Day.

These settings are automatically retrieved when sending Idea Day invitations to shortlisted innovators.

```json
{
  "title": "OTCI Innovation Challenge 2025",
  "description": "Submit your best ideas to transform Lagos State.",
  "start_date": "2025-06-01",
  "end_date": "2025-07-31",
  "is_active": true,
  "is_accepting_responses": true,
  "is_current": true,
  "idea_day_date": "2026-11-25",
  "idea_day_time": "09:00 AM",
  "idea_day_venue": "Adeyemi Bero Auditorium, Alausa, Ikeja"
}
```

---

### GET Get Event
`GET {{base_url}}/api/v1/admin/events/{{event_code}}`

Returns full event details including all fields and field options.

---

### PUT Update Event
`PUT {{base_url}}/api/v1/admin/events/{{event_code}}`

Update event settings, including Idea Day schedule and venue (`idea_day_date`: YYYY-MM-DD, `idea_day_time`: e.g. `10:00 AM`, `idea_day_venue`: string).

A snapshot of the **previous** state is automatically saved to history before the update is applied.

```json
{
  "title": "OTCI Innovation Challenge 2025 — Extended",
  "description": "Submit your best ideas to transform Lagos State.",
  "start_date": "2025-06-01",
  "end_date": "2025-08-31",
  "is_active": true,
  "is_accepting_responses": true,
  "is_current": true,
  "idea_day_date": "2026-11-25",
  "idea_day_time": "10:00 AM",
  "idea_day_venue": "Adeyemi Bero Auditorium, Alausa, Ikeja"
}
```

---

### DELETE Delete Event
`DELETE {{base_url}}/api/v1/admin/events/{{event_code}}`

Delete an event. **Returns 409 Conflict if the event has existing submissions.**

---

### GET Fields — List
`GET {{base_url}}/api/v1/admin/events/{{event_code}}/fields`

Returns all fields for the event in `sort_order` order.

---

### POST Fields — Add
`POST {{base_url}}/api/v1/admin/events/{{event_code}}/fields`

Add a field to an event.

- **Field types:** `short_text | long_text | radio | checkbox | dropdown | multi_select | date | number`
- **Options:** Required for `radio`, `checkbox`, `dropdown`, `multi_select` field types.
- **`template_key`:** Only set to `"sector"` for the sector dropdown. This causes the backend to validate the answer against the sectors table and store `sector_id` on the submission.

```json
{
  "question_label": "Select your sector",
  "field_type": "dropdown",
  "placeholder_text": "Choose a sector...",
  "helper_text": "Select the sector your idea belongs to.",
  "is_required": true,
  "template_key": "sector",
  "options": []
}
```

---

### POST Fields — Add (with options)
`POST {{base_url}}/api/v1/admin/events/{{event_code}}/fields`

Add a field with pre-defined options (radio, checkbox, dropdown, or multi_select).

```json
{
  "question_label": "Is this idea technology-driven?",
  "field_type": "radio",
  "is_required": true,
  "template_key": null,
  "options": [
    { "label": "Yes" },
    { "label": "No" }
  ]
}
```

---

### PUT Fields — Update
`PUT {{base_url}}/api/v1/admin/events/{{event_code}}/fields/{{field_code}}`

Update an existing field. Old answers for this field remain in the DB but will be displayed under the new `question_label`.

```json
{
  "question_label": "Which sector does your idea address?",
  "field_type": "dropdown",
  "placeholder_text": "Choose a sector...",
  "helper_text": null,
  "is_required": true,
  "template_key": "sector",
  "options": []
}
```

---

### DELETE Fields — Delete
`DELETE {{base_url}}/api/v1/admin/events/{{event_code}}/fields/{{field_code}}`

Delete a field. Existing submission answers for this field have their `form_field_id` set to NULL (they remain in DB for audit but are excluded from the API response).

---

### PUT Fields — Reorder
`PUT {{base_url}}/api/v1/admin/events/{{event_code}}/fields/reorder`

Reorder fields by setting explicit `sort_order` values. Submit an array of all field codes with their new positions.

```json
{
  "fields": [
    { "code": "FLD-AAAAAAAA", "sort_order": 1 },
    { "code": "FLD-BBBBBBBB", "sort_order": 2 },
    { "code": "FLD-CCCCCCCC", "sort_order": 3 }
  ]
}
```

---

### GET History — List Snapshots
`GET {{base_url}}/api/v1/admin/events/{{event_code}}/history`

Returns the version history (up to 15 snapshots) for an event, newest first. Each entry shows the snapshot code, reason, and timestamp. The full field list is NOT exposed — admin cannot preview snapshot fields before restoring.

---

### POST History — Restore Snapshot
`POST {{base_url}}/api/v1/admin/events/{{event_code}}/history/{{snapshot_code}}/restore`

Restore an event to a previous snapshot. The **current** state is snapshotted (with reason `restored_from`) before the restore is applied, so the current state is not lost. Existing submissions remain linked to the form.

---

## 12. Admin — Users

### GET List Public Users
`GET {{base_url}}/api/v1/admin/users`

Returns a paginated list of all public (non-admin) users. Returns full profile including ID document URL.

| Query param | Example | Notes |
|---|---|---|
| `user_type` | `citizen` | `citizen \| civil_servant` |
| `search` | `Ada` | Search by first name, last name, email, or phone |
| `page` | `1` | |

---

## 13. Admin — Admin Management

Manage administrator accounts and team invitations.

### GET Admin Stats (KPIs)
`GET {{base_url}}/api/v1/admin/admins/stats`

Retrieve KPI statistics matching Screen 1 summary cards.

Example response (200 — "Stats Success"):
```json
{
  "success": true,
  "data": {
    "total_admins": 12,
    "active_admins": 9,
    "super_admins": 2,
    "pending_invites": 2,
    "pending_invitations": 2,
    "deactivated_admins": 1
  }
}
```

---

### GET List Administrators (Unified)
`GET {{base_url}}/api/v1/admin/admins?view=unified&status=all`

Retrieve unified listing matching Screen 1 table. Combines active administrators, pending invitations, and deactivated administrators with uniform schema, role labels, and available action permissions.

| Query param | Example | Notes |
|---|---|---|
| `view` | `unified` | Required for unified list |
| `status` | `all` | Filter by: `all`, `active`, `invited` (or `pending`), `deactivated` |
| `per_page` | `15` | |
| `page` | `1` | |

Example response (200 — "Unified List Success"):
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_admins": 12,
      "active_admins": 9,
      "super_admins": 2,
      "pending_invites": 2,
      "pending_invitations": 2,
      "deactivated_admins": 1
    },
    "data": [
      {
        "id": 1,
        "code": "ADM-001",
        "type": "admin",
        "name": "Babatunde Fashola",
        "email": "bfashola@lagosstate.gov.ng",
        "role": "super_admin",
        "role_label": "Super Admin",
        "status": "active",
        "status_label": "Active",
        "date_added": "May 10, 2026",
        "added_by": "System",
        "available_actions": ["change_role", "deactivate"],
        "can_change_role": true,
        "can_deactivate": true,
        "can_reactivate": false,
        "can_resend_invite": false,
        "can_revoke_invite": false
      },
      {
        "id": 4,
        "code": null,
        "type": "invitation",
        "name": "Folashade Tinubu",
        "email": "folashade@lagosstate.gov.ng",
        "role": "admin",
        "role_label": "Admin",
        "status": "invited",
        "status_label": "Invited",
        "date_added": "Oct 5, 2026",
        "added_by": "Babatunde Fashola",
        "available_actions": ["resend_invite", "revoke_invite"],
        "can_change_role": false,
        "can_deactivate": false,
        "can_reactivate": false,
        "can_resend_invite": true,
        "can_revoke_invite": true
      }
    ],
    "meta": { "current_page": 1, "per_page": 15, "total": 2, "last_page": 1 }
  }
}
```

---

### GET Invitation Message Preview
`GET {{base_url}}/api/v1/admin/invitations/preview?role=admin`

Preview default invitation subject and body matching Screen 2 modal preview box.

| Query param | Example | Notes |
|---|---|---|
| `role` | `admin` | `admin` or `super_admin` |

Example response (200 — "Preview Success"):
```json
{
  "success": true,
  "data": {
    "role": "admin",
    "role_label": "Admin",
    "inviter_name": "Babajide Sanwo-Olu",
    "expires_at": "Monday, 12 October 2026",
    "expires_in_days": 7,
    "default_subject": "You've been invited to the OTCI Admin Portal",
    "default_body": "Hello,\n\nBabajide Sanwo-Olu has invited you to join the OTCI Admin Portal (Creativity & Innovation Management) as an Admin.\n\nAccept invitation ->\n\nThe link expires on Monday, 12 October 2026. If you weren't expecting this, you can ignore this email.\n\nOTCI Creativity & Innovation Team",
    "subject": "You've been invited to the OTCI Admin Portal",
    "preview_body": "Hello,\n\nBabajide Sanwo-Olu has invited you to join the OTCI Admin Portal (Creativity & Innovation Management) as an Admin.\n\nAccept invitation ->\n\nThe link expires on Monday, 12 October 2026. If you weren't expecting this, you can ignore this email.\n\nOTCI Creativity & Innovation Team",
    "sample_button_text": "Accept invitation ->",
    "note": "The link expires on Monday, 12 October 2026. If you weren't expecting this, you can ignore this email.",
    "allowed_placeholders": ["{inviter_name}", "{role_label}", "{expires_at}"]
  }
}
```

---

### POST Invite Administrator (Single)
`POST {{base_url}}/api/v1/admin/invitations`

Invite a new user to join the platform as an administrator. Dispatches an invitation email with a secure setup link. Link is valid for 7 days.

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@lagosstate.gov.ng",
  "role": "admin"
}
```

Example response (201 — "Invite Admin Success"):
```json
{
  "success": true,
  "message": "Administrator invitation sent successfully.",
  "data": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane.doe@lagosstate.gov.ng",
    "role": "admin",
    "invited_by": "Super Admin",
    "is_accepted": false,
    "is_expired": false,
    "expires_at": "2026-10-10T21:00:00.000000Z"
  }
}
```

---

### POST Invite Administrators (Batch / Screen 2 Modal)
`POST {{base_url}}/api/v1/admin/invitations`

Send invitations to multiple administrators simultaneously matching Screen 2 modal. Supports multiple email inputs, role selection (`admin` / `super_admin`), and optional customized subject and body.

```json
{
  "emails": ["colleague1@otci.gov.ng", "colleague2@otci.gov.ng"],
  "role": "admin",
  "custom_subject": "Invitation to join OTCI Admin Portal",
  "custom_body": "Hello,\n\nYou have been invited to join the OTCI Admin Portal as an Admin."
}
```

Example response (201 — "Batch Invite Success"):
```json
{
  "success": true,
  "message": "2 administrator invitation(s) sent successfully.",
  "data": {
    "success": true,
    "total_sent": 2,
    "sent": [
      { "email": "colleague1@otci.gov.ng", "status": "sent", "invitation_id": 5 },
      { "email": "colleague2@otci.gov.ng", "status": "sent", "invitation_id": 6 }
    ],
    "skipped": []
  }
}
```

> Single and batch invite share the same URL; the request bodies differ (`name` + `email` vs `emails[]`).

---

### PUT Change Admin Role
`PUT {{base_url}}/api/v1/admin/admins/{{admin_code}}/role`

Change an administrator's role between `admin` and `super_admin`. Protected by a safeguard ensuring at least one active Super Admin always remains in the system.

```json
{ "role": "super_admin" }
```

Example response (200 — "Change Role Success"):
```json
{
  "success": true,
  "message": "Administrator role updated successfully.",
  "data": {
    "code": "ADM-002",
    "name": "Jane Doe",
    "email": "jane.doe@lagosstate.gov.ng",
    "role": "super_admin",
    "role_label": "Super Admin",
    "status": "active",
    "status_label": "Active",
    "is_active": true,
    "date_added": "May 10, 2026"
  }
}
```

---

### PUT Deactivate Administrator
`PUT {{base_url}}/api/v1/admin/admins/{{admin_code}}/deactivate`

Deactivate an administrator account.
- Revokes all active user tokens immediately.
- Protected against self-deactivation.
- Protected against deactivating the last active Super Admin.

Example response (200 — "Deactivate Admin Success"):
```json
{
  "success": true,
  "message": "Administrator account deactivated.",
  "data": {
    "code": "ADM-002",
    "name": "Jane Doe",
    "email": "jane.doe@lagosstate.gov.ng",
    "role": "admin",
    "role_label": "Admin",
    "status": "deactivated",
    "status_label": "Deactivated",
    "is_active": false,
    "date_added": "May 10, 2026"
  }
}
```

---

### PUT Reactivate Administrator
`PUT {{base_url}}/api/v1/admin/admins/{{admin_code}}/reactivate`

Reactivate a previously deactivated administrator account, enabling them to sign in again.

Example response (200 — "Reactivate Admin Success"):
```json
{
  "success": true,
  "message": "Administrator account reactivated.",
  "data": {
    "code": "ADM-002",
    "name": "Jane Doe",
    "email": "jane.doe@lagosstate.gov.ng",
    "role": "admin",
    "role_label": "Admin",
    "status": "active",
    "status_label": "Active",
    "is_active": true,
    "date_added": "May 10, 2026"
  }
}
```

---

### POST Resend Invitation
`POST {{base_url}}/api/v1/admin/invitations/{{invitation_id}}/resend`

Regenerates invitation token, resets expiry to +7 days, and resends email.

Example response (200 — "Resend Invitation Success"):
```json
{
  "success": true,
  "message": "Administrator invitation resent successfully.",
  "data": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane.doe@lagosstate.gov.ng",
    "is_accepted": false
  }
}
```

---

### DELETE Revoke Invitation
`DELETE {{base_url}}/api/v1/admin/invitations/{{invitation_id}}`

Revokes and cancels a pending administrator invitation.

Example response (200 — "Revoke Invitation Success"):
```json
{
  "success": true,
  "message": "Administrator invitation revoked.",
  "data": null
}
```

---

### GET List Administrators
`GET {{base_url}}/api/v1/admin/admins`

Retrieve paginated list of all active administrator users.

Example response (200 — "List Admins Success"):
```json
{
  "success": true,
  "data": [
    {
      "code": "ADM-001",
      "first_name": "Super",
      "last_name": "Admin",
      "name": "Super Admin",
      "email": "admin@lagosstate.gov.ng",
      "is_active": true
    }
  ],
  "meta": { "current_page": 1, "per_page": 15, "total": 1 }
}
```

---

### GET List Invitations
`GET {{base_url}}/api/v1/admin/invitations`

List sent administrator invitations, showing pending/accepted status and expiry.

Example response (200 — "List Invitations Success"):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Folashade Tinubu",
      "email": "folashade@example.com",
      "role": "admin",
      "invited_by": "Super Admin",
      "is_accepted": false,
      "is_expired": false,
      "accepted_at": null,
      "expires_at": "2026-10-10T21:00:00.000000Z"
    }
  ],
  "meta": { "current_page": 1, "per_page": 15, "total": 1 }
}
```

---

### POST Validate Invitation Token (Frontend Onboarding Page)
`POST {{base_url}}/api/v1/public/invitations/validate`
Also works via: `GET {{base_url}}/api/v1/public/invitations/validate?token=...`

Called by the frontend onboarding page when the user opens `?invite_token=...` or `?token=...`.

Backend checks:
- If token exists and has not expired → returns `valid: true` and the invitation email so the frontend can prefill it.
- If token does not exist or has expired / already accepted → returns `valid: false` and the failure reason.

```json
{ "token": "secret-invitation-token-12345" }
```

Example response (200 — "Valid Token"):
```json
{
  "success": true,
  "message": "Invitation token is valid.",
  "data": {
    "valid": true,
    "email": "invitee@example.com",
    "name": "Invitee Name",
    "role": "admin",
    "role_label": "Admin",
    "expires_at": "2026-10-13T14:00:00.000000Z",
    "inviter_name": "System Administrator"
  }
}
```

> The collection also has a "200 OK - Invalid or Expired Token" example on this request; its body was not shown in the documentation view.

---

### POST Accept Invitation & Onboard Admin (Submit Password)
`POST {{base_url}}/api/v1/public/invitations/accept`

Submitted by the frontend when the invited admin fills out their onboarding form. Backend re-validates the token, assigns the admin role, sets password, activates the account, and marks the invitation accepted.

**Note:** Any submitted `email` field is ignored for security; the invitation email is strictly used.

```json
{
  "token": "QhswX2H58euZF9aAx9niOxqrXOy9jSCAkQA7sJbX5hQzgZ6ZC9vIaDxHSitA",
  "first_name": "Kola",
  "last_name": "Yusuf",
  "password": "BigMaya2026!",
  "password_confirmation": "BigMaya2026!"
}
```

Example response (200 — "Admin Account Created & Logged In"):
```json
{
  "success": true,
  "message": "Invitation accepted successfully. Welcome to OTCI Admin!",
  "data": {
    "user": {
      "id": 15,
      "code": "ADM-0015",
      "name": "First Last",
      "first_name": "First",
      "last_name": "Last",
      "email": "invitee@example.com",
      "role": "admin",
      "role_label": "Admin",
      "status": "active"
    },
    "token": "15|v4kG7X9..."
  }
}
```

---

## Open questions to confirm with the backend

These come straight from contradictions or gaps inside the collection itself:

1. **Pagination key** — collection overview says `pagination`; saved examples show `meta` (+ `links` on submissions).
2. **Accept invitation body** — `full_name` (Public › Admin Invitations) vs `first_name` + `last_name` (Admin Management) for the same URL, with different response shapes.
3. **`/admin/submissions` prefix** — submission routes have no `/api/v1` while every other route does.
4. **Response bodies not documented** for: Register (both), Login, Me, List Sectors/LGAs/MDAs, Get Current Active Form, Submit Idea, Direct Media Upload, message previews, Get Single Submission, comments, all single/bulk actions, Admin Profile, admin reference data, all Events/Fields/History endpoints, and List Public Users.
5. **Invalid/expired token response** for Validate Invitation Token exists in the collection but its body wasn't visible in the docs view.
