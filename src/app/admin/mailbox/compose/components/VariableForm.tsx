'use client';

import { EMAIL_VARIABLES, EmailVariable } from '@/lib/email/variables';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VariableFormProps {
  templateHtml: string;
  templateSubject: string;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function extractVariables(str: string): string[] {
  const regex = /\{\{([\w.]+)\}\}/g;
  const found = new Set<string>();
  let match;
  while ((match = regex.exec(str)) !== null) {
    found.add(match[1]);
  }
  return Array.from(found);
}

export function VariableForm({ templateHtml, templateSubject, values, onChange }: VariableFormProps) {
  const htmlVars = extractVariables(templateHtml || '');
  const subjectVars = extractVariables(templateSubject || '');
  const allVarKeys = Array.from(new Set([...htmlVars, ...subjectVars]));

  // Remove variables that are injected automatically by the system
  const systemKeys = ['currentYear', 'currentDate', 'company.name', 'company.website', 'company.email'];
  const manualVarKeys = allVarKeys.filter(k => !systemKeys.includes(k));

  if (manualVarKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
        <p>No manual variables detected in this template.</p>
        <p className="text-xs mt-1">System variables like {'{{company.name}}'} are automatically filled.</p>
      </div>
    );
  }

  const vars = manualVarKeys.map(k => {
    const reg = EMAIL_VARIABLES.find(v => v.key === k);
    return {
      key: k,
      label: reg?.label || k,
      description: reg?.description || '',
      type: reg?.dataType || 'string',
      example: reg?.exampleValue || '',
      category: reg?.category || 'Unknown'
    };
  });

  // Group by category
  const grouped = vars.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof vars>);

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{category}</h3>
            <div className="space-y-4">
              {items.map(v => (
                <div key={v.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      {v.label}
                      {v.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button" tabIndex={-1}>
                              <HelpCircle className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{v.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </Label>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">
                      {'{'}{'{'}{v.key}{'}'}{'}'}
                    </span>
                  </div>
                  <Input
                    type={v.type === 'date' ? 'date' : v.type === 'number' ? 'number' : v.type === 'url' ? 'url' : 'text'}
                    placeholder={`e.g. ${v.example}`}
                    value={values[v.key] || ''}
                    onChange={e => onChange(v.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
