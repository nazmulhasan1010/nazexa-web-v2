'use client';

import * as React from 'react';
import { ImageIcon, Link as LinkIcon, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploaderProps {
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [url, setUrl] = React.useState(value || '');
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setUrl(value || '');
  }, [value]);

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 8 MB.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed');
      onChange(json.url);
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    e.target.value = ''; // allow re-selecting the same file
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  const openPicker = () => inputRef.current?.click();
  const handleApply = () => onChange(url ? url : null);
  const handleClear = () => {
    setUrl('');
    setError(null);
    onChange(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFilePicked}
      />

      {value ? (
        <div
          className="group border-border bg-muted/30 relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0.3';
            }}
          />
          <div
            className={cn(
              'bg-background/60 absolute inset-0 flex items-center justify-center gap-2 opacity-0 backdrop-blur-sm transition-opacity duration-200',
              (hovered || uploading) && 'opacity-100'
            )}
          >
            {uploading ? (
              <span className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
              </span>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openPicker}
                  className="gap-1.5 shadow-xl"
                >
                  <UploadCloud className="h-4 w-4" /> Replace
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClear}
                  className="gap-1.5 shadow-xl"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            dragOver && 'border-primary bg-primary/5'
          )}
        >
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {uploading ? 'Uploading…' : 'Drag & drop, or click to browse'}
            </p>
            <p className="text-muted-foreground mt-1 max-w-[260px] text-xs">
              PNG, JPG, SVG or WebP up to 8 MB — or paste an image URL below.
            </p>
          </div>
        </div>
      )}

      {/* Actions: device picker + URL */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openPicker}
          disabled={uploading}
          className="shrink-0 gap-1.5"
        >
          <ImageIcon className="h-4 w-4" /> Device
        </Button>
        <div className="relative flex-1">
          <LinkIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="https://example.com/image.png"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
          />
        </div>
        {url !== (value || '') && (
          <Button type="button" onClick={handleApply} size="sm" className="shrink-0">
            Apply
          </Button>
        )}
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
