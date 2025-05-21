"use client";

import type { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Kept for future use

// const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* <QueryClientProvider client={queryClient}> */}
        {children}
        <Toaster />
      {/* </QueryClientProvider> */}
    </>
  );
}
