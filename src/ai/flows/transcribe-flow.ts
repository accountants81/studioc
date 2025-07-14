'use server';
/**
 * @fileOverview An AI flow for transcribing audio files.
 *
 * - transcribeAudio - A function that takes an audio data URI and returns its transcription.
 * - TranscribeInput - The input type for the transcribeAudio function.
 * - TranscribeOutput - The return type for the transcribeAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranscribeInputSchema = z.object({
  audioUri: z.string().describe(
    "A recorded audio file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type TranscribeInput = z.infer<typeof TranscribeInputSchema>;

const TranscribeOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeOutput = z.infer<typeof TranscribeOutputSchema>;

export async function transcribeAudio(input: TranscribeInput): Promise<TranscribeOutput> {
  return transcribeAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribePrompt',
  input: { schema: TranscribeInputSchema },
  output: { schema: TranscribeOutputSchema },
  prompt: `
    Transcribe the following audio recording. The language of the audio could be Arabic or English.
    Provide only the transcribed text as the output.

    Audio: {{media url=audioUri}}
  `,
  model: 'googleai/gemini-2.0-flash',
  config: {
    temperature: 0.1,
  },
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeInputSchema,
    outputSchema: TranscribeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { transcription: "Could not transcribe audio." };
    }
    return output;
  }
);
