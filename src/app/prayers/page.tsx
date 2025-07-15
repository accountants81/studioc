
"use client";

import { useState, useEffect } from "react";
import { Check, X, BookOpen, Sunrise, Sunset, Plus, Trash2, Pause, Play } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const prayerTranslations = {
  ar: {
    pageTitle: "العبادات اليومية",
    prayersSection: "الصلوات الخمس",
    adhkarSection: "الأذكار والعبادات اليومية",
    fajr: "الفجر",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
    morningAdhkar: "أذكار الصباح",
    eveningAdhkar: "أذكار المساء",
    quranWird: "الورد اليومي",
    addWorship: "إضافة عبادة جديدة",
    newWorshipTitle: "عبادة جديدة",
    newWorshipPlaceholder: "مثال: الاستغفار 100 مرة",
    add: "إضافة",
    cancel: "إلغاء",
    delete: "حذف",
    deleteConfirmTitle: "هل أنت متأكد؟",
    deleteConfirmDesc: "سيتم حذف هذه العبادة نهائيًا."
  },
  en: {
    pageTitle: "Daily Worship",
    prayersSection: "The Five Prayers",
    adhkarSection: "Daily Adhkar & Worship",
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    morningAdhkar: "Morning Adhkar",
    eveningAdhkar: "Evening Adhkar",
    quranWird: "Daily Quran",
    addWorship: "Add New Worship",
    newWorshipTitle: "New Worship",
    newWorshipPlaceholder: "e.g., Read a chapter of Quran",
    add: "Add",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirmTitle: "Are you sure?",
    deleteConfirmDesc: "This worship item will be permanently deleted."
  },
};

type Prayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
type PrayerStatus = Record<Prayer, 'pending' | 'completed'>;

type WorshipItem = {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
};

const prayerList: Prayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

const prayerCardColors: Record<Prayer, string> = {
    fajr: "bg-cyan-900/80 hover:bg-cyan-900/90 border-cyan-700/80",
    dhuhr: "bg-sky-800/80 hover:bg-sky-800/90 border-sky-600/80",
    asr: "bg-amber-800/80 hover:bg-amber-800/90 border-amber-600/80",
    maghrib: "bg-orange-900/80 hover:bg-orange-900/90 border-orange-700/80",
    isha: "bg-indigo-950/80 hover:bg-indigo-950/90 border-indigo-800/80",
};


const getInitialPrayers = (): PrayerStatus => ({
    fajr: 'pending', dhuhr: 'pending', asr: 'pending', maghrib: 'pending', isha: 'pending'
});

const getInitialWorships = (t: typeof prayerTranslations.ar): WorshipItem[] => [
    { id: 'w1', title: t.morningAdhkar, status: 'pending'},
    { id: 'w2', title: t.eveningAdhkar, status: 'pending'},
    { id: 'w3', title: t.quranWird, status: 'pending'},
];

export default function PrayersPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>("app-lang", "ar");
  const t = prayerTranslations[lang];

  const [prayers, setPrayers] = useLocalStorage<PrayerStatus>('momentum-prayers-status', getInitialPrayers());
  const [worshipItems, setWorshipItems] = useLocalStorage<WorshipItem[]>('momentum-worship-items-v2', getInitialWorships(t));
  const [lastResetDate, setLastResetDate] = useLocalStorage<string>('lastWorshipResetDate', '');

  const [newWorshipName, setNewWorshipName] = useState("");

  useEffect(() => {
    const defaultItems = getInitialWorships(t);
    setWorshipItems(prevItems => {
        const updatedItems = [...prevItems];
        const defaultIds = new Set(defaultItems.map(item => item.id));

        defaultItems.forEach(defaultItem => {
            const existingItem = updatedItems.find(item => item.id === defaultItem.id);
            if (existingItem) {
                existingItem.title = defaultItem.title;
            } else {
                updatedItems.push(defaultItem);
            }
        });
        
        return updatedItems.filter(item => {
            const isUserAdded = !item.id.startsWith('w');
            return isUserAdded || defaultIds.has(item.id);
        });
    });
  }, [lang, t, setWorshipItems]);

  const togglePrayer = (prayer: Prayer) => {
    setPrayers(prev => ({
      ...prev,
      [prayer]: prev[prayer] === 'completed' ? 'pending' : 'completed',
    }));
  };

  const handleWorshipStatusChange = (id: string, newStatus: WorshipItem['status']) => {
    setWorshipItems(items => items.map(item => item.id === id ? {...item, status: newStatus} : item));
  };
  
  const handleAddWorship = () => {
    if (!newWorshipName.trim()) return;
    const newItem: WorshipItem = {
        id: crypto.randomUUID(),
        title: newWorshipName,
        status: 'pending'
    };
    setWorshipItems(prev => [...prev, newItem]);
    setNewWorshipName("");
  };

  const handleDeleteWorship = (id: string) => {
    setWorshipItems(items => items.filter(item => item.id !== id));
  }
  
  // Daily Reset Logic
  useEffect(() => {
    const checkAndResetData = () => {
      const today = new Date().toDateString();
      if (lastResetDate !== today) {
        console.log("New day detected. Resetting daily data.");
        setPrayers(getInitialPrayers());
        setWorshipItems(prev => prev.map(item => ({...item, status: 'pending'})));
        setLastResetDate(today);
      }
    };

    checkAndResetData(); // Check on initial component load

    // Set up an interval to check for the new day
    const interval = setInterval(() => {
        checkAndResetData();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [lastResetDate, setLastResetDate, setPrayers, setWorshipItems]);

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <div className="max-w-4xl mx-auto space-y-12">
        
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-foreground">{t.prayersSection}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {prayerList.map((prayer) => (
                    <Card
                        key={prayer}
                        onClick={() => togglePrayer(prayer)}
                        className={cn(
                            "transition-all duration-300 border text-primary-foreground cursor-pointer text-center p-4 rounded-lg flex flex-col items-center justify-center gap-2 min-h-[100px] hover:-translate-y-1 hover:shadow-lg",
                            prayerCardColors[prayer],
                            prayers[prayer] === 'completed' && 'ring-4 ring-offset-2 ring-offset-background ring-green-500'
                        )}
                    >
                        <span className="text-xl font-semibold">{t[prayer]}</span>
                        {prayers[prayer] === 'completed' ? <Check size={24} /> : <X size={24} />}
                    </Card>
                ))}
            </CardContent>
        </Card>

        <Card className="bg-card/50">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold text-foreground">{t.adhkarSection}</CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                                <Plus />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>{t.addWorship}</AlertDialogTitle>
                            </AlertDialogHeader>
                            <Input 
                                placeholder={t.newWorshipPlaceholder}
                                value={newWorshipName}
                                onChange={e => setNewWorshipName(e.target.value)}
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleAddWorship} disabled={!newWorshipName.trim()}>{t.add}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {worshipItems.map((item) => (
                 <Card
                    key={item.id}
                    className="transition-all duration-300 border bg-card/70 hover:shadow-md flex items-center p-3 pr-1"
                >
                    <span className="flex-1 text-lg font-medium text-card-foreground">{item.title}</span>
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" size="icon"
                             onClick={() => handleWorshipStatusChange(item.id, 'pending')}
                            className={cn("rounded-full h-9 w-9", item.status === 'pending' && "bg-red-500/80 text-white")}>
                            <X size={20}/>
                        </Button>
                        <Button 
                            variant="ghost" size="icon" 
                            onClick={() => handleWorshipStatusChange(item.id, 'in-progress')}
                            className={cn("rounded-full h-9 w-9", item.status === 'in-progress' && "bg-orange-500/80 text-white")}>
                            <Pause size={16} fill="currentColor" />
                        </Button>
                        <Button 
                            variant="ghost" size="icon" 
                            onClick={() => handleWorshipStatusChange(item.id, 'completed')}
                            className={cn("rounded-full h-9 w-9", item.status === 'completed' && "bg-green-500/80 text-white")}>
                            <Check size={20}/>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-9 w-9 rounded-full">
                                    <Trash2 size={18} />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>{t.deleteConfirmDesc}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteWorship(item.id)} className="bg-destructive hover:bg-destructive/90">{t.delete}</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>
              ))}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
