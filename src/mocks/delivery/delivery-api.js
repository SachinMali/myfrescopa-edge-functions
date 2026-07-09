// Tutorial mock for the fulfillment upstream API.
// Called by handlers/estimated-delivery/handler.js (API 2 of 2).
// Production: replace with src/lib/delivery-client.js using the same SECRETS.DELIVERY token.

import { SECRETS, getApiToken, authorizedFetch } from "../../lib/api-client.js";

const DELIVERY_ZONES = [
  {
    prefix: "9",
    region: "West Coast Fulfillment",
    deliveryEta: "tomorrow",
    backorderEta: "3-5 business days",
    cutoffMessage: "Order by 2:00 PM for same-day dispatch.",
  },
  {
    prefix: "8",
    region: "Mountain Fulfillment",
    deliveryEta: "1-2 business days",
    backorderEta: "4-6 business days",
    cutoffMessage: "Order by 1:00 PM for next-day dispatch.",
  },
  {
    prefix: "7",
    region: "Central Fulfillment",
    deliveryEta: "2 business days",
    backorderEta: "5-7 business days",
    cutoffMessage: "Order by 3:00 PM for next-day dispatch.",
  },
  {
    prefix: "1",
    region: "East Coast Fulfillment",
    deliveryEta: "2-3 business days",
    backorderEta: "5-8 business days",
    cutoffMessage: "Order by 4:00 PM for dispatch today.",
  },
];

// Real API: GET /estimated-delivery?postcode={postcode} (uses DELIVERY_API_TOKEN).
export async function getEstimatedDeliveryByPostcode(postcode) {
  await getApiToken(SECRETS.DELIVERY);
  console.log("Fulfillment API auth ready (DELIVERY_API_TOKEN loaded from Secret Store)");

  // Real API: uncomment and replace with your logistics endpoint.
  // const response = await authorizedFetch(
  //   `https://api.example.com/estimated-delivery?postcode=${encodeURIComponent(postcode)}`,
  //   SECRETS.DELIVERY,
  // );
  // if (!response.ok) {
  //   throw new Error(`Fulfillment API error: ${response.status}`);
  // }
  // return response.json();

  const normalized = postcode.replace(/\s+/g, "").toUpperCase();
  const zone =
    DELIVERY_ZONES.find((entry) => normalized.startsWith(entry.prefix)) ||
    DELIVERY_ZONES[2];

  return {
    region: zone.region,
    deliveryEta: zone.deliveryEta,
    backorderEta: zone.backorderEta,
    cutoffMessage: zone.cutoffMessage,
  };
}
