'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Users, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type UserOption = {
  id: string;
  name: string | null;
  email: string | null;
  totalTokens?: number | null;
  requests?: number | null;
};

interface UserSelectProps {
  /** Selected user id, or 'all' for the All-Users aggregate. */
  value: string;
  onChange: (userId: string, label: string) => void;
}

function labelFor(u: UserOption): string {
  return u.name || u.email || u.id;
}

export function UserSelect({ value, onChange }: UserSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState('All Users');

  // Debounced server-side search (top-by-usage when the query is empty).
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const url = `/api/admin/ai-management/users${query ? `?q=${encodeURIComponent(query)}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled) setUsers(Array.isArray(data.users) ? data.users : []);
      } catch {
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            {value === 'all' ? (
              <Users className="h-4 w-4 shrink-0" />
            ) : (
              <UserIcon className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{selectedLabel}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search users…" value={query} onValueChange={setQuery} />
          <CommandList className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {loading && <div className="text-muted-foreground px-3 py-2 text-xs">Searching…</div>}
            {!loading && <CommandEmpty>No users found.</CommandEmpty>}
            <CommandGroup>
              <CommandItem
                value="all-users"
                className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                onSelect={() => {
                  setSelectedLabel('All Users');
                  onChange('all', 'All Users');
                  setOpen(false);
                }}
              >
                <div className="flex w-full items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>All Users</span>
                </div>
                <Check
                  className={cn('ml-auto h-4 w-4', value === 'all' ? 'opacity-100' : 'opacity-0')}
                />
              </CommandItem>
              {users.map((u) => {
                const label = labelFor(u);
                return (
                  <CommandItem
                    key={u.id}
                    value={u.id}
                    className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                    onSelect={() => {
                      setSelectedLabel(label);
                      onChange(u.id, label);
                      setOpen(false);
                    }}
                  >
                    <div className="flex w-full flex-col">
                      <span className="truncate">{u.name || u.email || u.id}</span>
                      {u.name && u.email && (
                        <span className="text-muted-foreground truncate text-xs">{u.email}</span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === u.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
