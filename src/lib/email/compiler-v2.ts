/**
 * V2 Email-Safe HTML Compiler
 *
 * Converts EmailDesignV2 JSON into production-ready, email-client-compatible
 * HTML using table-based layouts with inlined CSS.
 *
 * Compatible with: Gmail, Outlook 2007-2019, Apple Mail, Yahoo Mail, mobile clients.
 * Does NOT use: JavaScript, iframes, CSS Grid, Flexbox, CSS variables, animations.
 */

import type {
  EmailDesignV2,
  EmailSection,
  EmailColumn,
  EmailBlockV2,
  HeadingBlock,
  SubheadingBlock,
  TextBlock,
  RichTextBlock,
  QuoteBlock,
  ButtonBlock,
  ButtonGroupBlock,
  ImageBlock,
  LogoBlock,
  DividerBlock,
  SpacerBlock,
  SocialBlock,
  ListBlock,
  TableBlock,
  HeroBlock,
  AnnouncementBlock,
  CouponBlock,
  TestimonialBlock,
  TypographyProps,
  TextAlign,
} from './schema';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function px(val?: number, fallback = 0): string {
  return `${val ?? fallback}px`;
}

function typoStyle(t: TypographyProps, defaults?: Partial<TypographyProps>): string {
  const merged = { ...defaults, ...t };
  const parts: string[] = [];
  if (merged.fontFamily) parts.push(`font-family: ${merged.fontFamily}`);
  if (merged.fontSize) parts.push(`font-size: ${merged.fontSize}px`);
  if (merged.fontWeight) parts.push(`font-weight: ${merged.fontWeight}`);
  if (merged.lineHeight) parts.push(`line-height: ${merged.lineHeight}`);
  if (merged.letterSpacing) parts.push(`letter-spacing: ${merged.letterSpacing}px`);
  if (merged.color) parts.push(`color: ${merged.color}`);
  if (merged.textAlign) parts.push(`text-align: ${merged.textAlign}`);
  if (merged.textDecoration) parts.push(`text-decoration: ${merged.textDecoration}`);
  if (merged.textTransform) parts.push(`text-transform: ${merged.textTransform}`);
  return parts.join('; ');
}

function spacingStyle(s?: {
  paddingTop?: number; paddingBottom?: number;
  paddingLeft?: number; paddingRight?: number;
}): string {
  if (!s) return '';
  const parts: string[] = [];
  if (s.paddingTop !== undefined) parts.push(`padding-top: ${px(s.paddingTop)}`);
  if (s.paddingBottom !== undefined) parts.push(`padding-bottom: ${px(s.paddingBottom)}`);
  if (s.paddingLeft !== undefined) parts.push(`padding-left: ${px(s.paddingLeft)}`);
  if (s.paddingRight !== undefined) parts.push(`padding-right: ${px(s.paddingRight)}`);
  return parts.join('; ');
}

function alignToTableAlign(align?: TextAlign): string {
  return align || 'left';
}

// Social platform color map
const SOCIAL_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  x: '#000000',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  github: '#333333',
  website: '#6366f1',
  email: '#6b7280',
};

// Simple SVG icons for social platforms (email-safe inline SVG)
const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'f',
  instagram: 'ig',
  x: 'x',
  linkedin: 'in',
  youtube: 'yt',
  github: 'gh',
  website: 'www',
  email: '@',
};

// ─── Block Renderers ──────────────────────────────────────────────────────────

function renderHeading(block: HeadingBlock, settings: EmailDesignV2['settings']): string {
  const tag = `h${block.content.level}`;
  const defaultSizes = { 1: 32, 2: 24, 3: 20 };
  const style = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    fontSize: defaultSizes[block.content.level],
    fontWeight: '700',
  });
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 8, paddingLeft: 32, paddingRight: 32, ...block.style });
  return `
    <tr>
      <td align="${alignToTableAlign(block.typography.textAlign)}" style="${sp}">
        <${tag} style="margin: 0; ${style}">${block.content.text}</${tag}>
      </td>
    </tr>`;
}

function renderSubheading(block: SubheadingBlock, settings: EmailDesignV2['settings']): string {
  const style = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    fontSize: 18,
    fontWeight: '600',
  });
  const sp = spacingStyle({ paddingTop: 8, paddingBottom: 8, paddingLeft: 32, paddingRight: 32, ...block.style });
  return `
    <tr>
      <td align="${alignToTableAlign(block.typography.textAlign)}" style="${sp}">
        <p style="margin: 0; ${style}">${block.content.text}</p>
      </td>
    </tr>`;
}

function renderText(block: TextBlock, settings: EmailDesignV2['settings']): string {
  const style = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    fontSize: 16,
    lineHeight: 1.6,
  });
  const sp = spacingStyle({ paddingTop: 8, paddingBottom: 8, paddingLeft: 32, paddingRight: 32, ...block.style });
  return `
    <tr>
      <td align="${alignToTableAlign(block.typography.textAlign)}" style="${sp}">
        <p style="margin: 0; ${style}">${block.content.text}</p>
      </td>
    </tr>`;
}

function renderRichText(block: RichTextBlock, settings: EmailDesignV2['settings']): string {
  const style = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    fontSize: 16,
    lineHeight: 1.6,
  });
  const sp = spacingStyle({ paddingTop: 8, paddingBottom: 8, paddingLeft: 32, paddingRight: 32, ...block.style });
  // Strip dangerous tags/attrs from rich HTML
  const safe = block.content.html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '#');
  return `
    <tr>
      <td style="${sp}; ${style}">${safe}</td>
    </tr>`;
}

function renderQuote(block: QuoteBlock, settings: EmailDesignV2['settings']): string {
  const style = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    fontSize: 16,
    lineHeight: 1.6,
  });
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });
  return `
    <tr>
      <td style="${sp}">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="border-left: 4px solid ${settings.primaryColor}; padding-left: 16px; padding-top: 8px; padding-bottom: 8px;">
              <p style="margin: 0; font-style: italic; ${style}">${esc(block.content.text)}</p>
              ${block.content.attribution ? `<p style="margin: 8px 0 0; font-size: 13px; color: #71717a; font-family: ${settings.fontFamily}">— ${esc(block.content.attribution)}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderButton(block: ButtonBlock, settings: EmailDesignV2['settings']): string {
  const btn = block.button;
  const bgColor = btn.backgroundColor || settings.primaryColor;
  const textColor = btn.textColor || '#ffffff';
  const borderRadius = btn.borderRadius ?? 6;
  const sp = spacingStyle({ paddingTop: 24, paddingBottom: 24, paddingLeft: 32, paddingRight: 32, ...block.style });
  const btnStyle = [
    `display: inline-block`,
    `padding: ${px(btn.paddingTop, 12)} ${px(btn.paddingRight, 24)} ${px(btn.paddingBottom, 12)} ${px(btn.paddingLeft, 24)}`,
    `background-color: ${bgColor}`,
    `color: ${textColor}`,
    `text-decoration: none`,
    `border-radius: ${px(borderRadius)}`,
    `font-family: ${settings.fontFamily}`,
    `font-weight: ${block.typography.fontWeight || '500'}`,
    `font-size: ${px(block.typography.fontSize || 16)}`,
    btn.width === 'full' ? 'width: 100%; text-align: center; box-sizing: border-box' : '',
  ].filter(Boolean).join('; ');

  return `
    <tr>
      <td align="${alignToTableAlign(btn.align)}" style="${sp}">
        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${block.content.url}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="${bgColor}"><w:anchorlock/><center style="color:${textColor};font-family:${settings.fontFamily};font-size:16px;font-weight:bold;">${esc(block.content.text)}</center></v:roundrect><![endif]-->
        <!--[if !mso]><!-->
        <a href="${block.content.url}" ${block.content.newTab ? 'target="_blank"' : ''} style="${btnStyle}">${esc(block.content.text)}</a>
        <!--<![endif]-->
      </td>
    </tr>`;
}

function renderButtonGroup(block: ButtonGroupBlock, settings: EmailDesignV2['settings']): string {
  const buttonsHtml = block.buttons.map(btn => {
    const isOutline = btn.variant === 'outline';
    const style = [
      `display: inline-block`,
      `padding: 10px 20px`,
      `background-color: ${isOutline ? 'transparent' : btn.backgroundColor}`,
      `color: ${isOutline ? btn.backgroundColor : btn.textColor}`,
      `border: 2px solid ${btn.backgroundColor}`,
      `text-decoration: none`,
      `border-radius: ${px(btn.borderRadius)}`,
      `font-family: ${settings.fontFamily}`,
      `font-size: 15px`,
      `margin: 4px`,
    ].join('; ');
    return `<a href="${btn.url}" style="${style}">${esc(btn.text)}</a>`;
  }).join('\n');

  return `
    <tr>
      <td align="${alignToTableAlign(block.align)}" style="padding: 16px 32px;">
        ${buttonsHtml}
      </td>
    </tr>`;
}

function renderImage(block: ImageBlock, settings: EmailDesignV2['settings']): string {
  const { src, alt, link, newTab } = block.content;
  const { align, borderRadius, width, widthUnit } = block.image;
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });
  const imgWidth = width ? `${width}${widthUnit || 'px'}` : '100%';
  const imgStyle = [
    `display: block`,
    `max-width: 100%`,
    `height: auto`,
    borderRadius ? `border-radius: ${px(borderRadius)}` : '',
    block.style?.borderWidth ? `border: ${block.style.borderWidth}px ${block.style.borderStyle || 'solid'} ${block.style.borderColor || '#e4e4e7'}` : '',
  ].filter(Boolean).join('; ');

  const imgTag = `<img src="${src}" alt="${esc(alt || '')}" width="${imgWidth.replace('%', '')}" style="${imgStyle}; width: ${imgWidth};" />`;
  const content = link
    ? `<a href="${link}" ${newTab ? 'target="_blank"' : ''} style="text-decoration: none;">${imgTag}</a>`
    : imgTag;

  return `
    <tr>
      <td align="${alignToTableAlign(align)}" style="${sp}">${content}</td>
    </tr>`;
}

function renderLogo(block: LogoBlock, settings: EmailDesignV2['settings']): string {
  const { src, alt, link } = block.content;
  const { width, align } = block.logo;
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });
  const imgTag = `<img src="${src}" alt="${esc(alt || 'Logo')}" width="${width}" style="display: block; max-width: 100%; height: auto;" />`;
  const content = link ? `<a href="${link}" style="text-decoration: none;">${imgTag}</a>` : imgTag;
  return `
    <tr>
      <td align="${alignToTableAlign(align)}" style="${sp}">${content}</td>
    </tr>`;
}

function renderDivider(block: DividerBlock): string {
  const { color, height, style, width } = block.divider;
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });
  const divWidth = width ? `${width}%` : '100%';
  return `
    <tr>
      <td style="${sp}">
        <table width="${divWidth}" border="0" cellspacing="0" cellpadding="0" align="center">
          <tr>
            <td style="height: ${px(height)}; background-color: ${color}; border-top: ${px(height)} ${style} ${color}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderSpacer(block: SpacerBlock): string {
  const h = block.spacer.height;
  return `
    <tr>
      <td style="height: ${px(h)}; line-height: ${px(h)}; font-size: ${px(h)}; mso-line-height-rule: exactly;">&nbsp;</td>
    </tr>`;
}

function renderSocial(block: SocialBlock, settings: EmailDesignV2['settings']): string {
  const { iconSize, spacing, align, shape, backgroundColor, iconColor } = block.social;
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });
  const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : shape === 'square' ? '0' : '0';

  const iconsHtml = block.links.map(link => {
    const color = SOCIAL_COLORS[link.platform] || '#6b7280';
    const bg = backgroundColor || (shape !== 'plain' ? color : 'transparent');
    const fg = iconColor || '#ffffff';
    const label = link.label || SOCIAL_LABELS[link.platform] || link.platform;
    const cellStyle = shape !== 'plain'
      ? `display: inline-block; width: ${px(iconSize)}; height: ${px(iconSize)}; background-color: ${bg}; border-radius: ${radius}; text-align: center; line-height: ${px(iconSize)}; margin: 0 ${px(Math.floor(spacing / 2))};`
      : `display: inline-block; margin: 0 ${px(Math.floor(spacing / 2))};`;
    const textStyle = `color: ${shape !== 'plain' ? fg : color}; text-decoration: none; font-size: ${Math.max(10, iconSize * 0.4)}px; font-family: Arial, sans-serif; font-weight: bold;`;
    return `<a href="${link.url}" target="_blank" style="${cellStyle}"><span style="${textStyle}">${label.toUpperCase()}</span></a>`;
  }).join('\n');

  return `
    <tr>
      <td align="${alignToTableAlign(align)}" style="${sp}">${iconsHtml}</td>
    </tr>`;
}

function renderList(block: ListBlock, settings: EmailDesignV2['settings']): string {
  const style = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    color: settings.textColor,
    fontSize: 16,
    lineHeight: 1.6,
  });
  const sp = spacingStyle({ paddingTop: 8, paddingBottom: 8, paddingLeft: 32, paddingRight: 32, ...block.style });
  const bullet = block.content.bulletIcon || (block.content.ordered ? '' : '•');

  const itemsHtml = block.content.items.map((item, i) => {
    const prefix = block.content.ordered ? `${i + 1}.` : bullet;
    return `
      <tr>
        <td width="24" style="padding-right: 8px; vertical-align: top; ${style}">${prefix}</td>
        <td style="${style}">${item}</td>
      </tr>`;
  }).join('');

  return `
    <tr>
      <td style="${sp}">
        <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
          ${itemsHtml}
        </table>
      </td>
    </tr>`;
}

function renderTable(block: TableBlock, settings: EmailDesignV2['settings']): string {
  const { rows, hasHeader } = block.content;
  const { borderColor, cellPadding, headerBg, headerColor, stripedRows, align } = block.table;
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });

  const rowsHtml = rows.map((row, ri) => {
    const isHeader = hasHeader && ri === 0;
    const isStripe = !isHeader && stripedRows && ri % 2 === 0;
    const rowBg = isHeader ? headerBg : isStripe ? '#f9f9f9' : 'transparent';
    const cellStyle = `padding: ${px(cellPadding)}; border: 1px solid ${borderColor}; font-family: ${settings.fontFamily}; font-size: 14px; color: ${isHeader ? headerColor : settings.textColor}; background-color: ${rowBg};`;
    const cells = row.cells.map(cell => {
      const tag = isHeader ? 'th' : 'td';
      return `<${tag} style="${cellStyle}">${cell}</${tag}>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <tr>
      <td align="${alignToTableAlign(align)}" style="${sp}">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid ${borderColor};">
          ${rowsHtml}
        </table>
      </td>
    </tr>`;
}

function renderHero(block: HeroBlock, settings: EmailDesignV2['settings']): string {
  const { backgroundImage, backgroundColor, overlayOpacity, heading, subheading, buttonText, buttonUrl, buttonColor } = block.content;
  const bgStyle = backgroundImage
    ? `background-image: url('${backgroundImage}'); background-size: cover; background-position: center; background-color: ${backgroundColor};`
    : `background-color: ${backgroundColor};`;
  const overlayHtml = backgroundImage && overlayOpacity
    ? `<tr><td style="background-color: rgba(0,0,0,${overlayOpacity}); padding: 40px 32px; text-align: center;">` : '';
  const cellStyle = !overlayHtml ? 'padding: 40px 32px; text-align: center;' : '';

  const headStyle = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  });
  const subStyle = `font-family: ${settings.fontFamily}; color: rgba(255,255,255,0.85); font-size: 18px; margin: 12px 0 0;`;
  const btnStyle = buttonText
    ? `display: inline-block; padding: 12px 28px; background-color: ${buttonColor || settings.primaryColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-family: ${settings.fontFamily}; font-weight: bold; font-size: 16px; margin-top: 24px;`
    : '';

  return `
    <tr>
      <td style="${bgStyle}">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="${overlayHtml ? 'background-color: rgba(0,0,0,' + overlayOpacity + ');' : ''} padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; ${headStyle}">${heading}</h1>
              ${subheading ? `<p style="${subStyle}">${subheading}</p>` : ''}
              ${buttonText && buttonUrl ? `<a href="${buttonUrl}" style="${btnStyle}">${esc(buttonText)}</a>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderAnnouncement(block: AnnouncementBlock, settings: EmailDesignV2['settings']): string {
  const { text, backgroundColor, textColor, link } = block.content;
  const style = typoStyle(block.typography, {
    fontFamily: settings.fontFamily,
    fontSize: 15,
    fontWeight: '500',
  });
  const sp = spacingStyle({ paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, ...block.style });
  const content = link ? `<a href="${link}" style="color: ${textColor}; text-decoration: none;">${text}</a>` : text;
  return `
    <tr>
      <td align="center" style="background-color: ${backgroundColor}; ${sp}">
        <p style="margin: 0; color: ${textColor}; ${style}">${content}</p>
      </td>
    </tr>`;
}

function renderCoupon(block: CouponBlock): string {
  const { code, description, expiresText, backgroundColor, borderColor, codeColor, textColor } = block.content;
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });
  return `
    <tr>
      <td style="${sp}">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 2px dashed ${borderColor}; border-radius: 8px; background-color: ${backgroundColor};">
          <tr>
            <td align="center" style="padding: 24px;">
              ${description ? `<p style="margin: 0 0 12px; color: ${textColor}; font-size: 15px;">${esc(description)}</p>` : ''}
              <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: ${codeColor}; font-family: monospace;">${esc(code)}</p>
              ${expiresText ? `<p style="margin: 12px 0 0; color: ${textColor}; font-size: 12px; opacity: 0.8;">${esc(expiresText)}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function renderTestimonial(block: TestimonialBlock, settings: EmailDesignV2['settings']): string {
  const { quote, author, role, avatarUrl, backgroundColor, textColor } = block.content;
  const sp = spacingStyle({ paddingTop: 16, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, ...block.style });
  const avatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" alt="${esc(author)}" width="48" height="48" style="border-radius: 50%; display: block; margin: 0 auto 12px;" />`
    : '';
  return `
    <tr>
      <td style="${sp}">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${backgroundColor}; border-radius: 8px; padding: 24px;">
          <tr>
            <td align="center" style="padding: 24px;">
              ${avatarHtml}
              <p style="margin: 0 0 16px; color: ${textColor}; font-size: 16px; line-height: 1.6; font-style: italic; font-family: ${settings.fontFamily};">"${esc(quote)}"</p>
              <p style="margin: 0; color: ${textColor}; font-weight: bold; font-size: 14px; font-family: ${settings.fontFamily};">${esc(author)}</p>
              ${role ? `<p style="margin: 4px 0 0; color: ${textColor}; opacity: 0.7; font-size: 13px; font-family: ${settings.fontFamily};">${esc(role)}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

// ─── Block Dispatcher ─────────────────────────────────────────────────────────

function renderBlock(block: EmailBlockV2, settings: EmailDesignV2['settings']): string {
  if (block.hidden) return '';
  switch (block.type) {
    case 'heading': return renderHeading(block, settings);
    case 'subheading': return renderSubheading(block, settings);
    case 'text': return renderText(block, settings);
    case 'richtext': return renderRichText(block, settings);
    case 'quote': return renderQuote(block, settings);
    case 'button': return renderButton(block, settings);
    case 'button-group': return renderButtonGroup(block, settings);
    case 'image': return renderImage(block, settings);
    case 'logo': return renderLogo(block, settings);
    case 'divider': return renderDivider(block);
    case 'spacer': return renderSpacer(block);
    case 'social': return renderSocial(block, settings);
    case 'list': return renderList(block, settings);
    case 'table': return renderTable(block, settings);
    case 'hero': return renderHero(block, settings);
    case 'announcement': return renderAnnouncement(block, settings);
    case 'coupon': return renderCoupon(block);
    case 'testimonial': return renderTestimonial(block, settings);
    default: return '';
  }
}

// ─── Column Renderer ──────────────────────────────────────────────────────────

function renderColumn(column: EmailColumn, settings: EmailDesignV2['settings'], totalWidth: number): string {
  const colWidth = Math.round((parseFloat(column.width) / 100) * totalWidth);
  const style = column.style;
  const bgStyle = style.backgroundColor ? `background-color: ${style.backgroundColor};` : '';
  const borderStyle = style.borderWidth
    ? `border: ${style.borderWidth}px ${style.borderStyle || 'solid'} ${style.borderColor || '#e4e4e7'};`
    : '';
  const padStyle = spacingStyle(style);

  const blocksHtml = column.blocks.map(b => renderBlock(b, settings)).join('');
  return `
    <td class="email-col" width="${colWidth}" valign="${style.verticalAlign || 'top'}" style="${bgStyle} ${borderStyle} ${padStyle}">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        ${blocksHtml}
      </table>
    </td>`;
}

// ─── Section Renderer ─────────────────────────────────────────────────────────

function renderSection(section: EmailSection, settings: EmailDesignV2['settings']): string {
  if (section.hidden) return '';
  const s = section.style;
  const bgColor = s.backgroundColor || 'transparent';
  const bgImage = s.backgroundImage ? `background-image: url('${s.backgroundImage}');` : '';
  const bgPos = s.backgroundPosition ? `background-position: ${s.backgroundPosition};` : '';
  const bgSize = s.backgroundSize ? `background-size: ${s.backgroundSize};` : '';
  const border = s.borderWidth ? `border: ${s.borderWidth}px ${s.borderStyle || 'solid'} ${s.borderColor || '#e4e4e7'};` : '';
  const radius = s.borderRadius ? `border-radius: ${px(s.borderRadius)};` : '';
  const padTop = s.paddingTop ?? 0;
  const padBottom = s.paddingBottom ?? 0;
  const padLeft = s.paddingLeft ?? 0;
  const padRight = s.paddingRight ?? 0;

  const columnsHtml = section.columns
    .map(col => renderColumn(col, settings, settings.width))
    .join('\n');

  return `
    <tr>
      <td style="background-color: ${bgColor}; ${bgImage} ${bgPos} ${bgSize} ${border} ${radius} padding: ${px(padTop)} ${px(padRight)} ${px(padBottom)} ${px(padLeft)};">
        <table class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: ${settings.width}px;">
          <tr>
            ${columnsHtml}
          </tr>
        </table>
      </td>
    </tr>`;
}

// ─── Responsive CSS ───────────────────────────────────────────────────────────

const RESPONSIVE_CSS = `
  @media only screen and (max-width: 600px) {
    .email-wrapper { width: 100% !important; padding: 0 !important; }
    .email-container { width: 100% !important; max-width: 100% !important; clear: both !important; }
    .email-col { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; clear: both !important; }
    .hide-mobile { display: none !important; }
    img { max-width: 100% !important; height: auto !important; }
    td[class="mobile-pad"] { padding-left: 16px !important; padding-right: 16px !important; }
  }
`;

// ─── Root Compiler ────────────────────────────────────────────────────────────

export function compileEmailHtmlV2(design: EmailDesignV2): string {
  const { settings, sections } = design;
  const sectionsHtml = sections.map(s => renderSection(s, settings)).join('\n');

  const footerText = (settings.footerText || '')
    .split('\n')
    .map(line => `<p style="margin: 4px 0;">${line}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if mso]>
  <xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: ${settings.backgroundColor}; -webkit-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { mso-line-height-rule: exactly; }
    ${RESPONSIVE_CSS}
  </style>
</head>
<body>
  <table class="email-wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${settings.backgroundColor}; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;" class="mobile-pad">
        <!--[if mso]><table width="${settings.width}" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td><![endif]-->
        <table class="email-container" width="${settings.width}" border="0" cellspacing="0" cellpadding="0" align="center" style="background-color: ${settings.containerColor}; border-radius: 8px; overflow: hidden; max-width: 100%; margin: 0 auto;">
          ${sectionsHtml}
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
        ${footerText ? `
        <!--[if mso]><table width="${settings.width}" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td><![endif]-->
        <table class="email-container" width="${settings.width}" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 100%; margin: 0 auto;">
          <tr>
            <td align="center" style="padding: 24px 16px; font-family: ${settings.fontFamily}; font-size: 12px; color: ${settings.footerColor || '#71717a'}; line-height: 1.5;">
              ${footerText}
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->` : ''}
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// Export a single unified compile function that handles both v1 and v2
export { compileEmailHtmlV2 as default };
