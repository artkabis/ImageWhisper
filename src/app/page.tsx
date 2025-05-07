"use client"; // This page uses client-side hooks like useTranslation

import { ImageCaptioningForm } from "@/components/image-captioning-form";
import { useTranslation } from "@/lib/i18n/context";
import { useState } from "react";

export default function HomePage() {
  const { t } = useTranslation();
  const [caption, setCaption] = useState<string | null>(null);

  // Modifié pour accepter directement une chaîne de caractères
  const handleCaption = (captionText: string) => {
    if (captionText && captionText.trim() !== "") {
      setCaption(captionText);
    } else {
      console.error("Invalid caption:", captionText);
      setCaption(null);
    }
  };

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
        <ImageCaptioningForm onCaption={handleCaption} />
        {caption && <p className="mt-4 text-lg">{caption}</p>}
        <footer className="text-center text-sm text-foreground/60">
          © {new Date().getFullYear()} {t("homePage.footer")}. {t("homePage.allRightsReserved")}
        </footer>
      </main>
    </div>
  );
}