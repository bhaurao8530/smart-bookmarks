"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = "/dashboard";
      }
    });
  }, []);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={login}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
