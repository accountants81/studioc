"use client";

import { useContext } from "react";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { ar, enUS } from 'date-fns/locale';
import Link from 'next/link';
import {
  Flag,
  Tag,
  Calendar,
  Trash2,
  Edit,
  Circle,
  CheckCircle,
  Loader,
  Timer,
  Play,
  Pause
} from "lucide-react";

import { Task, TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TasksContext } from "@/contexts/task-provider";
import { AddTaskDialog } from "./add-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

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
    taskDeleted: "تم حذف المهمة",
    focus: "الدخول لوضع التركيز",
    edit: "تعديل المهمة",
    delete: "حذف",
    confirmDeleteTitle: "هل أنت متأكد؟",
    confirmDeleteDesc: "سيتم حذف هذه المهمة نهائيًا.",
    completeTask: "إكمال المهمة",
    startTask: "بدء المهمة",
    pauseTask: "إيقاف المهمة مؤقتًا",
    reopenTask: "إعادة فتح المهمة",
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
    taskDeleted: "Task deleted",
    focus: "Focus Mode",
    edit: "Edit task",
    delete: "Delete",
    confirmDeleteTitle: "Are you sure?",
    confirmDeleteDesc: "This task will be permanently deleted.",
    completeTask: "Complete Task",
    startTask: "Start Task",
    pauseTask: "Pause Task",
    reopenTask: "Re-open Task",
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
    'in-progress': <Loader className="h-4 w-4 text-primary animate-spin" />,
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, deleteTask, notifyTaskCompleted } = useContext(TasksContext);
  const { toast } = useToast();
  const [lang] = useLocalStorage<'ar' | 'en'>('app-lang', 'ar');
  const t = translations[lang];

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { ...task, status });
    toast({ title: `${t.statusUpdated} ${t[status]}` });
    if(status === 'completed') {
        notifyTaskCompleted();
    }
  };
  
  const handleTogglePlayPause = () => {
    if (task.status === 'in-progress') {
        handleStatusChange('pending');
    } else if (task.status === 'pending') {
        handleStatusChange('in-progress');
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast({ title: t.taskDeleted, variant: "destructive" });
  };

  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const locale = lang === 'ar' ? ar : enUS;

  const renderActionButtons = () => {
      if (isCompleted) {
          return (
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={() => handleStatusChange('pending')} variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600">
                        <CheckCircle className="h-5 w-5 text-slate-500" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t.reopenTask}</p>
                </TooltipContent>
            </Tooltip>
          )
      }

      return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Button onClick={() => handleStatusChange('completed')} variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-800/60">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t.completeTask}</p>
                </TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handleTogglePlayPause} variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/50 dark:hover:bg-orange-800/60">
                       {task.status === 'in-progress' 
                            ? <Pause className="h-4 w-4 text-orange-600 dark:text-orange-400" /> 
                            : <Play className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        }
                    </Button>
                </TooltipTrigger>
                 <TooltipContent>
                    <p>{task.status === 'in-progress' ? t.pauseTask : t.startTask}</p>
                </TooltipContent>
            </Tooltip>
        </>
      )
  }

  return (
    <TooltipProvider>
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card p-3 transition-all hover:shadow-lg hover:-translate-y-0.5",
        isCompleted && "border-green-500/20 bg-green-500/5",
        isOverdue && "border-destructive/20 bg-destructive/5"
      )}
    >
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
      <div className="flex items-center gap-1.5">
         {renderActionButtons()}
         <AddTaskDialog task={task}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-800/60">
                        <Edit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t.edit}</p>
                </TooltipContent>
            </Tooltip>
        </AddTaskDialog>
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/60">
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>
                 <TooltipContent>
                    <p>{t.delete}</p>
                </TooltipContent>
            </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.confirmDeleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.confirmDeleteDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                {t.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
      </div>
    </div>
    </TooltipProvider>
  );
}
