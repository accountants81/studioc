"use client";

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TasksContext } from '@/contexts/task-provider';
import { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

const FOCUS_DURATION = 25 * 60; // 25 minutes

const translations = {
  ar: {
    taskNotFound: "لم يتم العثور على المهمة.",
    descriptionPlaceholder: "استغل هذا الوقت للتركيز الكامل على مهمتك.",
    exitFocus: "الخروج من وضع التركيز",
    pause: "إيقاف مؤقت",
    start: "ابدأ",
  },
  en: {
    taskNotFound: "Task not found.",
    descriptionPlaceholder: "Use this time to fully focus on your task.",
    exitFocus: "Exit Focus Mode",
    pause: "Pause",
    start: "Start",
  }
};

export default function FocusPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;
  const { tasks, isLoading: tasksLoading } = useContext(TasksContext);
  
  const [task, setTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!tasksLoading && taskId) {
      const foundTask = tasks.find(t => t.id === taskId);
      setTask(foundTask || null);
    }
  }, [taskId, tasks, tasksLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play a sound
      new Audio('/notification.mp3').play().catch(e => console.error("Error playing sound:", e));
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(FOCUS_DURATION);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!isClient || tasksLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background p-4">
              <Card className="w-full max-w-lg mx-auto shadow-2xl bg-card/80">
                  <CardHeader className="text-center">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center space-y-8 py-12">
                      <Skeleton className="h-48 w-48 rounded-full" />
                      <div className="flex space-x-4">
                        <Skeleton className="h-12 w-24 rounded-full" />
                        <Skeleton className="h-12 w-12 rounded-full" />
                      </div>
                  </CardContent>
              </Card>
          </div>
      )
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>{t.taskNotFound}</p>
      </div>
    );
  }

  const progress = ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100;

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4 relative">
        <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/')}
        >
            <X className="h-6 w-6" />
            <span className="sr-only">{t.exitFocus}</span>
        </Button>
      <Card className={cn(
          "w-full max-w-lg mx-auto shadow-2xl transition-colors duration-500",
          isActive ? 'border-primary/50' : 'border-border',
          timeLeft === 0 && 'border-green-500/50'
          )}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">{task.title}</CardTitle>
          <CardDescription>
            {task.description || t.descriptionPlaceholder}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-8 py-12">
            <div className="relative h-64 w-64">
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                    <circle 
                        className="stroke-current text-muted/20" 
                        strokeWidth="5" 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="transparent"
                    />
                    <circle 
                        className={cn(
                            "stroke-current transition-all duration-1000 ease-linear",
                             timeLeft === 0 ? "text-green-500" : "text-primary"
                             )}
                        strokeWidth="5" 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="transparent"
                        strokeDasharray="282.6"
                        strokeDashoffset={282.6 - (progress / 100) * 282.6}
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-mono tracking-tighter text-foreground">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

          <div className="flex items-center space-x-4">
            <Button onClick={toggleTimer} size="lg" className="w-32 h-16 rounded-full text-lg shadow-lg">
              {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
              <span>{isActive ? t.pause : t.start}</span>
            </Button>
            <Button onClick={resetTimer} variant="outline" size="icon" className="w-16 h-16 rounded-full shadow-lg">
              <RotateCcw />
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
