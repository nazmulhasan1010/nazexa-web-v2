import React from 'react';

export default function BuilderRootLayout({ children }: { children: React.ReactNode }) {
  // This layout strips away the standard admin layout so the builder has full screen
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}
