// src/components/DataForm.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldLayout, ImageData } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageAdjustmentControl } from './ImageAdjustmentControl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DataFormProps = {
  layout: FieldLayout[];
  data: any;
  onDataChange: (name: string, value: string | ImageData) => void;
};

export const DataForm = ({ layout, data, onDataChange }: DataFormProps) => {
  const renderedFieldIds = new Set<string>();

  const dataFields = layout.filter(f => f.fieldType === 'text' || f.fieldType === 'image');

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="space-y-6 p-1">
        {dataFields.map((field) => {
          if (renderedFieldIds.has(field.fieldId)) {
            return null;
          }
          renderedFieldIds.add(field.fieldId);
          
          const labelText = field.fieldType === 'text' ? field.label.text : field.fieldId;
          const isDateField = field.fieldId.toLowerCase().includes('date');
          const inputType = field.fieldType === 'image' 
            ? 'image' 
            : (isDateField ? 'date' : (field.value.inputType || 'text'));

          const fieldIdLower = field.fieldId.toLowerCase();
          // Lock system critical technical IDs from manual editing
          const isSystemLocked = 
            fieldIdLower === 'regnumber' || 
            fieldIdLower === 'reportnumber' || 
            fieldIdLower === 'valuationcode' ||
            fieldIdLower.includes('reportnum');

          const fieldOptions = (field.fieldType === 'text' && field.value.options) ? field.value.options : [];

          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.fieldId} className="text-sm font-medium capitalize">
                {labelText.replace(/([A-Z])/g, ' $1').trim()}
              </Label>
              <div>
                {inputType === 'dropdown' ? (
                   <Select
                    value={data[field.fieldId] || ''}
                    onValueChange={(value) => onDataChange(field.fieldId, value)}
                   >
                     <SelectTrigger id={field.fieldId}>
                       <SelectValue placeholder={`Select ${field.label.text}`} />
                     </SelectTrigger>
                     <SelectContent>
                       {fieldOptions.filter(Boolean).map(option => (
                         <SelectItem key={option} value={option}>{option}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                ) : inputType === 'combobox' ? (
                  <div className="space-y-3">
                    <Input
                      id={field.fieldId}
                      value={data[field.fieldId] || ''}
                      onChange={(e) => onDataChange(field.fieldId, e.target.value)}
                      placeholder="Type or select from bank..."
                      disabled={isSystemLocked}
                    />
                    <div className="flex flex-wrap gap-1.5 p-2 bg-muted/20 rounded-lg border border-dashed border-primary/20">
                      {fieldOptions.filter(Boolean).map(opt => {
                        const currentValue = String(data[field.fieldId] || '');
                        const parts = currentValue.split(',').map(s => s.trim()).filter(Boolean);
                        const isActive = parts.includes(opt);
                        
                        return (
                          <Button
                            key={opt}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-7 text-[10px] px-2 font-bold",
                              isActive ? "bg-primary text-primary-foreground" : "border-primary/20"
                            )}
                            onClick={() => {
                              const newParts = [...parts];
                              const index = newParts.indexOf(opt);
                              if (index > -1) newParts.splice(index, 1);
                              else newParts.push(opt);
                              onDataChange(field.fieldId, newParts.join(', '));
                            }}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : inputType === 'image' ? (
                  <ImageAdjustmentControl
                    value={data[field.fieldId] || { url: '', scale: 1, x: 0, y: 0 }}
                    onChange={(value) => onDataChange(field.fieldId, value)}
                    width={field.placeholder?.width}
                    height={field.placeholder?.height}
                  />
                ) : (
                  <Input
                    id={field.fieldId}
                    name={field.fieldId}
                    type={inputType}
                    value={data[field.fieldId] || ''}
                    onChange={(e) => onDataChange(e.target.name, e.target.value)}
                    disabled={isSystemLocked}
                    className={isSystemLocked ? "bg-muted/50 font-mono cursor-not-allowed" : ""}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
