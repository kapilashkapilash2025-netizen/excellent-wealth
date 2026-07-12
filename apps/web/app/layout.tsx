import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Excellent Wealth — Financial clarity, explained',
  description:
    'Excellent Wealth is a privacy-first platform for tracking net worth, budgeting, planning debt payoff, and understanding your finances — with every calculation explained. Educational tool, not financial advice.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-accent focus:px-4 focus:py-2 focus:text-brand-navy-950"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
