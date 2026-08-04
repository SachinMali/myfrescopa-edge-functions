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

// Shared auth for all upstream API calls.
// Handlers never touch tokens directly — each API client calls getApiToken() with its own key.
// Tokens are stored in Fastly Secret Store (local values in fastly.toml for development).

import { SecretStoreManager } from "./config.js";

// Map each upstream API to its Secret Store key. One token per backend.
const SECRETS = {
  CATALOG: "CATALOG_API_TOKEN",
  DELIVERY: "DELIVERY_API_TOKEN",
};

// Read a token by key from Fastly Secret Store (via SecretStoreManager in config.js).
async function getApiToken(secretKey) {
  return SecretStoreManager.getSecret(secretKey);
}

// Production pattern: load token, attach Authorization header, fetch upstream API.
async function authorizedFetch(url, secretKey, options = {}) {
  const apiToken = await getApiToken(secretKey);
  const request = new Request(url, options);
  request.headers.set("Authorization", `Bearer ${apiToken}`);
  return fetch(request);
}

export { SECRETS, getApiToken, authorizedFetch };
