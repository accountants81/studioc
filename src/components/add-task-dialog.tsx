"use client";

import { useContext } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { ar } from 'date-fns/locale';

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
import { categories, priorities, statuses, taskSchema, Task } from "@/lib/types";
import { TasksContext } from "@/contexts/task-provider";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Switch } from "./ui/switch";

type AddTaskDialogProps = {
  children: React.ReactNode;
  task?: Task;
};

export function AddTaskDialog({ children, task }: AddTaskDialogProps) {
  const { addTask, updateTask } = useContext(TasksContext);
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  
  const isEditMode = task !== undefined;

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
    if (open && isEditMode) {
      form.reset({
        ...task,
        dueDate: new Date(task.dueDate),
      });
    } else if (open && !isEditMode) {
      form.reset();
    }
  }, [open, task, isEditMode, form]);

  function onSubmit(values: z.infer<typeof taskSchema>) {
    const taskData = {
        ...values,
        dueDate: values.dueDate.toISOString(),
    };

    if (isEditMode) {
        updateTask(task.id, taskData);
        toast({ title: "تم تحديث المهمة بنجاح" });
    } else {
        addTask(taskData);
        toast({ title: "تمت إضافة المهمة بنجاح" });
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'قم بتعديل تفاصيل مهمتك هنا.' : 'املأ التفاصيل أدناه لإنشاء مهمة جديدة.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان المهمة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: إنهاء التقرير الأسبوعي" {...field} />
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
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أضف وصفًا موجزًا للمهمة" {...field} />
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
                  <FormLabel>تاريخ الاستحقاق</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر تاريخًا</span>
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
                        locale={ar}
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
                    <FormLabel>الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="حدد الأولوية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p === 'high' ? 'عالية' : p === 'medium' ? 'متوسطة' : 'منخفضة'}
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
                    <FormLabel>التصنيف</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تصنيفًا" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c === 'personal' ? 'شخصي' : c === 'work' ? 'عمل' : c === 'study' ? 'دراسة' : 'أخرى'}
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
                        <FormLabel>الحالة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s === 'pending' ? 'قيد الانتظار' : s === 'in-progress' ? 'قيد التنفيذ' : 'مكتملة'}
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
                    name="isRecurring"
                    render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                        <FormLabel className="mb-2.5">مهمة متكررة</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="isRecurring-switch">هل هذه المهمة روتينية؟</Label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                    />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button type="submit">{isEditMode ? 'حفظ التغييرات' : 'إضافة المهمة'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
