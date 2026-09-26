'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type LogoContextType = {
  frontendLogo: string;
  adminLogo: string;
  setPreviewLogos: (logos: { frontendLogo?: string; adminLogo?: string }) => void;
};

const LogoContext = createContext<LogoContextType>({
  frontendLogo: '/logos/logo-dark.webp',
  adminLogo: '/logos/logo-dark.webp',
  setPreviewLogos: () => {},
});

export function LogoProvider({
  children,
  frontendLogo: initialFrontendLogo,
  adminLogo: initialAdminLogo,
}: {
  children: ReactNode;
  frontendLogo: string;
  adminLogo: string;
}) {
  const [frontendLogo, setFrontendLogo] = useState(initialFrontendLogo);
  const [adminLogo, setAdminLogo] = useState(initialAdminLogo);

  // Sync state if props change (e.g. server mutation / hard navigation)
  useEffect(() => {
    setFrontendLogo(initialFrontendLogo);
    setAdminLogo(initialAdminLogo);
  }, [initialFrontendLogo, initialAdminLogo]);

  const setPreviewLogos = (logos: { frontendLogo?: string; adminLogo?: string }) => {
    if (logos.frontendLogo) setFrontendLogo(logos.frontendLogo);
    if (logos.adminLogo) setAdminLogo(logos.adminLogo);
  };

  return (
    <LogoContext.Provider value={{ frontendLogo, adminLogo, setPreviewLogos }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  return useContext(LogoContext);
}
