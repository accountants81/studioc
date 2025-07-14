"use client";

import { PageHeader } from "@/components/page-header";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useContext, useMemo } from "react";
import { TasksContext } from "@/contexts/task-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { isThisWeek, parseISO, eachDayOfInterval, format, isThisMonth } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const translations = {
  ar: {
    pageTitle: "تحليلات الأداء",
    weeklyCompletion: "إنجاز المهام الأسبوعي",
    monthlyCompletion: "إنجاز المهام الشهري",
    tasksCompleted: "مهام مكتملة",
    noData: "لا توجد بيانات كافية لعرض التحليلات.",
    noDataDesc: "أكمل بعض المهام لتبدأ في رؤية إحصائياتك.",
  },
  en: {
    pageTitle: "Performance Analytics",
    weeklyCompletion: "Weekly Task Completion",
    monthlyCompletion: "Monthly Task Completion",
    tasksCompleted: "Tasks Completed",
    noData: "Not enough data to display analytics.",
    noDataDesc: "Complete some tasks to start seeing your stats.",
  },
};

export default function AnalyticsPage() {
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];
  const { tasks } = useContext(TasksContext);
  const locale = lang === 'ar' ? ar : enUS;

  const weeklyData = useMemo(() => {
    const today = new Date();
    const startOfWeek = (date: Date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    const weekStart = startOfWeek(today);
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23,59,59,999);
    
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map(day => {
        const completedTasks = tasks.filter(task => {
            const taskDate = parseISO(task.dueDate);
            return task.status === 'completed' && format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });
        return {
            name: format(day, 'E', { locale }),
            [t.tasksCompleted]: completedTasks.length
        }
    });
  }, [tasks, t.tasksCompleted, locale]);
  
  const hasData = useMemo(() => tasks.some(task => task.status === 'completed'), [tasks]);

  if (!hasData) {
      return (
        <main className="container mx-auto py-4 sm:py-6 lg:py-8">
             <PageHeader title={t.pageTitle} />
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-[50vh]">
                <LineChart className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{t.noData}</h3>
                <p className="text-muted-foreground mt-2">{t.noDataDesc}</p>
            </div>
        </main>
      )
  }

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle} />
      <div className="grid gap-8">
         <Card>
            <CardHeader>
                <CardTitle>{t.weeklyCompletion}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false}/>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            borderColor: 'hsl(var(--border))' 
                        }}
                    />
                    <Legend />
                    <Bar dataKey={t.tasksCompleted} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>
    </main>
  );
}
