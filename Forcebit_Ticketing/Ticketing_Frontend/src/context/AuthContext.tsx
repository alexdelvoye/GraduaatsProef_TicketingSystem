import React, { createContext, useContext, useEffect, useState } from "react";

import { login, register } from "../apis/authApi";
import {
  deleteAuthItem,
  getAuthItem,
  setAuthItem,
} from "../storage/authStorage";

import { useNotifications } from "./NotificationContext";

import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types";

// Shape of the authentication context. Components do not need to know where the
// token is stored; they only use these values and actions.
type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (request: LoginRequest) => Promise<void>;
  signUp: (request: RegisterRequest) => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
  signOut: (showToast?: boolean) => Promise<void>;
};

// Null is used as the initial value so useAuth can detect missing providers and
// throw a clear developer error.
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component that wraps the app and exposes authentication state/actions
// to every screen.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showInfo } = useNotifications();

  // user/token are kept in React state for immediate UI updates.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // isLoading is true while restoring a saved login from device storage.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        // Restore previous login so the user does not have to sign in every
        // time the app restarts.
        const storedToken = await getAuthItem("token");
        const storedUser = await getAuthItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // If stored JSON is corrupted, clear it. A clean logout is better than
        // leaving the app in a half-authenticated state.
        await deleteAuthItem("token");
        await deleteAuthItem("user");

        setToken(null);
        setUser(null);
      } finally {
        // Always stop the loading screen, even if restoring auth failed.
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  async function saveAuth(data: AuthResponse) {
    // Save to persistent storage first, then update React state. This keeps the
    // UI and storage in sync after login/register.
    await setAuthItem("token", data.token);
    await setAuthItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  async function signIn(request: LoginRequest) {
    // API-specific login details stay in authApi; the context only saves the
    // successful auth result.
    const data = await login(request);
    await saveAuth(data);
  }

  async function signUp(request: RegisterRequest) {
    // Register returns the same AuthResponse shape as login, so both flows can
    // reuse saveAuth.
    const data = await register(request);
    await saveAuth(data);
  }

  async function updateUser(updatedUser: AuthUser) {
    // Profile edits should update both React state and persistent storage so
    // the new name/email survive a page refresh.
    await setAuthItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  async function signOut(showToast = true) {
    // Remove both token and user data so future API calls are anonymous.
    await deleteAuthItem("token");
    await deleteAuthItem("user");

    setToken(null);
    setUser(null);

    if (showToast) {
      showInfo("Signed out", "Your session has ended.");
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signUp, updateUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access the authentication context. Throwing here catches setup
// mistakes quickly during development.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
