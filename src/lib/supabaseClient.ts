// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const url = "https://qioetnisvxtibwbisnyl.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpb2V0bmlzdnh0aWJ3YmlzbnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTg0OTcsImV4cCI6MjA3MDQzNDQ5N30.vKWGrqot_r2n5f4nhoN77hz1CQcYt_L7i78CpkTjqsI";

console.log("Supabase URL:", url);

export const supabase = createClient(url, key);
