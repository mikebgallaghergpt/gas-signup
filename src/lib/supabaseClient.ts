// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log("Supabase URL:", url);
console.log("Supabase Key (first 8 chars):", key?.slice(0, 8));

if (!url || !key) {
  console.warn("❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(url, key);