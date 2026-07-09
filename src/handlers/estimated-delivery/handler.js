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

// Handler for GET /api/frescopa/estimated-delivery
// Invoked by index.js — does not handle routing or secrets directly.
//
// Orchestration:
//   1. Parse & validate query params (sku, postcode)
//   2. Call catalog API  → mocks/catalog/product-api.js  (token: CATALOG_API_TOKEN)
//   3. Call fulfillment API → mocks/delivery/delivery-api.js (token: DELIVERY_API_TOKEN)
//   4. Merge both results into one JSON response (see responses.js)

import { getProductBySku } from "../../mocks/catalog/product-api.js";
import { getEstimatedDeliveryByPostcode } from "../../mocks/delivery/delivery-api.js";
import { json } from "../../lib/response.js";
import { DEFAULT_SKU } from "./constants.js";
import {
  missingPostcodeError,
  unknownSkuError,
  buildSuccessResponse,
} from "./responses.js";

async function estimatedDeliveryBySkuAndPostcodeHandler(req) {
  const url = new URL(req.url);
  const skuParam = url.searchParams.get("sku");
  const postcodeParam = url.searchParams.get("postcode");
  const sku = (skuParam ?? DEFAULT_SKU).trim();
  const postcode = (postcodeParam ?? "").trim();

  console.log(
    `Estimated delivery request: sku=${sku}, postcode=${postcode || "(missing)"}`,
  );

  if (!postcode) {
    return missingPostcodeError(skuParam);
  }

  // Each call below loads its own API token from Fastly Secret Store (see lib/api-client.js).
  // Tutorial: returns mock data. Production: swap mocks/ imports for lib/ API clients.

  // API 1 — Catalog service (CATALOG_API_TOKEN)
  const product = await getProductBySku(sku);
  if (!product) {
    return unknownSkuError(sku, postcode);
  }

  // API 2 — Fulfillment service (DELIVERY_API_TOKEN)
  const fulfillment = await getEstimatedDeliveryByPostcode(postcode);

  const responseBody = buildSuccessResponse(product, fulfillment);
  console.log("Estimated delivery response:\n", responseBody);

  return json(responseBody);
}

export { estimatedDeliveryBySkuAndPostcodeHandler };
