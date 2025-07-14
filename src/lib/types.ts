import { z } from "zod";

export const priorities = ["low", "medium", "high"] as const;
export const statuses = ["pending", "in-progress", "completed"] as const;
export const categories = ["personal", "work", "study", "other"] as const;

export const taskSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: z.string().min(3, "يجب أن يكون العنوان 3 أحرف على الأقل"),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "تاريخ الاستحقاق مطلوب.",
  }),
  priority: z.enum(priorities).default("medium"),
  status: z.enum(statuses).default("pending"),
  category: z.enum(categories).default("personal"),
  isRecurring: z.boolean().default(false),
});

// This is the type for the data stored in localStorage
export type Task = Omit<z.infer<typeof taskSchema>, 'dueDate'> & {
    dueDate: string; // Stored as ISO string
};

export type TaskPriority = z.infer<typeof taskSchema.shape.priority>;
export type TaskStatus = z.infer<typeof taskSchema.shape.status>;
export type TaskCategory = z.infer<typeof taskSchema.shape.category>;
