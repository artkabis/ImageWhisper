
'use server';

import { generateImageCaption, type GenerateImageCaptionInput } from '@/ai/flows/generate-image-caption';

interface HandleGenerateCaptionResult {
  caption?: string;
  error?: string;
}

export async function handleGenerateCaption(
  photoDataUri: string,
  targetLanguage?: string,
  maxWords?: number,
): Promise<HandleGenerateCaptionResult> {
  if (!photoDataUri) {
    return { error: 'Image data is missing. Please upload an image.' };
  }

  // Validate data URI format (basic check)
  if (!photoDataUri.startsWith('data:image/') || !photoDataUri.includes(';base64,')) {
    return { error: 'Invalid image data format. Please upload a valid image.' };
  }

  try {
    const input: GenerateImageCaptionInput = { photoDataUri };
    if (targetLanguage) {
      input.targetLanguage = targetLanguage;
    }
    if (maxWords && maxWords > 0) {
      input.maxWords = maxWords;
    }
    const result = await generateImageCaption(input);
    if (result.caption) {
      return { caption: result.caption };
    } else {
      return { error: 'Caption could not be generated. The result was empty.'};
    }
  } catch (e) {
    console.error('Error generating caption:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to generate caption: ${errorMessage}` };
  }
}
