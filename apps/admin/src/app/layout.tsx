import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solana Seeker — Admin',
  description: 'Admin dashboard for Solana Seeker platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
