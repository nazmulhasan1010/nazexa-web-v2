import { getConfigMapAction } from './src/app/admin/configuration/actions.ts';
async function main() {
  const map = await getConfigMapAction(['oauth.google.clientId', 'oauth.google.clientSecret']);
  console.log(map);
}
main().catch(console.error);
