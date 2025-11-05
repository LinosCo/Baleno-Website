import type { Metadata } from 'next';
import './globals.css';
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import { Providers } from '../components/providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Baleno San Zeno - Sistema di Prenotazione',
  description: 'Prenota spazi e risorse per la Casa di Quartiere Baleno',
  keywords: 'baleno, san zeno, casa quartiere, prenotazione, spazi, sale',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-italia@2.17.0/dist/css/bootstrap-italia.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap-italia@2.17.0/dist/js/bootstrap-italia.bundle.min.js" async></script>
      </body>
    </html>
  );
}
