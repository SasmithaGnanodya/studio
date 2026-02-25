"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, X, Lock, Unlock, Palette, Type, PlusCircle, AlertTriangle, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type EditorSidebarProps = {
  field: FieldLayout;
  onUpdate: (id: string, updates: Partial<FieldLayout>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  availableFieldIds?: string[];
};

const PROTECTED_FIELDS = ['regNumber', 'engineNumber', 'chassisNumber', 'reportNumber', 'date'];

export const EditorSidebar = ({ field, onUpdate, onDelete, onClose, availableFieldIds = [] }: EditorSidebarProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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
      
      const newPart = { ...currentPart, [property]: processedValue };
      onUpdate(field.id, { [part]: newPart });
  };
  
  const updateOptions = (part: 'label' | 'value', options: string[], weights?: Record<string, number>) => {
    const currentPart = field[part];
    if (!currentPart) return;
    onUpdate(field.id, {
      [part]: {
        ...currentPart,
        options,
        optionWeights: weights && Object.keys(weights).length > 0 ? weights : undefined
      }
    });
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

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Alignment</Label>
              <div className="flex bg-muted/20 p-1 rounded-md w-fit">
                <Button 
                  variant={data.textAlign === 'left' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePartChange(part, 'textAlign', 'left')}
                >
                  <AlignLeft size={14} />
                </Button>
                <Button 
                  variant={data.textAlign === 'center' || !data.textAlign ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePartChange(part, 'textAlign', 'center')}
                >
                  <AlignCenter size={14} />
                </Button>
                <Button 
                  variant={data.textAlign === 'right' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePartChange(part, 'textAlign', 'right')}
                >
                  <AlignRight size={14} />
                </Button>
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
              <Label htmlFor={`${part}-text`} className="text-[10px] uppercase font-bold text-muted-foreground">
                {isValuePart ? 'Default Value' : 'Label Text'}
              </Label>
              <Input 
                id={`${part}-text`}
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

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Alignment</Label>
              <div className="flex bg-muted/20 p-1 rounded-md w-fit">
                <Button 
                  variant={data.textAlign === 'left' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePartChange(part, 'textAlign', 'left')}
                >
                  <AlignLeft size={14} />
                </Button>
                <Button 
                  variant={data.textAlign === 'center' || !data.textAlign ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePartChange(part, 'textAlign', 'center')}
                >
                  <AlignCenter size={14} />
                </Button>
                <Button 
                  variant={data.textAlign === 'right' ? 'secondary' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handlePartChange(part, 'textAlign', 'right')}
                >
                  <AlignRight size={14} />
                </Button>
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
                  <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='combobox' id='type-combobox' />
                      <Label htmlFor='type-combobox' className='font-bold text-xs cursor-pointer'>Suggestions</Label>
                  </div>
              </RadioGroup>
              
              <div className="flex items-center space-x-2 pt-2 border-t mt-2">
                <Checkbox 
                  id={`${field.id}-price-format`}
                  checked={data.isPriceFormat || false}
                  onCheckedChange={(checked) => handlePartChange(part, 'isPriceFormat', checked as boolean)}
                />
                <Label htmlFor={`${field.id}-price-format`} className="text-xs font-bold cursor-pointer">Price Format (1,000.00)</Label>
              </div>
            </div>

            {(data.inputType === 'dropdown' || data.inputType === 'combobox') && (
              <div className='space-y-3 animate-in slide-in-from-top-1'>
                  <div className="flex items-center justify-between">
                    <Label className='text-[10px] font-bold'>Menu Selections</Label>
                    <Badge variant="secondary" className="text-[8px] uppercase tracking-tighter">
                      {data.inputType === 'dropdown' ? 'Technical Scoring' : 'Word Bank'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {(data.options || []).map((opt, index) => (
                      <div key={index} className="flex gap-1.5 items-center">
                        <Input 
                          placeholder={data.inputType === 'combobox' ? "Sentence..." : "Name"} 
                          value={opt} 
                          className="h-8 text-[10px] flex-1"
                          onChange={(e) => {
                            const newOptions = [...(data.options || [])];
                            const oldName = newOptions[index];
                            const newName = e.target.value;
                            newOptions[index] = newName;
                            
                            const newWeights = { ...(data.optionWeights || {}) };
                            if (oldName && newWeights[oldName] !== undefined) {
                              newWeights[newName] = newWeights[oldName];
                              delete newWeights[oldName];
                            }
                            updateOptions(part, newOptions, newWeights);
                          }}
                        />
                        {data.inputType === 'dropdown' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Input 
                                  placeholder="Val" 
                                  type="number"
                                  value={data.optionWeights?.[opt] ?? ''} 
                                  className="h-8 w-14 text-[10px] bg-primary/5 border-primary/20 focus:ring-1 focus:ring-primary"
                                  onChange={(e) => {
                                    const newWeights = { ...(data.optionWeights || {}) };
                                    const val = parseFloat(e.target.value);
                                    if (isNaN(val)) delete newWeights[opt];
                                    else newWeights[opt] = val;
                                    updateOptions(part, data.options || [], newWeights);
                                  }}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-primary text-primary-foreground">
                                <p className="text-[10px] font-bold">Valuation Code Calculation Value</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0" 
                          onClick={() => {
                            const newOptions = (data.options || []).filter((_, i) => i !== index);
                            const newWeights = { ...(data.optionWeights || {}) };
                            delete newWeights[opt];
                            updateOptions(part, newOptions, newWeights);
                          }}
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-[10px] h-8 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
                      onClick={() => {
                        const newOptions = [...(data.options || []), `New ${data.inputType === 'combobox' ? 'Sentence' : 'Option'} ${(data.options?.length || 0) + 1}`];
                        updateOptions(part, newOptions, data.optionWeights);
                      }}
                    >
                      <PlusCircle className="mr-2 h-3.5 w-3.5" /> Add New Row
                    </Button>
                  </div>
                  
                  <p className="text-[9px] text-muted-foreground italic leading-tight">
                    {data.inputType === 'dropdown' 
                      ? "Values used for Valuation Code (9th digit). Example: Selecting an option with Val '1' puts '1' in the 9th position."
                      : "Add pre-defined words or sentences that will appear as suggestions while typing."
                    }
                  </p>
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
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => {
                      setDeleteConfirmText("");
                      setIsDeleteDialogOpen(true);
                    }} 
                    className="text-[10px] font-black uppercase tracking-widest h-9 px-4"
                  >
                    <Trash className="mr-2 h-3.5 w-3.5" /> Delete
                  </Button>
                  <AlertDialogContent className="border-2 border-destructive/20 shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Structural Integrity Warning
                      </AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-4">
                          <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-lg">
                            <p className="font-bold text-destructive text-sm leading-tight">
                              "If you Delete some option without asking developer system may be crash"
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground italic">
                            Deleting layout fields can break database indexing logic and historical report rendering.
                          </p>
                          <div className="space-y-2 mt-4 text-left">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground">Type "delete" to confirm</Label>
                            <Input 
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value.toLowerCase())}
                              placeholder="Type word here..."
                              className="border-destructive/30 focus:border-destructive h-10 bg-background"
                            />
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                      <AlertDialogCancel className="font-bold">Cancel Action</AlertDialogCancel>
                      <Button 
                        variant="destructive" 
                        className="font-black"
                        disabled={deleteConfirmText !== 'delete'}
                        onClick={() => {
                          onDelete(field.id);
                          setIsDeleteDialogOpen(false);
                        }}
                      >
                        I Understand, Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
