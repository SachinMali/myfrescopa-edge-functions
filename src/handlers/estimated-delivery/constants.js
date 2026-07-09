// Route and query-param defaults for the estimated-delivery handler.
// Referenced by responses.js for validation error messages.

export const ROUTE = "/api/frescopa/estimated-delivery";
export const DEFAULT_SKU = "house-blend-medium-roast";

// Tutorial reference — query parameter documentation for validation error responses.
export const PARAM_DOCS = {
  postcode: {
    required: true,
    description: "Delivery postcode used to resolve fulfillment region and ETA",
    example: "90210",
  },
  sku: {
    required: false,
    description: "Product slug; defaults to house-blend-medium-roast when omitted",
    example: DEFAULT_SKU,
  },
};
