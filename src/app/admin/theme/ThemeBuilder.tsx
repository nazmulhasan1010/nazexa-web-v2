'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Plus,
  Copy,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { siteSettingsQuery } from '@/lib/queries';
import { saveThemeDraft, publishTheme, discardThemeDraft, fetchThemeDraft } from '@/lib/cms';
import {
  PRESET_THEMES,
  type SiteThemeConfig,
  type FullThemeVars,
  type ThemePreset,
} from '@/lib/theme-registry';

const COLOR_KEYS: { key: keyof FullThemeVars; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'foreground', label: 'Foreground' },
  { key: 'card', label: 'Card' },
  { key: 'cardForeground', label: 'Card Foreground' },
  { key: 'popover', label: 'Popover' },
  { key: 'popoverForeground', label: 'Popover Foreground' },
  { key: 'primary', label: 'Primary' },
  { key: 'primaryForeground', label: 'Primary Foreground' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'secondaryForeground', label: 'Secondary Foreground' },
  { key: 'muted', label: 'Muted' },
  { key: 'mutedForeground', label: 'Muted Foreground' },
  { key: 'accent', label: 'Accent' },
  { key: 'accentForeground', label: 'Accent Foreground' },
  { key: 'destructive', label: 'Destructive' },
  { key: 'destructiveForeground', label: 'Destructive Foreground' },
  { key: 'border', label: 'Border' },
  { key: 'input', label: 'Input' },
  { key: 'ring', label: 'Ring/Focus' },
];

export function ThemeBuilder({
  target,
  title,
  defaultPaths,
}: {
  target: 'frontend' | 'admin';
  title: string;
  defaultPaths: { label: string; value: string }[];
}) {
  const queryClient = useQueryClient();
  const { data: settingsData, isLoading: settingsLoading } = useQuery(siteSettingsQuery);

  const [config, setConfig] = useState<SiteThemeConfig>({
    activeThemeId: 'preset-aurora',
    customThemes: [],
  });

  const [hasDraft, setHasDraft] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Preview state
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeReady = useRef(false);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewPath, setPreviewPath] = useState(defaultPaths[0].value);

  useEffect(() => {
    async function init() {
      if (!settingsData) return;
      const draft = await fetchThemeDraft(target);
      if (draft) {
        setConfig(draft.config);
        setHasDraft(true);
      } else if (settingsData.theme?.[target]) {
        setConfig(settingsData.theme[target]);
        setHasDraft(false);
      }
      setIsInitializing(false);
    }
    init();
  }, [settingsData, target]);

  // Derived state
  const allThemes = useMemo(
    () => [...PRESET_THEMES, ...(config.customThemes || [])],
    [config.customThemes]
  );
  const activeTheme = allThemes.find((t) => t.id === config.activeThemeId) || PRESET_THEMES[0];

  // Send update to iframe
  const postToPreview = useCallback(() => {
    if (!iframeReady.current) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'NAZEXA_THEME_PREVIEW', theme: activeTheme.vars },
      '*'
    );
  }, [activeTheme]);

  // Push updates to iframe whenever the active theme vars change
  useEffect(() => {
    postToPreview();
  }, [postToPreview]);

  // Listen for iframe readiness
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'NAZEXA_THEME_READY') {
        iframeReady.current = true;
        postToPreview();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [postToPreview]);

  // --- Mutations ---
  const saveDraftMutation = useMutation({
    mutationFn: async () => saveThemeDraft(target, config),
    onSuccess: () => {
      setHasDraft(true);
      toast.success('Draft saved successfully');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to save draft'),
  });

  const publishMutation = useMutation({
    mutationFn: async () => publishTheme(target, config),
    onSuccess: () => {
      setHasDraft(false);
      toast.success('Theme published to live site!');
      void queryClient.invalidateQueries({ queryKey: siteSettingsQuery.queryKey });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to publish'),
  });

  const discardMutation = useMutation({
    mutationFn: async () => discardThemeDraft(target),
    onSuccess: () => {
      setHasDraft(false);
      toast.success('Draft discarded');
      // Re-initialize from settingsData
      if (settingsData?.theme?.[target]) {
        setConfig(settingsData.theme[target]);
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to discard'),
  });

  // --- Handlers ---
  const handleCreateTheme = (duplicateFrom?: ThemePreset) => {
    const baseTheme = duplicateFrom || PRESET_THEMES[0];
    const newTheme: ThemePreset = {
      id: `custom-${Date.now()}`,
      name: duplicateFrom ? `${baseTheme.name} (Copy)` : 'New Custom Theme',
      isCustom: true,
      vars: { ...baseTheme.vars },
    };
    setConfig((prev) => ({
      ...prev,
      customThemes: [...(prev.customThemes || []), newTheme],
      activeThemeId: newTheme.id,
    }));
  };

  const handleDeleteTheme = (id: string) => {
    if (!confirm('Are you sure you want to delete this custom theme?')) return;
    setConfig((prev) => {
      const newCustom = (prev.customThemes || []).filter((t) => t.id !== id);
      return {
        ...prev,
        customThemes: newCustom,
        activeThemeId: prev.activeThemeId === id ? 'preset-aurora' : prev.activeThemeId,
      };
    });
  };

  const updateActiveThemeVar = (key: keyof FullThemeVars, val: string) => {
    if (!activeTheme.isCustom) {
      const newTheme: ThemePreset = {
        id: `custom-${Date.now()}`,
        name: `${activeTheme.name} (Custom)`,
        isCustom: true,
        vars: { ...activeTheme.vars, [key]: val },
      };
      setConfig((prev) => ({
        ...prev,
        customThemes: [...(prev.customThemes || []), newTheme],
        activeThemeId: newTheme.id,
      }));
      return;
    }

    setConfig((prev) => ({
      ...prev,
      customThemes: (prev.customThemes || []).map((t) => {
        if (t.id === activeTheme.id) {
          return { ...t, vars: { ...t.vars, [key]: val } };
        }
        return t;
      }),
    }));
  };

  const renameActiveTheme = (val: string) => {
    if (!activeTheme.isCustom) return;
    setConfig((prev) => ({
      ...prev,
      customThemes: (prev.customThemes || []).map((t) =>
        t.id === activeTheme.id ? { ...t, name: val } : t
      ),
    }));
  };

  if (settingsLoading || isInitializing) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const deviceWidth = device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px';

  return (
    <div className="flex h-full max-h-[calc(100vh-50px)] flex-col overflow-hidden rounded-md border lg:flex-row">
      {/* SIDEBAR: Theme Settings */}
      <div className=" flex max-h-[40vh] w-full shrink-0 flex-col overflow-y-auto border-b lg:max-h-full lg:w-80 lg:border-r lg:border-b-0">
        <div className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 border-b px-4 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-muted-foreground text-xs">Configure the site-wide appearance.</p>
        </div>

        <div className="flex flex-col gap-6 p-4">
          <div className="space-y-2">
            <Label>Active Theme</Label>
            <Select
              value={config.activeThemeId}
              onValueChange={(val) => setConfig((prev) => ({ ...prev, activeThemeId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a theme..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="_create_new"
                  disabled
                  className="text-muted-foreground font-semibold"
                >
                  Presets
                </SelectItem>
                {PRESET_THEMES.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    {pt.name}
                  </SelectItem>
                ))}

                {config.customThemes && config.customThemes.length > 0 && (
                  <SelectItem
                    value="_custom_divider"
                    disabled
                    className="text-muted-foreground mt-2 font-semibold"
                  >
                    Custom Themes
                  </SelectItem>
                )}
                {config.customThemes?.map((ct) => (
                  <SelectItem key={ct.id} value={ct.id}>
                    {ct.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleCreateTheme()}
              >
                <Plus className="mr-1.5 h-3 w-3" /> New
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleCreateTheme(activeTheme)}
              >
                <Copy className="mr-1.5 h-3 w-3" /> Dup
              </Button>
            </div>
          </div>

          <div className="bg-muted/20 space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold">
                {activeTheme.isCustom ? 'Edit Custom Theme' : 'Theme Variables'}
              </Label>
              {activeTheme.isCustom && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-6 w-6"
                  onClick={() => handleDeleteTheme(activeTheme.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {activeTheme.isCustom && (
              <div className="space-y-1.5">
                <Label className="text-xs">Theme Name</Label>
                <Input
                  className="h-8 text-sm"
                  value={activeTheme.name}
                  onChange={(e) => renameActiveTheme(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Border Radius</Label>
              <Input
                className="h-8 font-mono text-xs"
                value={activeTheme.vars.radius}
                onChange={(e) => updateActiveThemeVar('radius', e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-2">
              {COLOR_KEYS.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <div className="flex items-center gap-2">
                    <span
                      className="border-border h-6 w-6 shrink-0 rounded border shadow-sm"
                      style={{ background: activeTheme.vars[key] }}
                    />
                    <Input
                      className="h-7 font-mono text-[10px]"
                      value={activeTheme.vars[key]}
                      onChange={(e) => updateActiveThemeVar(key, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN: Preview Area */}
      <div className="bg-muted/10 flex min-h-[50vh] flex-1 flex-col justify-start!">
        {/* Topbar: Preview Controls & Actions */}
        <div className="bg-background flex shrink-0 scrollbar-none items-center justify-between gap-4 overflow-x-auto border-b p-2 px-4">
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="flex items-center rounded-md border p-1">
              <Button
                variant={device === 'desktop' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={device === 'tablet' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setDevice('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={device === 'mobile' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Select value={previewPath} onValueChange={setPreviewPath}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {defaultPaths.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">
                    Preview: {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <a
              href={previewPath}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {hasDraft && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => discardMutation.mutate()}
                disabled={discardMutation.isPending}
              >
                <RotateCcw className="mr-1.5 h-3 w-3" />
                Discard
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => saveDraftMutation.mutate()}
              disabled={saveDraftMutation.isPending}
            >
              {saveDraftMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className={hasDraft ? 'bg-green-600 text-white hover:bg-green-700' : ''}
            >
              {publishMutation.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Publish to Live
            </Button>
          </div>
        </div>

        {/* Iframe Canvas */}
        <div className="flex flex-1 items-start justify-center overflow-auto p-4 sm:p-5">
          <div
            className="bg-background overflow-hidden rounded-md border shadow-lg transition-all duration-300 ease-out"
            style={{ width: deviceWidth, height: '100%', maxHeight: '800px' }}
          >
            {/* The query parameter `?preview=theme` could optionally bypass caching if needed, but postMessage handles live changes */}
            <iframe
              ref={iframeRef}
              src={`${previewPath}`}
              title="Theme Live Preview"
              className="h-full w-full border-0"
              onLoad={() => {
                iframeReady.current = false; // Reset until NAZEXA_THEME_READY is fired by iframe
                // But as a fallback, post immediately
                postToPreview();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
