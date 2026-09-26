'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { DynamicIcon } from '@/components/DynamicIcon';
import { IconMap } from '@/components/IconMap';

interface IconPickerProps {
  value: string | null;
  onChange: (icon: string | null) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center border rounded-md bg-muted/50">
          {value ? <DynamicIcon name={value} className="w-5 h-5" /> : null}
        </div>
        <select 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">Select an icon...</option>
          {Object.keys(IconMap).map((k) => (
            <option key={k} value={k}>{k.replace('lu:', '')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
