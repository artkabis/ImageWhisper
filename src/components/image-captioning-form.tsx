
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
  const [maxWords, setMaxWords] = useState<number | undefined>(10);


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
      setApiCaption(null); 
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

  const handleMaxWordsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      setMaxWords(undefined);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        setMaxWords(numValue);
      } else if (value === "" || numValue <=0) { // Allow clearing or setting to 0 (which means undefined for us)
        setMaxWords(undefined)
      }
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
    setApiCaption(null); 

    const currentLocale: Locale = locale || 'fr'; 
    const targetLanguage = currentLocale === 'fr' ? 'French' : 'English';

    const result = await handleGenerateCaption(imageDataUrl, targetLanguage, maxWords);

    if (result.caption) {
      setCaption(result.caption);
      onCaption(result.caption); 
    } else if (result.error) {
      setError(result.error); 
      onCaption(""); 
    } else {
      setError(t('imageCaptioningForm.unknownError'));
      onCaption(""); 
    }
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
    setCaption(null); 

    const currentLocale: Locale = locale || 'fr';
    const targetLanguage = currentLocale === 'fr' ? 'French' : 'English';

    try {
      const response = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, targetLanguage, maxWords }),
      });
      const data = await response.json();

      if (data.caption && data.caption.caption && typeof data.caption.caption === 'string') {
        setApiCaption(data.caption.caption);
      } else if (data.error) {
        console.error("API error:", data.error);
        setError(data.error || t('imageCaptioningForm.apiError'));
        setApiCaption(null);
      }
      else {
        console.error("API response for caption is not in the expected format:", data);
        setError(t('imageCaptioningForm.apiError'));
        setApiCaption(null);
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
        <div className="space-y-2">
          <Label htmlFor="max-words" className="text-sm font-medium text-card-foreground">
            {t('imageCaptioningForm.maxWordsLabel')}
          </Label>
          <Input
            id="max-words"
            type="number"
            min="1"
            placeholder={t('imageCaptioningForm.maxWordsPlaceholder')}
            value={maxWords === undefined ? '' : maxWords}
            onChange={handleMaxWordsChange}
            className="w-full"
          />
        </div>

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

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-sm">{t('imageCaptioningForm.orSeparator')}</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
        
         <form onSubmit={handleApiSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-url">{t('imageCaptioningForm.imageUrlLabel')}</Label>
            <Input
              id="image-url"
              type="url"
              placeholder={t('imageCaptioningForm.imageUrlPlaceholder')}
              value={imageUrl || ''}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageDataUrl(null);
                setFileName(null);
                setCaption(null);
                setError(null);
              }}
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

        {!isApiLoading && apiCaption && typeof apiCaption === 'string' && apiCaption.trim() !== "" && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-700">
            <h3 className="text-lg font-semibold text-card-foreground">{t('imageCaptioningForm.captionTitle')}</h3>
            <Card className="bg-secondary/30">
              <CardContent className="p-4">
                <p className="text-card-foreground/90 leading-relaxed">{apiCaption}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        {isLoading && imageDataUrl && (
           <div className="mt-6 space-y-4 text-center text-card-foreground/70 animate-in fade-in duration-700">
            <Loader2 className="mx-auto h-10 w-10 animate-spin" />
            <p>{t('imageCaptioningForm.generatingButton')}</p>
          </div>
        )}
        
         {isApiLoading && imageUrl && (
           <div className="mt-6 space-y-4 text-center text-card-foreground/70 animate-in fade-in duration-700">
            <Loader2 className="mx-auto h-10 w-10 animate-spin" />
            <p>{t('imageCaptioningForm.apiGeneratingButton')}</p>
          </div>
        )}

        {!imageDataUrl && !imageUrl && !caption && !apiCaption && !isLoading && !isApiLoading && (
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
