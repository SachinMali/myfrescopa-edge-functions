// Response builders for the estimated-delivery handler.
// Keeps handler.js focused on orchestration; error JSON shapes live here.

import { getAvailableProductSlugs, getStockState } from "../../mocks/catalog/product-api.js";
import { json } from "../../lib/response.js";
import { ROUTE, DEFAULT_SKU, PARAM_DOCS } from "./constants.js";

function missingPostcodeError(skuParam) {
  return json(
    {
      error: "Missing required parameter",
      code: "MISSING_POSTCODE",
      message: "The postcode query parameter is required",
      received: {
        postcode: null,
        sku: skuParam ?? DEFAULT_SKU,
      },
      parameters: PARAM_DOCS,
      validSkus: getAvailableProductSlugs(),
      example: `${ROUTE}?postcode=90210&sku=${DEFAULT_SKU}`,
    },
    400,
  );
}

function unknownSkuError(sku, postcode) {
  return json(
    {
      error: "Unknown product",
      code: "UNKNOWN_SKU",
      message: `No product found for sku: ${sku}`,
      received: { sku, postcode },
      validSkus: getAvailableProductSlugs(),
      example: `${ROUTE}?postcode=${encodeURIComponent(postcode)}&sku=${DEFAULT_SKU}`,
    },
    404,
  );
}

function buildSuccessResponse(product, fulfillment) {
  const inventoryStatus = getStockState(product.qty);
  const deliveryEta =
    inventoryStatus === "out-of-stock"
      ? fulfillment.backorderEta
      : fulfillment.deliveryEta;

  return {
    sku: product.sku,
    productName: product.name,
    inventoryStatus,
    qtyLeft: product.qty,
    fulfillmentRegion: fulfillment.region,
    deliveryEta,
    cutoffMessage: fulfillment.cutoffMessage,
    message:
      inventoryStatus === "out-of-stock"
        ? `Currently unavailable in ${fulfillment.region}`
        : `Arrives ${fulfillment.deliveryEta} in ${fulfillment.region}`,
  };
}

export { missingPostcodeError, unknownSkuError, buildSuccessResponse };
