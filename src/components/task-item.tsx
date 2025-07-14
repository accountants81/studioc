"use client";

import { useContext } from "react";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { ar, enUS } from 'date-fns/locale';
import Link from 'next/link';
import {
  Flag,
  Tag,
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  Circle,
  CheckCircle,
  Loader,
  Timer
} from "lucide-react";

import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { TasksContext } from "@/contexts/task-provider";
import { AddTaskDialog } from "./add-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useLocalStorage } from "@/hooks/use-local-storage";

const translations = {
  ar: {
    high: "أولوية عالية",
    medium: "أولوية متوسطة",
    low: "أولوية منخفضة",
    personal: "شخصي",
    work: "عمل",
    study: "دراسة",
    other: "أخرى",
    pending: "قيد الانتظار",
    'in-progress': "قيد التنفيذ",
    completed: "مكتملة",
    statusUpdated: "تم تحديث حالة المهمة إلى:",
    deleted: "تم حذف المهمة",
    focus: "الدخول لوضع التركيز",
    edit: "تعديل المهمة",
    moreOptions: "المزيد",
    delete: "حذف"
  },
  en: {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Low Priority",
    personal: "Personal",
    work: "Work",
    study: "Study",
    other: "Other",
    pending: "Pending",
    'in-progress': "In Progress",
    completed: "Completed",
    statusUpdated: "Task status updated to:",
    deleted: "Task deleted",
    focus: "Focus Mode",
    edit: "Edit task",
    moreOptions: "More options",
    delete: "Delete"
  }
};

type TaskItemProps = {
  task: Task;
};

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  high: <Flag className="h-4 w-4 text-red-500" />,
  medium: <Flag className="h-4 w-4 text-yellow-500" />,
  low: <Flag className="h-4 w-4 text-blue-500" />,
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
    pending: <Circle className="h-4 w-4 text-muted-foreground" />,
    'in-progress': <Loader className="h-4 w-4 text-blue-500 animate-spin" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask } = useContext(TasksContext);
  const { toast } = useToast();
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { ...task, status });
    toast({ title: `${t.statusUpdated} ${t[status]}` });
  };
  
  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      handleStatusChange('completed');
    } else {
      handleStatusChange('pending');
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast({ title: t.deleted, variant: "destructive" });
  };

  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const locale = lang === 'ar' ? ar : enUS;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-lg hover:border-primary/50",
        isCompleted && "border-green-500/40 bg-green-500/5",
        isOverdue && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex h-full items-center pt-1">
        <Checkbox
          id={`task-${task.id}`}
          checked={isCompleted}
          onCheckedChange={handleCheckedChange}
          className={cn("h-5 w-5 rounded-full", isCompleted ? "border-green-500 text-green-500" : "")}
          aria-label={`Mark task ${task.title} as ${isCompleted ? 'not completed' : 'completed'}`}
        />
      </div>
      <div className="flex-1">
        <p className={cn("font-medium text-card-foreground", isCompleted && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className={cn("flex items-center gap-1.5", isOverdue && "text-destructive font-medium")}>
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(task.dueDate), "d MMMM yyyy", { locale })}</span>
            <span className="text-xs">({formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale })})</span>
          </div>
          <div className="flex items-center gap-1.5">
            {priorityIcons[task.priority]}
            <span>{t[task.priority]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            <Badge variant="outline">{t[task.category as keyof typeof t] || task.category}</Badge>
          </div>
           <div className="flex items-center gap-1.5">
            {statusIcons[task.status]}
            <span>{t[task.status]}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
              <TooltipTrigger asChild>
                  <Link href={`/focus/${task.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={t.focus}>
                          <Timer className="h-4 w-4" />
                      </Button>
                  </Link>
              </TooltipTrigger>
              <TooltipContent>
                  <p>{t.focus}</p>
              </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AddTaskDialog task={task}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={t.edit}>
                <Edit className="h-4 w-4" />
            </Button>
        </AddTaskDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label={t.moreOptions}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t.delete}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
