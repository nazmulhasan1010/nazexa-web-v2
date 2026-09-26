// ─── V2 Email Design Schema ─────────────────────────────────────────────────
// This is the canonical typed schema for the advanced email builder.
// Version 1 (flat blocks array) is auto-migrated to version 2 on load.

export type TextAlign = 'left' | 'center' | 'right';
export type FontWeight = 'normal' | 'bold' | '500' | '600' | '700';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'none';

export interface SpacingProps {
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
}

export interface BorderProps {
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: BorderStyle;
  borderRadius?: number;
}

export interface TypographyProps {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  textAlign?: TextAlign;
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

// ─── Section / Column ────────────────────────────────────────────────────────

export interface SectionStyle extends SpacingProps, BorderProps {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  fullWidth?: boolean;
}

export interface ColumnStyle extends SpacingProps, BorderProps {
  backgroundColor?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export type ColumnLayout =
  | '100'
  | '50-50'
  | '33-67'
  | '67-33'
  | '33-33-33'
  | '25-25-25-25';

export interface EmailColumn {
  id: string;
  width: string; // e.g. '100%', '50%', '33.33%'
  blocks: EmailBlockV2[];
  style: ColumnStyle;
}

export interface EmailSection {
  id: string;
  layout: ColumnLayout;
  columns: EmailColumn[];
  style: SectionStyle;
  hidden?: boolean;
  locked?: boolean;
}

// ─── Block Types ─────────────────────────────────────────────────────────────

export type BlockType =
  | 'heading'
  | 'subheading'
  | 'text'
  | 'richtext'
  | 'quote'
  | 'button'
  | 'button-group'
  | 'image'
  | 'logo'
  | 'divider'
  | 'spacer'
  | 'social'
  | 'list'
  | 'table'
  | 'hero'
  | 'announcement'
  | 'coupon'
  | 'testimonial';

export interface BaseBlock {
  id: string;
  type: BlockType;
  hidden?: boolean;
  locked?: boolean;
  style?: SpacingProps & BorderProps & { backgroundColor?: string };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: {
    text: string;
    level: 1 | 2 | 3;
  };
  typography: TypographyProps;
}

export interface SubheadingBlock extends BaseBlock {
  type: 'subheading';
  content: { text: string };
  typography: TypographyProps;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: { text: string };
  typography: TypographyProps;
}

export interface RichTextBlock extends BaseBlock {
  type: 'richtext';
  content: { html: string };
  typography: TypographyProps;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: {
    text: string;
    attribution?: string;
  };
  typography: TypographyProps;
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  content: {
    text: string;
    url: string;
    newTab?: boolean;
  };
  typography: TypographyProps;
  button: {
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    width?: 'auto' | 'full';
    align: TextAlign;
    border?: BorderProps;
  };
}

export interface ButtonGroupBlock extends BaseBlock {
  type: 'button-group';
  buttons: Array<{
    id: string;
    text: string;
    url: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    variant: 'filled' | 'outline';
  }>;
  align: TextAlign;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  content: {
    src: string;
    alt: string;
    link?: string;
    newTab?: boolean;
  };
  image: {
    width?: number; // px or percentage
    widthUnit?: 'px' | '%';
    align: TextAlign;
    borderRadius?: number;
    border?: BorderProps;
  };
}

export interface LogoBlock extends BaseBlock {
  type: 'logo';
  content: {
    src: string;
    alt: string;
    link?: string;
  };
  logo: {
    width: number;
    align: TextAlign;
  };
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  divider: {
    color: string;
    height: number;
    style: BorderStyle;
    width?: number; // percentage
  };
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  spacer: { height: number };
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube' | 'github' | 'website' | 'email';
  url: string;
  label?: string;
}

export interface SocialBlock extends BaseBlock {
  type: 'social';
  links: SocialLink[];
  social: {
    iconSize: number;
    spacing: number;
    align: TextAlign;
    shape: 'circle' | 'square' | 'rounded' | 'plain';
    backgroundColor?: string;
    iconColor?: string;
  };
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  content: {
    items: string[];
    ordered: boolean;
    bulletIcon?: string; // emoji or symbol e.g. '✓'
  };
  typography: TypographyProps;
}

export interface TableRow {
  id: string;
  cells: string[];
  isHeader?: boolean;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  content: {
    rows: TableRow[];
    hasHeader: boolean;
  };
  table: {
    borderColor: string;
    cellPadding: number;
    headerBg: string;
    headerColor: string;
    stripedRows: boolean;
    align: TextAlign;
  };
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  content: {
    backgroundImage?: string;
    backgroundColor: string;
    overlayOpacity: number;
    heading: string;
    subheading?: string;
    buttonText?: string;
    buttonUrl?: string;
    buttonColor?: string;
  };
  typography: TypographyProps;
}

export interface AnnouncementBlock extends BaseBlock {
  type: 'announcement';
  content: {
    text: string;
    backgroundColor: string;
    textColor: string;
    link?: string;
  };
  typography: TypographyProps;
}

export interface CouponBlock extends BaseBlock {
  type: 'coupon';
  content: {
    code: string;
    description?: string;
    expiresText?: string;
    backgroundColor: string;
    borderColor: string;
    codeColor: string;
    textColor: string;
  };
}

export interface TestimonialBlock extends BaseBlock {
  type: 'testimonial';
  content: {
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
    backgroundColor: string;
    textColor: string;
  };
}

export type EmailBlockV2 =
  | HeadingBlock
  | SubheadingBlock
  | TextBlock
  | RichTextBlock
  | QuoteBlock
  | ButtonBlock
  | ButtonGroupBlock
  | ImageBlock
  | LogoBlock
  | DividerBlock
  | SpacerBlock
  | SocialBlock
  | ListBlock
  | TableBlock
  | HeroBlock
  | AnnouncementBlock
  | CouponBlock
  | TestimonialBlock;

// ─── Global Settings ─────────────────────────────────────────────────────────

export interface EmailSettingsV2 {
  width: number;
  backgroundColor: string;
  containerColor: string;
  fontFamily: string;
  textColor: string;
  primaryColor: string;
  footerText?: string;
  footerColor?: string;
}

// ─── Root Design ─────────────────────────────────────────────────────────────

export interface EmailDesignV2 {
  version: 2;
  settings: EmailSettingsV2;
  sections: EmailSection[];
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS_V2: EmailSettingsV2 = {
  width: 600,
  backgroundColor: '#f4f4f5',
  containerColor: '#ffffff',
  fontFamily: 'Arial, Helvetica, sans-serif',
  textColor: '#09090b',
  primaryColor: '#2563eb',
  footerText: '© {{currentYear}} {{company.name}}. All rights reserved.\n{{company.address}}',
  footerColor: '#71717a',
};

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createDefaultSection(layout: ColumnLayout = '100'): EmailSection {
  const widths = layoutToWidths(layout);
  return {
    id: generateId(),
    layout,
    columns: widths.map(w => ({
      id: generateId(),
      width: w,
      blocks: [],
      style: {},
    })),
    style: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
  };
}

export function layoutToWidths(layout: ColumnLayout): string[] {
  switch (layout) {
    case '100': return ['100%'];
    case '50-50': return ['50%', '50%'];
    case '33-67': return ['33.33%', '66.67%'];
    case '67-33': return ['66.67%', '33.33%'];
    case '33-33-33': return ['33.33%', '33.33%', '33.34%'];
    case '25-25-25-25': return ['25%', '25%', '25%', '25%'];
    default: return ['100%'];
  }
}

// ─── V1 → V2 Migration ───────────────────────────────────────────────────────

/**
 * Auto-migrates a v1 flat design (blocks + theme) to v2 sections+columns.
 * Called on load from the builder page.
 */
export function migrateV1toV2(v1: {
  theme?: {
    backgroundColor?: string;
    containerColor?: string;
    textColor?: string;
    primaryColor?: string;
  };
  blocks?: Array<{
    id: string;
    type: string;
    content?: string;
    url?: string;
    align?: string;
  }>;
}): EmailDesignV2 {
  const section = createDefaultSection('100');

  if (v1.blocks) {
    section.columns[0].blocks = v1.blocks.map(b => {
      const base = { id: b.id, style: {} };
      const align: TextAlign = (b.align as TextAlign) || 'left';

      if (b.type === 'heading') {
        return {
          ...base,
          type: 'heading' as const,
          content: { text: b.content || '', level: 2 as const },
          typography: { textAlign: align, fontSize: 24, fontWeight: '600' as const, color: v1.theme?.textColor },
        } satisfies HeadingBlock;
      }
      if (b.type === 'paragraph') {
        return {
          ...base,
          type: 'text' as const,
          content: { text: b.content || '' },
          typography: { textAlign: align, fontSize: 16, color: v1.theme?.textColor },
        } satisfies TextBlock;
      }
      if (b.type === 'button') {
        return {
          ...base,
          type: 'button' as const,
          content: { text: b.content || 'Click Me', url: b.url || '#' },
          typography: { fontSize: 16, fontWeight: '500' as const, color: '#ffffff' },
          button: {
            backgroundColor: v1.theme?.primaryColor || '#2563eb',
            textColor: '#ffffff',
            borderRadius: 6,
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 24,
            paddingRight: 24,
            align,
          },
        } satisfies ButtonBlock;
      }
      if (b.type === 'image') {
        return {
          ...base,
          type: 'image' as const,
          content: { src: b.content || '', alt: '', link: b.url },
          image: { align },
        } satisfies ImageBlock;
      }
      if (b.type === 'divider') {
        return {
          ...base,
          type: 'divider' as const,
          divider: { color: '#e4e4e7', height: 1, style: 'solid' },
        } satisfies DividerBlock;
      }
      if (b.type === 'spacer') {
        return {
          ...base,
          type: 'spacer' as const,
          spacer: { height: parseInt(b.content || '32') || 32 },
        } satisfies SpacerBlock;
      }
      // Fallback: treat as text block
      return {
        ...base,
        type: 'text' as const,
        content: { text: b.content || '' },
        typography: { textAlign: align },
      } satisfies TextBlock;
    });
  }

  return {
    version: 2,
    settings: {
      ...DEFAULT_SETTINGS_V2,
      backgroundColor: v1.theme?.backgroundColor || DEFAULT_SETTINGS_V2.backgroundColor,
      containerColor: v1.theme?.containerColor || DEFAULT_SETTINGS_V2.containerColor,
      textColor: v1.theme?.textColor || DEFAULT_SETTINGS_V2.textColor,
      primaryColor: v1.theme?.primaryColor || DEFAULT_SETTINGS_V2.primaryColor,
    },
    sections: [section],
  };
}
