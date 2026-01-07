
// src/components/DataForm.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FieldLayout } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

type DataFormProps = {
  layout: FieldLayout[];
  data: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
};

export const DataForm = ({ layout, data, onChange, onSelectChange }: DataFormProps) => {
  // Create a set of unique fieldIds to avoid rendering duplicate inputs
  const renderedFieldIds = new Set<string>();

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-1">
        {layout.map((field) => {
          // Ensure we haven't already rendered an input for this fieldId
          if (renderedFieldIds.has(field.fieldId)) {
            return null;
          }
          renderedFieldIds.add(field.fieldId);

          const inputType = field.value.inputType || 'text';

          return (
            <div key={field.id} className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor={field.fieldId} className="text-sm font-medium text-right">
                {field.label.text}
              </Label>
              <div className="col-span-2">
                {inputType === 'dropdown' ? (
                   <Select
                    value={data[field.fieldId] || ''}
                    onValueChange={(value) => onSelectChange(field.fieldId, value)}
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
                ) : (
                  <Input
                    id={field.fieldId}
                    name={field.fieldId}
                    value={data[field.fieldId] || ''}
                    onChange={onChange}
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
