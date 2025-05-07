
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { TranslationProvider } from '@/lib/i18n/context';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/types';

// Set the default locale for the application
const defaultLocale: Locale = 'fr';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(defaultLocale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dictionary = await getDictionary(defaultLocale);
  return (
    <html lang={defaultLocale} className={GeistSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <TranslationProvider locale={defaultLocale} dictionary={dictionary}>
          {children}
          <Toaster />
        </TranslationProvider>
      </body>
    </html>
  );
}

