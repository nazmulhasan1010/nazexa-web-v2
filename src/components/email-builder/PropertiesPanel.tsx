'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Trash2, Upload } from 'lucide-react';
import { EMAIL_VARIABLES } from '@/lib/email/variables';
import type {
  EmailBlockV2,
  EmailSection,
  EmailColumn,
  EmailDesignV2,
  TextAlign,
  HeadingBlock,
  TextBlock,
  RichTextBlock,
  QuoteBlock,
  ButtonBlock,
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
  SubheadingBlock,
  ButtonGroupBlock,
  ColumnLayout,
} from '@/lib/email/schema';
import { generateId } from '@/lib/email/schema';
import type { SelectionTarget } from './useBuilderState';

// ─── Shared sub-panels ────────────────────────────────────────────────────────

function AlignPicker({ value, onChange }: { value?: TextAlign; onChange: (v: TextAlign) => void }) {
  return (
    <div className="flex border rounded-md overflow-hidden">
      {(['left', 'center', 'right'] as TextAlign[]).map(a => (
        <button key={a} onClick={() => onChange(a)} className={`flex-1 py-1 text-xs capitalize transition-colors ${value === a ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{a}</button>
      ))}
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2 items-center">
        <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="h-8 w-10 rounded border cursor-pointer p-0.5" />
        <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000" className="h-8 text-xs font-mono" />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, unit = 'px' }: { label: string; value?: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1 items-center">
        <Input
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          onChange={e => onChange(Number(e.target.value))}
          className="h-8 text-xs"
        />
        {unit && <span className="text-xs text-muted-foreground shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function VariableButton({ onInsert }: { onInsert: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setOpen(!open)}>
        Insert Variable
      </Button>
      {open && (
        <div className="absolute z-50 left-0 top-full mt-1 w-64 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {EMAIL_VARIABLES.map(v => (
            <button key={v.key} onClick={() => { onInsert(`{{${v.key}}}`); setOpen(false); }} className="block w-full text-left px-3 py-2 text-xs hover:bg-muted">
              <span className="font-mono text-primary">{`{{${v.key}}}`}</span>
              <span className="ml-2 text-muted-foreground">{v.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpacingPanel({ style, onChange }: { style: any; onChange: (updates: any) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumberInput label="Pad Top" value={style?.paddingTop} onChange={v => onChange({ paddingTop: v })} min={0} />
      <NumberInput label="Pad Bottom" value={style?.paddingBottom} onChange={v => onChange({ paddingBottom: v })} min={0} />
      <NumberInput label="Pad Left" value={style?.paddingLeft} onChange={v => onChange({ paddingLeft: v })} min={0} />
      <NumberInput label="Pad Right" value={style?.paddingRight} onChange={v => onChange({ paddingRight: v })} min={0} />
    </div>
  );
}

function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) { onChange(data.url); toast.success('Image uploaded'); }
    else toast.error('Upload failed');
  };
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1">
        <Input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..." className="h-8 text-xs" />
        <label className="cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" type="button" asChild><span><Upload className="h-3 w-3" /></span></Button>
        </label>
      </div>
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────

function SectionPanel({ section, onUpdate, onChangeLayout }: {
  section: EmailSection;
  onUpdate: (updates: Partial<EmailSection>) => void;
  onChangeLayout: (layout: ColumnLayout) => void;
}) {
  const s = section.style;
  const upd = (k: keyof typeof s, v: any) => onUpdate({ style: { ...s, [k]: v } });

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <Label className="text-xs">Column Layout</Label>
        <Select value={section.layout} onValueChange={v => onChangeLayout(v as ColumnLayout)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="100">Full Width (1 column)</SelectItem>
            <SelectItem value="50-50">Two Equal (50/50)</SelectItem>
            <SelectItem value="33-67">Sidebar Left (33/67)</SelectItem>
            <SelectItem value="67-33">Sidebar Right (67/33)</SelectItem>
            <SelectItem value="33-33-33">Three Equal (33/33/33)</SelectItem>
            <SelectItem value="25-25-25-25">Four Equal (25/25/25/25)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <ColorInput label="Background Color" value={s.backgroundColor} onChange={v => upd('backgroundColor', v)} />
      <ImageUploadField label="Background Image" value={s.backgroundImage || ''} onChange={v => upd('backgroundImage', v)} />
      <Separator />
      <div className="font-medium text-xs text-muted-foreground uppercase">Padding</div>
      <SpacingPanel style={s} onChange={updates => onUpdate({ style: { ...s, ...updates } })} />
      <Separator />
      <div className="font-medium text-xs text-muted-foreground uppercase">Border</div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Width" value={s.borderWidth} onChange={v => upd('borderWidth', v)} min={0} />
        <NumberInput label="Radius" value={s.borderRadius} onChange={v => upd('borderRadius', v)} min={0} />
      </div>
      <ColorInput label="Border Color" value={s.borderColor} onChange={v => upd('borderColor', v)} />
    </div>
  );
}

// ─── Per-Block Panels ─────────────────────────────────────────────────────────

function HeadingPanel({ block, onUpdate }: { block: HeadingBlock; onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Text</Label>
        <Input value={block.content.text} onChange={e => onUpdate({ content: { ...block.content, text: e.target.value } })} className="h-8 text-xs" />
        <VariableButton onInsert={v => onUpdate({ content: { ...block.content, text: block.content.text + v } })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Heading Level</Label>
        <Select value={String(block.content.level)} onValueChange={v => onUpdate({ content: { ...block.content, level: Number(v) } })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1 — Large</SelectItem>
            <SelectItem value="2">H2 — Medium</SelectItem>
            <SelectItem value="3">H3 — Small</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <AlignPicker value={block.typography.textAlign} onChange={v => onUpdate({ typography: { ...block.typography, textAlign: v } })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Font Size" value={block.typography.fontSize} onChange={v => onUpdate({ typography: { ...block.typography, fontSize: v } })} min={12} max={72} />
        <ColorInput label="Color" value={block.typography.color} onChange={v => onUpdate({ typography: { ...block.typography, color: v } })} />
      </div>
    </div>
  );
}

function TextPanel({ block, onUpdate }: { block: TextBlock | SubheadingBlock; onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Text</Label>
        <Textarea rows={5} value={block.content.text} onChange={e => onUpdate({ content: { ...block.content, text: e.target.value } })} className="text-xs" />
        <VariableButton onInsert={v => onUpdate({ content: { ...block.content, text: block.content.text + v } })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <AlignPicker value={block.typography.textAlign} onChange={v => onUpdate({ typography: { ...block.typography, textAlign: v } })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Font Size" value={block.typography.fontSize} onChange={v => onUpdate({ typography: { ...block.typography, fontSize: v } })} min={10} max={40} />
        <NumberInput label="Line Height" value={block.typography.lineHeight} onChange={v => onUpdate({ typography: { ...block.typography, lineHeight: v } })} min={1} max={3} unit="×" />
      </div>
      <ColorInput label="Color" value={block.typography.color} onChange={v => onUpdate({ typography: { ...block.typography, color: v } })} />
    </div>
  );
}

function RichTextPanel({ block, onUpdate }: { block: RichTextBlock; onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">HTML Content</Label>
        <Textarea rows={8} value={block.content.html} onChange={e => onUpdate({ content: { ...block.content, html: e.target.value } })} className="text-xs font-mono" />
        <VariableButton onInsert={v => onUpdate({ content: { ...block.content, html: block.content.html + v } })} />
      </div>
      <ColorInput label="Text Color" value={block.typography.color} onChange={v => onUpdate({ typography: { ...block.typography, color: v } })} />
    </div>
  );
}

function ButtonPanel({ block, onUpdate }: { block: ButtonBlock; onUpdate: (u: any) => void }) {
  const btn = block.button;
  const upd = (k: keyof typeof btn, v: any) => onUpdate({ button: { ...btn, [k]: v } });
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Button Text</Label>
        <Input value={block.content.text} onChange={e => onUpdate({ content: { ...block.content, text: e.target.value } })} className="h-8 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Link URL</Label>
        <Input value={block.content.url} onChange={e => onUpdate({ content: { ...block.content, url: e.target.value } })} className="h-8 text-xs" placeholder="https:// or {{verification.url}}" />
        <VariableButton onInsert={v => onUpdate({ content: { ...block.content, url: block.content.url + v } })} />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={!!block.content.newTab} onCheckedChange={v => onUpdate({ content: { ...block.content, newTab: v } })} id="newtab" />
        <Label htmlFor="newtab" className="text-xs cursor-pointer">Open in new tab</Label>
      </div>
      <Separator />
      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <AlignPicker value={btn.align} onChange={v => upd('align', v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="Background" value={btn.backgroundColor} onChange={v => upd('backgroundColor', v)} />
        <ColorInput label="Text Color" value={btn.textColor} onChange={v => upd('textColor', v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Border Radius" value={btn.borderRadius} onChange={v => upd('borderRadius', v)} min={0} max={50} />
        <NumberInput label="Font Size" value={block.typography.fontSize} onChange={v => onUpdate({ typography: { ...block.typography, fontSize: v } })} min={10} max={30} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Pad Vertical" value={btn.paddingTop} onChange={v => onUpdate({ button: { ...btn, paddingTop: v, paddingBottom: v } })} min={0} />
        <NumberInput label="Pad Horizontal" value={btn.paddingLeft} onChange={v => onUpdate({ button: { ...btn, paddingLeft: v, paddingRight: v } })} min={0} />
      </div>
    </div>
  );
}

function ImagePanel({ block, onUpdate }: { block: ImageBlock; onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <ImageUploadField label="Image" value={block.content.src} onChange={v => onUpdate({ content: { ...block.content, src: v } })} />
      <div className="space-y-1">
        <Label className="text-xs">Alt Text</Label>
        <Input value={block.content.alt} onChange={e => onUpdate({ content: { ...block.content, alt: e.target.value } })} className="h-8 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Link URL</Label>
        <Input value={block.content.link || ''} onChange={e => onUpdate({ content: { ...block.content, link: e.target.value } })} className="h-8 text-xs" placeholder="https://..." />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <AlignPicker value={block.image.align} onChange={v => onUpdate({ image: { ...block.image, align: v } })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Width" value={block.image.width} onChange={v => onUpdate({ image: { ...block.image, width: v } })} min={0} unit="px" />
        <NumberInput label="Border Radius" value={block.image.borderRadius} onChange={v => onUpdate({ image: { ...block.image, borderRadius: v } })} min={0} />
      </div>
    </div>
  );
}

function LogoPanel({ block, onUpdate }: { block: LogoBlock; onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <ImageUploadField label="Logo Image" value={block.content.src} onChange={v => onUpdate({ content: { ...block.content, src: v } })} />
      <div className="space-y-1">
        <Label className="text-xs">Alt Text</Label>
        <Input value={block.content.alt} onChange={e => onUpdate({ content: { ...block.content, alt: e.target.value } })} className="h-8 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Link URL</Label>
        <Input value={block.content.link || ''} onChange={e => onUpdate({ content: { ...block.content, link: e.target.value } })} className="h-8 text-xs" placeholder="https://..." />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <AlignPicker value={block.logo.align} onChange={v => onUpdate({ logo: { ...block.logo, align: v } })} />
      </div>
      <NumberInput label="Width" value={block.logo.width} onChange={v => onUpdate({ logo: { ...block.logo, width: v } })} min={20} max={400} />
    </div>
  );
}

function DividerPanel({ block, onUpdate }: { block: DividerBlock; onUpdate: (u: any) => void }) {
  const d = block.divider;
  const upd = (k: keyof typeof d, v: any) => onUpdate({ divider: { ...d, [k]: v } });
  return (
    <div className="space-y-3">
      <ColorInput label="Color" value={d.color} onChange={v => upd('color', v)} />
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Height" value={d.height} onChange={v => upd('height', v)} min={1} max={10} />
        <NumberInput label="Width %" value={d.width} onChange={v => upd('width', v)} min={10} max={100} unit="%" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Style</Label>
        <Select value={d.style} onValueChange={v => upd('style', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SpacerPanel({ block, onUpdate }: { block: SpacerBlock; onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Height</Label>
      <Slider min={8} max={120} step={4} value={[block.spacer.height]} onValueChange={([v]) => onUpdate({ spacer: { height: v } })} />
      <p className="text-xs text-muted-foreground text-center">{block.spacer.height}px</p>
    </div>
  );
}

function SocialPanel({ block, onUpdate }: { block: SocialBlock; onUpdate: (u: any) => void }) {
  const s = block.social;
  const upd = (k: keyof typeof s, v: any) => onUpdate({ social: { ...s, [k]: v } });
  const PLATFORMS = ['facebook', 'instagram', 'x', 'linkedin', 'youtube', 'github', 'website', 'email'] as const;

  const addLink = () => {
    onUpdate({ links: [...block.links, { id: generateId(), platform: 'facebook', url: '#' }] });
  };
  const removeLink = (id: string) => onUpdate({ links: block.links.filter(l => l.id !== id) });
  const updateLink = (id: string, updates: any) => onUpdate({ links: block.links.map(l => l.id === id ? { ...l, ...updates } : l) });

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs">Alignment</Label>
        <AlignPicker value={s.align} onChange={v => upd('align', v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="Icon Size" value={s.iconSize} onChange={v => upd('iconSize', v)} min={20} max={60} />
        <NumberInput label="Spacing" value={s.spacing} onChange={v => upd('spacing', v)} min={0} max={32} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Shape</Label>
        <Select value={s.shape} onValueChange={v => upd('shape', v)}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="rounded">Rounded</SelectItem>
            <SelectItem value="plain">Plain (no background)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Social Links</Label>
          <Button size="sm" variant="outline" onClick={addLink} className="h-6 text-xs px-2"><Plus className="h-3 w-3 mr-1" />Add</Button>
        </div>
        {block.links.map(link => (
          <div key={link.id} className="space-y-1 border rounded p-2">
            <div className="flex gap-1">
              <Select value={link.platform} onValueChange={v => updateLink(link.id, { platform: v })}>
                <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeLink(link.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
            <Input value={link.url} onChange={e => updateLink(link.id, { url: e.target.value })} placeholder="URL" className="h-7 text-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListPanel({ block, onUpdate }: { block: ListBlock; onUpdate: (u: any) => void }) {
  const updateItem = (i: number, v: string) => {
    const items = [...block.content.items];
    items[i] = v;
    onUpdate({ content: { ...block.content, items } });
  };
  const addItem = () => onUpdate({ content: { ...block.content, items: [...block.content.items, 'New item'] } });
  const removeItem = (i: number) => onUpdate({ content: { ...block.content, items: block.content.items.filter((_, j) => j !== i) } });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Switch checked={block.content.ordered} onCheckedChange={v => onUpdate({ content: { ...block.content, ordered: v } })} id="ordered" />
        <Label htmlFor="ordered" className="text-xs cursor-pointer">Ordered (numbered)</Label>
      </div>
      {!block.content.ordered && (
        <div className="space-y-1">
          <Label className="text-xs">Bullet Icon</Label>
          <Input value={block.content.bulletIcon || '•'} onChange={e => onUpdate({ content: { ...block.content, bulletIcon: e.target.value } })} className="h-8 text-xs w-16" />
        </div>
      )}
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Items</Label>
          <Button size="sm" variant="outline" onClick={addItem} className="h-6 text-xs px-2"><Plus className="h-3 w-3 mr-1" />Add</Button>
        </div>
        {block.content.items.map((item, i) => (
          <div key={i} className="flex gap-1">
            <Input value={item} onChange={e => updateItem(i, e.target.value)} className="h-7 text-xs" />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
      </div>
      <ColorInput label="Text Color" value={block.typography.color} onChange={v => onUpdate({ typography: { ...block.typography, color: v } })} />
    </div>
  );
}

function TablePanel({ block, onUpdate }: { block: TableBlock; onUpdate: (u: any) => void }) {
  const { rows, hasHeader } = block.content;
  const { borderColor, cellPadding, headerBg, headerColor, stripedRows } = block.table;
  const upd = (k: any, v: any) => onUpdate({ table: { ...block.table, [k]: v } });

  const addRow = () => {
    const colCount = rows[0]?.cells.length || 3;
    onUpdate({ content: { ...block.content, rows: [...rows, { id: generateId(), cells: Array(colCount).fill('') }] } });
  };
  const removeRow = (id: string) => onUpdate({ content: { ...block.content, rows: rows.filter(r => r.id !== id) } });
  const updateCell = (rowId: string, ci: number, v: string) => {
    onUpdate({ content: { ...block.content, rows: rows.map(r => r.id === rowId ? { ...r, cells: r.cells.map((c, i) => i === ci ? v : c) } : r) } });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <Switch checked={hasHeader} onCheckedChange={v => onUpdate({ content: { ...block.content, hasHeader: v } })} id="tbl-header" />
          <Label htmlFor="tbl-header" className="text-xs">Header Row</Label>
        </div>
        <div className="flex items-center gap-1">
          <Switch checked={stripedRows} onCheckedChange={v => upd('stripedRows', v)} id="tbl-stripe" />
          <Label htmlFor="tbl-stripe" className="text-xs">Striped</Label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="Border" value={borderColor} onChange={v => upd('borderColor', v)} />
        <NumberInput label="Cell Pad" value={cellPadding} onChange={v => upd('cellPadding', v)} min={0} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="Header BG" value={headerBg} onChange={v => upd('headerBg', v)} />
        <ColorInput label="Header Text" value={headerColor} onChange={v => upd('headerColor', v)} />
      </div>
      <Separator />
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {rows.map((row, ri) => (
          <div key={row.id} className="border rounded p-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{hasHeader && ri === 0 ? 'Header Row' : `Row ${ri + 1}`}</span>
              <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => removeRow(row.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
            {row.cells.map((cell, ci) => (
              <Input key={ci} value={cell} onChange={e => updateCell(row.id, ci, e.target.value)} className="h-6 text-xs" placeholder={`Cell ${ci + 1}`} />
            ))}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addRow} className="w-full h-7 text-xs"><Plus className="h-3 w-3 mr-1" />Add Row</Button>
      </div>
    </div>
  );
}

function HeroPanel({ block, onUpdate }: { block: HeroBlock; onUpdate: (u: any) => void }) {
  const c = block.content;
  const upd = (k: keyof typeof c, v: any) => onUpdate({ content: { ...c, [k]: v } });
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Heading</Label>
        <Input value={c.heading} onChange={e => upd('heading', e.target.value)} className="h-8 text-xs" />
        <VariableButton onInsert={v => upd('heading', c.heading + v)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Subheading</Label>
        <Input value={c.subheading || ''} onChange={e => upd('subheading', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Button Text</Label>
        <Input value={c.buttonText || ''} onChange={e => upd('buttonText', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Button URL</Label>
        <Input value={c.buttonUrl || ''} onChange={e => upd('buttonUrl', e.target.value)} className="h-8 text-xs" />
      </div>
      <ImageUploadField label="Background Image" value={c.backgroundImage || ''} onChange={v => upd('backgroundImage', v)} />
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="BG Color" value={c.backgroundColor} onChange={v => upd('backgroundColor', v)} />
        <ColorInput label="Button Color" value={c.buttonColor || '#ffffff'} onChange={v => upd('buttonColor', v)} />
      </div>
    </div>
  );
}

function AnnouncementPanel({ block, onUpdate }: { block: AnnouncementBlock; onUpdate: (u: any) => void }) {
  const c = block.content;
  const upd = (k: keyof typeof c, v: any) => onUpdate({ content: { ...c, [k]: v } });
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Text</Label>
        <Input value={c.text} onChange={e => upd('text', e.target.value)} className="h-8 text-xs" />
        <VariableButton onInsert={v => upd('text', c.text + v)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Link URL (optional)</Label>
        <Input value={c.link || ''} onChange={e => upd('link', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="Background" value={c.backgroundColor} onChange={v => upd('backgroundColor', v)} />
        <ColorInput label="Text Color" value={c.textColor} onChange={v => upd('textColor', v)} />
      </div>
    </div>
  );
}

function CouponPanel({ block, onUpdate }: { block: CouponBlock; onUpdate: (u: any) => void }) {
  const c = block.content;
  const upd = (k: keyof typeof c, v: any) => onUpdate({ content: { ...c, [k]: v } });
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Coupon Code</Label>
        <Input value={c.code} onChange={e => upd('code', e.target.value)} className="h-8 text-xs font-mono uppercase" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Input value={c.description || ''} onChange={e => upd('description', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Expiry Text</Label>
        <Input value={c.expiresText || ''} onChange={e => upd('expiresText', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="Background" value={c.backgroundColor} onChange={v => upd('backgroundColor', v)} />
        <ColorInput label="Border" value={c.borderColor} onChange={v => upd('borderColor', v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="Code Color" value={c.codeColor} onChange={v => upd('codeColor', v)} />
        <ColorInput label="Text Color" value={c.textColor} onChange={v => upd('textColor', v)} />
      </div>
    </div>
  );
}

function TestimonialPanel({ block, onUpdate }: { block: TestimonialBlock; onUpdate: (u: any) => void }) {
  const c = block.content;
  const upd = (k: keyof typeof c, v: any) => onUpdate({ content: { ...c, [k]: v } });
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Quote</Label>
        <Textarea rows={4} value={c.quote} onChange={e => upd('quote', e.target.value)} className="text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Author</Label>
        <Input value={c.author} onChange={e => upd('author', e.target.value)} className="h-8 text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Role / Company</Label>
        <Input value={c.role || ''} onChange={e => upd('role', e.target.value)} className="h-8 text-xs" />
      </div>
      <ImageUploadField label="Avatar Image" value={c.avatarUrl || ''} onChange={v => upd('avatarUrl', v)} />
      <div className="grid grid-cols-2 gap-2">
        <ColorInput label="Background" value={c.backgroundColor} onChange={v => upd('backgroundColor', v)} />
        <ColorInput label="Text Color" value={c.textColor} onChange={v => upd('textColor', v)} />
      </div>
    </div>
  );
}

function QuotePanel({ block, onUpdate }: { block: QuoteBlock; onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">Quote Text</Label>
        <Textarea rows={4} value={block.content.text} onChange={e => onUpdate({ content: { ...block.content, text: e.target.value } })} className="text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Attribution</Label>
        <Input value={block.content.attribution || ''} onChange={e => onUpdate({ content: { ...block.content, attribution: e.target.value } })} className="h-8 text-xs" />
      </div>
      <ColorInput label="Text Color" value={block.typography.color} onChange={v => onUpdate({ typography: { ...block.typography, color: v } })} />
    </div>
  );
}

// ─── Main Properties Panel ────────────────────────────────────────────────────

interface PropertiesPanelProps {
  selection: SelectionTarget;
  design: EmailDesignV2;
  onUpdateSettings: (u: Partial<EmailDesignV2['settings']>) => void;
  onUpdateBlock: (sectionId: string, columnId: string, blockId: string, updates: Partial<EmailBlockV2>) => void;
  onUpdateSection: (sectionId: string, updates: Partial<EmailSection>) => void;
  onUpdateColumn: (sectionId: string, columnId: string, updates: Partial<EmailColumn>) => void;
  onChangeLayout: (sectionId: string, layout: ColumnLayout) => void;
}

export function PropertiesPanel({
  selection,
  design,
  onUpdateSettings,
  onUpdateBlock,
  onUpdateSection,
  onUpdateColumn,
  onChangeLayout,
}: PropertiesPanelProps) {
  const { settings } = design;

  // Find selected objects
  const section = selection ? design.sections.find(s => s.id === selection.sectionId) : null;
  const column = (section && selection?.columnId) ? section.columns.find(c => c.id === selection.columnId) : null;
  const block = (column && selection?.blockId) ? column.blocks.find(b => b.id === selection.blockId) : null;

  const blockUpdater = (updates: any) => {
    if (selection?.sectionId && selection?.columnId && selection?.blockId) {
      onUpdateBlock(selection.sectionId, selection.columnId, selection.blockId, updates);
    }
  };

  return (
    <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l bg-background shrink-0 flex flex-col lg:h-full max-h-[50vh] lg:max-h-none">
      <Tabs defaultValue={selection ? 'block' : 'settings'} key={selection?.blockId || selection?.sectionId || 'root'} className="flex flex-col h-full">
        <TabsList className="w-full rounded-none border-b shrink-0 h-10">
          <TabsTrigger value="block" className="flex-1 text-xs">Properties</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 text-xs">Email Settings</TabsTrigger>
        </TabsList>

        {/* Block / Section Properties */}
        <TabsContent value="block" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1">
              {!selection && (
                <p className="text-xs text-muted-foreground text-center mt-8">Click a block or section to edit its properties.</p>
              )}

              {/* Section properties (no block selected) */}
              {section && !block && (
                <>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Section</p>
                  <SectionPanel
                    section={section}
                    onUpdate={u => onUpdateSection(section.id, u)}
                    onChangeLayout={l => onChangeLayout(section.id, l)}
                  />
                </>
              )}

              {/* Block properties */}
              {block && section && column && (
                <>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{block.type} block</p>
                  {block.type === 'heading' && <HeadingPanel block={block} onUpdate={blockUpdater} />}
                  {(block.type === 'text' || block.type === 'subheading') && <TextPanel block={block as TextBlock} onUpdate={blockUpdater} />}
                  {block.type === 'richtext' && <RichTextPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'quote' && <QuotePanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'button' && <ButtonPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'image' && <ImagePanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'logo' && <LogoPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'divider' && <DividerPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'spacer' && <SpacerPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'social' && <SocialPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'list' && <ListPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'table' && <TablePanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'hero' && <HeroPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'announcement' && <AnnouncementPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'coupon' && <CouponPanel block={block} onUpdate={blockUpdater} />}
                  {block.type === 'testimonial' && <TestimonialPanel block={block} onUpdate={blockUpdater} />}
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Block Spacing</p>
                    <SpacingPanel style={block.style} onChange={updates => blockUpdater({ style: { ...block.style, ...updates } })} />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Email-level settings */}
        <TabsContent value="settings" className="flex-1 overflow-hidden m-0 data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs">Font Family</Label>
                <Select value={settings.fontFamily} onValueChange={v => onUpdateSettings({ fontFamily: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Arial, Helvetica, sans-serif', 'Georgia, serif', 'Tahoma, Geneva, sans-serif', 'Verdana, Geneva, sans-serif', 'Times New Roman, serif'].map(f => (
                      <SelectItem key={f} value={f}>{f.split(',')[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <NumberInput label="Email Width" value={settings.width} onChange={v => onUpdateSettings({ width: v })} min={400} max={700} unit="px" />
              <ColorInput label="Page Background" value={settings.backgroundColor} onChange={v => onUpdateSettings({ backgroundColor: v })} />
              <ColorInput label="Container Background" value={settings.containerColor} onChange={v => onUpdateSettings({ containerColor: v })} />
              <ColorInput label="Default Text Color" value={settings.textColor} onChange={v => onUpdateSettings({ textColor: v })} />
              <ColorInput label="Primary / Brand Color" value={settings.primaryColor} onChange={v => onUpdateSettings({ primaryColor: v })} />
              <Separator />
              <div className="space-y-1">
                <Label className="text-xs">Footer Text</Label>
                <Textarea rows={3} value={settings.footerText || ''} onChange={e => onUpdateSettings({ footerText: e.target.value })} className="text-xs" placeholder="© {{currentYear}} {{company.name}}" />
                <p className="text-xs text-muted-foreground">Supports {'{{variables}}'}</p>
              </div>
              <ColorInput label="Footer Text Color" value={settings.footerColor} onChange={v => onUpdateSettings({ footerColor: v })} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
