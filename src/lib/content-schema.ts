import { ContentItem } from "./cms";

export type FieldType =
  | "text"
  | "textarea"
  | "rich-text"
  | "image"
  | "icon"
  | "tone"
  | "json"
  | "date"
  | "datetime"
  | "select";

export interface FieldSchema {
  name:
    | keyof Omit<
        ContentItem,
        "id" | "collection" | "position" | "published" | "data"
      >
    | string;
  label: string;
  type: FieldType;
  isData?: boolean;
  className?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface CollectionSchema {
  label: string;
  description: string;
  fields: FieldSchema[];
}

export const CONTENT_SCHEMA: Record<string, CollectionSchema> = {
  blog: {
    label: "Blog Post",
    description: "Manage your blog posts and articles.",
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        className: "sm:col-span-2",
      },
      { name: "slug", label: "Slug", type: "text" },
      { name: "category", label: "Category", type: "text" },
      {
        name: "image_url",
        label: "Featured Image",
        type: "image",
        className: "sm:col-span-2",
      },
      {
        name: "body",
        label: "Content",
        type: "rich-text",
        className: "sm:col-span-2",
      },
      { name: "author", label: "Author", type: "text", isData: true },
      {
        name: "tags",
        label: "Tags (comma separated)",
        type: "text",
        isData: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        isData: true,
        options: [
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Scheduled", value: "scheduled" },
          { label: "Archived", value: "archived" },
        ],
      },
      {
        name: "publish_date",
        label: "Publish Date",
        type: "datetime",
        isData: true,
      },
    ],
  },
  announcement: {
    label: "Announcement",
    description: "Manage global announcements and alerts.",
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        className: "sm:col-span-2",
      },
      {
        name: "body",
        label: "Message",
        type: "textarea",
        className: "sm:col-span-2",
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        isData: true,
        options: [
          { label: "Low", value: "low" },
          { label: "Normal", value: "normal" },
          { label: "High", value: "high" },
          { label: "Critical", value: "critical" },
        ],
      },
      {
        name: "start_date",
        label: "Start Date",
        type: "datetime",
        isData: true,
      },
      { name: "end_date", label: "End Date", type: "datetime", isData: true },
    ],
  },
  video: {
    label: "Video",
    description: "Manage video content and tutorials.",
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        className: "sm:col-span-2",
      },
      {
        name: "subtitle",
        label: "Short Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
      {
        name: "video_url",
        label: "Video URL (YouTube/Vimeo/MP4)",
        type: "text",
        isData: true,
      },
      { name: "image_url", label: "Thumbnail URL", type: "image" },
      {
        name: "duration",
        label: "Duration (e.g., 05:30)",
        type: "text",
        isData: true,
      },
      { name: "category", label: "Category", type: "text" },
      {
        name: "body",
        label: "Transcript / Details",
        type: "rich-text",
        className: "sm:col-span-2",
      },
    ],
  },
  gallery: {
    label: "Image / Gallery",
    description: "Manage image galleries and portfolios.",
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        className: "sm:col-span-2",
      },
      {
        name: "image_url",
        label: "Primary Image",
        type: "image",
        className: "sm:col-span-2",
      },
      {
        name: "subtitle",
        label: "Caption",
        type: "textarea",
        className: "sm:col-span-2",
      },
      {
        name: "additional_images",
        label: "Additional Images (comma separated URLs)",
        type: "textarea",
        isData: true,
        className: "sm:col-span-2",
      },
    ],
  },
  document: {
    label: "Document",
    description: "Manage downloadable files and whitepapers.",
    fields: [
      {
        name: "title",
        label: "Document Title",
        type: "text",
        className: "sm:col-span-2",
      },
      {
        name: "body",
        label: "Description",
        type: "rich-text",
        className: "sm:col-span-2",
      },
      {
        name: "file_url",
        label: "File URL (PDF/Doc)",
        type: "text",
        isData: true,
      },
      {
        name: "download_settings",
        label: "Download Settings",
        type: "select",
        isData: true,
        options: [
          { label: "Public Download", value: "public" },
          { label: "Requires Email", value: "email_required" },
          { label: "Authenticated Users Only", value: "auth_only" },
        ],
      },
    ],
  },
  faq: {
    label: "FAQ",
    description: "Manage frequently asked questions.",
    fields: [
      {
        name: "title",
        label: "Question",
        type: "text",
        className: "sm:col-span-2",
      },
      {
        name: "body",
        label: "Answer",
        type: "rich-text",
        className: "sm:col-span-2",
      },
      { name: "category", label: "Category", type: "text" },
    ],
  },
  products: {
    label: "Product",
    description: "Manage your flagship products and services.",
    fields: [
      {
        name: "title",
        label: "Product Name",
        type: "text",
        className: "sm:col-span-1",
      },
      { name: "subtitle", label: "Tagline", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "tone", label: "Brand Tone", type: "tone" },
      { name: "link_url", label: "Call to Action URL", type: "text" },
      { name: "link_label", label: "Call to Action Label", type: "text" },
      {
        name: "image_url",
        label: "Hero Image URL",
        type: "image",
        className: "sm:col-span-2",
      },
      {
        name: "body",
        label: "Description",
        type: "rich-text",
        className: "sm:col-span-2",
      },
    ],
  },
  services: {
    label: "Service",
    description: "Manage professional services and offerings.",
    fields: [
      { name: "title", label: "Service Name", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      {
        name: "subtitle",
        label: "Short Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
      { name: "icon", label: "Icon", type: "icon" },
      {
        name: "body",
        label: "Detailed Description",
        type: "rich-text",
        className: "sm:col-span-2",
      },
      {
        name: "features",
        label: "Key Features (JSON Array of {title, body})",
        type: "json",
        isData: true,
        className: "sm:col-span-2",
      },
    ],
  },
  solutions: {
    label: "Solution",
    description: "Manage solutions by stage or problem.",
    fields: [
      { name: "title", label: "Solution Name", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      {
        name: "category",
        label: "Target Audience (e.g. Startups)",
        type: "text",
      },
      {
        name: "subtitle",
        label: "Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
      {
        name: "benefits",
        label: "Benefits (JSON Array)",
        type: "json",
        isData: true,
        className: "sm:col-span-2",
      },
    ],
  },
  industries: {
    label: "Industry",
    description: "Manage supported industries and compliance.",
    fields: [
      { name: "title", label: "Industry Name", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      {
        name: "subtitle",
        label: "Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
      { name: "icon", label: "Icon", type: "icon" },
      {
        name: "controls",
        label: "Compliance Controls (JSON Array)",
        type: "json",
        isData: true,
        className: "sm:col-span-2",
      },
    ],
  },
  "case-studies": {
    label: "Case Study",
    description: "Manage customer success stories.",
    fields: [
      {
        name: "title",
        label: "Headline",
        type: "text",
        className: "sm:col-span-2",
      },
      { name: "subtitle", label: "Client Name", type: "text" },
      { name: "slug", label: "Slug", type: "text" },
      {
        name: "metric",
        label: "Key Metric (e.g. 8x faster)",
        type: "text",
        isData: true,
      },
      {
        name: "body",
        label: "Full Story",
        type: "rich-text",
        className: "sm:col-span-2",
      },
      {
        name: "image_url",
        label: "Cover Image",
        type: "image",
        className: "sm:col-span-2",
      },
    ],
  },
  portfolio: {
    label: "Portfolio Item",
    description: "Manage selected work and projects.",
    fields: [
      { name: "title", label: "Project Title", type: "text" },
      { name: "category", label: "Category", type: "text" },
      {
        name: "subtitle",
        label: "Short Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
      {
        name: "image_url",
        label: "Project Image",
        type: "image",
        className: "sm:col-span-2",
      },
    ],
  },
  integrations: {
    label: "Integration",
    description: "Manage third-party tool integrations.",
    fields: [
      { name: "title", label: "Integration Name", type: "text" },
      { name: "category", label: "Category", type: "text" },
      {
        name: "subtitle",
        label: "Description",
        type: "text",
        className: "sm:col-span-2",
      },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "link_url", label: "Documentation URL", type: "text" },
    ],
  },
  events: {
    label: "Event",
    description: "Manage conferences, meetups, and webinars.",
    fields: [
      {
        name: "title",
        label: "Event Name",
        type: "text",
        className: "sm:col-span-2",
      },
      { name: "category", label: "Event Type", type: "text" },
      {
        name: "start_date",
        label: "Date & Time",
        type: "datetime",
        isData: true,
      },
      {
        name: "location",
        label: "Location / Link",
        type: "text",
        isData: true,
      },
      {
        name: "body",
        label: "Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
    ],
  },
  team: {
    label: "Team Member",
    description: "Manage company employees and leadership.",
    fields: [
      { name: "title", label: "Full Name", type: "text" },
      { name: "subtitle", label: "Role / Job Title", type: "text" },
      { name: "category", label: "Department", type: "text" },
      { name: "location", label: "Location", type: "text", isData: true },
      {
        name: "image_url",
        label: "Profile Photo URL",
        type: "image",
        className: "sm:col-span-2",
      },
      {
        name: "body",
        label: "Bio",
        type: "textarea",
        className: "sm:col-span-2",
      },
    ],
  },
  customers: {
    label: "Customer",
    description: "Manage customer logos and testimonials.",
    fields: [
      { name: "title", label: "Company Name", type: "text" },
      { name: "image_url", label: "Logo URL", type: "image" },
      {
        name: "testimonial",
        label: "Testimonial Quote",
        type: "textarea",
        isData: true,
        className: "sm:col-span-2",
      },
      { name: "author", label: "Quote Author", type: "text", isData: true },
      { name: "author_role", label: "Author Role", type: "text", isData: true },
    ],
  },
  partners: {
    label: "Partner",
    description: "Manage agency and technology partners.",
    fields: [
      { name: "title", label: "Partner Name", type: "text" },
      {
        name: "category",
        label: "Partner Type",
        type: "select",
        options: [
          { label: "Solution Partner", value: "solution" },
          { label: "Technology Partner", value: "technology" },
        ],
      },
      {
        name: "subtitle",
        label: "Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
      {
        name: "link_url",
        label: "Website URL",
        type: "text",
        className: "sm:col-span-2",
      },
    ],
  },
  pricing: {
    label: "Pricing Tier",
    description: "Manage subscription plans and tiers.",
    fields: [
      { name: "title", label: "Tier Name", type: "text" },
      { name: "subtitle", label: "Price String (e.g. $49/mo)", type: "text" },
      {
        name: "body",
        label: "Description",
        type: "textarea",
        className: "sm:col-span-2",
      },
      {
        name: "features",
        label: "Features (JSON Array of strings)",
        type: "json",
        isData: true,
        className: "sm:col-span-2",
      },
      { name: "link_url", label: "Checkout URL", type: "text" },
      { name: "link_label", label: "Button Label", type: "text" },
    ],
  },
};
