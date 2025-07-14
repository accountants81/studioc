"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trophy, Award, Medal, Star } from "lucide-react";
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

  const initialChallenges: Challenge[] = [
    { id: "c1", title: t.challenge_1_title, description: t.challenge_1_desc, icon: Star, isCompleted: false },
    { id: "c2", title: t.challenge_2_title, description: t.challenge_2_desc, icon: Medal, isCompleted: false },
    { id: "c3", title: t.challenge_3_title, description: t.challenge_3_desc, icon: Award, isCompleted: false },
    { id: "c4", title: t.challenge_4_title, description: t.challenge_4_desc, icon: Trophy, isCompleted: false },
    { id: "c5", title: t.challenge_5_title, description: t.challenge_5_desc, icon: Star, isCompleted: false },
    { id: "c6", title: t.challenge_6_title, description: t.challenge_6_desc, icon: Medal, isCompleted: false },
  ];
  
  const [challenges, setChallenges] = useLocalStorage<Challenge[]>("momentum-challenges-v1", initialChallenges);

  // This ensures that new challenges from code are added to localStorage if they don't exist
  useState(() => {
    setChallenges(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newChallenges = initialChallenges.filter(c => !existingIds.has(c.id));
        return [...prev, ...newChallenges];
    });
  });

  const handleCompleteChallenge = (id: string) => {
    setChallenges(
      challenges.map((c) => (c.id === id ? { ...c, isCompleted: true } : c))
    );
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
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
                    onClick={() => handleCompleteChallenge(challenge.id)} 
                    disabled={challenge.isCompleted}
                    className={cn("w-full", challenge.isCompleted ? "bg-green-500 hover:bg-green-600" : "")}
                >
                    {challenge.isCompleted ? (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            {t.completed}
                        </>
                    ) : t.markAsDone}
                </Button>
            </CardContent>
          </Card>
        )})}
      </div>
    </main>
  );
}
