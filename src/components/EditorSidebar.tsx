
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, X, Lock, Unlock, Palette, Type } from 'lucide-react';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

type EditorSidebarProps = {
  field: FieldLayout;
  onUpdate: (id: string, updates: Partial<FieldLayout>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  availableFieldIds?: string[];
};

const PROTECTED_FIELDS = ['regNumber', 'engineNumber', 'chassisNumber', 'reportNumber', 'date'];

export const EditorSidebar = ({ field, onUpdate, onDelete, onClose, availableFieldIds = [] }: EditorSidebarProps) => {

  const isSystemMandatory = PROTECTED_FIELDS.includes(field.fieldId) || 
                            PROTECTED_FIELDS.some(id => id.toLowerCase() === field.fieldId.toLowerCase().trim());
  
  const isLocked = field.isLocked || isSystemMandatory;

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
    if (!isLocked) {
      onUpdate(field.id, { fieldId: e.target.value });
    }
  }

  const renderStaticTextEditor = (part: 'label') => {
    const data = field[part];
    if (!data) return null;

    return (
      <div className="flex-1 px-4 py-4 space-y-6">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            <Type size={14} /> Text Properties
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${part}-text`} className="text-[10px] uppercase font-bold text-muted-foreground">Display Content</Label>
              <Input 
                id={`${part}-text`} 
                value={data.text || ''} 
                onChange={(e) => handlePartChange(part, 'text', e.target.value)}
                className="h-9 bg-muted/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                  <Palette size={10} /> Color
                </Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={data.color || '#000000'} 
                    onChange={(e) => handlePartChange(part, 'color', e.target.value)}
                    className="w-10 h-9 p-1 bg-muted/20 cursor-pointer"
                  />
                  <Input 
                    value={data.color || '#000000'} 
                    onChange={(e) => handlePartChange(part, 'color', e.target.value)}
                    className="h-9 font-mono text-[10px] bg-muted/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Font Size (pt)</Label>
                <Input 
                  type="number" 
                  value={data.fontSize || 12} 
                  onChange={(e) => handlePartChange(part, 'fontSize', e.target.value)}
                  className="h-9 bg-muted/20"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id={`${part}-bold`} 
                checked={data.isBold || false} 
                onCheckedChange={(checked) => handlePartChange(part, 'isBold', checked as boolean)} 
              />
              <Label htmlFor={`${part}-bold`} className="text-xs font-bold cursor-pointer">Use Bold Styling</Label>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Geometry (mm)</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px]">X Position</Label>
              <Input type="number" value={data.x || 0} onChange={(e) => handlePartChange(part, 'x', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Y Position</Label>
              <Input type="number" value={data.y || 0} onChange={(e) => handlePartChange(part, 'y', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Width</Label>
              <Input type="number" value={data.width || 0} onChange={(e) => handlePartChange(part, 'width', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Height</Label>
              <Input type="number" value={data.height || 0} onChange={(e) => handlePartChange(part, 'height', e.target.value)} className="h-8 bg-muted/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderTextPartEditor = (part: 'label' | 'value') => {
    const data = field[part];
    if (!data) return null;
    const isValuePart = part === 'value';

    return (
      <div className="flex-1 px-4 py-4 space-y-6">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            {isValuePart ? <Type size={14} /> : <Type size={14} />} 
            {isValuePart ? 'Data Configuration' : 'Label Configuration'}
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                {isValuePart ? 'Default Value' : 'Label Text'}
              </Label>
              <Input 
                value={data.text || ''} 
                onChange={(e) => handlePartChange(part, 'text', e.target.value)}
                className="h-9 bg-muted/20"
                placeholder={isValuePart ? "Initial value..." : "Label..."}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Font Size (pt)</Label>
                <Input 
                  type="number" 
                  value={data.fontSize || 12} 
                  onChange={(e) => handlePartChange(part, 'fontSize', e.target.value)}
                  className="h-9 bg-muted/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Color</Label>
                <div className="flex gap-1.5">
                  <Input 
                    type="color" 
                    value={data.color || '#000000'} 
                    onChange={(e) => handlePartChange(part, 'color', e.target.value)}
                    className="w-10 h-9 p-1 bg-muted/20 cursor-pointer shrink-0"
                  />
                  <Input 
                    value={data.color || '#000000'} 
                    onChange={(e) => handlePartChange(part, 'color', e.target.value)}
                    className="h-9 font-mono text-[9px] bg-muted/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox 
                id={`${part}-bold`} 
                checked={data.isBold || false} 
                onCheckedChange={(checked) => handlePartChange(part, 'isBold', checked as boolean)} 
              />
              <Label htmlFor={`${part}-bold`} className="text-xs font-bold cursor-pointer">Bold Style</Label>
            </div>
          </div>
        </div>

        {isValuePart && (
          <div className="pt-4 border-t space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Input Mechanics</Label>
              <RadioGroup 
                  value={data.inputType || 'text'} 
                  onValueChange={(value) => handlePartChange(part, 'inputType', value)}
                  className='flex items-center gap-4 mt-1'
              >
                  <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='text' id='type-text' />
                      <Label htmlFor='type-text' className='font-bold text-xs cursor-pointer'>Text</Label>
                  </div>
                   <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='dropdown' id='type-dropdown' />
                      <Label htmlFor='type-dropdown' className='font-bold text-xs cursor-pointer'>Options</Label>
                  </div>
              </RadioGroup>
            </div>

            {data.inputType === 'dropdown' && (
              <div className='space-y-2 animate-in slide-in-from-top-1'>
                  <Label className='text-[10px] font-bold'>Menu Items (Line by Line)</Label>
                  <Textarea
                      value={(data.options || []).join('\n')}
                      onChange={(e) => handlePartChange(part, 'options', e.target.value)}
                      placeholder={'Option 1\nOption 2...'}
                      className='text-xs min-h-[100px] bg-muted/20 font-mono'
                  />
              </div>
            )}
          </div>
        )}

        <Separator />

        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Coordinates (mm)</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px]">X Pos</Label>
              <Input type="number" value={data.x || 0} onChange={(e) => handlePartChange(part, 'x', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Y Pos</Label>
              <Input type="number" value={data.y || 0} onChange={(e) => handlePartChange(part, 'y', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Width</Label>
              <Input type="number" value={data.width || 0} onChange={(e) => handlePartChange(part, 'width', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Height</Label>
              <Input type="number" value={data.height || 0} onChange={(e) => handlePartChange(part, 'height', e.target.value)} className="h-8 bg-muted/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderImagePartEditor = () => {
    const data = field.placeholder;
    if (!data) return null;

    return (
      <div className="flex-1 px-4 py-4 space-y-6">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            <Type size={14} /> Image Dimensions
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px]">X Position</Label>
              <Input type="number" value={data.x || 0} onChange={(e) => handlePartChange('placeholder', 'x', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Y Position</Label>
              <Input type="number" value={data.y || 0} onChange={(e) => handlePartChange('placeholder', 'y', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Frame Width</Label>
              <Input type="number" value={data.width || 0} onChange={(e) => handlePartChange('placeholder', 'width', e.target.value)} className="h-8 bg-muted/20" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Frame Height</Label>
              <Input type="number" value={data.height || 0} onChange={(e) => handlePartChange('placeholder', 'height', e.target.value)} className="h-8 bg-muted/20" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full md:border-0 md:shadow-none overflow-hidden bg-background h-full flex flex-col border-l border-primary/10">
       <div className='p-4 border-b bg-muted/30'>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tighter flex items-center gap-2">
                  <span className="font-mono bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs">{field.fieldId}</span>
                  {isLocked && <Lock className="h-4 w-4 text-primary" />}
                </h2>
                <Button variant="ghost" size='icon' className='h-8 w-8 hover:bg-destructive/10' onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
             <div className='mt-4 space-y-4'>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor="fieldId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Identifier</Label>
                        {isSystemMandatory && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 text-[8px] h-4 uppercase font-bold">
                            Core Field
                          </Badge>
                        )}
                    </div>
                    <Input 
                        id="fieldId"
                        value={field.fieldId}
                        onChange={handleFieldIdChange}
                        className="font-mono h-9 bg-background shadow-inner"
                        disabled={field.fieldType === 'staticText' || isLocked}
                        placeholder="e.g. marketValue"
                    />
                 </div>

                 <div className="flex items-center space-x-2 bg-primary/5 p-2.5 rounded-md border border-primary/10">
                    <Checkbox 
                        id="lock-field" 
                        checked={field.isLocked || false} 
                        onCheckedChange={(checked) => onUpdate(field.id, { isLocked: checked as boolean })}
                        disabled={isSystemMandatory}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="lock-field" className="text-[11px] font-bold leading-none flex items-center gap-1.5 cursor-pointer">
                            {field.isLocked ? <Lock size={12} className="text-primary" /> : <Unlock size={12} />}
                            Prevent Accidental Changes
                        </Label>
                    </div>
                 </div>
             </div>
        </div>

        <ScrollArea className="flex-1">
            <div className="flex flex-col">
                {field.fieldType === 'text' ? (
                <>
                    {/* Only show label configuration if the label has text */}
                    {field.label.text && renderTextPartEditor('label')}
                    {field.label.text && <Separator />}
                    {renderTextPartEditor('value')}
                </>
                ) : field.fieldType === 'staticText' ? (
                  renderStaticTextEditor('label')
                ) : (
                renderImagePartEditor()
                )}
            </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 p-4 border-t bg-muted/50 mt-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="text-[10px] font-black uppercase tracking-widest h-9 px-4">
                Close
            </Button>
            {!isLocked && (
                <Button variant="destructive" size="sm" onClick={() => onDelete(field.id)} className="text-[10px] font-black uppercase tracking-widest h-9 px-4">
                    <Trash className="mr-2 h-3.5 w-3.5" /> Delete
                </Button>
            )}
            {isLocked && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="cursor-not-allowed">
                                <Button variant="destructive" size="sm" disabled className="opacity-50 text-[10px] font-black uppercase tracking-widest h-9 px-4">
                                    <Lock className="mr-2 h-3.5 w-3.5" /> System Locked
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-[10px] font-bold">{isSystemMandatory ? "Essential for technical indexing." : "Unlock to enable deletion."}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    </Card>
  );
};
