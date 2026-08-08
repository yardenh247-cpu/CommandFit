"use client";

import {
  useEffect,
  useState,
} from "react";

type UserRole =
  | "admin"
  | "viewer";

type AuthUser = {
  username: string;
  role: UserRole;
};

export function useAuth() {
  const [
    user,
    setUser,
  ] =
    useState<AuthUser | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response =
          await fetch(
            "/api/auth/me",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data =
          await response.json();

        setUser(
          data.user ?? null
        );
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return {
    user,
    loading,

    isAdmin:
      user?.role ===
      "admin",

    isViewer:
      user?.role ===
      "viewer",
  };
}