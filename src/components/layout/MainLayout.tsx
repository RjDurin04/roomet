
import { Outlet } from 'react-router-dom';

import { SidebarTenant } from './tenant/Sidebar';

export function MainLayout() {
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background overflow-hidden text-foreground selection:bg-primary/20 font-sans">
      
      <SidebarTenant />

      {/* Main Workspace Area with subtle background pattern */}
      <main className="flex-1 h-full w-full relative bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col min-w-0 pt-14 md:pt-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="relative z-10 w-full flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}

