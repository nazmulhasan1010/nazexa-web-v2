'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { ContentItem } from '@/lib/cms';

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTH: Record<Device, number | null> = { desktop: null, tablet: 834, mobile: 390 };

// Reusable preview surface. Points an iframe at the public-fidelity preview route and,
// when `liveItem` is supplied, streams unsaved edits into it via postMessage.
export function PreviewDrawer({
  open,
  onOpenChange,
  title,
  src,
  liveItem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  src: string;
  liveItem?: ContentItem | null;
}) {
  const [device, setDevice] = useState<Device>('desktop');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const ready = useRef(false);
  const liveRef = useRef(liveItem);
  liveRef.current = liveItem;

  const push = useCallback(() => {
    if (!liveRef.current) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'nazexa:preview-item', item: liveRef.current },
      window.location.origin
    );
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string })?.type === 'nazexa:preview-ready') {
        ready.current = true;
        push();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [push]);

  useEffect(() => {
    if (ready.current) push();
  }, [liveItem, push]);

  // Reset readiness whenever the drawer reopens or the target changes.
  useEffect(() => {
    if (!open) ready.current = false;
  }, [open, src]);

  const width = DEVICE_WIDTH[device];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:w-[72vw] sm:max-w-none"
      >
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <SheetTitle className="truncate text-base">{title}</SheetTitle>
          <div className="flex items-center gap-2">
            <div className="bg-muted/50 flex items-center rounded-md p-0.5">
              {(['desktop', 'tablet', 'mobile'] as Device[]).map((d) => {
                const Icon = d === 'desktop' ? Monitor : d === 'tablet' ? Tablet : Smartphone;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    aria-label={`${d} preview`}
                    className={cn(
                      'rounded p-1.5 transition-colors',
                      device === d
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground rounded-md p-1.5"
              aria-label="Open preview in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </SheetHeader>
        <div className="bg-muted/30 flex min-h-0 flex-1 justify-center overflow-auto p-3">
          <div
            className="h-full overflow-hidden rounded-md bg-white shadow-sm transition-all"
            style={{ width: width ?? '100%', maxWidth: '100%' }}
          >
            {open && (
              <iframe
                ref={iframeRef}
                src={src}
                title={title}
                className="h-full w-full border-0"
                onLoad={() => {
                  if (ready.current) push();
                }}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
