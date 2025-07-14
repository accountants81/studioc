"use client";

import React, { useMemo, useContext, useState, useEffect } from "react";
import { isToday, isFuture, isPast } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon, CheckCircle, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TasksContext } from "@/contexts/task-provider";
import { getSuggestion } from "@/ai/flows/suggestion-flow";
import { Skeleton } from "@/components/ui/skeleton";

function AssistantCard() {
    const { tasks } = useContext(TasksContext);
    const [suggestion, setSuggestion] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSuggestion() {
            try {
                setIsLoading(true);
                const relevantTasks = tasks.map(({ title, status, priority, category }) => ({ title, status, priority, category }));
                const result = await getSuggestion({ tasks: relevantTasks });
                setSuggestion(result.suggestion);
            } catch (error) {
                console.error("Error fetching suggestion:", error);
                setSuggestion("حدث خطأ أثناء محاولة الحصول على اقتراح. حاول مرة أخرى.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchSuggestion();
    }, [tasks]);


    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow bg-primary/10 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">المساعد الذكي</CardTitle>
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

  const todayTasks = useMemo(() => tasks.filter(task => isToday(new Date(task.dueDate))), [tasks]);
  const upcomingTasks = useMemo(() => tasks.filter(task => isFuture(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter(task => isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed'), [tasks]);
  
  const inProgressCount = useMemo(() => tasks.filter(t => t.status === 'in-progress').length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title="لوحة التحكم">
        <AddTaskDialog>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" />
            <span>إضافة مهمة جديدة</span>
          </Button>
        </AddTaskDialog>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
         <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مهام قيد التنفيذ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.length > 0 ? `${Math.round((inProgressCount / tasks.length) * 100)}% من الإجمالي` : 'لا توجد مهام'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مهام مكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
             <p className="text-xs text-muted-foreground">
              {tasks.length > 0 ? `${Math.round((completedCount / tasks.length) * 100)}% من الإجمالي` : 'لا توجد مهام'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مهام متأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
             <p className="text-xs text-muted-foreground">
              {tasks.length > 0 ? `${Math.round((overdueTasks.length / tasks.length) * 100)}% من الإجمالي` : 'لا توجد مهام'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">لديك {tasks.length} مهام مسجلة</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <AssistantCard />
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="today">مهام اليوم ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="upcoming">المهام القادمة ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">المهام المتأخرة ({overdueTasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-6">
          <TaskList tasks={todayTasks} emptyMessage="لا توجد مهام لهذا اليوم! لم لا تبدأ بإضافة واحدة؟" />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-6">
           <TaskList tasks={upcomingTasks} emptyMessage="لا توجد مهام قادمة. خطط لأسبوعك الآن!" />
        </TabsContent>
        <TabsContent value="overdue" className="mt-6">
           <TaskList tasks={overdueTasks} emptyMessage="لا توجد مهام متأخرة. عمل رائع!" />
        </TabsContent>
      </Tabs>
    </main>
  );
}
