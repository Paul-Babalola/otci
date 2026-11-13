// OTCI API — import from here.
//
//   import { api, ApiError } from './api';
//   const sectors = await api.public.reference.sectors();
//   const { items, page } = await api.admin.submissions.list({ status: 'pending' });
//   const page = await api.cms.pages.get('bos');
//   await api.cms.feedback.submit({ mda_code: 'MDA-001', message: 'Great service' });
//
// See docs/api-integration.md for setup and the open questions on the spec.

import * as publicApi from './public.js';
import * as adminApi from './admin.js';
import * as cmsApi from './cmsPublic.js';

export const api = { public: publicApi, admin: adminApi, cms: cmsApi };

export {
  ApiError, API_BASE_URL, getToken, setToken, clearToken, onUnauthorized,
  toPage, toFormData, saveBlob, request, call, list,
} from './client.js';
export { uploadedPath } from './public.js';
export { cmsPages, cmsGallery, cmsFeedback, cmsNewsletter, cmsContact, cmsCharters } from './cmsPublic.js';
