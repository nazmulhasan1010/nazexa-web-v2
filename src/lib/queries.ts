import { queryOptions } from '@tanstack/react-query';
import {
  fetchHomeSections,
  fetchSiteSettings,
  fetchCmsPages,
  fetchContentItems,
  fetchAdminContentItems,
} from './cms';

export const homeSectionsQuery = queryOptions({
  queryKey: ['home_sections'],
  queryFn: () => fetchHomeSections(),
});

export const siteSettingsQuery = queryOptions({
  queryKey: ['site_settings'],
  queryFn: () => fetchSiteSettings(),
});

export const cmsPagesQuery = queryOptions({
  queryKey: ['cms_pages'],
  queryFn: () => fetchCmsPages(),
});

export function contentQuery(collection: string) {
  return queryOptions({
    queryKey: ['content_items', collection],
    queryFn: () => fetchContentItems(collection),
  });
}

export function adminContentQuery(collection: string) {
  return queryOptions({
    queryKey: ['content_items_admin', collection],
    queryFn: () => fetchAdminContentItems(collection),
  });
}
