# CMS (OTCI Studio) vs the OTCI API

Every CMS screen and action, and whether the Postman collection has an endpoint for it.

| # | Screen | Action | API exists? |
|---|---|---|---|
| 1 | Login | Send a 6-digit code to the email | ❌ (only email + password login exists) |
| 2 | Login | Verify the code | ❌ |
| 3 | Sidebar | Show who is signed in | ✅ `GET /admin/profile` |
| 4 | Sidebar | Log out | ✅ `POST /admin/logout` |
| 5 | Overview | Dashboard numbers | ❌ (needs rows 6–24) |
| 6 | Pages | List pages and sections | ❌ |
| 7 | Pages | Edit a section (save draft) | ❌ |
| 8 | Pages | Upload an image or PDF in a section | ❌ |
| 9 | Pages | Reorder, show/hide, delete a section | ❌ |
| 10 | Pages | Discard changes | ❌ |
| 11 | Pages | Send for review / withdraw | ❌ |
| 12 | Pages | Publish a page | ❌ |
| 13 | Service charters | List charters | ❌ |
| 14 | Service charters | Create, edit, delete a charter | ❌ |
| 15 | Service charters | Publish / move to drafts / coming soon | ❌ |
| 16 | Service charters | Attach the signed PDF | ❌ |
| 17 | Service charters | Import / export JSON | ❌ (done in the browser for now) |
| 18 | Service charters | MDA names | ⚠️ `GET /admin/mdas` exists, but charters aren't linked to it |
| 19 | Media library | List, create, rename, delete folders | ❌ |
| 20 | Media library | Show/hide a folder | ❌ |
| 21 | Media library | Upload images, set cover, delete image | ❌ |
| 22 | Activity | Activity log | ❌ |
| 23 | Department admins | List admins | ✅ `GET /admin/admins?view=unified` |
| 24 | Department admins | Invite an admin | ⚠️ `POST /admin/invitations` exists, but has no department field and uses `admin`/`super_admin`, not `editor`/`super` |
| 25 | Department admins | Remove an admin | ⚠️ only deactivate (`PUT /admin/admins/{code}/deactivate`) or revoke an invite (`DELETE /admin/invitations/{id}`) |
| 26 | How it's built | Export site content | ❌ |

**Summary:** 3 of 26 exist, 3 partly, 20 missing. Everything the CMS edits (pages, charters, media, activity) has no API.

**Design conflict:** the CMS's own "How it's built" screen describes no backend: static JSON files in a GitHub repo. The Postman API is a Laravel backend. The team should pick one before the content APIs are built.

**Not in this CMS:** the Postman admin endpoints for idea submissions, events/forms, sectors and public users have no screen here.
