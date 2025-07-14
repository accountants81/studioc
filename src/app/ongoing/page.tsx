"use client";

import React, { useMemo, useContext } from "react";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskList } from "@/components/task-list";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TasksContext } from "@/contexts/task-provider";

export default function OngoingPage() {
  const { tasks } = useContext(TasksContext);

  const ongoingTasks = useMemo(() => {
    return tasks.filter(task => task.isRecurring);
  }, [tasks]);

  return (
    <main className="container mx-auto py-4 sm:py-6 lg:py-8">
      <PageHeader title="المهام المستمرة">
         <AddTaskDialog>
            <Button>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة مهمة جديدة</span>
            </Button>
        </AddTaskDialog>
      </PageHeader>
      <TaskList tasks={ongoingTasks} emptyMessage="لا توجد مهام مستمرة." />
    </main>
  );
}
