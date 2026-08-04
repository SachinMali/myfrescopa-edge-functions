// Tutorial mock for the catalog / inventory upstream API.
// Called by handlers/estimated-delivery/handler.js (API 1 of 2).
// Production: replace with src/lib/catalog-client.js using the same SECRETS.CATALOG token.

import { SECRETS, getApiToken, authorizedFetch } from "../../lib/api-client.js";

const PRODUCTS = {
  "house-blend-medium-roast": {
    sku: "HB-MED-250",
    name: "House Blend- Medium Roast",
    qty: 12,
  },
  "frescopa-smart-machine": {
    sku: "FSM-001",
    name: "Fréscopa Smart Machine",
    qty: 3,
  },
  "insulated-travel-thermos": {
    sku: "ITT-012",
    name: "Insulated Travel Thermos",
    qty: 0,
  },
};

// Real API: GET /products?sku={sku} (uses CATALOG_API_TOKEN).
export async function getProductBySku(sku) {
  await getApiToken(SECRETS.CATALOG);
  console.log("Catalog API auth ready (CATALOG_API_TOKEN loaded from Secret Store)");

  // Real API: uncomment and replace with your catalog endpoint.
  // const response = await authorizedFetch(
  //   `https://api.example.com/products?sku=${encodeURIComponent(sku)}`,
  //   SECRETS.CATALOG,
  // );
  // return response.ok ? response.json() : null;

  return PRODUCTS[sku] || null;
}

// Tutorial helper for validation errors. Real API: query catalog for available SKUs.
export function getAvailableProductSlugs() {
  return Object.keys(PRODUCTS);
}

// Real API: derive from inventory service response (e.g. GET /inventory?sku={sku}).
export function getStockState(qty) {
  if (qty <= 0) return "out-of-stock";
  if (qty <= 3) return "low-stock";
  return "in-stock";
}
