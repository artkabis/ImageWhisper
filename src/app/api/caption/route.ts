
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { generateImageCaption, type GenerateImageCaptionInput } from '../../../ai/flows/generate-image-caption'; 

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl = body.imageUrl;
    const targetLanguage = body.targetLanguage as string | undefined;
    const maxWords = body.maxWords as number | undefined;

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: `Failed to fetch image from ${imageUrl}` }, { status: imageResponse.status });
    }

    // Convert image to data URI
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'; // Default to jpeg if no content-type
    const photoDataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Prepare input for Genkit flow
    const captionInput: GenerateImageCaptionInput = { photoDataUri };
    if (targetLanguage) {
      captionInput.targetLanguage = targetLanguage;
    }
    if (maxWords && typeof maxWords === 'number' && maxWords > 0) {
      captionInput.maxWords = maxWords;
    } else {
      // Default to 10 words if not specified or invalid for API route, consistent with UI goal
      // The flow itself has a 10-word default in prompt if maxWords is undefined
      // but being explicit here for the API endpoint.
      // Or, we can rely on the flow's default handling by not setting input.maxWords if not provided/invalid.
      // For this iteration, let's rely on the flow's default logic when maxWords is not provided.
    }


    // Generate caption
    const result = await generateImageCaption(captionInput);

    return NextResponse.json({ caption: result });

  } catch (error: any) {
    console.error('Error generating caption:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
