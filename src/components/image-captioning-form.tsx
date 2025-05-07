
'use client';

import { useState, type ChangeEvent, type FormEvent, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, FileText, Loader2, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { handleGenerateCaption } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ImageCaptioningForm() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limit file size to 4MB
        setError('File is too large. Maximum size is 4MB.');
        setImageDataUrl(null);
        setFileName(null);
        setCaption(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
        }
        return;
      }
      setError(null);
      setCaption(null);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
        setImageDataUrl(null);
        setFileName(null);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageDataUrl) {
      setError('Please select an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCaption(null);

    const result = await handleGenerateCaption(imageDataUrl);

    if (result.caption) {
      setCaption(result.caption);
    } else if (result.error) {
      setError(result.error);
    } else {
      setError('An unknown error occurred while generating the caption.');
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Generate Image Caption</CardTitle>
        <CardDescription className="text-center text-card-foreground/80">
          Upload an image and our AI will describe it for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="image-upload" className="text-sm font-medium text-card-foreground">
              Upload Image (Max 4MB)
            </Label>
            <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-border hover:border-primary transition-colors">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-card-foreground/60" />
                <div className="flex text-sm text-card-foreground/80">
                  <Label
                    htmlFor="image-upload-input"
                    className={cn(
                      buttonVariants({ variant: 'link', size: 'sm' }),
                      'relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 p-0'
                    )}
                  >
                    <span>Click to upload</span>
                    <Input
                      id="image-upload-input"
                      name="image-upload-input"
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      className="sr-only"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      aria-describedby="file-name-status"
                    />
                  </Label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-card-foreground/60" id="file-name-status">
                  {fileName ? `Selected: ${fileName}` : 'PNG, JPG, GIF, WEBP up to 4MB'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in fade-in duration-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !imageDataUrl}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Caption'
            )}
          </Button>
        </form>

        {imageDataUrl && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-700">
            <h3 className="text-lg font-semibold text-card-foreground">Preview:</h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border shadow-sm">
              <Image src={imageDataUrl} alt="Uploaded preview" layout="fill" objectFit="contain" data-ai-hint="uploaded image" />
            </div>
          </div>
        )}

        {!isLoading && caption && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-700">
            <h3 className="text-lg font-semibold text-card-foreground">Generated Caption:</h3>
            <Card className="bg-secondary/30">
              <CardContent className="p-4">
                <p className="text-card-foreground/90 leading-relaxed">{caption}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {!isLoading && !caption && imageDataUrl && (
           <div className="mt-6 space-y-4 text-center text-card-foreground/70 animate-in fade-in duration-700">
            <FileText className="mx-auto h-10 w-10" />
            <p>Your image caption will appear here once generated.</p>
          </div>
        )}

        {!imageDataUrl && (
          <div className="mt-6 py-8 text-center text-card-foreground/70 border-2 border-dashed rounded-md border-border">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">Your uploaded image and caption will appear here.</p>
          </div>
        )}

      </CardContent>
      <CardFooter>
         <p className="text-xs text-card-foreground/60 text-center w-full">
            Powered by Genkit and BLIP model.
          </p>
      </CardFooter>
    </Card>
  );
}
