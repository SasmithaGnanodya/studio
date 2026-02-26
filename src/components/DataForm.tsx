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
                  <>
                    <Input
                      id={field.fieldId}
                      list={`list-form-${field.id}`}
                      value={data[field.fieldId] || ''}
                      onChange={(e) => {
                        let val = e.target.value;
                        const oldValue = String(data[field.fieldId] || "");
                        
                        // Accumulate multiple choices separated by comma if an option is picked
                        if (fieldOptions.includes(val) && oldValue !== "" && oldValue !== val && !val.includes(oldValue)) {
                          const existingItems = oldValue.split(',').map(s => s.trim()).filter(Boolean);
                          if (!existingItems.includes(val)) {
                            val = [...existingItems, val].join(', ');
                          } else {
                            val = oldValue;
                          }
                        }
                        onDataChange(field.fieldId, val);
                      }}
                      placeholder="Type or select..."
                    />
                    <datalist id={`list-form-${field.id}`}>
                      {fieldOptions.filter(Boolean).map(opt => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  </>
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
