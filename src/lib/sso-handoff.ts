/**
 * Cross-origin SSO handoff helpers.
 *
 * nazexa_session cookies set on nazexa-web (e.g. localhost:3000) are NOT sent
 * to satellite products (e.g. localhost:8000). After OAuth we therefore append a
 * short-lived handoff token to the product callback URL so SSO can complete.
 */

export function appendSsoHandoff(targetUrl: string, sessionToken: string): string {
  const url = new URL(targetUrl);
  url.searchParams.set('handoff', sessionToken);
  return url.toString();
}

export function isExternalProductRedirect(redirectUrl: string, centralBaseUrl: string): boolean {
  try {
    const target = new URL(redirectUrl);
    const central = new URL(centralBaseUrl);
    return target.origin !== central.origin;
  } catch {
    return false;
  }
}
