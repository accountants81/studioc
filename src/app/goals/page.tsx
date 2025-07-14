"use client";

import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Target } from "lucide-react";

const translations = {
  ar: {
    pageTitle: "الأهداف",
    comingSoon: "قريبا...",
    description: "سيسمح لك هذا القسم بتحديد وتتبع أهدافك طويلة المدى وربطها بمهامك اليومية. هذه الميزة قيد التطوير حاليًا.",
  },
  en: {
    pageTitle: "Goals",
    comingSoon: "Coming Soon...",
    description: "This section will allow you to set and track your long-term goals and connect them to your daily tasks. This feature is currently under development.",
  },
};

export default function GoalsPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-[50vh]">
        <Target className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">{t.comingSoon}</h3>
        <p className="text-muted-foreground mt-2 max-w-md">{t.description}</p>
      </div>
    </main>
  );
}
