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
};

export const TasksContext = createContext<TasksContextType>({
  tasks: [],
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  isLoading: true,
});

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('momentumflow-tasks', []);
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
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const value = { tasks, addTask, updateTask, deleteTask, isLoading };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};
