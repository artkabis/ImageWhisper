
'use client';

import { useState, type ChangeEvent, type FormEvent, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, Image as ImageIcon, Loader2, AlertTriangle, Link as LinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { handleGenerateCaption } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/lib/i18n/context';
import type { Locale } from '@/lib/i18n/types';

interface ImageCaptioningFormProps {
  onCaption: (caption: string) => void; // Primarily for single file upload
}

interface ApiResultItem {
  imageUrl: string;
  caption?: string;
  error?: string;
}

export function ImageCaptioningForm({ onCaption }: ImageCaptioningFormProps) {
  const { t, locale } = useTranslation();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null); // For single file upload
  const [isLoading, setIsLoading] = useState<boolean>(false); // For single file upload
  const [error, setError] = useState<string | null>(null); // General error / file upload error
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [imageUrlsInput, setImageUrlsInput] = useState<string>(''); // For multi-URL textarea
  const [apiResults, setApiResults] = useState<ApiResultItem[]>([]); // For multi-URL results
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false); // For multi-URL batch processing

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
            fileInputRef.current.value = "";
        }
        return;
      }
      setError(null);
      setCaption(null);
      setApiResults([]); 
      setImageUrlsInput('');
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
      } else if (value === "" || numValue <=0) {
        setMaxWords(undefined)
      }
    }
  };

  const handleSubmitFile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageDataUrl) {
      setError(t('imageCaptioningForm.selectImageError'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setCaption(null);
    setApiResults([]);

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

  const handleBatchUrlSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const urls = imageUrlsInput.split('\\n').map(url => url.trim()).filter(url => url.length > 0);

    if (urls.length === 0) {
      setError(t('imageCaptioningForm.urlsEmptyError'));
      return;
    }

    setIsApiLoading(true);
    setError(null);
    setApiResults([]);
    setImageDataUrl(null); // Clear file upload data
    setCaption(null);     // Clear file upload caption

    const currentLocale: Locale = locale || 'fr';
    const targetLanguage = currentLocale === 'fr' ? 'French' : 'English';

    try {
      const response = await fetch('/api/captions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: urls, targetLanguage, maxWords }),
      });
      const data = await response.json();

      if (response.ok && data.results) {
        setApiResults(data.results);
      } else if (data.error) {
        setError(data.error || t('imageCaptioningForm.apiError'));
        setApiResults([]);
      } else {
        setError(t('imageCaptioningForm.apiError'));
        setApiResults([]);
      }
    } catch (error) {
      setError(t('imageCaptioningForm.apiError'));
      setApiResults([]);
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

        <form onSubmit={handleSubmitFile} className="space-y-6">
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
                      'relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 p-0',
                      'hover:underline' // Simplified styling for link-like appearance
                    )}
                  >
                    <span>{t('imageCaptioningForm.uploadClick')}</span>
                    <Input
                      id="image-upload-input"
                      name="image-upload-input"
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      className="sr-only"
                      onChange={(e) => {
                        handleFileChange(e);
                        setImageUrlsInput(''); // Clear URL input on file selection
                        setApiResults([]);    // Clear URL results
                      }}
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
        
         <form onSubmit={handleBatchUrlSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-urls">{t('imageCaptioningForm.urlsLabel')}</Label>
            <Textarea
              id="image-urls"
              placeholder={t('imageCaptioningForm.urlsPlaceholder')}
              value={imageUrlsInput}
              onChange={(e) => {
                setImageUrlsInput(e.target.value);
                setImageDataUrl(null); // Clear file upload data
                setFileName(null);
                setCaption(null);
                // setApiResults([]); // Optionally clear previous URL results on typing
                setError(null);
              }}
              rows={4}
              className="resize-y"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isApiLoading || imageUrlsInput.trim() === ''}>
            {isApiLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('imageCaptioningForm.generatingFromUrlsButton')}
              </>
            ) : (
              t('imageCaptioningForm.generateFromUrlsButton')
            )}          
          </Button>
        </form>
        
        {error && (
          <Alert variant="destructive" className="animate-in fade-in duration-300 mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('imageCaptioningForm.errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Display area for single file upload */}
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
         {isLoading && imageDataUrl && (
           <div className="mt-6 space-y-4 text-center text-card-foreground/70 animate-in fade-in duration-700">
            <Loader2 className="mx-auto h-10 w-10 animate-spin" />
            <p>{t('imageCaptioningForm.generatingButton')}</p>
          </div>
        )}

        {/* Display area for batch URL results */}
        {isApiLoading && imageUrlsInput.trim() !== '' && (
           <div className="mt-6 space-y-4 text-center text-card-foreground/70 animate-in fade-in duration-700">
            <Loader2 className="mx-auto h-10 w-10 animate-spin" />
            <p>{t('imageCaptioningForm.generatingFromUrlsButton')}</p>
          </div>
        )}

        {!isApiLoading && apiResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-2xl font-semibold text-card-foreground mb-4">{t('imageCaptioningForm.resultsTitle')}</h3>
            <div className="space-y-4">
              {apiResults.map((result, index) => (
                <Card key={index} className="overflow-hidden shadow-md">
                  <CardHeader className="p-4 bg-muted/50">
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-4 w-4 text-primary" />
                      <a 
                        href={result.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-medium text-primary hover:underline truncate"
                        title={result.imageUrl}
                      >
                        {result.imageUrl}
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="relative aspect-video w-full max-w-xs mx-auto h-auto overflow-hidden rounded-md border border-border bg-muted">
                      <Image
                        src={result.imageUrl}
                        alt={t('imageCaptioningForm.imagePreviewAlt', { url: result.imageUrl })}
                        fill
                        style={{ objectFit: 'contain' }}
                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                        data-ai-hint="remote image"
                      />
                       <noscript>
                        <Image
                          src={result.imageUrl}
                          alt={t('imageCaptioningForm.imagePreviewAlt', { url: result.imageUrl })}
                           fill
                           style={{ objectFit: 'contain' }}
                           data-ai-hint="remote image"
                        />
                      </noscript>
                    </div>
                    {result.caption && (
                      <p className="text-card-foreground/90 leading-relaxed text-sm">{result.caption}</p>
                    )}
                    {result.error && (
                      <Alert variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        <AlertDescription>
                          {t('imageCaptioningForm.errorForUrl', {url: result.imageUrl, errorMessage: result.error})}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Placeholder when nothing is active */}
        {!imageDataUrl && imageUrlsInput.trim() === '' && !caption && apiResults.length === 0 && !isLoading && !isApiLoading && !error && (
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
