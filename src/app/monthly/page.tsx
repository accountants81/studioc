"use client";

import React, { useMemo, useContext } from "react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskList } from "@/components/task-list";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TasksContext } from "@/contexts/task-provider";

export default function MonthlyPage() {
  const { tasks } = useContext(TasksContext);

  const monthlyTasks = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    return tasks.filter(task => isWithinInterval(new Date(task.dueDate), { start: monthStart, end: monthEnd }));
  }, [tasks]);

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title="المهام الشهرية">
         <AddTaskDialog>
            <Button>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة مهمة جديدة</span>
            </Button>
        </AddTaskDialog>
      </PageHeader>
      <TaskList tasks={monthlyTasks} emptyMessage="لا توجد مهام مجدولة لهذا الشهر." />
    </main>
  );
}
