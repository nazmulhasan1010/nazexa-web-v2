'use client';

import React, { memo } from 'react';
import type { EmailBlockV2 } from '@/lib/email/schema';

// ─── Individual block canvas preview renderers ──────────────────────────────
// These are React components (NOT email HTML). They provide a visual-faithful
// preview of each block in the builder canvas. Actual email HTML is generated
// by compiler-v2.ts at save/preview time.

interface BlockPreviewProps {
  block: EmailBlockV2;
  primaryColor: string;
  textColor: string;
  fontFamily: string;
}

export const BlockPreview = memo(function BlockPreview({ block, primaryColor, textColor, fontFamily }: BlockPreviewProps) {
  const fontStyle = { fontFamily };

  switch (block.type) {
    case 'heading': {
      const sizes = { 1: 28, 2: 22, 3: 18 };
      return (
        <div style={{ padding: '12px 24px', ...fontStyle }}>
          <div style={{
            fontSize: block.typography.fontSize || sizes[block.content.level],
            fontWeight: block.typography.fontWeight || 'bold',
            color: block.typography.color || textColor,
            textAlign: block.typography.textAlign || 'left',
          }}>{block.content.text || 'Heading'}</div>
        </div>
      );
    }

    case 'subheading':
      return (
        <div style={{ padding: '8px 24px', ...fontStyle }}>
          <div style={{ fontSize: block.typography.fontSize || 17, fontWeight: block.typography.fontWeight || '600', color: block.typography.color || textColor, textAlign: block.typography.textAlign || 'left' }}>
            {block.content.text || 'Subheading'}
          </div>
        </div>
      );

    case 'text':
      return (
        <div style={{ padding: '6px 24px', ...fontStyle }}>
          <p style={{ margin: 0, fontSize: block.typography.fontSize || 15, lineHeight: block.typography.lineHeight || 1.6, color: block.typography.color || textColor, textAlign: block.typography.textAlign || 'left' }}>
            {block.content.text || 'Text block'}
          </p>
        </div>
      );

    case 'richtext':
      return (
        <div style={{ padding: '6px 24px', ...fontStyle }}>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: textColor }} dangerouslySetInnerHTML={{ __html: block.content.html }} />
        </div>
      );

    case 'quote':
      return (
        <div style={{ padding: '12px 24px', ...fontStyle }}>
          <div style={{ borderLeft: `4px solid ${primaryColor}`, paddingLeft: 12 }}>
            <p style={{ margin: 0, fontStyle: 'italic', color: textColor, fontSize: 15 }}>{block.content.text}</p>
            {block.content.attribution && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#71717a' }}>— {block.content.attribution}</p>}
          </div>
        </div>
      );

    case 'button': {
      const btn = block.button;
      return (
        <div style={{ padding: '16px 24px', textAlign: btn.align || 'center', ...fontStyle }}>
          <span style={{
            display: 'inline-block',
            padding: `${btn.paddingTop || 10}px ${btn.paddingRight || 20}px ${btn.paddingBottom || 10}px ${btn.paddingLeft || 20}px`,
            backgroundColor: btn.backgroundColor || primaryColor,
            color: btn.textColor || '#ffffff',
            borderRadius: btn.borderRadius ?? 6,
            fontSize: block.typography.fontSize || 15,
            fontWeight: block.typography.fontWeight || '500',
            cursor: 'default',
          }}>
            {block.content.text || 'Button'}
          </span>
        </div>
      );
    }

    case 'button-group':
      return (
        <div style={{ padding: '12px 24px', textAlign: block.align || 'center', ...fontStyle }}>
          {block.buttons.map(btn => (
            <span key={btn.id} style={{
              display: 'inline-block',
              margin: 4,
              padding: '8px 16px',
              backgroundColor: btn.variant === 'outline' ? 'transparent' : btn.backgroundColor,
              color: btn.variant === 'outline' ? btn.backgroundColor : btn.textColor,
              border: `2px solid ${btn.backgroundColor}`,
              borderRadius: btn.borderRadius ?? 6,
              fontSize: 14,
              cursor: 'default',
            }}>{btn.text}</span>
          ))}
        </div>
      );

    case 'image': {
      const src = block.content.src;
      return (
        <div style={{ padding: '12px 24px', textAlign: block.image.align || 'center' }}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={block.content.alt || ''} style={{ maxWidth: '100%', borderRadius: block.image.borderRadius || 0, display: 'inline-block' }} />
          ) : (
            <div style={{ width: '100%', height: 120, backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '2px dashed #d4d4d8', color: '#a1a1aa', fontSize: 13 }}>
              Click to set image URL
            </div>
          )}
        </div>
      );
    }

    case 'logo': {
      const src = block.content.src;
      return (
        <div style={{ padding: '12px 24px', textAlign: block.logo.align || 'center' }}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={block.content.alt || 'Logo'} style={{ width: block.logo.width, maxWidth: '100%', display: 'inline-block' }} />
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#f4f4f5', padding: '8px 16px', borderRadius: 6, border: '2px dashed #d4d4d8', color: '#a1a1aa', fontSize: 13 }}>
              Logo placeholder
            </div>
          )}
        </div>
      );
    }

    case 'divider': {
      const { color, height, style: dStyle } = block.divider;
      return (
        <div style={{ padding: '16px 24px' }}>
          <div style={{ height, backgroundColor: color, borderTop: `${height}px ${dStyle} ${color}` }} />
        </div>
      );
    }

    case 'spacer':
      return (
        <div style={{ height: block.spacer.height, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: '#d4d4d8', fontFamily, userSelect: 'none' }}>Spacer {block.spacer.height}px</span>
        </div>
      );

    case 'social': {
      const { iconSize, spacing, align, shape } = block.social;
      const radius = shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : '0';
      return (
        <div style={{ padding: '12px 24px', textAlign: align || 'center' }}>
          {block.links.map(link => {
            const COLORS: Record<string, string> = { facebook: '#1877F2', instagram: '#E1306C', x: '#000000', linkedin: '#0A66C2', youtube: '#FF0000', github: '#333333', website: '#6366f1', email: '#6b7280' };
            const bg = block.social.backgroundColor || (shape !== 'plain' ? COLORS[link.platform] || '#888' : 'transparent');
            return (
              <span key={link.id} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: iconSize, height: iconSize,
                backgroundColor: bg,
                borderRadius: radius,
                margin: spacing / 2,
                color: block.social.iconColor || '#fff',
                fontSize: Math.max(9, iconSize * 0.3),
                fontFamily,
                fontWeight: 'bold',
                cursor: 'default',
              }}>
                {link.platform.charAt(0).toUpperCase()}
              </span>
            );
          })}
        </div>
      );
    }

    case 'list':
      return (
        <div style={{ padding: '8px 24px', ...fontStyle }}>
          {block.content.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: block.typography.fontSize || 15, color: block.typography.color || textColor, lineHeight: block.typography.lineHeight || 1.6 }}>
              <span style={{ minWidth: 20, color: primaryColor }}>{block.content.ordered ? `${i + 1}.` : (block.content.bulletIcon || '•')}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      );

    case 'table': {
      const { rows, hasHeader } = block.content;
      const { headerBg, headerColor, borderColor, cellPadding, stripedRows } = block.table;
      return (
        <div style={{ padding: '12px 24px', ...fontStyle, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: `1px solid ${borderColor}` }}>
            <tbody>
              {rows.map((row, ri) => {
                const isHead = hasHeader && ri === 0;
                const isStripe = !isHead && stripedRows && ri % 2 === 0;
                return (
                  <tr key={row.id}>
                    {row.cells.map((cell, ci) => (
                      <td key={ci} style={{ padding: cellPadding, border: `1px solid ${borderColor}`, backgroundColor: isHead ? headerBg : isStripe ? '#f9f9f9' : 'transparent', color: isHead ? headerColor : textColor, fontWeight: isHead ? '600' : 'normal' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case 'hero': {
      const { backgroundColor, heading, subheading, buttonText, buttonColor } = block.content;
      return (
        <div style={{ backgroundColor, padding: '32px 24px', textAlign: 'center', ...fontStyle }}>
          <div style={{ fontSize: 26, fontWeight: '700', color: '#ffffff', marginBottom: 10 }}>{heading}</div>
          {subheading && <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>{subheading}</div>}
          {buttonText && (
            <span style={{ display: 'inline-block', padding: '10px 22px', backgroundColor: buttonColor || '#ffffff', color: backgroundColor, borderRadius: 6, fontWeight: '600', fontSize: 14, cursor: 'default' }}>
              {buttonText}
            </span>
          )}
        </div>
      );
    }

    case 'announcement': {
      const { text, backgroundColor, textColor: tc } = block.content;
      return (
        <div style={{ backgroundColor, padding: '10px 24px', textAlign: 'center', fontSize: 14, fontWeight: '500', color: tc, ...fontStyle }}>
          {text}
        </div>
      );
    }

    case 'coupon': {
      const { code, description, expiresText, backgroundColor, borderColor, codeColor, textColor: tc } = block.content;
      return (
        <div style={{ padding: '12px 24px', ...fontStyle }}>
          <div style={{ backgroundColor, border: `2px dashed ${borderColor}`, borderRadius: 8, padding: '20px 16px', textAlign: 'center' }}>
            {description && <p style={{ margin: '0 0 10px', color: tc, fontSize: 14 }}>{description}</p>}
            <div style={{ fontSize: 26, fontWeight: '700', letterSpacing: 6, color: codeColor, fontFamily: 'monospace' }}>{code}</div>
            {expiresText && <p style={{ margin: '10px 0 0', color: tc, fontSize: 12, opacity: 0.8 }}>{expiresText}</p>}
          </div>
        </div>
      );
    }

    case 'testimonial': {
      const { quote, author, role, avatarUrl, backgroundColor, textColor: tc } = block.content;
      return (
        <div style={{ padding: '12px 24px', ...fontStyle }}>
          <div style={{ backgroundColor, borderRadius: 8, padding: '20px 16px', textAlign: 'center' }}>
            {avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={author} style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 10, objectFit: 'cover' }} />
            )}
            <p style={{ margin: '0 0 12px', color: tc, fontStyle: 'italic', fontSize: 15, lineHeight: 1.6 }}>"{quote}"</p>
            <p style={{ margin: 0, color: tc, fontWeight: 'bold', fontSize: 14 }}>{author}</p>
            {role && <p style={{ margin: '3px 0 0', color: tc, opacity: 0.7, fontSize: 12 }}>{role}</p>}
          </div>
        </div>
      );
    }

    default:
      return <div style={{ padding: '8px 24px', color: '#a1a1aa', fontSize: 12 }}>Unknown block type</div>;
  }
});
