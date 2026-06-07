import { createFileRoute } from "@tanstack/react-router";

interface NominatimResult {
  lat: string;
  lon: string;
}

interface OsrmRoute {
  distance?: number;
}

interface OsrmResp {
  code?: string;
  routes?: OsrmRoute[];
}

/**
 * POST /api/public/delivery-distance
 * Body: { origin: string, destination: string }
 * Returns: { miles } on success, or { unresolved: true, reason } on failure.
 *
 * Uses free, no-key APIs:
 *   - OpenStreetMap Nominatim for geocoding (address → lat/lon)
 *   - OSRM public router for driving distance
 */
export const Route = createFileRoute("/api/public/delivery-distance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { origin?: unknown; destination?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ unresolved: true, reason: "bad_request" }, { status: 400 });
        }

        const origin = typeof body.origin === "string" ? body.origin.trim() : "";
        const rawDest = typeof body.destination === "string" ? body.destination.trim() : "";
        if (!origin || !rawDest) {
          return Response.json({ unresolved: true, reason: "missing_fields" }, { status: 400 });
        }
        const destination = /^\d{5}$/.test(rawDest) ? `${rawDest}, USA` : rawDest;

        const geocode = async (address: string) => {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
          const res = await fetch(url, {
            headers: { "User-Agent": "Bagnetchon-delivery-widget/1.0" },
          });
          if (!res.ok) return null;
          const data = (await res.json()) as NominatimResult[];
          if (!data[0]) return null;
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        };

        try {
          const [from, to] = await Promise.all([geocode(origin), geocode(destination)]);
          if (!from || !to) {
            return Response.json({ unresolved: true, reason: "geocode_failed" });
          }

          const osrmUrl =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;

          const osrmRes = await fetch(osrmUrl);
          if (!osrmRes.ok) {
            return Response.json({ unresolved: true, reason: "routing_failed" });
          }
          const osrm = (await osrmRes.json()) as OsrmResp;
          const meters = osrm.routes?.[0]?.distance;
          if (typeof meters !== "number") {
            return Response.json({ unresolved: true, reason: "no_route" });
          }

          const miles = meters / 1609.344;
          return Response.json({ miles });
        } catch {
          return Response.json({ unresolved: true, reason: "fetch_failed" });
        }
      },
    },
  },
});
