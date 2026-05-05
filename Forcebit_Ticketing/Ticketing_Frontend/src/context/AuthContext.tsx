import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthItem, setAuthItem, deleteAuthItem } from "../storage/authStorage";
import { login, register, LoginRequest, RegisterRequest } from "../api/authApi";

type User = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (request: LoginRequest) => Promise<void>;
  signUp: (request: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await getAuthItem("token")
        const storedUser = await getAuthItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Failed to load auth:", error);

        await deleteAuthItem("token");
        await deleteAuthItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  async function saveAuth(data: any) {
    await setAuthItem("token", data.token);
    await setAuthItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  async function signIn(request: LoginRequest) {
    const data = await login(request);
    await saveAuth(data);
  }

  async function signUp(request: RegisterRequest) {
    const data = await register(request);
    await saveAuth(data);
  }

  async function signOut() {
    await deleteAuthItem("token");
    await deleteAuthItem("user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
