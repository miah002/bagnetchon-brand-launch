import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes an email to the newsletter list.
 * Duplicate emails (unique violation, code 23505) are silently ignored.
 */
export async function subscribeEmail(email: string, source = "Website"): Promise<void> {
  const { error } = await supabase
    .from("subscribers")
    .insert({ email: email.trim().toLowerCase(), source });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }
}
