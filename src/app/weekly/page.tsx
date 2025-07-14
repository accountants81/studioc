"use client";

import React, { useMemo, useContext } from "react";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { ar } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskList } from "@/components/task-list";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TasksContext } from "@/contexts/task-provider";

export default function WeeklyPage() {
  const { tasks } = useContext(TasksContext);

  const weeklyTasks = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ar });
    const weekEnd = endOfWeek(today, { locale: ar });
    return tasks.filter(task => isWithinInterval(new Date(task.dueDate), { start: weekStart, end: weekEnd }));
  }, [tasks]);

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title="المهام الأسبوعية">
         <AddTaskDialog>
            <Button>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة مهمة جديدة</span>
            </Button>
        </AddTaskDialog>
      </PageHeader>
      <TaskList tasks={weeklyTasks} emptyMessage="لا توجد مهام مجدولة لهذا الأسبوع." />
    </main>
  );
}
