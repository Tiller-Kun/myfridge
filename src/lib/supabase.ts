import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

// Expo inlines EXPO_PUBLIC_* variables only for literal `process.env.NAME`
// references, so these must not be read dynamically.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const missing = [
  !supabaseUrl && "EXPO_PUBLIC_SUPABASE_URL",
  !supabasePublishableKey && "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
].filter(Boolean);

if (missing.length > 0) {
  // Names only: never include the values in the message.
  throw new Error(
    `Supabase is not configured. Missing ${missing.join(" and ")}. ` +
      "Copy .env.example to .env, fill in your project's values, and restart Expo.",
  );
}

// The app has no login, so there is no session to store, refresh or read
// back from a URL.
export const supabase = createClient(supabaseUrl!, supabasePublishableKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
