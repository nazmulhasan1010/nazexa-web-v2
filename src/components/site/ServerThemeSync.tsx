import type { FullThemeVars } from '@/lib/theme-registry';

export function ServerThemeSync({
  frontendVars,
  adminVars,
  brand1,
  brand2,
  brand3,
  radius,
}: {
  frontendVars: FullThemeVars | undefined;
  adminVars: FullThemeVars | undefined;
  brand1?: string;
  brand2?: string;
  brand3?: string;
  radius?: string;
}) {
  const objectToCssVars = (vars: FullThemeVars | undefined) => {
    if (!vars) return '';
    return Object.entries(vars).map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `--${kebabKey}: ${value};`;
    }).join('\n    ');
  };

  const frontendCss = objectToCssVars(frontendVars);
  const adminCss = objectToCssVars(adminVars);

  const customFrontendCss = `
    ${brand1 ? `--brand-1: ${brand1};` : ''}
    ${brand2 ? `--brand-2: ${brand2};` : ''}
    ${brand3 ? `--brand-3: ${brand3};` : ''}
    ${radius ? `--radius: ${radius};` : ''}
  `;

  // Output both themes. The inline script determines which one takes effect.
  const cssString = `
    :root {
      ${frontendCss}
      ${customFrontendCss}
    }
    :root[data-theme='admin'] {
      ${adminCss}
    }
  `;

  const scriptString = `
    try {
      if (window.location.pathname.startsWith('/admin')) {
        document.documentElement.setAttribute('data-theme', 'admin');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } catch (e) {}
  `;

  return (
    <>
      <style id="nazexa-server-theme" dangerouslySetInnerHTML={{ __html: cssString }} suppressHydrationWarning />
      <script id="nazexa-theme-script" dangerouslySetInnerHTML={{ __html: scriptString }} suppressHydrationWarning />
    </>
  );
}
