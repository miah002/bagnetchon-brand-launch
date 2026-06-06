import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import {
  calcDeliveryFee,
  estimateDistanceMiles,
  type DeliveryEstimate,
} from "@/config/delivery";

interface Props {
  compact?: boolean;
}

export function DeliveryWidget({ compact = false }: Props) {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(zip)) {
      setMessage("Please enter a valid 5-digit ZIP.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setEstimate(null);
    const miles = await estimateDistanceMiles(zip);
    setLoading(false);
    if (miles == null) {
      setMessage("We'll confirm your delivery cost after you order.");
      return;
    }
    setEstimate(calcDeliveryFee(miles));
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-ambient ${
        compact ? "" : "md:p-8"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
        <MapPin className="h-4 w-4" />
        Check delivery cost
      </div>
      <form onSubmit={handle} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="delivery-zip" className="sr-only">
          ZIP code
        </label>
        <input
          id="delivery-zip"
          inputMode="numeric"
          maxLength={5}
          placeholder="Enter ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-sheen inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Estimate
        </button>
      </form>
      {estimate && (
        <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
          <div className="flex justify-between">
            <span>Distance</span>
            <span className="font-semibold">{estimate.miles.toFixed(1)} mi</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Delivery fee</span>
            <span className="font-semibold text-primary">
              ${estimate.fee.toFixed(2)}
            </span>
          </div>
          {estimate.needsQuote && (
            <p className="mt-2 text-xs text-muted-foreground">
              Over 30 miles — contact us to confirm this quote.
            </p>
          )}
        </div>
      )}
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
