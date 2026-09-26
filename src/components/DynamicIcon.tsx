'use client';

import { LucideProps } from 'lucide-react';
import { IconMap } from './IconMap';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

export function DynamicIcon({ name, ...props }: IconProps) {
  const Icon = IconMap[name] || IconMap['lu:Box']; // Fallback
  return <Icon {...props} />;
}
