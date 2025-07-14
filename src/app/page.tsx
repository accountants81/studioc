"use client";

import React, { useState, useMemo, useContext } from "react";
import { isToday, isFuture, isPast } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { AddTaskDialog } from "@/components/add-task-dialog";
import { TaskList } from "@/components/task-list";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { TasksContext } from "@/contexts/task-provider";

export default function DailyTasksPage() {
  const { tasks } = useContext(TasksContext);

  const todayTasks = useMemo(() => tasks.filter(task => isToday(new Date(task.dueDate))), [tasks]);
  const upcomingTasks = useMemo(() => tasks.filter(task => isFuture(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter(task => isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'completed'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(task => task.status === 'completed'), [tasks]);

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
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مهام قيد التنفيذ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مهام مكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مهام متأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
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
