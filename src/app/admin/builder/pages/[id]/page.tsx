'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useBuilderStore } from '@/lib/builder/store';
import BuilderLayout from '@/components/builder/BuilderLayout';
import { Loader2 } from 'lucide-react';

export default function BuilderPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const setSchema = useBuilderStore(s => s.setSchema);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/admin/builder/pages/${id}`);
        if (!res.ok) throw new Error('Failed to fetch page');
        const data = await res.json();
        
        if (data.draftData) {
          const parsed = typeof data.draftData === 'string' ? JSON.parse(data.draftData) : data.draftData;
          setSchema(parsed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [id, setSchema]);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return <BuilderLayout pageId={id as string} />;
}
