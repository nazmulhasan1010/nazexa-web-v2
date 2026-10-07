'use client';
import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { saveConfigAction, getConfigMapAction } from '../actions';
import { toast } from 'sonner';

export default function ContactSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [configs, setConfigs] = useState<Record<string, any>>({
    'contact.title': '',
    'contact.subtitle': '',
    'contact.companyName': '',
    'contact.supportEmail': '',
    'contact.phone': '',
    'contact.address': '',
    'contact.whatsapp': '',
    'contact.enableForm': true,
    'contact.formHeading': '',
    'contact.formSuccessMessage': '',
    'contact.formButtonText': '',
    'contact.workingHours': '',
    'contact.facebookUrl': '',
    'contact.twitterUrl': '',
    'contact.linkedinUrl': '',
    'contact.instagramUrl': '',
    'contact.channels': [],
    'contact.offices': {},
    'contact.faq': [],
  });

  const keys = Object.keys(configs);

  useEffect(() => {
    getConfigMapAction(keys).then(res => {
      if (res.success && res.data) {
        setConfigs(prev => ({
          ...prev,
          ...res.data,
          'contact.channels': res.data['contact.channels'] || [],
          'contact.offices': res.data['contact.offices'] || { columns: ['Location', 'Address', 'Best for'], rows: [] },
          'contact.faq': res.data['contact.faq'] || [],
        }));
      }
      setFetching(false);
    });
  }, []);

  const handleChange = (key: string, value: any) => setConfigs(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = keys.map(key => {
        if (key === 'contact.channels' || key === 'contact.offices' || key === 'contact.faq') {
          return { key, category: 'Contact', value: configs[key], valueType: 'json' };
        }
        return { key, category: 'Contact', value: configs[key] };
      });
      const result = await saveConfigAction(payload);
      if (result.success) toast.success('Saved successfully.');
      else toast.error(result.error || 'Failed to save.');
    } catch (e: any) {
      toast.error('Failed to save configuration: ' + e.message);
    }
    setLoading(false);
  };

  const updateArrayItem = (key: string, index: number, field: string, value: any) => {
    const newArr = [...(configs[key] || [])];
    newArr[index] = { ...newArr[index], [field]: value };
    handleChange(key, newArr);
  };
  const addArrayItem = (key: string, defaultItem: any) => {
    handleChange(key, [...(configs[key] || []), defaultItem]);
  };
  const removeArrayItem = (key: string, index: number) => {
    const newArr = [...(configs[key] || [])];
    newArr.splice(index, 1);
    handleChange(key, newArr);
  };

  const updateOfficeRow = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...(configs['contact.offices']?.rows || [])];
    if (!newRows[rowIndex]) newRows[rowIndex] = ['', '', ''];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    handleChange('contact.offices', { ...configs['contact.offices'], rows: newRows });
  };
  const addOfficeRow = () => {
    const newRows = [...(configs['contact.offices']?.rows || []), ['', '', '']];
    handleChange('contact.offices', { ...configs['contact.offices'], rows: newRows });
  };
  const removeOfficeRow = (rowIndex: number) => {
    const newRows = [...(configs['contact.offices']?.rows || [])];
    newRows.splice(rowIndex, 1);
    handleChange('contact.offices', { ...configs['contact.offices'], rows: newRows });
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Contact Settings</h1>
        <p className="text-muted-foreground mt-2">Manage public contact information.</p>
      </div>

      <Accordion type="multiple" defaultValue={['contact-info', 'contact-form', 'social-links', 'team', 'offices', 'faq']} className="space-y-4">
        <AccordionItem value="contact-info" className="border bg-card text-card-foreground shadow-sm rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline text-lg font-semibold py-4">Contact Info</AccordionTrigger>
          <AccordionContent className="pt-0 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2"><Label>Page Title</Label><Input value={configs['contact.title'] || ''} onChange={e => handleChange('contact.title', e.target.value)} placeholder="Let's talk about your project" /></div>
              <div className="space-y-2 col-span-2"><Label>Page Subtitle</Label><Input value={configs['contact.subtitle'] || ''} onChange={e => handleChange('contact.subtitle', e.target.value)} placeholder="Whether you have a question about features..." /></div>
              <div className="space-y-2"><Label>Company Name</Label><Input value={configs['contact.companyName'] || ''} onChange={e => handleChange('contact.companyName', e.target.value)} /></div>
              <div className="space-y-2"><Label>Support Email</Label><Input value={configs['contact.supportEmail'] || ''} onChange={e => handleChange('contact.supportEmail', e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input value={configs['contact.phone'] || ''} onChange={e => handleChange('contact.phone', e.target.value)} /></div>
              <div className="space-y-2"><Label>WhatsApp</Label><Input value={configs['contact.whatsapp'] || ''} onChange={e => handleChange('contact.whatsapp', e.target.value)} /></div>
              <div className="space-y-2 col-span-2"><Label>Address</Label><Input value={configs['contact.address'] || ''} onChange={e => handleChange('contact.address', e.target.value)} /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact-form" className="border bg-card text-card-foreground shadow-sm rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline text-lg font-semibold py-4">Contact Form Settings</AccordionTrigger>
          <AccordionContent className="pt-0 pb-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch checked={configs['contact.enableForm'] !== false} onCheckedChange={v => handleChange('contact.enableForm', v)} />
              <Label>Enable Contact Form</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2"><Label>Form Heading</Label><Input value={configs['contact.formHeading'] || ''} onChange={e => handleChange('contact.formHeading', e.target.value)} placeholder="Send us a message" /></div>
              <div className="space-y-2 col-span-2"><Label>Success Message</Label><Input value={configs['contact.formSuccessMessage'] || ''} onChange={e => handleChange('contact.formSuccessMessage', e.target.value)} placeholder="Message sent successfully!" /></div>
              <div className="space-y-2 col-span-2"><Label>Button Text</Label><Input value={configs['contact.formButtonText'] || ''} onChange={e => handleChange('contact.formButtonText', e.target.value)} placeholder="Send Message" /></div>
              <div className="space-y-2 col-span-2"><Label>Working Hours</Label><Textarea value={configs['contact.workingHours'] || ''} onChange={e => handleChange('contact.workingHours', e.target.value)} placeholder="Mon - Fri: 9:00 AM - 5:00 PM" /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="social-links" className="border bg-card text-card-foreground shadow-sm rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline text-lg font-semibold py-4">Social Links</AccordionTrigger>
          <AccordionContent className="pt-0 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Facebook URL</Label><Input value={configs['contact.facebookUrl'] || ''} onChange={e => handleChange('contact.facebookUrl', e.target.value)} placeholder="https://facebook.com/..." /></div>
              <div className="space-y-2"><Label>Twitter URL</Label><Input value={configs['contact.twitterUrl'] || ''} onChange={e => handleChange('contact.twitterUrl', e.target.value)} placeholder="https://twitter.com/..." /></div>
              <div className="space-y-2"><Label>LinkedIn URL</Label><Input value={configs['contact.linkedinUrl'] || ''} onChange={e => handleChange('contact.linkedinUrl', e.target.value)} placeholder="https://linkedin.com/..." /></div>
              <div className="space-y-2"><Label>Instagram URL</Label><Input value={configs['contact.instagramUrl'] || ''} onChange={e => handleChange('contact.instagramUrl', e.target.value)} placeholder="https://instagram.com/..." /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="team" className="border bg-card text-card-foreground shadow-sm rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline text-lg font-semibold py-4">Reach the right team</AccordionTrigger>
          <AccordionContent className="pt-0 pb-6 space-y-4">
            {(configs['contact.channels'] || []).map((item: any, i: number) => (
              <div key={i} className="border rounded-md p-4 space-y-3 relative">
                <Button type="button" variant="destructive" size="sm" className="absolute top-4 right-4" onClick={() => removeArrayItem('contact.channels', i)}>Remove</Button>
                <div className="space-y-1"><Label>Team Name</Label><Input value={item.title || ''} onChange={e => updateArrayItem('contact.channels', i, 'title', e.target.value)} /></div>
                <div className="space-y-1"><Label>Description</Label><Textarea value={item.body || ''} onChange={e => updateArrayItem('contact.channels', i, 'body', e.target.value)} /></div>
                <div className="space-y-1"><Label>Contact Action (Email/Link)</Label><Input value={item.action || ''} onChange={e => updateArrayItem('contact.channels', i, 'action', e.target.value)} /></div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem('contact.channels', { title: '', body: '', action: '' })}>+ Add Team</Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="offices" className="border bg-card text-card-foreground shadow-sm rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline text-lg font-semibold py-4">Offices</AccordionTrigger>
          <AccordionContent className="pt-0 pb-6 space-y-4">
            {(configs['contact.offices']?.rows || []).map((row: any[], i: number) => (
              <div key={i} className="border rounded-md p-4 space-y-3 relative">
                <Button type="button" variant="destructive" size="sm" className="absolute top-4 right-4" onClick={() => removeOfficeRow(i)}>Remove</Button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mr-20">
                  <div className="space-y-1"><Label>Location</Label><Input value={row[0] || ''} onChange={e => updateOfficeRow(i, 0, e.target.value)} /></div>
                  <div className="space-y-1"><Label>Address</Label><Input value={row[1] || ''} onChange={e => updateOfficeRow(i, 1, e.target.value)} /></div>
                  <div className="space-y-1"><Label>Best for</Label><Input value={row[2] || ''} onChange={e => updateOfficeRow(i, 2, e.target.value)} /></div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOfficeRow}>+ Add Office</Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq" className="border bg-card text-card-foreground shadow-sm rounded-lg px-6">
          <AccordionTrigger className="hover:no-underline text-lg font-semibold py-4">Before you write (FAQ)</AccordionTrigger>
          <AccordionContent className="pt-0 pb-6 space-y-4">
            {(configs['contact.faq'] || []).map((item: any, i: number) => (
              <div key={i} className="border rounded-md p-4 space-y-3 relative">
                <Button type="button" variant="destructive" size="sm" className="absolute top-4 right-4" onClick={() => removeArrayItem('contact.faq', i)}>Remove</Button>
                <div className="space-y-1"><Label>Question</Label><Input value={item.title || ''} onChange={e => updateArrayItem('contact.faq', i, 'title', e.target.value)} /></div>
                <div className="space-y-1"><Label>Answer</Label><Textarea value={item.body || ''} onChange={e => updateArrayItem('contact.faq', i, 'body', e.target.value)} /></div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem('contact.faq', { title: '', body: '' })}>+ Add FAQ</Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end"><Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save All Changes'}</Button></div>
    </div>
  );
}
