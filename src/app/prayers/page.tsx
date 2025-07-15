
"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const prayerTranslations = {
  ar: {
    pageTitle: "العبادات اليومية",
    sectionTitle: "الصلوات الخمس",
    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    completed: "تمت",
    pending: "لم تتم",
  },
  en: {
    pageTitle: "Daily Worship",
    sectionTitle: "The Five Prayers",
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    completed: "Completed",
    pending: "Pending",
  },
};

type Prayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
type PrayerStatus = Record<Prayer, boolean>;

const prayerList: Prayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const prayerCardColors: Record<Prayer, string> = {
    fajr: "bg-green-100/60 dark:bg-green-900/40 border-green-500/30",
    dhuhr: "bg-yellow-100/60 dark:bg-yellow-900/30 border-yellow-500/30",
    asr: "bg-orange-100/60 dark:bg-orange-900/30 border-orange-500/30",
    maghrib: "bg-blue-100/60 dark:bg-blue-900/30 border-blue-500/30",
    isha: "bg-indigo-100/60 dark:bg-indigo-900/30 border-indigo-500/30",
};

export default function PrayersPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>("app-lang", "ar");
  const t = prayerTranslations[lang];
  
  const getInitialPrayerStatus = () => {
    const today = new Date().toISOString().slice(0, 10);
    const storedStatus = localStorage.getItem(`momentum-prayers-${today}`);
    if (storedStatus) {
      return JSON.parse(storedStatus);
    }
    return {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    };
  };

  const [prayerStatus, setPrayerStatus] = useState<PrayerStatus>(getInitialPrayerStatus);

  useEffect(() => {
    // Reset prayers every new day
    const todayKey = `momentum-prayers-${new Date().toISOString().slice(0, 10)}`;
    const storedData = localStorage.getItem(todayKey);
    if (!storedData) {
        const resetStatus = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
        setPrayerStatus(resetStatus);
        localStorage.setItem(todayKey, JSON.stringify(resetStatus));
    }
  }, []);
  
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`momentum-prayers-${today}`, JSON.stringify(prayerStatus));
  }, [prayerStatus]);

  const togglePrayer = (prayer: Prayer) => {
    setPrayerStatus((prevStatus) => ({
      ...prevStatus,
      [prayer]: !prevStatus[prayer],
    }));
  };

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">{t.sectionTitle}</h2>
        <div className="space-y-4">
          {prayerList.map((prayer) => (
            <Card
              key={prayer}
              className={cn(
                "transition-all duration-300",
                prayerCardColors[prayer],
                prayerStatus[prayer] ? "shadow-lg scale-105" : "shadow-sm"
              )}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-xl font-semibold text-card-foreground">
                  {t[prayer]}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => togglePrayer(prayer)}
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-full transition-colors",
                        prayerStatus[prayer] ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                    )}
                  >
                    {prayerStatus[prayer] ? <Check /> : <X />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
