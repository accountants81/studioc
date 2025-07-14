import { z } from "zod";

export const priorities = ["low", "medium", "high"] as const;
export const statuses = ["pending", "in-progress", "completed"] as const;
export const categories = ["personal", "work", "study", "other"] as const;

export function getTaskSchema(titleErrorMsg: string) {
    return z.object({
        id: z.string().default(() => crypto.randomUUID()),
        title: z.string().min(3, titleErrorMsg),
        description: z.string().optional(),
        dueDate: z.date({
            required_error: "Due date is required.",
        }),
        priority: z.enum(priorities).default("medium"),
        status: z.enum(statuses).default("pending"),
        category: z.enum(categories).default("personal"),
        isRecurring: z.boolean().default(false),
    });
}
const baseTaskSchema = getTaskSchema("Title must be at least 3 characters.");

// This is the type for the data stored in localStorage
export type Task = Omit<z.infer<typeof baseTaskSchema>, 'dueDate'> & {
    dueDate: string; // Stored as ISO string
};

export type TaskPriority = z.infer<typeof baseTaskSchema.shape.priority>;
export type TaskStatus = z.infer<typeof baseTaskSchema.shape.status>;
export type TaskCategory = z.infer<typeof baseTaskSchema.shape.category>;
