
// src/components/DataForm.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldLayout, ImageData } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageAdjustmentControl } from './ImageAdjustmentControl';

type DataFormProps = {
  layout: FieldLayout[];
  data: any;
  onDataChange: (name: string, value: string | ImageData) => void;
};

export const DataForm = ({ layout, data, onDataChange }: DataFormProps) => {
  const renderedFieldIds = new Set<string>();

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-6 p-1">
        {layout.map((field) => {
          if (renderedFieldIds.has(field.fieldId)) {
            return null;
          }
          renderedFieldIds.add(field.fieldId);
          
          const labelText = field.fieldType === 'text' ? field.label.text : field.fieldId;
          const inputType = field.fieldType === 'image' ? 'image' : field.value.inputType || 'text';


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
                       {(field.value.options || []).map(option => (
                         <SelectItem key={option} value={option}>{option}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                ) : inputType === 'image' ? (
                  <ImageAdjustmentControl
                    value={data[field.fieldId] || { url: '', scale: 1, x: 0, y: 0 }}
                    onChange={(value) => onDataChange(field.fieldId, value)}
                  />
                ) : (
                  <Input
                    id={field.fieldId}
                    name={field.fieldId}
                    value={data[field.fieldId] || ''}
                    onChange={(e) => onDataChange(e.target.name, e.target.value)}
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
