
'use client';

import { useState, type ChangeEvent, type FormEvent, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, FileText, Loader2, AlertTriangle } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { handleGenerateCaption } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/types';

interface ImageCaptioningFormProps {
  onCaption: (caption: string) => void;
}

export function ImageCaptioningForm({ onCaption }: ImageCaptioningFormProps) {
  const { t, locale } = useTranslation();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [apiCaption, setApiCaption] = useState<string | null>(null);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limit file size to 4MB
        setError(t('imageCaptioningForm.fileTooLargeError'));
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
        setError(t('imageCaptioningForm.fileReadError'));
        setImageDataUrl(null);
        setFileName(null);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageDataUrl) {
      setError(t('imageCaptioningForm.selectImageError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setCaption(null);

    const currentLocale: Locale = locale || 'fr'; // Default to French if locale is somehow undefined
    const targetLanguage = currentLocale === 'fr' ? 'French' : 'English';

    const result = await handleGenerateCaption(imageDataUrl, targetLanguage);

    if (result.caption) {
      setCaption(result.caption);
    } else if (result.error) {
      // Error messages from actions are not yet translated in this pass
      setError(result.error); 
    } else {
      // Generic error, could be translated if a key exists
      setError(t('imageCaptioningForm.unknownError')); // Assuming you'll add this key
    }
    onCaption(result.caption || "");
    setIsLoading(false);
  };

    const handleApiSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageUrl) {
      setError(t('imageCaptioningForm.imageUrlEmptyError'));
      return;
    }

    setIsApiLoading(true);
    setError(null);
    setApiCaption(null);

    try {
      const response = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();
      if (data.caption) {
        setApiCaption(data.caption);
      } else {
        setError(t('imageCaptioningForm.apiError'));
      }
    } catch (error) {
       setApiCaption(null);
      setError(t('imageCaptioningForm.apiError'));
    }
    setIsApiLoading(false);
  };
  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t('imageCaptioningForm.cardTitle')}</CardTitle>
        <CardDescription className="text-center text-card-foreground/80">
          {t('imageCaptioningForm.cardDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="image-upload" className="text-sm font-medium text-card-foreground">
              {t('imageCaptioningForm.uploadLabel')} {t('imageCaptioningForm.uploadMaxSize')}
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
                    <span>{t('imageCaptioningForm.uploadClick')}</span>
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
                  <p className="pl-1">{t('imageCaptioningForm.uploadDragAndDrop')}</p>
                </div>
                <p className="text-xs text-card-foreground/60" id="file-name-status">
                  {fileName 
                    ? t('imageCaptioningForm.uploadSelectedFile', { fileName }) 
                    : t('imageCaptioningForm.uploadSupportedFormats')}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-in fade-in duration-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('imageCaptioningForm.errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !imageDataUrl}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('imageCaptioningForm.generatingButton')}
              </>
            ) : (
              t('imageCaptioningForm.generateButton')
            )}
          </Button>
        </form>
         <form onSubmit={handleApiSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-url">{t('imageCaptioningForm.imageUrlLabel')}</Label>
            <Input
              id="image-url"
              type="url"
              placeholder={t('imageCaptioningForm.imageUrlPlaceholder')}
              value={imageUrl || ''}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isApiLoading || !imageUrl}>
            {isApiLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('imageCaptioningForm.apiGeneratingButton')}
              </>
            ) : (
              t('imageCaptioningForm.apiGenerateButton')
            )}          
          </Button>

          {apiCaption && apiCaption.trim() !== "" && (
            <div className="mt-6 animate-in fade-in duration-700">
              {/* Utiliser un effet ou appeler avant le rendu */}
              <p className="text-card-foreground/90 leading-relaxed">{apiCaption}</p>
            </div>
          )}
        </form>

        {imageDataUrl && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-700">
            <h3 className="text-lg font-semibold text-card-foreground">{t('imageCaptioningForm.previewTitle')}</h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border shadow-sm">
              <Image 
                src={imageDataUrl} 
                alt={t('imageCaptioningForm.imageAltPreview')} 
                fill
                style={{ objectFit: 'contain' }}
                data-ai-hint="uploaded image" 
              />
            </div>
          </div>
        )}

        {!isLoading && caption && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-700">
            <h3 className="text-lg font-semibold text-card-foreground">{t('imageCaptioningForm.captionTitle')}</h3>
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
            <p>{t('imageCaptioningForm.captionPlaceholder')}</p>
          </div>
        )}

        {!imageDataUrl && (
          <div className="mt-6 py-8 text-center text-card-foreground/70 border-2 border-dashed rounded-md border-border">
            <ImageIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">{t('imageCaptioningForm.imageAndCaptionPlaceholder')}</p>
          </div>
        )}

      </CardContent>
      <CardFooter>
         <p className="text-xs text-card-foreground/60 text-center w-full">
            {t('imageCaptioningForm.poweredBy')}
          </p>
      </CardFooter>
    </Card>
  );
}
