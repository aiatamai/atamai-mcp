import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Context7 - Up-to-date Code Documentation',
  description: 'AI-powered code documentation for modern libraries. Search, learn, and code with confidence.',
  keywords: ['documentation', 'code', 'libraries', 'API', 'AI'],
  authors: [{ name: 'Atamai', url: 'https://atamai.dev' }],
  openGraph: {
    type: 'website',
    url: 'https://context7.dev',
    title: 'Context7 - Up-to-date Code Documentation',
    description: 'AI-powered code documentation for modern libraries',
    images: [
      {
        url: 'https://context7.dev/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Context7',
    description: 'Up-to-date code documentation for AI',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-black text-white">
          {children}
        </div>
      </body>
    </html>
  );
}
