/**
 * Server-side HTML email sanitization using DOMPurify + jsdom.
 * Strips XSS vectors while preserving safe email formatting.
 */
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Allowed tags for email rendering (safe subset)
const ALLOWED_TAGS = [
  'a', 'b', 'br', 'caption', 'center', 'cite', 'col', 'colgroup',
  'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figure',
  'figcaption', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
  'hr', 'i', 'img', 'ins', 'kbd', 'li', 'mark', 'nav', 'ol', 'p',
  'pre', 'q', 's', 'samp', 'section', 'small', 'span', 'strong', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
  'time', 'tr', 'u', 'ul', 'var',
];

const ALLOWED_ATTR = [
  'align', 'alt', 'border', 'cellpadding', 'cellspacing', 'class', 'colspan',
  'color', 'dir', 'height', 'href', 'id', 'lang', 'rel', 'rowspan', 'scope',
  'size', 'src', 'style', 'summary', 'target', 'title', 'valign', 'width',
];

/**
 * Sanitize an HTML email body for safe rendering.
 * Returns safe HTML string.
 */
export function sanitizeEmailHtml(html: string): string {
  if (!html) return '';

  const window = new JSDOM('').window;
  const purify = DOMPurify(window as any);

  const clean = purify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true,
    // Force links to open in new tab
    ADD_ATTR: ['target'],
  });

  // Force all links to open safely in new tab
  return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
}

/**
 * Extract a plain-text preview from an HTML or text body.
 */
export function extractPreview(bodyText?: string | null, bodyHtml?: string | null, maxLength = 200): string {
  let source = bodyText || '';

  if (!source && bodyHtml) {
    // Strip HTML tags for preview
    source = bodyHtml
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return source.length > maxLength ? source.slice(0, maxLength) + '…' : source;
}
