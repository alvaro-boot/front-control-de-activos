'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <NotificationProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}

