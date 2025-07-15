
"use client";

import { useState, useEffect } from "react";
import { Check, X, BookOpen, Sunrise, Sunset } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const prayerTranslations = {
  ar: {
    pageTitle: "العبادات اليومية",
    prayersSection: "الصلوات الخمس",
    adhkarSection: "الأذكار اليومية",
    quranSection: "الورد القرآني",
    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    morningAdhkar: "أذكار الصباح",
    eveningAdhkar: "أذكار المساء",
    quranWird: "الورد اليومي",
    completed: "تمت",
    pending: "لم تتم",
  },
  en: {
    pageTitle: "Daily Worship",
    prayersSection: "The Five Prayers",
    adhkarSection: "Daily Adhkar",
    quranSection: "Daily Quran Reading",
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    morningAdhkar: "Morning Adhkar",
    eveningAdhkar: "Evening Adhkar",
    quranWird: "Daily Wird",
    completed: "Completed",
    pending: "Pending",
  },
};

type Prayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
type Adhkar = "morning" | "evening" | "quran";

type WorshipStatus = {
  prayers: Record<Prayer, boolean>;
  adhkar: Record<Adhkar, boolean>;
};

const prayerList: Prayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const prayerCardColors: Record<Prayer, string> = {
    fajr: "bg-[#1E4D2B] hover:bg-[#2A6A3B] border-[#2A6A3B]",
    dhuhr: "bg-[#5D4037] hover:bg-[#795548] border-[#795548]",
    asr: "bg-[#7B1F20] hover:bg-[#9E2B2C] border-[#9E2B2C]",
    maghrib: "bg-[#283593] hover:bg-[#3949AB] border-[#3949AB]",
    isha: "bg-[#1A237E] hover:bg-[#283593] border-[#283593]",
};

const otherWorship: { key: Adhkar; icon: React.ElementType }[] = [
    { key: "morning", icon: Sunrise },
    { key: "evening", icon: Sunset },
    { key: "quran", icon: BookOpen },
];

export default function PrayersPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>("app-lang", "ar");
  const t = prayerTranslations[lang];
  
  const getInitialStatus = () => {
    const today = new Date().toISOString().slice(0, 10);
    const storedStatus = localStorage.getItem(`momentum-worship-${today}`);
    if (storedStatus) {
      const data = JSON.parse(storedStatus);
      // Ensure all keys exist to prevent errors if the structure changes
      return {
          prayers: data.prayers || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
          adhkar: data.adhkar || { morning: false, evening: false, quran: false }
      };
    }
    return {
      prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
      adhkar: { morning: false, evening: false, quran: false },
    };
  };

  const [worshipStatus, setWorshipStatus] = useState<WorshipStatus>(getInitialStatus);

  useEffect(() => {
    const todayKey = `momentum-worship-${new Date().toISOString().slice(0, 10)}`;
    const storedData = localStorage.getItem(todayKey);
    if (!storedData) {
        const resetStatus = {
            prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
            adhkar: { morning: false, evening: false, quran: false },
        };
        setWorshipStatus(resetStatus);
        localStorage.setItem(todayKey, JSON.stringify(resetStatus));
    } else {
        setWorshipStatus(getInitialStatus());
    }
  }, []);
  
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`momentum-worship-${today}`, JSON.stringify(worshipStatus));
  }, [worshipStatus]);

  const togglePrayer = (prayer: Prayer) => {
    setWorshipStatus((prev) => ({
      ...prev,
      prayers: { ...prev.prayers, [prayer]: !prev.prayers[prayer] },
    }));
  };

  const toggleAdhkar = (item: Adhkar) => {
    setWorshipStatus((prev) => ({
      ...prev,
      adhkar: { ...prev.adhkar, [item]: !prev.adhkar[item] },
    }));
  };

  const getAdhkarTranslation = (key: Adhkar) => {
    if (key === 'morning') return t.morningAdhkar;
    if (key === 'evening') return t.eveningAdhkar;
    return t.quranWird;
  }

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <div className="max-w-2xl mx-auto space-y-12">
        
        {/* Five Prayers Section */}
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">{t.prayersSection}</h2>
            <div className="space-y-3">
            {prayerList.map((prayer) => (
                <Card
                key={prayer}
                className={cn(
                    "transition-all duration-300 border text-primary-foreground",
                    prayerCardColors[prayer]
                )}
                >
                <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-xl font-semibold">
                    {t[prayer]}
                    </span>
                    <Button
                        onClick={() => togglePrayer(prayer)}
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full transition-colors",
                            worshipStatus.prayers[prayer] ? "bg-green-500/80 hover:bg-green-500" : "bg-black/20 hover:bg-black/40"
                        )}
                    >
                        {worshipStatus.prayers[prayer] ? <Check /> : <X />}
                    </Button>
                </CardContent>
                </Card>
            ))}
            </div>
        </div>

        {/* Adhkar Section */}
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">{t.adhkarSection}</h2>
            <div className="space-y-3">
              {otherWorship.map(({ key, icon: Icon }) => (
                 <Card
                    key={key}
                    className="transition-all duration-300 border bg-card hover:bg-accent"
                >
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <Icon className="h-6 w-6 text-primary" />
                           <span className="text-xl font-semibold text-card-foreground">
                             {getAdhkarTranslation(key)}
                           </span>
                        </div>
                        <Button
                            onClick={() => toggleAdhkar(key)}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-10 w-10 rounded-full transition-colors",
                                worshipStatus.adhkar[key] ? "bg-green-500/80 hover:bg-green-500 text-primary-foreground" : "bg-muted hover:bg-muted/80"
                            )}
                        >
                            {worshipStatus.adhkar[key] ? <Check /> : <X />}
                        </Button>
                    </CardContent>
                </Card>
              ))}
            </div>
        </div>
        
      </div>
    </main>
  );
}
