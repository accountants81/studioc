"use client";

import { useContext } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ar, enUS } from 'date-fns/locale';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { categories, priorities, statuses, getTaskSchema } from "@/lib/types";
import type { Task } from "@/lib/types";
import { TasksContext } from "@/contexts/task-provider";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useLocalStorage } from "@/hooks/use-local-storage";

type AddTaskDialogProps = {
  children: React.ReactNode;
  task?: Task;
};

const translations = {
  ar: {
    editTask: "تعديل المهمة",
    addTask: "إضافة مهمة جديدة",
    editDesc: "قم بتعديل تفاصيل مهمتك هنا.",
    addDesc: "املأ التفاصيل أدناه لإنشاء مهمة جديدة.",
    taskTitle: "عنوان المهمة",
    taskTitlePlaceholder: "مثال: إنهاء التقرير الأسبوعي",
    description: "الوصف (اختياري)",
    descriptionPlaceholder: "أضف وصفًا موجزًا للمهمة",
    dueDate: "تاريخ الاستحقاق",
    pickDate: "اختر تاريخًا",
    priority: "الأولوية",
    priorityPlaceholder: "حدد الأولوية",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    category: "التصنيف",
    categoryPlaceholder: "اختر تصنيفًا",
    personal: "شخصي",
    work: "عمل",
    study: "دراسة",
    other: "أخرى",
    status: "الحالة",
    statusPlaceholder: "اختر الحالة",
    pending: "قيد الانتظار",
    inProgress: "قيد التنفيذ",
    completed: "مكتملة",
    recurringTask: "مهمة متكررة",
    isRoutine: "هل هذه المهمة روتينية؟",
    cancel: "إلغاء",
    saveChanges: "حفظ التغييرات",
    addTaskBtn: "إضافة المهمة",
    updateSuccess: "تم تحديث المهمة بنجاح",
    addSuccess: "تمت إضافة المهمة بنجاح",
  },
  en: {
    editTask: "Edit Task",
    addTask: "Add New Task",
    editDesc: "Modify the details of your task here.",
    addDesc: "Fill in the details below to create a new task.",
    taskTitle: "Task Title",
    taskTitlePlaceholder: "e.g., Finish weekly report",
    description: "Description (optional)",
    descriptionPlaceholder: "Add a brief description of the task",
    dueDate: "Due Date",
    pickDate: "Pick a date",
    priority: "Priority",
    priorityPlaceholder: "Select priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    category: "Category",
    categoryPlaceholder: "Select a category",
    personal: "Personal",
    work: "Work",
    study: "Study",
    other: "Other",
    status: "Status",
    statusPlaceholder: "Select status",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    recurringTask: "Recurring Task",
    isRoutine: "Is this a routine task?",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    addTaskBtn: "Add Task",
    updateSuccess: "Task updated successfully",
    addSuccess: "Task added successfully",
  },
};


export function AddTaskDialog({ children, task }: AddTaskDialogProps) {
  const { addTask, updateTask } = useContext(TasksContext);
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  
  const isEditMode = task !== undefined;
  const t = translations[lang];
  const taskSchema = getTaskSchema(t.taskTitle);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: isEditMode ? {
        ...task,
        dueDate: new Date(task.dueDate),
    } : {
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium",
      status: "pending",
      category: "personal",
      isRecurring: false,
    },
  });

  React.useEffect(() => {
    if (open) {
        const defaultValues = isEditMode ? {
            ...task,
            dueDate: new Date(task.dueDate),
        } : {
          title: "",
          description: "",
          dueDate: new Date(),
          priority: "medium",
          status: "pending",
          category: "personal",
          isRecurring: false,
        };
        form.reset(defaultValues);
    }
  }, [open, task, isEditMode, form]);

  function onSubmit(values: z.infer<typeof taskSchema>) {
    const taskData = {
        ...values,
        dueDate: values.dueDate.toISOString(),
    };

    if (isEditMode) {
        updateTask(task.id, taskData);
        toast({ title: t.updateSuccess });
    } else {
        addTask(taskData);
        toast({ title: t.addSuccess });
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t.editTask : t.addTask}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t.editDesc : t.addDesc}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.taskTitle}</FormLabel>
                  <FormControl>
                    <Input placeholder={t.taskTitlePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.description}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.descriptionPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t.dueDate}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: lang === 'ar' ? ar : enUS })
                          ) : (
                            <span>{t.pickDate}</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={lang === 'ar' ? ar : enUS}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.priority}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.priorityPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {t[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.category}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.categoryPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {t[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.status}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.statusPlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             <SelectItem value="pending">{t.pending}</SelectItem>
                             <SelectItem value="in-progress">{t.inProgress}</SelectItem>
                             <SelectItem value="completed">{t.completed}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                        <FormLabel className="mb-2.5">{t.recurringTask}</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Switch
                              id="isRecurring-switch"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="isRecurring-switch">{t.isRoutine}</Label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                    />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.cancel}</Button>
              <Button type="submit">{isEditMode ? t.saveChanges : t.addTaskBtn}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
