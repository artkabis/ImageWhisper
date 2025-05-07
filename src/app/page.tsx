
import { ImageCaptioningForm } from '@/components/image-captioning-form';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 selection:bg-primary/30 selection:text-primary-foreground">
      <main className="container mx-auto flex w-full max-w-2xl flex-grow flex-col justify-center space-y-8 py-12">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            ImageWhisper
          </h1>
          <p className="mt-3 text-lg text-foreground/80 sm:text-xl">
            Let AI paint a thousand words for your pictures.
          </p>
        </header>
        
        <ImageCaptioningForm />

        <footer className="text-center text-sm text-foreground/60">
          © {new Date().getFullYear()} ImageWhisper. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
