'use server';
/**
 * @fileOverview An AI assistant that provides suggestions and motivation.
 *
 * - getSuggestion - A function that returns a suggestion based on the user's tasks.
 * - SuggestionInput - The input type for the getSuggestion function.
 * - SuggestionOutput - The return type for the getSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string(),
  status: z.string(),
  priority: z.string(),
  category: z.string(),
});

const SuggestionInputSchema = z.object({
  tasks: z.array(taskSchema).describe("The user's current list of tasks."),
  lang: z.enum(['ar', 'en']).default('ar').describe("The language for the response."),
});
export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;

const SuggestionOutputSchema = z.object({
  suggestion: z.string().describe('A helpful suggestion or a motivational message for the user.'),
});
export type SuggestionOutput = z.infer<typeof SuggestionOutputSchema>;

export async function getSuggestion(input: SuggestionInput): Promise<SuggestionOutput> {
  return suggestionFlow(input);
}

const prompts = {
    ar: `
    You are a friendly and motivational assistant for a task management app called MomentumFlow.
    Your goal is to help the user stay productive and feel good about their progress.
    You must answer in Arabic.

    Analyze the user's task list:
    - If the list is empty, provide 2-3 simple and actionable task suggestions to help them get started. (e.g., "خطط لأسبوعك", "نظّف مكتبك", "اقرأ لمدة 15 دقيقة").
    - If there are tasks, but none are overdue, provide a short, encouraging, and motivational message.
    - If there are overdue tasks, provide a gentle and supportive reminder to look at them, without being pushy.
    
    Current Tasks:
    {{#if tasks}}
      {{#each tasks}}
        - {{this.title}} (Status: {{this.status}}, Priority: {{this.priority}})
      {{/each}}
    {{else}}
      The user has no tasks.
    {{/if}}
  `,
  en: `
    You are a friendly and motivational assistant for a task management app called MomentumFlow.
    Your goal is to help the user stay productive and feel good about their progress.
    You must answer in English.

    Analyze the user's task list:
    - If the list is empty, provide 2-3 simple and actionable task suggestions to help them get started. (e.g., "Plan your week", "Clean your desk", "Read for 15 minutes").
    - If there are tasks, but none are overdue, provide a short, encouraging, and motivational message.
    - If there are overdue tasks, provide a gentle and supportive reminder to look at them, without being pushy.
    
    Current Tasks:
    {{#if tasks}}
      {{#each tasks}}
        - {{this.title}} (Status: {{this.status}}, Priority: {{this.priority}})
      {{/each}}
    {{else}}
      The user has no tasks.
    {{/if}}
  `
};

const suggestionFlow = ai.defineFlow(
  {
    name: 'suggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: SuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
        prompt: prompts[input.lang],
        model: 'googleai/gemini-1.5-flash',
        input: input,
        output: { schema: SuggestionOutputSchema }
    });
    return output!;
  }
);
