import { createServerFn } from "@tanstack/react-start";

import { subscribeSchema } from "./schemas";
import { throttleByIp } from "./server-utils.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Server-authoritative newsletter subscribe. Validates + normalizes the email,
 * throttles by IP, writes via service role, and silently ignores duplicates.
 */
export const subscribeEmailFn = createServerFn({ method: "POST" })
  .inputValidator(subscribeSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    throttleByIp("subscribe", 8, 60_000);

    const { error } = await supabaseAdmin
      .from("subscribers")
      .insert({ email: data.email, source: data.source });

    // 23505 = unique violation (already subscribed) — treat as success.
    if (error && error.code !== "23505") {
      console.error("Subscribe insert failed:", error.message);
      throw new Error("Could not subscribe. Please try again.");
    }
    return { ok: true };
  });
