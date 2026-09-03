'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

type AIConfig = {
  activeProvider: string;
  googleApiKey: string | null;
  googleModel: string | null;
};

type AIAgent = {
  id: string;
  name: string;
  baseUrl: string | null;
  model: string;
  apiKey: string | null;
  isActive: boolean;
};

export default function AIManagementPage() {
  const [globalConfig, setGlobalConfig] = useState<AIConfig | null>(null);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  
  const [agentForm, setAgentForm] = useState({
    name: '',
    baseUrl: '',
    model: '',
    apiKey: '',
  });

  const load = async () => {
    try {
      const res = await fetch('/api/admin/ai-management');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGlobalConfig(data.globalConfig);
      setAgents(data.agents);
    } catch (err: unknown) {
      toast.error('Failed to load AI config: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleProviderChange = async (provider: string) => {
    try {
      const res = await fetch('/api/admin/ai-management', {
        method: 'PUT',
        body: JSON.stringify({ activeProvider: provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGlobalConfig(prev => prev ? { ...prev, activeProvider: provider } : null);
      toast.success('Active AI provider updated');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const saveGoogleConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/ai-management', {
        method: 'PUT',
        body: JSON.stringify({
          googleApiKey: (document.getElementById('google-api-key') as HTMLInputElement).value,
          googleModel: (document.getElementById('google-model') as HTMLInputElement).value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Google GenAI configuration saved');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleAgentSave = async () => {
    try {
      const isNew = !editingAgent;
      const url = isNew ? '/api/admin/ai-management' : `/api/admin/ai-management/agent/${editingAgent.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        body: JSON.stringify(agentForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Agent ${isNew ? 'created' : 'updated'} successfully`);
      setIsAgentDialogOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const setActiveAgent = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ai-management/agent/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error('Failed to set active agent');
      toast.success('Active agent updated');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
      const res = await fetch(`/api/admin/ai-management/agent/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete agent');
      toast.success('Agent deleted');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error');
    }
  };

  const openNewAgentDialog = () => {
    setEditingAgent(null);
    setAgentForm({ name: '', baseUrl: '', model: '', apiKey: '' });
    setIsAgentDialogOpen(true);
  };

  const openEditAgentDialog = (agent: AIAgent) => {
    setEditingAgent(agent);
    setAgentForm({
      name: agent.name,
      baseUrl: agent.baseUrl || '',
      model: agent.model,
      apiKey: agent.apiKey === '••••••••••••' ? '' : (agent.apiKey || ''),
    });
    setIsAgentDialogOpen(true);
  };

  if (loading) {
    return <div className="p-8 space-y-4"><Skeleton className="h-10 w-[200px]" /><Skeleton className="h-[200px] w-full" /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Management</h1>
        <p className="text-muted-foreground text-sm">Configure AI providers and agents for the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active AI Provider</CardTitle>
          <CardDescription>Select which AI provider Nazexa-DB should use globally.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={globalConfig?.activeProvider || 'openai'}
            onValueChange={handleProviderChange}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="flex-1 cursor-pointer">
                <div className="font-medium">OpenAI-Compatible</div>
                <div className="text-muted-foreground text-sm font-normal">Use one of the configured OpenAI-compatible agents below</div>
              </Label>
              {globalConfig?.activeProvider === 'openai' && <Badge variant="default">Active</Badge>}
            </div>
            
            <div className="flex items-center space-x-2 border p-4 rounded-lg bg-card">
              <RadioGroupItem value="google" id="google" />
              <Label htmlFor="google" className="flex-1 cursor-pointer">
                <div className="font-medium">Google GenAI</div>
                <div className="text-muted-foreground text-sm font-normal">Use Google Gemini API</div>
              </Label>
              {globalConfig?.activeProvider === 'google' && <Badge variant="default">Active</Badge>}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Google GenAI Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="google-config-form" onSubmit={saveGoogleConfig} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-api-key">API Key</Label>
                <Input
                  id="google-api-key"
                  type="password"
                  placeholder={globalConfig?.googleApiKey ? "••••••••••••" : "Enter API Key"}
                />
                <p className="text-xs text-muted-foreground">Leave blank to keep current key</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-model">Model Name</Label>
                <Input
                  id="google-model"
                  defaultValue={globalConfig?.googleModel || 'gemini-1.5-pro'}
                  placeholder="gemini-1.5-pro"
                />
              </div>
              <Button type="submit">Save Google Config</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>OpenAI-Compatible Agents</CardTitle>
              <CardDescription>Manage your custom OpenAI-compatible endpoints</CardDescription>
            </div>
            <Button onClick={openNewAgentDialog} size="sm">Add Agent</Button>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No agents configured.</div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.model}</div>
                        </TableCell>
                        <TableCell>
                          {agent.isActive ? (
                            <Badge variant="default">Active Agent</Badge>
                          ) : (
                            <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setActiveAgent(agent.id)}>
                              Set Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditAgentDialog(agent)}>Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAgent(agent.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAgentDialogOpen} onOpenChange={setIsAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add AI Agent'}</DialogTitle>
            <DialogDescription>Configure connection details for an OpenAI-compatible agent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name / Label</Label>
              <Input
                value={agentForm.name}
                onChange={e => setAgentForm({ ...agentForm, name: e.target.value })}
                placeholder="e.g. Primary AI"
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL (Optional)</Label>
              <Input
                value={agentForm.baseUrl}
                onChange={e => setAgentForm({ ...agentForm, baseUrl: e.target.value })}
                placeholder="https://openrouter.ai/api/v1"
              />
            </div>
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input
                value={agentForm.model}
                onChange={e => setAgentForm({ ...agentForm, model: e.target.value })}
                placeholder="e.g. gpt-4"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={agentForm.apiKey}
                onChange={e => setAgentForm({ ...agentForm, apiKey: e.target.value })}
                placeholder={editingAgent?.apiKey ? "•••••••••••• (Leave blank to keep)" : "sk-..."}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAgentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAgentSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
