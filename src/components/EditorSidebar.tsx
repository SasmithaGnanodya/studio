
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, X, Lock } from 'lucide-react';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';

type EditorSidebarProps = {
  field: FieldLayout;
  onUpdate: (id: string, updates: Partial<FieldLayout>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

// These fields are critical for database indexing and search functionality.
const PROTECTED_FIELDS = ['regNumber', 'engineNumber', 'chassisNumber', 'reportNumber', 'date'];

export const EditorSidebar = ({ field, onUpdate, onDelete, onClose }: EditorSidebarProps) => {

  // Robust check for protected fields
  const isProtected = PROTECTED_FIELDS.includes(field.fieldId) || 
                     PROTECTED_FIELDS.some(id => id.toLowerCase() === field.fieldId.toLowerCase().trim());

  const handlePartChange = (part: 'label' | 'value' | 'placeholder', property: keyof FieldPart, value: any) => {
      const currentPart = field[part];
      if (!currentPart) return;

      let processedValue = value;
      if (['x', 'y', 'width', 'height', 'fontSize'].includes(property as string)) {
          processedValue = value === '' ? 0 : parseFloat(value);
          if (isNaN(processedValue)) processedValue = 0;
      }
      
      if (property === 'options' && typeof value === 'string') {
          processedValue = value.split('\n');
      }

      const newPart = { ...currentPart, [property]: processedValue };
      onUpdate(field.id, { [part]: newPart });
  };
  
  const handleFieldIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isProtected) {
      onUpdate(field.id, { fieldId: e.target.value });
    }
  }

  const renderStaticTextEditor = (part: 'label') => {
    const data = field[part];
    if (!data) return null;

    return (
      <div className="flex-1 px-4 py-2">
        <h3 className="font-semibold mb-2">Static Text</h3>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
          <div className="space-y-1 sm:col-span-6">
            <Label htmlFor={`${part}-text`} className="text-xs">Text</Label>
            <Input 
              id={`${part}-text`} 
              name="text"
              className="h-8"
              value={data.text || ''} 
              onChange={(e) => handlePartChange(part, 'text', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-x`} className="text-xs">X (mm)</Label>
            <Input id={`${part}-x`} name="x" type="number" value={data.x || 0} onChange={(e) => handlePartChange(part, 'x', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-y`} className="text-xs">Y (mm)</Label>
            <Input id={`${part}-y`} name="y" type="number" value={data.y || 0} onChange={(e) => handlePartChange(part, 'y', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-width`} className="text-xs">Width (mm)</Label>
            <Input id={`${part}-width`} name="width" type="number" value={data.width || 0} onChange={(e) => handlePartChange(part, 'width', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-height`} className="text-xs">Height (mm)</Label>
            <Input id={`${part}-height`} name="height" type="number" value={data.height || 0} onChange={(e) => handlePartChange(part, 'height', e.target.value)} className="h-8" />
          </div>
           <div className="space-y-1">
            <Label htmlFor={`${part}-color`} className="text-xs">Color</Label>
            <Input id={`${part}-color`} name="color" type="color" value={data.color || '#000000'} onChange={(e) => handlePartChange(part, 'color', e.target.value)} className="h-8 p-1" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-fontSize`} className="text-xs">Size (pt)</Label>
            <Input id={`${part}-fontSize`} name="fontSize" type="number" value={data.fontSize || 12} onChange={(e) => handlePartChange(part, 'fontSize', e.target.value)} className="h-8" />
          </div>
           <div className="flex items-center space-x-2 pt-5 sm:col-span-6">
            <Checkbox id={`${part}-bold`} checked={data.isBold || false} onCheckedChange={(checked) => handlePartChange(part, 'isBold', checked as boolean)} />
            <Label htmlFor={`${part}-bold`} className="text-xs font-normal">Bold</Label>
          </div>
        </div>
      </div>
    );
  }

  const renderTextPartEditor = (part: 'label' | 'value') => {
    const data = field[part];
    if (!data) return null;
    const title = part.charAt(0).toUpperCase() + part.slice(1);
    const isValuePart = part === 'value';

    return (
      <div className="flex-1 px-4 py-2">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
          <div className="space-y-1 sm:col-span-6">
            <Label htmlFor={`${part}-text`} className="text-xs">Text</Label>
            <Input 
              id={`${part}-text`} 
              name="text"
              className="h-8"
              value={data.text || ''} 
              onChange={(e) => handlePartChange(part, 'text', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-x`} className="text-xs">X (mm)</Label>
            <Input id={`${part}-x`} name="x" type="number" value={data.x || 0} onChange={(e) => handlePartChange(part, 'x', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-y`} className="text-xs">Y (mm)</Label>
            <Input id={`${part}-y`} name="y" type="number" value={data.y || 0} onChange={(e) => handlePartChange(part, 'y', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-width`} className="text-xs">Width (mm)</Label>
            <Input id={`${part}-width`} name="width" type="number" value={data.width || 0} onChange={(e) => handlePartChange(part, 'width', e.target.value)} className="h-8" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-height`} className="text-xs">Height (mm)</Label>
            <Input id={`${part}-height`} name="height" type="number" value={data.height || 0} onChange={(e) => handlePartChange(part, 'height', e.target.value)} className="h-8" />
          </div>
           <div className="space-y-1">
            <Label htmlFor={`${part}-color`} className="text-xs">Color</Label>
            <Input id={`${part}-color`} name="color" type="color" value={data.color || '#000000'} onChange={(e) => handlePartChange(part, 'color', e.target.value)} className="h-8 p-1" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${part}-fontSize`} className="text-xs">Size (pt)</Label>
            <Input id={`${part}-fontSize`} name="fontSize" type="number" value={data.fontSize || 12} onChange={(e) => handlePartChange(part, 'fontSize', e.target.value)} className="h-8" />
          </div>
           <div className="flex items-center space-x-2 pt-5 sm:col-span-6">
            <Checkbox id={`${part}-bold`} checked={data.isBold || false} onCheckedChange={(checked) => handlePartChange(part, 'isBold', checked as boolean)} />
            <Label htmlFor={`${part}-bold`} className="text-xs font-normal">Bold</Label>
          </div>
        </div>
        {isValuePart && (
            <div className='mt-4 border-t pt-4'>
                <Label className='text-xs font-medium'>Input Type</Label>
                <RadioGroup 
                    value={data.inputType || 'text'} 
                    onValueChange={(value) => handlePartChange(part, 'inputType', value)}
                    className='flex items-center gap-4 mt-2'
                >
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='text' id='type-text' />
                        <Label htmlFor='type-text' className='font-normal'>Text Input</Label>
                    </div>
                     <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='dropdown' id='type-dropdown' />
                        <Label htmlFor='type-dropdown' className='font-normal'>Dropdown</Label>
                    </div>
                </RadioGroup>

                {data.inputType === 'dropdown' && (
                    <div className='mt-4 space-y-2'>
                        <Label htmlFor='dropdown-options' className='text-xs'>Dropdown Options (one per line)</Label>
                        <Textarea
                            id='dropdown-options'
                            value={(data.options || []).join('\n')}
                            onChange={(e) => handlePartChange(part, 'options', e.target.value)}
                            placeholder='Option 1\nOption 2\nOption 3'
                            className='text-sm'
                        />
                    </div>
                )}
            </div>
        )}
      </div>
    );
  }

  const renderImagePartEditor = () => {
    const data = field.placeholder;
    if (!data) return null;

    return (
      <div className="flex-1 px-4 py-2">
        <h3 className="font-semibold mb-2">Image Placeholder</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                <div className="space-y-1">
                    <Label htmlFor="image-x" className="text-xs">X (mm)</Label>
                    <Input id="image-x" name="x" type="number" value={data.x || 0} onChange={(e) => handlePartChange('placeholder', 'x', e.target.value)} className="h-8" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="image-y" className="text-xs">Y (mm)</Label>
                    <Input id="image-y" name="y" type="number" value={data.y || 0} onChange={(e) => handlePartChange('placeholder', 'y', e.target.value)} className="h-8" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="image-width" className="text-xs">Width (mm)</Label>
                    <Input id="image-width" name="width" type="number" value={data.width || 0} onChange={(e) => handlePartChange('placeholder', 'width', e.target.value)} className="h-8" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="image-height" className="text-xs">Height (mm)</Label>
                    <Input id="image-height" name="height" type="number" value={data.height || 0} onChange={(e) => handlePartChange('placeholder', 'height', e.target.value)} className="h-8" />
                </div>
            </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full md:border-0 md:shadow-none">
       <div className='p-4 border-b hidden md:block'>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Editing Field: <span className="font-mono bg-muted px-2 py-1 rounded-md">{field.fieldId}</span>
                  {isProtected && <Lock className="h-4 w-4 text-primary" />}
                </h2>
                <Button variant="ghost" size='icon' className='h-8 w-8' onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
             <div className='mt-4'>
                 <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="fieldId" className="text-sm font-medium">Field ID (for data linking)</Label>
                    {isProtected && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 text-[10px] h-5">
                        <Lock size={10} /> System Mandatory
                      </Badge>
                    )}
                 </div>
                 <Input 
                   id="fieldId"
                   value={field.fieldId}
                   onChange={handleFieldIdChange}
                   className="font-mono mt-1 h-9"
                   disabled={field.fieldType === 'staticText' || isProtected}
                 />
                 {isProtected && (
                   <p className="text-[10px] text-muted-foreground mt-1.5 italic font-medium">
                     This field is required for database indexing and report search. It cannot be renamed.
                   </p>
                 )}
             </div>
        </div>

        <div className='p-4 border-b block md:hidden'>
            <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="fieldId-mobile">Field ID (for data linking)</Label>
                {isProtected && <Badge variant="secondary" className="text-[10px] h-5">Mandatory</Badge>}
            </div>
            <Input 
              id="fieldId-mobile"
              value={field.fieldId}
              onChange={handleFieldIdChange}
              className="font-mono mt-1"
              disabled={field.fieldType === 'staticText' || isProtected}
            />
        </div>

        <div className="flex flex-col lg:divide-y">
            {field.fieldType === 'text' ? (
            <>
                {renderTextPartEditor('label')}
                {renderTextPartEditor('value')}
            </>
            ) : field.fieldType === 'staticText' ? (
              renderStaticTextEditor('label')
            ) : (
            renderImagePartEditor()
            )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t mt-auto">
            <Button variant="outline" size="sm" onClick={onClose}>
                <X className="mr-2 h-4 w-4" /> Close
            </Button>
            {isProtected ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-not-allowed">
                      <Button variant="destructive" size="sm" disabled className="opacity-50">
                          <Lock className="mr-2 h-4 w-4" /> Mandatory Field
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mandatory filtering fields cannot be deleted or renamed to maintain database search integrity.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button variant="destructive" size="sm" onClick={() => onDelete(field.id)}>
                  <Trash className="mr-2 h-4 w-4" /> Delete Field
              </Button>
            )}
        </div>
    </Card>
  );
};
