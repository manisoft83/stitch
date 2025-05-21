import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppHeader from './header';
import SidebarNav from './sidebar-nav';
import Link from 'next/link';
import { Button } from '../ui/button';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
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
        <SidebarFooter className="p-4">
          {/* Optional: Footer content like settings or logout */}
          {/* <Button variant="outline" className="w-full">Settings</Button> */}
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
