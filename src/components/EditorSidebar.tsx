
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, X, ChevronDown } from 'lucide-react';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';

type EditorSidebarProps = {
  field: FieldLayout;
  onUpdate: (id: string, updates: Partial<FieldLayout>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export const EditorSidebar = ({ field, onUpdate, onDelete, onClose }: EditorSidebarProps) => {

  const handleLayoutChange = (part: 'label' | 'value', property: keyof FieldPart, value: string | number | boolean) => {
    const currentPart = field[part];
    if (!currentPart) return;

    let processedValue = value;
    if (['x', 'y', 'width', 'height'].includes(property as string)) {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        processedValue = isNaN(numericValue as number) || !value ? 0 : numericValue;
    }

    const newPart = { ...currentPart, [property]: processedValue };
    onUpdate(field.id, { [part]: newPart });
  };
  
  const handleFieldIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(field.id, { fieldId: e.target.value });
  }

  const renderPartEditor = (part: 'label' | 'value') => {
    const data = field[part];
    if (!data) return null;
    const title = part.charAt(0).toUpperCase() + part.slice(1);
    const isLabelPart = part === 'label';

    return (
      <div className="flex-1 px-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`${part}-text`} className="text-xs">{isLabelPart ? 'Label Text' : 'Data Field ID'}</Label>
            <Input 
              id={`${part}-text`} 
              name="text"
              className="h-8"
              value={isLabelPart ? data.text || '' : field.fieldId || ''} 
              onChange={(e) => isLabelPart ? handleLayoutChange(part, 'text', e.target.value) : handleFieldIdChange(e) }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-x`} className="text-xs">X (mm)</Label>
            <Input id={`${part}-x`} name="x" type="number" value={data.x || 0} onChange={(e) => handleLayoutChange(part, 'x', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-y`} className="text-xs">Y (mm)</Label>
            <Input id={`${part}-y`} name="y" type="number" value={data.y || 0} onChange={(e) => handleLayoutChange(part, 'y', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-width`} className="text-xs">Width (mm)</Label>
            <Input id={`${part}-width`} name="width" type="number" value={data.width || 0} onChange={(e) => handleLayoutChange(part, 'width', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-height`} className="text-xs">Height (mm)</Label>
            <Input id={`${part}-height`} name="height" type="number" value={data.height || 0} onChange={(e) => handleLayoutChange(part, 'height', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label htmlFor={`${part}-className`} className="text-xs">CSS Class</Label>
            <Input id={`${part}-className`} name="className" value={data.className || ''} onChange={(e) => handleLayoutChange(part, 'className', e.target.value)} className="h-8" />
          </div>
           <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`${part}-color`} className="text-xs">Color</Label>
            <Input id={`${part}-color`} name="color" type="color" value={data.color || '#000000'} onChange={(e) => handleLayoutChange(part, 'color', e.target.value)} className="h-8 p-1" />
          </div>
           <div className="flex items-center space-x-2 pt-5">
            <Checkbox id={`${part}-bold`} checked={data.isBold || false} onCheckedChange={(checked) => handleLayoutChange(part, 'isBold', checked as boolean)} />
            <Label htmlFor={`${part}-bold`} className="text-xs font-normal">Bold</Label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="px-6 py-3">
             <div className="flex items-center gap-4">
                <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                <h2 className="text-lg font-semibold">Editing Field: <span className="font-mono bg-muted px-2 py-1 rounded-md">{field.fieldId}</span></h2>
             </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x border-t">
              {renderPartEditor('label')}
              {renderPartEditor('value')}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t mt-2">
               <Button variant="outline" onClick={onClose}>
                  <X className="mr-2 h-4 w-4" /> Unselect
               </Button>
               <Button variant="destructive" onClick={() => onDelete(field.id)}>
                  <Trash className="mr-2 h-4 w-4" /> Delete Field
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
