
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, X, PlusCircle } from 'lucide-react';
import type { FieldLayout, SubField } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

type EditorSidebarProps = {
  field: FieldLayout;
  onUpdate: (id: string, updates: Partial<FieldLayout>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export const EditorSidebar = ({ field, onUpdate, onDelete, onClose }: EditorSidebarProps) => {

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate(field.id, { [name]: name === 'width' || name === 'height' ? parseFloat(value) : value });
  };
  
  const handleSubFieldChange = (subFieldIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newSubFields = [...field.subFields];
    const numericValue = (name === 'x' || name === 'y' || name === 'width' || name === 'height') ? parseFloat(value) : value;
    (newSubFields[subFieldIndex] as any)[name] = numericValue;
    onUpdate(field.id, { subFields: newSubFields });
  };

  const handleAddSubField = () => {
    const newSubField: SubField = {
      id: `${field.id}_sub_${Date.now()}`,
      label: 'New Sub-field',
      x: 0,
      y: (field.subFields.length * 5), // Position new field below last one
      width: field.width,
      height: 5,
    };
    onUpdate(field.id, { subFields: [...field.subFields, newSubField] });
  };
  
  const handleDeleteSubField = (subFieldIndex: number) => {
    const newSubFields = field.subFields.filter((_, index) => index !== subFieldIndex);
    onUpdate(field.id, { subFields: newSubFields });
  };

  return (
    <Card className="w-full md:w-1/3 lg:w-1/4 h-fit sticky top-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Edit Field</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6">
            {/* Parent Field Editor */}
            <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Main Container</h4>
                <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input id="label" name="label" value={field.label} onChange={handleParentChange} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="width">Width (mm)</Label>
                        <Input id="width" name="width" type="number" value={field.width} onChange={handleParentChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="height">Height (mm)</Label>
                        <Input id="height" name="height" type="number" value={field.height} onChange={handleParentChange} />
                    </div>
                </div>
            </div>
            
            {/* Sub-fields Editor */}
            <div className="space-y-2">
                <h4 className="font-medium">Sub-fields</h4>
                 {field.subFields.map((sub, index) => (
                    <div key={index} className="space-y-4 p-3 border rounded-md relative">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="absolute top-1 right-1 h-6 w-6"
                         onClick={() => handleDeleteSubField(index)}
                        >
                           <Trash className="h-3 w-3 text-red-500"/>
                        </Button>

                       <div className="space-y-2">
                           <Label htmlFor={`sub-id-${index}`}>Field ID</Label>
                           <Input id={`sub-id-${index}`} name="id" value={sub.id} onChange={(e) => handleSubFieldChange(index, e)} />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor={`sub-label-${index}`}>Label</Label>
                           <Input id={`sub-label-${index}`} name="label" value={sub.label} onChange={(e) => handleSubFieldChange(index, e)} />
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                           <div className="space-y-2">
                               <Label htmlFor={`sub-x-${index}`}>X (mm)</Label>
                               <Input id={`sub-x-${index}`} name="x" type="number" value={sub.x} onChange={(e) => handleSubFieldChange(index, e)} />
                           </div>
                           <div className="space-y-2">
                               <Label htmlFor={`sub-y-${index}`}>Y (mm)</Label>
                               <Input id={`sub-y-${index}`} name="y" type="number" value={sub.y} onChange={(e) => handleSubFieldChange(index, e)} />
                           </div>
                           <div className="space-y-2">
                               <Label htmlFor={`sub-width-${index}`}>Width (mm)</Label>
                               <Input id={`sub-width-${index}`} name="width" type="number" value={sub.width} onChange={(e) => handleSubFieldChange(index, e)} />
                           </div>
                           <div className="space-y-2">
                               <Label htmlFor={`sub-height-${index}`}>Height (mm)</Label>
                               <Input id={`sub-height-${index}`} name="height" type="number" value={sub.height} onChange={(e) => handleSubFieldChange(index, e)} />
                           </div>
                       </div>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={handleAddSubField} className="w-full mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Sub-field
                </Button>
            </div>

            {/* Actions */}
            <div className="pt-4">
                 <Button variant="destructive" onClick={() => onDelete(field.id)} className="w-full">
                    <Trash className="mr-2 h-4 w-4" /> Delete Field
                </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
