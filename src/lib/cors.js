/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/// <reference types="@fastly/js-compute" />

// Origins permitted to call this API cross-origin (e.g. local aem up → Edge Function).
// Same-origin production traffic does not send Origin and needs no CORS header.
//
// Use exact matches for fixed hosts; use regex for gradual rollout environments.

const ALLOWED_ORIGIN_EXACT = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

// prod, dev, and stage Frescopa on enablementadobe.com
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(dev-|stage-)?myfrescopa\.enablementadobe\.com$/,
];

function isAllowedOrigin(origin) {
  if (!origin) {
    return false;
  }

  if (ALLOWED_ORIGIN_EXACT.has(origin)) {
    return true;
  }

  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

function applyCors(request, response) {
  const origin = request.headers.get("Origin");

  if (!isAllowedOrigin(origin)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin);
  headers.set("vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function corsPreflightResponse(request) {
  const origin = request.headers.get("Origin");

  if (!isAllowedOrigin(origin)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "access-control-max-age": "86400",
      vary: "Origin",
    },
  });
}

export { applyCors, corsPreflightResponse };
