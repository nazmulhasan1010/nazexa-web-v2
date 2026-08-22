import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import { iconNames, getIcon } from '@/lib/icons';

interface IconPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const SelectedIcon = value ? getIcon(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && SelectedIcon ? (
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-4 w-4" />
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select an icon...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search icons..." />
          <CommandList className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="none"
                value="none"
                className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <div className="flex w-full items-center gap-2">
                  <div className="h-4 w-4" />
                  <span>None</span>
                </div>
                <Check className={cn('ml-auto h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
              {iconNames.map((name) => {
                const Icon = getIcon(name);
                return (
                  <CommandItem
                    key={name}
                    value={name}
                    className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? null : currentValue);
                      setOpen(false);
                    }}
                  >
                    <div className="flex w-full items-center gap-2">
                      <Icon className="text-muted-foreground h-4 w-4" />
                      <span>{name}</span>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === name ? 'opacity-100' : 'opacity-0'
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
