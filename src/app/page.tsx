"use client";

import React, { useMemo, useContext, useState, useEffect } from "react";
import { isToday, isFuture, isPast } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon, CheckCircle, Clock, AlertTriangle, Sparkles, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TasksContext } from "@/contexts/task-provider";
import { getSuggestion } from "@/ai/flows/suggestion-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Input } from "@/components/ui/input";

const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    addTask: "إضافة مهمة جديدة",
    inProgressTasks: "مهام قيد التنفيذ",
    completedTasks: "مهام مكتملة",
    overdueTasks: "مهام متأخرة",
    totalTasks: "إجمالي المهام",
    ofTotal: "من الإجمالي",
    noTasks: "لا توجد مهام",
    registeredTasks: "لديك {count} مهام مسجلة",
    assistant: "المساعد الذكي",
    assistantError: "حدث خطأ أثناء محاولة الحصول على اقتراح. حاول مرة أخرى.",
    todayTasks: "مهام اليوم",
    upcomingTasks: "المهام القادمة",
    overdueTasksTab: "المهام المتأخرة",
    emptyToday: "لا توجد مهام لهذا اليوم! لم لا تبدأ بإضافة واحدة؟",
    emptyUpcoming: "لا توجد مهام قادمة. خطط لأسبوعك الآن!",
    emptyOverdue: "لا توجد مهام متأخرة. عمل رائع!",
    searchPlaceholder: "ابحث عن مهمة...",
  },
  en: {
    dashboard: "Dashboard",
    addTask: "Add New Task",
    inProgressTasks: "In Progress",
    completedTasks: "Completed",
    overdueTasks: "Overdue",
    totalTasks: "Total Tasks",
    ofTotal: "of total",
    noTasks: "No tasks yet",
    registeredTasks: "You have {count} registered tasks",
    assistant: "AI Assistant",
    assistantError: "An error occurred while fetching a suggestion. Please try again.",
    todayTasks: "Today's Tasks",
    upcomingTasks: "Upcoming Tasks",
    overdueTasksTab: "Overdue Tasks",
    emptyToday: "No tasks for today! Why not add one?",
    emptyUpcoming: "No upcoming tasks. Plan your week now!",
    emptyOverdue: "No overdue tasks. Great job!",
    searchPlaceholder: "Search for a task...",
  },
};

function AssistantCard() {
    const { tasks } = useContext(TasksContext);
    const [suggestion, setSuggestion] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [lang] = useLocalStorage('app-lang', 'ar');
    const t = translations[lang];

    useEffect(() => {
        async function fetchSuggestion() {
            try {
                setIsLoading(true);
                const relevantTasks = tasks.map(({ title, status, priority, category }) => ({ title, status, priority, category }));
                const result = await getSuggestion({ tasks: relevantTasks, lang });
                setSuggestion(result.suggestion);
            } catch (error) {
                console.error("Error fetching suggestion:", error);
                setSuggestion(t.assistantError);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSuggestion();
    }, [tasks, lang, t.assistantError]);


    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-primary/10 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">{t.assistant}</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : (
                <p className="text-sm text-primary/90 pt-2">{suggestion}</p>
            )}
          </CardContent>
        </Card>
    )
}


export default function DailyTasksPage() {
  const { tasks } = useContext(TasksContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [lang] = useLocalStorage('app-lang', 'ar');
  const t = translations[lang];

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const todayTasks = useMemo(() => filteredTasks.filter(task => isToday(new Date(task.dueDate))), [filteredTasks]);
  const upcomingTasks = useMemo(() => filteredTasks.filter(task => isFuture(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))), [filteredTasks]);
  const overdueTasks = useMemo(() => filteredTasks.filter(task => isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed'), [filteredTasks]);
  
  const inProgressCount = useMemo(() => tasks.filter(t => t.status === 'in-progress').length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.dashboard}>
        <AddTaskDialog>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            <span>{t.addTask}</span>
          </Button>
        </AddTaskDialog>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
         <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.inProgressTasks}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.length > 0 ? `${Math.round((inProgressCount / tasks.length) * 100)}% ${t.ofTotal}` : t.noTasks}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.completedTasks}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
             <p className="text-xs text-muted-foreground">
              {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}% ${t.ofTotal}` : t.noTasks}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.overdueTasks}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
             <p className="text-xs text-muted-foreground">
              {tasks.length > 0 ? `${Math.round((overdueTasks.length / tasks.length) * 100)}% ${t.ofTotal}` : t.noTasks}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalTasks}</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">{t.registeredTasks.replace('{count}', tasks.length.toString())}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <AssistantCard />
      </div>

       <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-base"
        />
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="today">{t.todayTasks} ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="upcoming">{t.upcomingTasks} ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">{t.overdueTasksTab} ({overdueTasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-6">
          <TaskList tasks={todayTasks} emptyMessage={t.emptyToday} />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-6">
           <TaskList tasks={upcomingTasks} emptyMessage={t.emptyUpcoming} />
        </TabsContent>
        <TabsContent value="overdue" className="mt-6">
           <TaskList tasks={overdueTasks} emptyMessage={t.emptyOverdue} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
