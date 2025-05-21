import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected: Geist is from next/font/google as per user files
import './globals.css';
import { AppProviders } from '@/providers/app-providers';
import MainLayout from '@/components/layout/main-layout';

const geistSans = Geist({ // Corrected: Geist is from next/font/google
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected: Geist_Mono is from next/font/google
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StitchStyle - Custom Tailoring & Style',
  description: 'Personalized women\'s fashion, designed by you, tailored for you.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AppProviders>
          <MainLayout>{children}</MainLayout>
        </AppProviders>
      </body>
    </html>
  );
}
