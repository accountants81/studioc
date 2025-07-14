"use client";

import { Task } from "@/lib/types";
import { TaskItem } from "@/components/task-item";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

type TaskListProps = {
  tasks: Task[],
  emptyMessage: string
};

const translations = {
  ar: {
    addTask: "إضافة مهمة جديدة",
    emptySub: "أضف مهمة جديدة للبدء."
  },
  en: {
    addTask: "Add New Task",
    emptySub: "Add a new task to get started."
  }
}

export function TaskList({ tasks, emptyMessage }: TaskListProps) {
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center h-[50vh]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <CalendarIcon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{emptyMessage}</h3>
        <p className="text-muted-foreground mt-2">{t.emptySub}</p>
        <div className="mt-6">
          <AddTaskDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>{t.addTask}</span>
            </Button>
          </AddTaskDialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
