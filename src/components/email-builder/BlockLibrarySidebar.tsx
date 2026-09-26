'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { EMAIL_VARIABLES } from '@/lib/email/variables';
import type { BlockType } from '@/lib/email/schema';
import {
  Type, Heading1, Heading2, Image, Link2, Minus, Space, Share2, List,
  Table, Zap, Megaphone, Tag, Quote, Star, AlignLeft, LayoutGrid,
  MessageSquare, MousePointerClick,
} from 'lucide-react';

interface BlockDef {
  type: BlockType;
  label: string;
  icon: React.ElementType;
  group: string;
  description: string;
}

const BLOCK_DEFS: BlockDef[] = [
  // Basic
  { type: 'heading', label: 'Heading', icon: Heading1, group: 'Basic', description: 'H1, H2, H3 headings' },
  { type: 'subheading', label: 'Subheading', icon: Heading2, group: 'Basic', description: 'Secondary heading' },
  { type: 'text', label: 'Text', icon: AlignLeft, group: 'Basic', description: 'Plain text paragraph' },
  { type: 'richtext', label: 'Rich Text', icon: Type, group: 'Basic', description: 'HTML rich text editor' },
  { type: 'quote', label: 'Quote', icon: Quote, group: 'Basic', description: 'Block quote with attribution' },
  { type: 'divider', label: 'Divider', icon: Minus, group: 'Basic', description: 'Horizontal rule' },
  { type: 'spacer', label: 'Spacer', icon: Space, group: 'Basic', description: 'Vertical whitespace' },
  // Media
  { type: 'image', label: 'Image', icon: Image, group: 'Media', description: 'Upload or URL image' },
  { type: 'logo', label: 'Logo', icon: Star, group: 'Media', description: 'Brand logo with link' },
  // Interactive
  { type: 'button', label: 'Button', icon: MousePointerClick, group: 'Interactive', description: 'CTA button with link' },
  { type: 'button-group', label: 'Button Group', icon: LayoutGrid, group: 'Interactive', description: 'Multiple CTA buttons' },
  { type: 'social', label: 'Social Links', icon: Share2, group: 'Interactive', description: 'Social media icons' },
  // Structured
  { type: 'list', label: 'List', icon: List, group: 'Structured', description: 'Ordered or unordered list' },
  { type: 'table', label: 'Table', icon: Table, group: 'Structured', description: 'Data table with header' },
  // Advanced
  { type: 'hero', label: 'Hero Banner', icon: Zap, group: 'Advanced', description: 'Full-width hero section' },
  { type: 'announcement', label: 'Announcement', icon: Megaphone, group: 'Advanced', description: 'Highlighted info bar' },
  { type: 'coupon', label: 'Coupon', icon: Tag, group: 'Advanced', description: 'Promo code block' },
  { type: 'testimonial', label: 'Testimonial', icon: MessageSquare, group: 'Advanced', description: 'Customer review card' },
];

const GROUPS = ['Basic', 'Media', 'Interactive', 'Structured', 'Advanced'];

interface BlockLibrarySidebarProps {
  onAddBlock: (type: BlockType) => void;
  activeSectionId: string | null;
  activeColumnId: string | null;
}

export function BlockLibrarySidebar({ onAddBlock, activeSectionId, activeColumnId }: BlockLibrarySidebarProps) {
  const [search, setSearch] = useState('');
  const [varSearch, setVarSearch] = useState('');
  const [tab, setTab] = useState<'blocks' | 'variables'>('blocks');

  const filteredBlocks = BLOCK_DEFS.filter(b =>
    b.label.toLowerCase().includes(search.toLowerCase()) ||
    b.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVars = EMAIL_VARIABLES.filter(v =>
    v.key.toLowerCase().includes(varSearch.toLowerCase()) ||
    v.label.toLowerCase().includes(varSearch.toLowerCase()) ||
    v.category.toLowerCase().includes(varSearch.toLowerCase())
  );

  const varsByCategory = filteredVars.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof filteredVars>);

  const handleAddBlock = (type: BlockType) => {
    if (!activeSectionId || !activeColumnId) {
      toast.info('Select a section first, then add a block.');
      return;
    }
    onAddBlock(type);
  };

  return (
    <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r bg-background shrink-0 flex flex-col lg:h-full max-h-[50vh] lg:max-h-none">
      {/* Tab switcher */}
      <div className="flex border-b shrink-0">
        <button onClick={() => setTab('blocks')} className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === 'blocks' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Blocks
        </button>
        <button onClick={() => setTab('variables')} className={`flex-1 py-2 text-xs font-medium transition-colors ${tab === 'variables' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Variables
        </button>
      </div>

      {tab === 'blocks' && (
        <>
          <div className="p-2 shrink-0">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blocks..." className="h-7 text-xs" />
          </div>
          {!activeSectionId && (
            <p className="text-xs text-muted-foreground text-center px-3 pb-2">Select or add a section first</p>
          )}
          <ScrollArea className="flex-1">
            <div className="px-2 pb-4">
              {GROUPS.map(group => {
                const blocks = filteredBlocks.filter(b => b.group === group);
                if (!blocks.length) return null;
                return (
                  <div key={group} className="mb-3">
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground px-1 mb-1.5">{group}</p>
                    <div className="space-y-0.5">
                      {blocks.map(block => {
                        const Icon = block.icon;
                        return (
                          <button
                            key={block.type}
                            onClick={() => handleAddBlock(block.type)}
                            disabled={!activeSectionId || !activeColumnId}
                            title={block.description}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-left text-xs rounded-md hover:bg-background hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
                          >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <span className="truncate">{block.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {tab === 'variables' && (
        <>
          <div className="p-2 shrink-0">
            <Input value={varSearch} onChange={e => setVarSearch(e.target.value)} placeholder="Search variables..." className="h-7 text-xs" />
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2 pb-4">
              {Object.entries(varsByCategory).map(([cat, vars]) => (
                <div key={cat} className="mb-3">
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground px-1 mb-1.5">{cat}</p>
                  <div className="space-y-0.5">
                    {vars.map(v => (
                      <button
                        key={v.key}
                        title={v.description + '\nClick to copy'}
                        onClick={() => {
                          navigator.clipboard.writeText(`{{${v.key}}}`);
                          toast.success(`Copied {{${v.key}}}`);
                        }}
                        className="flex flex-col w-full px-2 py-1.5 text-left rounded-md hover:bg-background hover:shadow-sm transition-all group"
                      >
                        <span className="font-mono text-[10px] text-primary group-hover:text-primary/80">{`{{${v.key}}}`}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
