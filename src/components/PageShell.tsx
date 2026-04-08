import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface PageShellProps {
  children: ReactNode;
  title?: string;
  showNav?: boolean;
}

export default function PageShell({ children, title, showNav = true }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {title && (
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center px-5 py-4">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
        </header>
      )}
      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-4">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
