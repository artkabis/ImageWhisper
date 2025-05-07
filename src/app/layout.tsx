
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed as it's not used and causes an error
import './globals.css';
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: 'ImageWhisper - AI Image Captioning',
  description: 'Upload an image and get an AI-generated caption with ImageWhisper.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
