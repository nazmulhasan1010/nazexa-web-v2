import { EMAIL_VARIABLES } from './variables';

export type TemplateContext = Record<string, any>;

/**
 * Validates that all variables used in the template exist in the registry.
 */
export function validateTemplateVariables(templateString: string): { valid: boolean; errors: string[] } {
  const regex = /\{\{([\w.]+)\}\}/g;
  let match;
  const errors: string[] = [];
  const foundVars = new Set<string>();

  while ((match = regex.exec(templateString)) !== null) {
    foundVars.add(match[1]);
  }

  for (const v of foundVars) {
    if (!EMAIL_VARIABLES.find(ev => ev.key === v)) {
      errors.push(`Unknown variable: ${v}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Resolves a dot-notation key from a nested context object.
 */
function resolvePath(obj: any, path: string): string {
  if (obj[path] !== undefined) return String(obj[path]);
  
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return '';
    current = current[part];
  }
  return current !== null && current !== undefined ? String(current) : '';
}

/**
 * Renders a template string by substituting {{variables}} with context data.
 */
export function renderTemplateString(templateString: string, context: TemplateContext): string {
  // Inject system variables automatically
  const fullContext = {
    ...context,
    currentYear: new Date().getFullYear().toString(),
    currentDate: new Date().toLocaleDateString(),
    company: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Nazexa',
      website: process.env.NEXT_PUBLIC_SITE_URL || 'https://nazexa.com',
      email: process.env.SUPPORT_EMAIL || 'support@nazexa.com',
      ...(context.company || {})
    }
  };

  return templateString.replace(/\{\{([\w.]+)\}\}/g, (match, key) => {
    return resolvePath(fullContext, key);
  });
}
