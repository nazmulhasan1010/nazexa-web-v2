import React from 'react';
import { useBuilderStore } from '@/lib/builder/store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';
import { contentRegistry } from '@/lib/builder/content-registry';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const RightInspector = () => {
  const { selectedId, schema, updateElement, removeElement, duplicateElement } = useBuilderStore();

  const findSelectedElement = (id: string, root = schema.root): any => {
    if (root.id === id) return root;
    for (const child of root.children) {
      const found = findSelectedElement(id, child);
      if (found) return found;
    }
    return null;
  };

  const selectedElement = selectedId ? findSelectedElement(selectedId) : null;

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-background flex flex-col h-full shrink-0 p-4 items-center justify-center text-muted-foreground text-sm">
        No element selected
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateElement(selectedElement.id, {
      props: { ...selectedElement.props, [key]: value }
    });
  };

  const isRoot = selectedElement.id === 'root';

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full shrink-0">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium text-sm">Inspector</h3>
          <p className="text-xs text-muted-foreground mt-1">Editing: {selectedElement.type}</p>
        </div>
        {!isRoot && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateElement(selectedElement.id)} title="Duplicate">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeElement(selectedElement.id)} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b h-auto p-0">
          <TabsTrigger value="content" className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">Content</TabsTrigger>
          <TabsTrigger value="style" className="rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary">Style</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="flex-1 overflow-y-auto p-4 m-0 space-y-4">
          {selectedElement.type === 'Text' || selectedElement.type === 'Heading' || selectedElement.type === 'Badge' || selectedElement.type === 'Button' ? (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Text Content</Label>
              <Textarea
                value={selectedElement.props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="text-sm min-h-[100px]"
              />
            </div>
          ) : null}

          {selectedElement.type === 'Heading' && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">HTML Tag</Label>
              <Select value={selectedElement.props.tag || 'h2'} onValueChange={(val) => handlePropChange('tag', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                  <SelectItem value="h4">H4</SelectItem>
                  <SelectItem value="h5">H5</SelectItem>
                  <SelectItem value="h6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedElement.type === 'Image' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Image URL</Label>
                <Input
                  value={selectedElement.props.src || ''}
                  onChange={(e) => handlePropChange('src', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Alt Text</Label>
                <Input
                  value={selectedElement.props.alt || ''}
                  onChange={(e) => handlePropChange('alt', e.target.value)}
                  className="text-sm"
                />
              </div>
            </>
          )}

          {selectedElement.type === 'Button' && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Link URL</Label>
              <Input
                value={selectedElement.props.href || ''}
                onChange={(e) => handlePropChange('href', e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          {selectedElement.type === 'DynamicContent' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Data Source</Label>
                <Select value={selectedElement.props.source || ''} onValueChange={(val) => handlePropChange('source', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentRegistry.getAll().map(src => (
                      <SelectItem key={src.key} value={src.key}>{src.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Layout Display</Label>
                <Select value={selectedElement.props.layout || 'grid'} onValueChange={(val) => handlePropChange('layout', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Card Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="slider">Slider / Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Limit Items</Label>
                <Input
                  type="number"
                  value={selectedElement.props.limit || 6}
                  onChange={(e) => handlePropChange('limit', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="style" className="flex-1 overflow-y-auto p-4 m-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tailwindClasses" className="text-xs font-semibold">
              Tailwind Classes
            </Label>
            <Textarea
              id="tailwindClasses"
              value={selectedElement.tailwindClasses || ''}
              onChange={(e) => updateElement(selectedElement.id, { tailwindClasses: e.target.value })}
              placeholder="e.g. px-4 py-2 bg-blue-500 text-white"
              className="font-mono text-xs min-h-[120px]"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Add any valid Tailwind CSS classes here to style the element. 
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
