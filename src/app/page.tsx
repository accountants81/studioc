"use client";

import React, { useState, useMemo, useContext } from "react";
import { format, isToday, isFuture, isPast } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskItem } from "@/components/task-item";
import { Task, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksContext } from "@/contexts/task-provider";

export default function DailyTasksPage() {
  const { tasks } = useContext(TasksContext);
  const [currentTab, setCurrentTab] = useState<string>("today");

  const todayTasks = useMemo(() => tasks.filter(task => isToday(new Date(task.dueDate))), [tasks]);
  const upcomingTasks = useMemo(() => tasks.filter(task => isFuture(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter(task => isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed'), [tasks]);

  const TaskList = ({ tasks, emptyMessage }: { tasks: Task[], emptyMessage: string }) => {
    if (tasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card/20 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CalendarIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{emptyMessage}</h3>
          <p className="text-muted-foreground mt-2">أضف مهمة جديدة للبدء.</p>
          <div className="mt-6">
            <AddTaskDialog>
              <Button>
                <PlusCircle className="ml-2 h-4 w-4" />
                <span>إضافة مهمة جديدة</span>
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
  };

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

      <Tabs defaultValue="today" onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="today">مهام اليوم ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="upcoming">المهام القادمة ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">المهام المتأخرة ({overdueTasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-6">
          <TaskList tasks={todayTasks} emptyMessage="لا توجد مهام لهذا اليوم!" />
        </TabsContent>
        <TabsContent value="upcoming" className="mt-6">
           <TaskList tasks={upcomingTasks} emptyMessage="لا توجد مهام قادمة." />
        </TabsContent>
        <TabsContent value="overdue" className="mt-6">
           <TaskList tasks={overdueTasks} emptyMessage="لا توجد مهام متأخرة." />
        </TabsContent>
      </Tabs>
    </main>
  );
}
