'use client';

import React from 'react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { IconMap } from '@/components/IconMap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IconPickerProps {
  value: string | null;
  onChange: (icon: string | null) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-muted/50 flex h-12 w-12 shrink-0 items-center justify-center rounded-md border">
          {value ? <DynamicIcon name={value} className="h-5 w-5" /> : null}
        </div>
        <Select value={value || undefined} onValueChange={(val) => onChange(val || null)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an icon..." />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(IconMap).map((k) => (
              <SelectItem key={k} value={k}>
                <div className="flex items-center gap-2">
                  <DynamicIcon name={k} className="h-4 w-4" />
                  <span>{k.replace('lu:', '')}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
