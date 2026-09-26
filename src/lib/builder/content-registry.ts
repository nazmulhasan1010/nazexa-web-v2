export interface ContentSourceField {
  name: string;
  label: string;
  type: 'text' | 'image' | 'number' | 'date' | 'boolean' | 'url';
}

export interface ContentSource {
  key: string;
  label: string;
  model: string;
  fields: ContentSourceField[];
  filterableFields?: string[];
  sortableFields?: string[];
}

class ContentSourceRegistry {
  private sources: Map<string, ContentSource> = new Map();

  register(source: ContentSource) {
    this.sources.set(source.key, source);
  }

  get(key: string): ContentSource | undefined {
    return this.sources.get(key);
  }

  getAll(): ContentSource[] {
    return Array.from(this.sources.values());
  }
}

export const contentRegistry = new ContentSourceRegistry();

// --- Default Registrations ---

contentRegistry.register({
  key: 'job_postings',
  label: 'Job Postings',
  model: 'JobPosting',
  fields: [
    { name: 'id', label: 'ID', type: 'text' },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'slug', label: 'Slug / URL', type: 'url' },
    { name: 'department', label: 'Department', type: 'text' },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'excerpt', label: 'Excerpt', type: 'text' },
    { name: 'remote', label: 'Remote', type: 'boolean' },
    { name: 'posted_at', label: 'Posted At', type: 'date' }
  ],
  filterableFields: ['department', 'location', 'remote'],
  sortableFields: ['posted_at', 'title', 'created_at']
});

contentRegistry.register({
  key: 'content_items',
  label: 'Content Items (Blog/Etc)',
  model: 'ContentItem',
  fields: [
    { name: 'id', label: 'ID', type: 'text' },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text' },
    { name: 'slug', label: 'Slug / URL', type: 'url' },
    { name: 'image_url', label: 'Image URL', type: 'image' },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ],
  filterableFields: ['category', 'collection'],
  sortableFields: ['created_at', 'title', 'position']
});

contentRegistry.register({
  key: 'resources',
  label: 'Resources',
  model: 'Resource',
  fields: [
    { name: 'id', label: 'ID', type: 'text' },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'slug', label: 'Slug / URL', type: 'url' },
    { name: 'excerpt', label: 'Excerpt', type: 'text' },
    { name: 'image_url', label: 'Image URL', type: 'image' },
    { name: 'type', label: 'Type', type: 'text' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ],
  filterableFields: ['type', 'gated'],
  sortableFields: ['created_at', 'title', 'position']
});
