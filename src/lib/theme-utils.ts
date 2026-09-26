export function parseColorToLuminance(color: string): number {
  if (!color) return 1;
  const str = color.trim().toLowerCase();
  
  if (str.startsWith('oklch')) {
    const match = str.match(/oklch\(\s*([\d.]+)(%?)/);
    if (match) {
      let l = parseFloat(match[1]);
      if (match[2] === '%') l = l / 100;
      return l;
    }
  }

  if (str.startsWith('hsl')) {
    const match = str.match(/hsl\(\s*[\d.]+(?:deg)?\s*[, ]\s*[\d.]+%?\s*[, ]\s*([\d.]+)(%?)/);
    if (match) {
      let l = parseFloat(match[1]);
      if (match[2] === '%' || l > 1) l = l / 100;
      return l;
    }
  }

  if (str.startsWith('#')) {
    let hex = str.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      return (0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  if (str.startsWith('rgb')) {
    const match = str.match(/rgb\w*\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/);
    if (match) {
      const r = parseFloat(match[1]) / 255;
      const g = parseFloat(match[2]) / 255;
      const b = parseFloat(match[3]) / 255;
      return (0.299 * r + 0.587 * g + 0.114 * b);
    }
  }

  return 1;
}

export function resolveThemeLogo(backgroundColor: string | undefined): string {
  if (!backgroundColor) return '/logos/logo-dark.webp';
  
  const luminance = parseColorToLuminance(backgroundColor);
  
  // L < 0.6 means the background is visually dark. Use the light logo for contrast.
  if (luminance < 0.6) {
    return '/logos/logo-light.webp';
  } else {
    return '/logos/logo-dark.webp';
  }
}
