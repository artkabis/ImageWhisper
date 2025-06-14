
// 'use server';
/**
 * @fileOverview Generates a text caption (summary) for an image using an AI model.
 *
 * - generateImageCaption - A function that generates the caption/summary for an image.
 * - GenerateImageCaptionInput - The input type for the generateImageCaption function.
 * - GenerateImageCaptionOutput - The return type for the generateImageCaption function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetLanguage: z
    .string()
    .describe('The desired language for the caption, e.g., "French", "English".')
    .optional(),
  maxWords: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('The maximum number of words for the caption. If not provided, defaults to approximately 10 words.'),
});
export type GenerateImageCaptionInput = z.infer<typeof GenerateImageCaptionInputSchema>;

const GenerateImageCaptionOutputSchema = z.object({
  caption: z.string().describe('A concise summary of the image.'),
});
export type GenerateImageCaptionOutput = z.infer<typeof GenerateImageCaptionOutputSchema>;

export async function generateImageCaption(
  input: GenerateImageCaptionInput
): Promise<GenerateImageCaptionOutput> {
  return generateImageCaptionFlow(input);
}

const generateImageCaptionPrompt = ai.definePrompt({
  name: 'generateImageCaptionPrompt',
  input: {schema: GenerateImageCaptionInputSchema},
  output: {schema: GenerateImageCaptionOutputSchema},
  prompt: `You are an AI model that generates highly descriptive and accurate summaries for images, capturing their essence.
Focus on the main subject, action, and setting.
Describe the image vividly but concisely.
{{#if maxWords}}The caption should be a maximum of {{{maxWords}}} words.{{else}}The caption should be a maximum of ten words.{{/if}}
{{#if targetLanguage}}The caption should be in {{targetLanguage}}.{{else}}The caption should be in English.{{/if}}
Image: {{media url=photoDataUri}}`,
});

const generateImageCaptionFlow = ai.defineFlow(
  {
    name: 'generateImageCaptionFlow',
    inputSchema: GenerateImageCaptionInputSchema,
    outputSchema: GenerateImageCaptionOutputSchema,
  },
  async input => {
    const {output} = await generateImageCaptionPrompt(input);
    return output!;
  }
);

