'use client';
import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="h-full">
            <SidebarNav />
        </Sidebar>
        <SidebarInset>
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
