"use client"
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TaskProvider } from "@/contexts/task-provider";
import AppShell from "@/components/app-shell";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useEffect } from 'react';
import { Cairo, Inter } from 'next/font/google';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
    document.title = lang === 'ar' ? 'تدفق الزخم' : 'MomentumFlow';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`dark ${cairo.variable} ${inter.variable}`} style={{ colorScheme: 'dark' }}>
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
