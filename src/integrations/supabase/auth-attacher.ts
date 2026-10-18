import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

// Global client middleware for attaching the Supabase session token to server functions
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
