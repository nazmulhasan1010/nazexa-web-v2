'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Loader2 } from 'lucide-react';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { saveSiteSettings } from '@/lib/cms';
import { siteSettingsQuery } from '@/lib/queries';

export default SeoPage;

function SeoPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(siteSettingsQuery);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!data) return;
    setTitle(data.default_seo_title ?? '');
    setDescription(data.default_seo_description ?? '');
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await saveSiteSettings({
        default_seo_title: title,
        default_seo_description: description,
      });
    },
    onSuccess: () => {
      toast.success('SEO defaults saved');
      void queryClient.invalidateQueries({
        queryKey: siteSettingsQuery.queryKey,
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
  });

  if (isLoading) return <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">SEO defaults</h1>
          <p className="text-muted-foreground mt-2">
            Fallback metadata for pages without their own values.
          </p>
        </div>
        <Button className="glow-ring" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <FaRegCircleCheck className="mr-1.5 h-4 w-4" />
          )}
          Save
        </Button>
      </div>

      <div className="surface-card mt-8 space-y-4 p-6">
        <div className="space-y-1.5">
          <Label>Default title</Label>
          <Input value={title} maxLength={70} onChange={(e) => setTitle(e.target.value)} />
          <p className="text-muted-foreground text-xs">{title.length}/60 recommended</p>
        </div>
        <div className="space-y-1.5">
          <Label>Default description</Label>
          <Textarea
            rows={3}
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">{description.length}/160 recommended</p>
        </div>
      </div>

      <div className="surface-card mt-6 p-6">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Search preview</p>
        <p className="text-primary mt-3 text-lg">{title || 'Untitled'}</p>
        <p className="text-muted-foreground text-xs">https://nazexa.com</p>
        <p className="text-muted-foreground mt-1 text-sm">{description || 'No description set.'}</p>
      </div>
    </div>
  );
}
