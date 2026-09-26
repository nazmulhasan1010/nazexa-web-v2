'use client';

import { useState, useEffect, use } from 'react';
import { migrateV1toV2 } from '@/lib/email/schema';
import type { EmailDesignV2 } from '@/lib/email/schema';
import { DEFAULT_SETTINGS_V2, createDefaultSection } from '@/lib/email/schema';
import { BuilderShell } from '@/components/email-builder/BuilderShell';

export default function EmailBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [design, setDesign] = useState<EmailDesignV2 | null>(null);

  useEffect(() => {
    fetch(`/api/admin/emails/templates/${id}`)
      .then(async res => {
        if (!res.ok) { setError('Template not found'); setLoading(false); return; }
        const data = await res.json();
        if (!data.template) { setError('Template not found'); setLoading(false); return; }

        const tmpl = data.template;
        setTemplate(tmpl);

        // Parse and migrate design JSON
        let parsed: any = null;
        try { parsed = JSON.parse(tmpl.designJson); } catch {}

        let finalDesign: EmailDesignV2;
        if (parsed?.version === 2) {
          // Already v2
          finalDesign = parsed as EmailDesignV2;
        } else if (parsed?.theme || parsed?.blocks) {
          // V1 flat design — migrate
          finalDesign = migrateV1toV2(parsed);
        } else {
          // Empty / no design — start fresh with one blank section
          const section = createDefaultSection('100');
          finalDesign = {
            version: 2,
            settings: DEFAULT_SETTINGS_V2,
            sections: [section],
          };
        }

        setDesign(finalDesign);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load template'); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading builder...</p>
        </div>
      </div>
    );
  }

  if (error || !template || !design) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-red-500">{error || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <BuilderShell
      templateId={id}
      initialTemplate={{
        id: template.id,
        name: template.name,
        key: template.key,
        subject: template.subject || '',
        category: template.category,
        status: template.status,
        version: template.version,
      }}
      initialDesign={design}
    />
  );
}
