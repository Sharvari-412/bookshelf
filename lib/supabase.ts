import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wuvvalfhqkselavanyhm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dnZhbGZocWtzZWxhdmFueWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjU1MzQsImV4cCI6MjA5MzQwMTUzNH0.aUP3jVskuHwiIw2bqHBa7m47p_NvR8n-b2hD3Gbj_lI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
