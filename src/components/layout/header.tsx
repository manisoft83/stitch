
"use client"; 

import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden"> 
         <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
           {/* Minimalist logo representation - consistent with sidebar */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary">
             <path d="M12 2l-4.5 4.5L3 12l4.5 4.5L12 22l4.5-4.5L21 12l-4.5-4.5L12 2zM12 7.5v9M7.5 12h9"/>
           </svg>
           <span className="hidden font-semibold text-lg text-primary md:block">StitchStyle</span>
        </Link>
      </div>
      <div className="flex-1 md:ml-4">
        {/* Optionally add breadcrumbs or page title here */}
      </div>
      {/* Optional: User avatar/menu */}
      {/* <UserNav /> */}
    </header>
  );
}
