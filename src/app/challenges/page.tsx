"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trophy, Award, Medal, Star, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Challenge = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isCompleted: boolean;
};

const translations = {
  ar: {
    pageTitle: "الإنجازات والتحديات",
    pageDescription: "احتفل بإنجازاتك وتحدياتك التي أكملتها.",
    markAsDone: "إكمال التحدي",
    completed: "مكتمل!",
    undo: "تراجع",
    challenge_1_title: "المبادر",
    challenge_1_desc: "أكملت مهمتك الأولى بنجاح.",
    challenge_2_title: "المنظم الأسبوعي",
    challenge_2_desc: "أضفت 5 مهام في أسبوع واحد.",
    challenge_3_title: "سيد التركيز",
    challenge_3_desc: "استخدمت وضع التركيز لمدة ساعة كاملة.",
    challenge_4_title: "صانع العادات",
    challenge_4_desc: "حافظت على سلسلة التزام لمدة 7 أيام متتالية.",
    challenge_5_title: "الفضولي",
    challenge_5_desc: "استخدمت المساعد الذكي 10 مرات.",
    challenge_6_title: "الموثق الصوتي",
    challenge_6_desc: "سجلت 5 مذكرات صوتية.",
  },
  en: {
    pageTitle: "Achievements & Challenges",
    pageDescription: "Celebrate your achievements and completed challenges.",
    markAsDone: "Complete Challenge",
    completed: "Completed!",
    undo: "Undo",
    challenge_1_title: "The Initiator",
    challenge_1_desc: "Completed your first task successfully.",
    challenge_2_title: "Weekly Planner",
    challenge_2_desc: "Added 5 tasks in a single week.",
    challenge_3_title: "Focus Master",
    challenge_3_desc: "Used the focus mode for a total of 1 hour.",
    challenge_4_title: "Habit Builder",
    challenge_4_desc: "Maintained a 7-day streak.",
    challenge_5_title: "The Curious",
    challenge_5_desc: "Used the AI assistant 10 times.",
    challenge_6_title: "Voice Documenter",
    challenge_6_desc: "Recorded 5 voice memos.",
  },
};

export default function ChallengesPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  // This function now returns a translated list of challenges
  const getInitialChallenges = (): Challenge[] => [
    { id: "c1", title: t.challenge_1_title, description: t.challenge_1_desc, icon: Star, isCompleted: false },
    { id: "c2", title: t.challenge_2_title, description: t.challenge_2_desc, icon: Medal, isCompleted: false },
    { id: "c3", title: t.challenge_3_title, description: t.challenge_3_desc, icon: Award, isCompleted: false },
    { id: "c4", title: t.challenge_4_title, description: t.challenge_4_desc, icon: Trophy, isCompleted: false },
    { id: "c5", title: t.challenge_5_title, description: t.challenge_5_desc, icon: Star, isCompleted: false },
    { id: "c6", title: t.challenge_6_title, description: t.challenge_6_desc, icon: Medal, isCompleted: false },
  ];
  
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>("momentum-challenges-v1", getInitialChallenges());

  // This effect syncs challenge definitions (like titles) from code with localStorage
  // without overriding the completion status.
  useState(() => {
    const initialChallenges = getInitialChallenges();
    setChallenges(prev => {
        const prevMap = new Map(prev.map(c => [c.id, c]));
        const syncedChallenges = initialChallenges.map(initialChallenge => {
            const existingChallenge = prevMap.get(initialChallenge.id);
            return {
                ...initialChallenge,
                isCompleted: existingChallenge?.isCompleted || false
            };
        });
        return syncedChallenges;
    });
  }, [lang]);

  const handleToggleChallenge = (id: string) => {
    const isCompleting = !challenges.find(c => c.id === id)?.isCompleted;
    
    setChallenges(
      challenges.map((c) => (c.id === id ? { ...c, isCompleted: !c.isCompleted } : c))
    );

    if (isCompleting) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 1000,
        });
    }
  };

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <p className="mb-8 text-muted-foreground">{t.pageDescription}</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => {
          const Icon = challenge.icon;
          return (
          <Card key={challenge.id} className={cn("transition-all hover:shadow-lg hover:-translate-y-0.5", challenge.isCompleted ? "bg-primary/10 border-primary/20" : "")}>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
               <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", challenge.isCompleted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary')}>
                   <Icon className="w-6 h-6" />
                </div>
                <div>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription className="mt-1">{challenge.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Button 
                    onClick={() => handleToggleChallenge(challenge.id)} 
                    className={cn("w-full transition-colors", challenge.isCompleted ? "bg-green-600 hover:bg-green-700" : "")}
                >
                    {challenge.isCompleted ? (
                        <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t.undo}
                        </>
                    ) : (
                       <>
                         <Check className="mr-2 h-4 w-4" />
                         {t.markAsDone}
                       </>
                    )}
                </Button>
            </CardContent>
          </Card>
        )})}
      </div>
    </main>
  );
}
