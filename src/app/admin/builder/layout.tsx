import React from 'react';

export default function BuilderRootLayout({ children }: { children: React.ReactNode }) {
  // This layout strips away the standard admin layout so the builder has full screen
  return (
    <div className="h-full w-full overflow-hidden bg-background text-foreground p-4 sm:p-6">
      {children}
    </div>
  );
}
