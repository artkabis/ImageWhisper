import { NextRequest, NextResponse } from 'next/server';
import { generateImageCaption } from '../../../ai/flows/generate-image-caption'; // correct import path

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl = body.imageUrl;

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

    // Generate caption
    const caption = await generateImageCaption({ photoDataUri, targetLanguage: 'French' });

    return NextResponse.json({ caption });

  } catch (error: any) {
    console.error('Error generating caption:', error);
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}