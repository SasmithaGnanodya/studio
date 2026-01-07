
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, X, CheckCircle } from 'lucide-react';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type EditorSidebarProps = {
  field: FieldLayout;
  onUpdate: (id: string, updates: Partial<FieldLayout>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export const EditorSidebar = ({ field, onUpdate, onDelete, onClose }: EditorSidebarProps) => {

  const handleLayoutChange = (part: 'label' | 'value', property: keyof FieldPart, value: string | number) => {
    const newPart = { ...field[part], [property]: value };
    onUpdate(field.id, { [part]: newPart });
  };
  
  const handleFieldIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { fieldId: e.target.value });
  }

  const renderPartEditor = (part: 'label' | 'value') => {
    const data = field[part];
    const title = part.charAt(0).toUpperCase() + part.slice(1);

    return (
      <AccordionItem value={part}>
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${part}-text`}>{part === 'label' ? 'Label Text' : 'Data Field ID'}</Label>
            <Input 
              id={`${part}-text`} 
              name="text" 
              value={data.text} 
              onChange={(e) => handleLayoutChange(part, 'text', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor={`${part}-x`}>X (mm)</Label>
              <Input id={`${part}-x`} name="x" type="number" value={data.x} onChange={(e) => handleLayoutChange(part, 'x', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${part}-y`}>Y (mm)</Label>
              <Input id={`${part}-y`} name="y" type="number" value={data.y} onChange={(e) => handleLayoutChange(part, 'y', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${part}-width`}>Width (mm)</Label>
              <Input id={`${part}-width`} name="width" type="number" value={data.width} onChange={(e) => handleLayoutChange(part, 'width', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${part}-height`}>Height (mm)</Label>
              <Input id={`${part}-height`} name="height" type="number" value={data.height} onChange={(e) => handleLayoutChange(part, 'height', parseFloat(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${part}-className`}>CSS Class</Label>
            <Input id={`${part}-className`} name="className" value={data.className || ''} onChange={(e) => handleLayoutChange(part, 'className', e.target.value)} />
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Card className="w-full md:w-1/3 lg:w-1/4 h-fit sticky top-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Edit Field</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="fieldId">Field ID (for data linking)</Label>
                <Input id="fieldId" name="fieldId" value={field.fieldId} onChange={handleFieldIdChange} />
            </div>

            <Accordion type="multiple" defaultValue={['label', 'value']} className="w-full">
              {renderPartEditor('label')}
              {renderPartEditor('value')}
            </Accordion>
          </div>
        </ScrollArea>
        {/* Actions */}
        <div className="pt-4 mt-4 border-t">
              <Button onClick={onClose} className="w-full mb-2">
                <CheckCircle className="mr-2 h-4 w-4" /> Confirm & Close
             </Button>
             <Button variant="destructive" onClick={() => onDelete(field.id)} className="w-full">
                <Trash className="mr-2 h-4 w-4" /> Delete Field
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};
