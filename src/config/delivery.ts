export const KITCHEN_ORIGIN =
  (import.meta.env.VITE_KITCHEN_ORIGIN as string | undefined) ??
  "REPLACE_WITH_KITCHEN_ADDRESS, South Florida";

export const TAX_RATE = 0.07;

export interface DeliveryTier {
  maxMiles: number;
  fee: number;
}

export const DELIVERY_TIERS: DeliveryTier[] = [
  { maxMiles: 5, fee: 8 },
  { maxMiles: 15, fee: 15 },
  { maxMiles: 30, fee: 25 },
];

export const OVER_30_PER_MILE = 2;

export interface DeliveryEstimate {
  fee: number;
  miles: number;
  needsQuote: boolean;
}

export function calcDeliveryFee(miles: number): DeliveryEstimate {
  for (const tier of DELIVERY_TIERS) {
    if (miles <= tier.maxMiles) {
      return { fee: tier.fee, miles, needsQuote: false };
    }
  }
  return { fee: OVER_30_PER_MILE * miles, miles, needsQuote: true };
}

/**
 * Calls the (future) Supabase edge function `delivery-distance` which wraps
 * Google Distance Matrix. Until that exists, gracefully resolves to null so
 * the UI can show "We'll confirm your delivery cost after you order."
 *
 * TODO(backend): implement `supabase/functions/delivery-distance/index.ts`
 * that takes { origin, destination } and returns { miles }.
 */
export async function estimateDistanceMiles(
  address: string,
): Promise<number | null> {
  try {
    const res = await fetch("/api/public/delivery-distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: KITCHEN_ORIGIN, destination: address }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { miles?: number; unresolved?: boolean };
    if (data.unresolved || typeof data.miles !== "number") return null;
    return data.miles;
  } catch {
    return null;
  }
}
