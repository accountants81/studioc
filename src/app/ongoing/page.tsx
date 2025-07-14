"use client";

import React, { useMemo, useContext } from "react";
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
        pageTitle: "المهام المستمرة",
        addTask: "إضافة مهمة جديدة",
        emptyMessage: "لا توجد مهام مستمرة."
    },
    en: {
        pageTitle: "Ongoing Tasks",
        addTask: "Add New Task",
        emptyMessage: "No ongoing tasks found."
    }
}

export default function OngoingPage() {
  const { tasks } = useContext(TasksContext);
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  const ongoingTasks = useMemo(() => {
    return tasks.filter(task => task.isRecurring);
  }, [tasks]);

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
      <TaskList tasks={ongoingTasks} emptyMessage={t.emptyMessage} />
    </main>
  );
}
