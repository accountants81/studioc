"use client";

import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Shield } from "lucide-react";

const translations = {
  ar: {
    pageTitle: "الخزنة الخاصة",
    comingSoon: "قريبا...",
    description: "ستوفر الخزنة الخاصة مساحة آمنة ومحمية بكلمة مرور لتخزين ملاحظاتك وأفكارك الأكثر حساسية. هذه الميزة قيد الإنشاء.",
  },
  en: {
    pageTitle: "Private Vault",
    comingSoon: "Coming Soon...",
    description: "The Private Vault will provide a secure, password-protected space for your most sensitive notes and ideas. This feature is currently under construction.",
  },
};

export default function VaultPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-[50vh]">
        <Shield className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">{t.comingSoon}</h3>
        <p className="text-muted-foreground mt-2 max-w-md">{t.description}</p>
      </div>
    </main>
  );
}
