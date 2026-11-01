// OTCI API — import from here.
//
//   import { api, ApiError } from './api';
//   const sectors = await api.public.reference.sectors();
//   const { items, page } = await api.admin.submissions.list({ status: 'pending' });
//
// See docs/api-integration.md for setup and the open questions on the spec.

import * as publicApi from './public.js';
import * as adminApi from './admin.js';

export const api = { public: publicApi, admin: adminApi };

export {
  ApiError, API_BASE_URL, getToken, setToken, clearToken, onUnauthorized,
  toPage, toFormData, saveBlob, request, call, list,
} from './client.js';
export { uploadedPath } from './public.js';
