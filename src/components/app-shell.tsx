'use client';
import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

const SidebarNav = dynamic(() => import('./sidebar-nav'), { 
    ssr: false,
    loading: () => (
        <div className="p-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-3/4" />
            <div className="pt-4 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
            </div>
        </div>
    )
});

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
