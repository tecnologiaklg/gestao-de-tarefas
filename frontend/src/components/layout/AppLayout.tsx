import { ReactNode } from 'react';
import { NavSidebar } from './NavSidebar';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <NavSidebar />
      <main className="app-content">
        <div className="app-main">{children}</div>
      </main>
    </div>
  );
}
