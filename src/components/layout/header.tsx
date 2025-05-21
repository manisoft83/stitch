"use client"; // SidebarTrigger relies on client-side state

import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden"> {/* Show trigger only on mobile, sidebar is collapsible by icon on desktop */}
         <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Optionally add breadcrumbs or page title here */}
      </div>
      {/* Optional: User avatar/menu */}
      {/* <UserNav /> */}
    </header>
  );
}
