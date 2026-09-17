import { emptyProviderStat, type AdapterResult } from './types';

/**
 * Google's Generative Language API exposes no account balance, usage or quota
 * to the `AIza...` API key, and returns no rate-limit headers. Quota is only
 * visible in AI Studio or via GCP Cloud Monitoring (a different credential),
 * so every metric is "Unavailable". No network call is made.
 */
export async function syncGoogle(): Promise<AdapterResult> {
  return {
    stat: {
      ...emptyProviderStat('google', 'unavailable'),
      extra: {
        note: 'Google exposes no usage/quota to the API key. View quota in Google AI Studio or via GCP Cloud Monitoring.',
      },
    },
  };
}
