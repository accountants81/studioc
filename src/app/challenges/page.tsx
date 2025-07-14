"use client";

import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Trophy } from "lucide-react";

const translations = {
  ar: {
    pageTitle: "التحديات",
    comingSoon: "قريبا...",
    description: "نحن نعمل حاليًا على قسم التحديات لجعله ممتعًا ومحفزًا. ترقبوا التحديثات!",
  },
  en: {
    pageTitle: "Challenges",
    comingSoon: "Coming Soon...",
    description: "We are currently working on the Challenges section to make it fun and engaging. Stay tuned for updates!",
  },
};

export default function ChallengesPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-[50vh]">
        <Trophy className="h-16 w-16 text-primary mb-4" />
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">{t.comingSoon}</h3>
        <p className="text-muted-foreground mt-2 max-w-md">{t.description}</p>
      </div>
    </main>
  );
}
