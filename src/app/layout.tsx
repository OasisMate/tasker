import './globals.css';
import Link from 'next/link';
import QueryProvider from '@/components/QueryProvider';
import { ThemeProvider, ThemePicker } from '@/theme/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <header className="sticky top-0 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group" aria-label="Go to Home">
                <div className="h-6 w-6 rounded-md" style={{ background: 'rgb(var(--brand))' }} />
                <span className="font-semibold group-hover:underline">Tasker</span>
              </Link>
              <ThemePicker />
            </div>
          </header>
          <main className="px-3 sm:px-4 max-w-6xl mx-auto py-6">
            <QueryProvider>{children}</QueryProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
