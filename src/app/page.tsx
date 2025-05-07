
"use client"; 

import { ImageCaptioningForm } from "@/components/image-captioning-form";
import { useTranslation } from "@/lib/i18n/context";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";


export default function HomePage() {
  const { t } = useTranslation();
  // This state will be updated by ImageCaptioningForm via onCaption
  // It's used if you want to display the caption *outside* the form
  // or pass it to other components.
  // For now, the ImageCaptioningForm displays captions internally.
  // This `caption` state can be removed if not used for other purposes.
  const [pageCaption, setPageCaption] = useState<string | null>(null);
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);


  // This function is called by ImageCaptioningForm when a caption is generated (or fails)
  const handleCaptionUpdate = (newCaption: string) => {
    if (newCaption && newCaption.trim() !== "") {
      setPageCaption(newCaption);
    } else {
      // If newCaption is empty or only whitespace, clear the caption
      setPageCaption(null); 
    }
  };

  if (!clientLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 selection:bg-primary/30 selection:text-primary-foreground">
      <main className="container mx-auto flex w-full max-w-2xl flex-grow flex-col justify-center space-y-8 py-12">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            {t("homePage.title")}
          </h1>
          <p className="mt-3 text-lg text-foreground/80 sm:text-xl">
            {t("homePage.subtitle")}
          </p>
        </header>
        {/* 
          Pass handleCaptionUpdate to the form. 
          The form itself will handle displaying the generated caption.
          This onCaption prop is for the HomePage to be aware of the caption if needed.
        */}
        <ImageCaptioningForm onCaption={handleCaptionUpdate} />
        
        {/* 
          Example: If you wanted to display the caption here, in HomePage,
          you could use the pageCaption state. But currently, ImageCaptioningForm
          handles its own display.
        */}
        {/* {pageCaption && (
          <Card className="mt-6 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-card-foreground/90 leading-relaxed">{pageCaption}</p>
            </CardContent>
          </Card>
        )} */}

        <footer className="text-center text-sm text-foreground/60">
          © {new Date().getFullYear()} {t("homePage.footer")}. {t("homePage.allRightsReserved")}
        </footer>
      </main>
    </div>
  );
}
