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

// Entry point for this Edge Function (built from ./src/index.js → ./bin/main.wasm).
//
// Request flow (tutorial):
//   1. index.js        — match URL path → delegate to a handler
//   2. handlers/       — validate input, orchestrate upstream API calls
//   3. mocks/ (demo)   — stand-in APIs; each loads its own token from Secret Store
//   4. lib/api-client  — shared auth helpers (getApiToken, authorizedFetch)
//
// Add a new endpoint: create handlers/<feature>/handler.js, then register its path below.

import * as response from './lib/response.js';
import { applyCors, corsPreflightResponse } from './lib/cors.js';
import { log } from './lib/log.js';
import { estimatedDeliveryBySkuAndPostcodeHandler } from "./handlers/estimated-delivery/handler.js";

const ESTIMATED_DELIVERY_ROUTE = "/api/frescopa/estimated-delivery";

// Fastly Compute listens for every incoming request here.
addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

function normalizePathname(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

async function handleRequest(event) {
  const req = event.request;
  const url = new URL(req.url);
  const pathname = normalizePathname(url.pathname);

  let finalResponse;

  try {
    // Route table — index.js only routes; business logic lives in handlers/.
    if (pathname === ESTIMATED_DELIVERY_ROUTE) {
      if (req.method === "OPTIONS") {
        finalResponse = corsPreflightResponse(req);
      } else if (req.method === "GET") {
        // Handler calls upstream APIs (mocks in this tutorial, real APIs in production).
        finalResponse = await estimatedDeliveryBySkuAndPostcodeHandler(req);
      } else {
        finalResponse = response.methodNotAllowed();
      }
    } else {
      finalResponse = response.notFound();
    }
  } catch (err) {
    // Upstream API or secret-store failures surface here as a generic 500.
    console.log(err);
    finalResponse = response.error();
  }

  finalResponse = applyCors(req, finalResponse);

  log(req, finalResponse);

  return finalResponse;
}
