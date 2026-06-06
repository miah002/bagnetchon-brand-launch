/** Auto-detect source from UTM params; fallback to "Website". */
export function detectSource(): string {
  if (typeof window === "undefined") return "Website";
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (!utm) return "Website";
  const norm = utm.toLowerCase();
  if (norm.includes("facebook") || norm === "fb") return "Facebook";
  if (norm.includes("instagram") || norm === "ig") return "Instagram";
  if (norm.includes("tiktok")) return "TikTok";
  if (norm.includes("messenger")) return "Messenger";
  if (norm.includes("referral")) return "Referral";
  return utm.charAt(0).toUpperCase() + utm.slice(1);
}

export const SOURCE_OPTIONS = [
  "Website",
  "Facebook",
  "Instagram",
  "TikTok",
  "Messenger",
  "Referral",
  "Other",
] as const;
