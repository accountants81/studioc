"use client";

import React, { createContext, useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

type TasksContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  isLoading: boolean;
  notifyTaskCompleted: () => void;
};

export const TasksContext = createContext<TasksContextType>({
  tasks: [],
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  isLoading: true,
  notifyTaskCompleted: () => {},
});

type Streak = {
  count: number;
  lastCompletedDate: string;
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('timeflow-tasks', []);
  const [streak, setStreak] = useLocalStorage<Streak>('timeflow-streak', { count: 0, lastCompletedDate: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
    };
    setTasks(prevTasks => [...prevTasks, newTask].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    );
     if (updates.status === 'completed') {
      notifyTaskCompleted();
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const notifyTaskCompleted = () => {
    const today = new Date().toISOString().split('T')[0];
    if (streak.lastCompletedDate !== today) {
        const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0];
        if (streak.lastCompletedDate === yesterday) {
            // Increment streak
            setStreak({ count: streak.count + 1, lastCompletedDate: today });
        } else {
            // Reset streak
            setStreak({ count: 1, lastCompletedDate: today });
        }
    }
  };

  const value = { tasks, addTask, updateTask, deleteTask, isLoading, notifyTaskCompleted };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};
