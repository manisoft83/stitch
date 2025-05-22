
"use client";

import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Tailor } from '@/lib/mockData'; // Assuming Tailor type is in mockData

export type UserRole = "admin" | "tailor" | null;

export interface AuthState {
  role: UserRole;
  tailorId: string | null;
  tailorName?: string | null; // Optional: store tailor name for display
}

interface AuthContextType extends AuthState {
  login: (role: UserRole, tailor?: Tailor) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "stitchstyle_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ role: null, tailorId: null, tailorName: null });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        setAuthState(parsedAuth);
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((role: UserRole, tailor?: Tailor) => {
    const newState: AuthState = {
      role,
      tailorId: tailor && role === 'tailor' ? tailor.id : null,
      tailorName: tailor && role === 'tailor' ? tailor.name : null,
    };
    setAuthState(newState);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    router.push('/'); // Redirect to home after login
  }, [router]);

  const logout = useCallback(() => {
    setAuthState({ role: null, tailorId: null, tailorName: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/login'); // Redirect to login after logout
  }, [router]);

  // Redirect to login if not authenticated and not on login page
  useEffect(() => {
    if (!isLoading && !authState.role && pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoading, authState.role, pathname, router]);


  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    isLoading,
  };

  if (isLoading && pathname !== '/login') {
     // You might want a dedicated loading component here for better UX
    return <div className="flex h-screen w-full items-center justify-center bg-background"><p>Loading authentication...</p></div>;
  }
  
  // If not authenticated and not on login page, MainLayout will handle redirection.
  // This provider only renders children if loading is done OR if on login page to avoid flicker.
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
