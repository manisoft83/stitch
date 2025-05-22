
"use client"; 
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from '@/components/ui/sidebar';
import AppHeader from './header';
import SidebarNav from './sidebar-nav';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, UserCircle } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { role, tailorName, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // If loading auth state, show a generic loading or null to prevent layout shift
  // The AuthProvider also has a loading check, this is an additional safeguard for MainLayout specifically
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><p>Initializing...</p></div>;
  }

  // If not authenticated and not on login page, redirect. AuthProvider also handles this.
  if (!role && pathname !== '/login') {
    // This useEffect ensures redirection happens after initial render if needed
    // but typically AuthProvider handles it earlier.
    if (typeof window !== 'undefined') {
        router.replace('/login');
    }
    return <div className="flex h-screen w-full items-center justify-center bg-background"><p>Redirecting to login...</p></div>; // Or a loading spinner
  }
  
  // Do not render MainLayout for the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }


  return (
    <SidebarProvider defaultOpen={true} open={true}> {/* Ensure sidebar is open by default on desktop */}
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            {/* Minimalist logo representation */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
              <path d="M12 2l-4.5 4.5L3 12l4.5 4.5L12 22l4.5-4.5L21 12l-4.5-4.5L12 2zM12 7.5v9M7.5 12h9"/>
            </svg>
            <h1 className="text-xl font-semibold text-primary">StitchStyle</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4 space-y-2">
          {role && (
            <div className="text-xs text-sidebar-foreground/80 p-2 rounded-md bg-sidebar-accent/10 border border-sidebar-border">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-sidebar-accent"/>
                <div>
                    <p className="font-semibold">Logged in as: {role === 'admin' ? 'Admin' : tailorName || 'Tailor'}</p>
                    {role === 'tailor' && tailorName && <p className="text-xs">Tailor View</p>}
                </div>
              </div>
            </div>
          )}
          <Button variant="outline" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4"/> Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
