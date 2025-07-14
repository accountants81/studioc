import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TaskProvider } from "@/contexts/task-provider";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: 'TimeFlow',
  description: 'Organize your time and tasks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
