"use client"
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TaskProvider } from "@/contexts/task-provider";
import AppShell from "@/components/app-shell";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useEffect } from 'react';

// export const metadata: Metadata = {
//   title: 'MomentumFlow',
//   description: 'Organize your time and tasks.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [lang] = useLocalStorage('app-lang', 'ar');

  useEffect(() => {
    document.title = lang === 'ar' ? 'تدفق الإنجاز | MomentumFlow' : 'MomentumFlow | Organize Your Time';
  }, [lang]);

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className='dark' style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <TaskProvider>
            <AppShell>
                {children}
            </AppShell>
        </TaskProvider>
        <Toaster />
      </body>
    </html>
  );
}
