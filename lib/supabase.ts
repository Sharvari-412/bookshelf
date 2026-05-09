import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const supabaseUrl = "https://wuvvalfhqkselavanyhm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dnZhbGZocWtzZWxhdmFueWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjU1MzQsImV4cCI6MjA5MzQwMTUzNH0.aUP3jVskuHwiIw2bqHBa7m47p_NvR8n-b2hD3Gbj_lI";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const WebLocalStorageAdapter = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) =>
    Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:
      Platform.OS === "web" ? WebLocalStorageAdapter : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
