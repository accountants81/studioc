"use client";

import React, { useMemo, useContext } from "react";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskList } from "@/components/task-list";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TasksContext } from "@/contexts/task-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

const translations = {
    ar: {
        pageTitle: "المهام الأسبوعية",
        addTask: "إضافة مهمة جديدة",
        emptyMessage: "لا توجد مهام مجدولة لهذا الأسبوع."
    },
    en: {
        pageTitle: "Weekly Tasks",
        addTask: "Add New Task",
        emptyMessage: "No tasks scheduled for this week."
    }
}

export default function WeeklyPage() {
  const { tasks } = useContext(TasksContext);
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  const weeklyTasks = useMemo(() => {
    const today = new Date();
    const locale = lang === 'ar' ? ar : enUS;
    const weekStart = startOfWeek(today, { locale });
    const weekEnd = endOfWeek(today, { locale });
    return tasks.filter(task => isWithinInterval(new Date(task.dueDate), { start: weekStart, end: weekEnd }));
  }, [tasks, lang]);

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title={t.pageTitle}>
         <AddTaskDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>{t.addTask}</span>
            </Button>
        </AddTaskDialog>
      </PageHeader>
      <TaskList tasks={weeklyTasks} emptyMessage={t.emptyMessage} />
    </main>
  );
}
