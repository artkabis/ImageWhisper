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
});
export type GenerateImageCaptionInput = z.infer<typeof GenerateImageCaptionInputSchema>;

const GenerateImageCaptionOutputSchema = z.object({
  caption: z.string().describe('A concise summary of the image, maximum ten words.'),
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
  prompt: `You are an AI model that generates concise summaries for images.
  Generate a summary of the image provided in a maximum of ten words{{#if targetLanguage}}, in {{targetLanguage}}{{else}}, in English{{/if}}.
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

