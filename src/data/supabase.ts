import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let configurationError = Boolean(url || key) && !(url && key);
if (url && key) {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" &&
      !(
        parsed.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname)
      )
    )
      configurationError = true;
    if (key.startsWith("sb_secret_")) configurationError = true;
    // Legacy JWT public anon keys are supported; service-role keys are never browser keys.
    if (key.split(".").length === 3) {
      const claims = JSON.parse(
        atob(key.split(".")[1].replaceAll("-", "+").replaceAll("_", "/")),
      );
      if (claims.role !== "anon") configurationError = true;
    }
  } catch {
    configurationError = true;
  }
}
export const databaseConfigurationError = configurationError;
export const databaseConfigured = Boolean(url && key) && !configurationError;
export const supabase = databaseConfigured ? createClient(url, key) : null;
