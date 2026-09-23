import type { Metadata } from 'next';
import './globals.css';
import TRPCProvider from '@/components/TRPCProvider';

export const metadata: Metadata = {
  title: {
    default: 'NoneKnow — Secure Self-Destructing Messages',
    template: '%s | NoneKnow',
  },
  description:
    'Share sensitive information securely. Create encrypted, self-destructing messages that burn after reading.',
  keywords: [
    'secure message',
    'self-destructing message',
    'encrypted note',
    'burn after reading',
    'private message',
    'temporary message',
    'NoneKnow',
  ],
  authors: [{ name: 'NoneKnow' }],
  creator: 'NoneKnow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://none-know.vercel.app',
    siteName: 'NoneKnow',
    title: 'NoneKnow — Secure Self-Destructing Messages',
    description:
      'Share passwords, keys, and private notes securely. Messages disappear after viewing.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoneKnow — Secure Self-Destructing Messages',
    description:
      'Share sensitive information securely. Messages burn after reading.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
