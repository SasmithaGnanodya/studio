
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Home, PlusCircle, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { DraggableField } from '@/components/DraggableField';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initialLayout, initialReportState } from '@/lib/initialReportState';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { EditorSidebar } from '@/components/EditorSidebar';
import { ReportPage } from '@/components/ReportPage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Standard DPI for screen, used for mm to px conversion
const DPI = 96;
const INCH_PER_MM = 0.0393701;
const MM_TO_PX = (mm: number) => mm * INCH_PER_MM * DPI;
const PX_TO_MM = (px: number) => px / (INCH_PER_MM * DPI);

const validateAndCleanFieldPart = (part: any): FieldPart => {
  const defaults: FieldPart = {
    text: '',
    x: 0,
    y: 0,
    width: 50,
    height: 5,
    isBold: false,
    color: '#000000',
    fontSize: 12,
    inputType: 'text',
    options: []
  };

  if (typeof part !== 'object' || part === null) {
    return { ...defaults, text: String(part || '') };
  }

  return {
    text: part.text || '',
    x: part.x || 0,
    y: part.y || 0,
    width: part.width || 50,
    height: part.height || 5,
    isBold: part.isBold || false,
    color: part.color || '#000000',
    fontSize: part.fontSize || 12,
    inputType: part.inputType || 'text',
    options: part.options || []
  };
};


export default function EditorPage() {
  const [fields, setFields] = useState<FieldLayout[]>(initialLayout);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  // Fetch layout from Firestore on component mount
  useEffect(() => {
    if (user && firestore) {
      const fetchLayout = async () => {
        const layoutDocRef = doc(firestore, `layouts/${user.uid}`);
        const layoutDoc = await getDoc(layoutDocRef);
        if (layoutDoc.exists()) {
          const data = layoutDoc.data();
          if (data.fields && Array.isArray(data.fields)) {
            const validatedFields = data.fields.map((f: any) => ({
              ...f,
              fieldType: f.fieldType || 'text', // Default to text for old data
              label: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.label) : ({} as FieldPart),
              value: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.value) : ({} as FieldPart),
              placeholder: f.fieldType === 'image' ? validateAndCleanFieldPart(f.placeholder) : undefined,
            }));
            setFields(validatedFields as FieldLayout[]);
          }
        }
      };
      fetchLayout();
    }
  }, [user, firestore]);

  const updateFieldPosition = useCallback((id: string, xInPx: number, yInPx: number) => {
      setFields(prev => prev.map(f => {
          if (f.id === id) {
              if (f.fieldType === 'image' && f.placeholder) {
                  return { ...f, placeholder: { ...f.placeholder, x: PX_TO_MM(xInPx), y: PX_TO_MM(yInPx) } };
              }
          }
          return f;
      }));
  }, []);

  const updateFieldSize = useCallback((id: string, widthInPx: number, heightInPx: number) => {
      setFields(prev => prev.map(f => {
          if (f.id === id) {
              if (f.fieldType === 'image' && f.placeholder) {
                  return { ...f, placeholder: { ...f.placeholder, width: PX_TO_MM(widthInPx), height: PX_TO_MM(heightInPx) } };
              }
          }
          return f;
      }));
  }, []);


  const updateFieldPartPosition = useCallback((fieldId: string, part: 'label' | 'value' | 'placeholder', xInPx: number, yInPx: number) => {
    setFields(prevFields =>
      prevFields.map(field => {
        if (field.id === fieldId) {
            const fieldToUpdate = (field as any)[part];
            if (fieldToUpdate) {
                return {
                    ...field,
                    [part]: {
                        ...fieldToUpdate,
                        x: PX_TO_MM(xInPx),
                        y: PX_TO_MM(yInPx),
                    }
                };
            }
        }
        return field;
      })
    );
  }, []);
  
  const updateFieldPartSize = useCallback((fieldId: string, part: 'label' | 'value' | 'placeholder', widthInPx: number, heightInPx: number) => {
    setFields(prevFields =>
      prevFields.map(field => {
        if (field.id === fieldId) {
            const fieldToUpdate = (field as any)[part];
             if (fieldToUpdate) {
                return {
                    ...field,
                    [part]: {
                    ...fieldToUpdate,
                    width: PX_TO_MM(widthInPx),
                    height: PX_TO_MM(heightInPx),
                    }
                };
            }
        }
        return field;
      })
    );
  }, []);

  const handleSelectField = (id: string) => {
    const baseId = id.replace(/-(label|value|placeholder)$/, '');
    setSelectedFieldId(baseId);
  };
  
  const handleAddNewField = (type: 'text' | 'image') => {
    const newId = `${type}_${Date.now()}`;
    if (type === 'text') {
      const newField: FieldLayout = {
        id: newId,
        fieldId: 'newField',
        fieldType: 'text',
        label: { text: 'New Label', x: 10, y: 10, width: 50, height: 5, isBold: false, color: '#000000', fontSize: 12 },
        value: { text: 'newField', x: 10, y: 20, width: 50, height: 5, isBold: false, color: '#000000', inputType: 'text', options: [], fontSize: 12 },
      };
      setFields(prev => [...prev, newField]);
    } else { // image
       const newImageField: FieldLayout = {
        id: newId,
        fieldId: 'newImage',
        fieldType: 'image',
        placeholder: { text: 'newImage', x: 10, y: 150, width: 90, height: 60, color: '#0000FF' },
        // These are not used but required by the type, can be empty objects
        label: {} as any,
        value: {} as any,
      };
      setFields(prev => [...prev, newImageField]);
    }
    setSelectedFieldId(newId);
  }

  const handleUpdateField = useCallback((id: string, updates: Partial<FieldLayout>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);
  
  const handleDeleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const handleSaveLayout = async () => {
    if (!user || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to save the layout.",
        });
        return;
    }

    try {
        const cleanedFields = JSON.parse(JSON.stringify(fields)).map((field: FieldLayout) => {
          if (field.fieldType === 'text') {
            if (typeof field.label === 'object' && field.label !== null) {
              field.label.isBold = field.label.isBold || false;
              field.label.color = field.label.color || '#000000';
              field.label.fontSize = field.label.fontSize || 12;
            }
            if (typeof field.value === 'object' && field.value !== null) {
              field.value.isBold = field.value.isBold || false;
              field.value.color = field.value.color || '#000000';
              field.value.inputType = field.value.inputType || 'text';
              field.value.options = field.value.options || [];
              field.value.fontSize = field.value.fontSize || 12;
            }
          } else if (field.fieldType === 'image') {
            // No specific cleaning needed for image fields yet unless new properties are added
          }
          return field;
        });

        const layoutDocRef = doc(firestore, `layouts/${user.uid}`);
        await setDoc(layoutDocRef, { fields: cleanedFields });
        
        toast({
            title: "Layout Saved",
            description: "Your field layout has been saved successfully.",
        });
    } catch (error) {
        console.error("Error saving layout: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the layout. Please try again.",
        });
    }
  };
  
  const { staticLabels, valuePlaceholders, imagePlaceholders } = useMemo(() => {
    const staticLabels = fields.filter(f => f.fieldType === 'text').map(field => ({
      id: `label-${field.id}`,
      value: field.label.text,
      x: field.label.x,
      y: field.label.y,
      width: field.label.width,
      height: field.label.height,
      isBold: field.label.isBold,
      color: field.label.color,
      fontSize: field.label.fontSize,
    }));

    const valuePlaceholders = fields.filter(f => f.fieldType === 'text').map(field => {
      const value = initialReportState[field.fieldId as keyof typeof initialReportState] || `[${field.fieldId}]`;
      return {
        id: `value-${field.id}`,
        value: value,
        x: field.value.x,
        y: field.value.y,
        width: field.value.width,
        height: field.value.height,
        isBold: field.value.isBold,
        color: field.value.color,
        fontSize: field.value.fontSize,
      };
    });

    const imagePlaceholders = fields.filter(f => f.fieldType === 'image' && f.placeholder).map(field => {
      const imageUrl = initialReportState[field.fieldId] || "https://placehold.co/600x400?text=Image";
      return {
        id: `image-${field.id}`,
        value: imageUrl, // URL
        x: field.placeholder!.x,
        y: field.placeholder!.y,
        width: field.placeholder!.width,
        height: field.placeholder!.height,
      };
    });

    return { staticLabels, valuePlaceholders, imagePlaceholders };
  }, [fields]);

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card>
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-semibold self-start">Layout Editor</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" onClick={() => handleAddNewField('text')}><PlusCircle className="mr-2 h-4 w-4" /> Add Text Field</Button>
                <Button variant="outline" onClick={() => handleAddNewField('image')}><ImageIcon className="mr-2 h-4 w-4" /> Add Image</Button>
                <Link href="/" passHref>
                    <Button variant="outline"><Home className="mr-2 h-4 w-4" /> Go to Form</Button>
                </Link>
                <Button onClick={handleSaveLayout}><Save className="mr-2 h-4 w-4" /> Save Layout</Button>
            </div>
          </CardContent>
        </Card>
        
        {selectedField && (
          <div className='block md:hidden'>
             <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="bg-card px-6">
                       <h2 className="text-lg font-semibold">Editing Field: <span className="font-mono bg-muted px-2 py-1 rounded-md">{selectedField.fieldId}</span></h2>
                    </AccordionTrigger>
                    <AccordionContent className='bg-card'>
                        <EditorSidebar 
                            field={selectedField}
                            onUpdate={handleUpdateField}
                            onDelete={handleDeleteField}
                            onClose={() => setSelectedFieldId(null)}
                         />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </div>
        )}
        <div className='hidden md:block'>
          {selectedField && (
            <EditorSidebar 
              field={selectedField}
              onUpdate={handleUpdateField}
              onDelete={handleDeleteField}
              onClose={() => setSelectedFieldId(null)}
            />
          )}
        </div>
        
        <div className="flex-1 rounded-lg bg-white shadow-sm overflow-auto p-4">
          <div className="relative mx-auto w-fit">
              <ReportPage 
                staticLabels={staticLabels} 
                dynamicValues={valuePlaceholders} 
                imageValues={imagePlaceholders} 
                isCalibrating={true} 
              />
              
              {/* Draggable handles for text fields */}
              {fields.filter(f => f.fieldType === 'text').flatMap(field => [
                <DraggableField
                  key={`label-drag-${field.id}`}
                  id={`${field.id}-label`}
                  x={MM_TO_PX(field.label.x)}
                  y={MM_TO_PX(field.label.y)}
                  width={MM_TO_PX(field.label.width)}
                  height={MM_TO_PX(field.label.height)}
                  onDragStop={(id, x, y) => updateFieldPartPosition(field.id, 'label', x, y)}
                  onResizeStop={(id, w, h) => updateFieldPartSize(field.id, 'label', w, h)}
                  onClick={handleSelectField}
                  isSelected={field.id === selectedFieldId}
                  borderColor='blue'
                />,
                <DraggableField
                  key={`value-drag-${field.id}`}
                  id={`${field.id}-value`}
                  x={MM_TO_PX(field.value.x)}
                  y={MM_TO_PX(field.value.y)}
                  width={MM_TO_PX(field.value.width)}
                  height={MM_TO_PX(field.value.height)}
                  onDragStop={(id, x, y) => updateFieldPartPosition(field.id, 'value', x, y)}
                  onResizeStop={(id, w, h) => updateFieldPartSize(field.id, 'value', w, h)}
                  onClick={handleSelectField}
                  isSelected={field.id === selectedFieldId}
                  borderColor='green'
                />
              ])}

               {/* Draggable handles for images */}
               {fields.filter(f => f.fieldType === 'image' && f.placeholder).map(field => (
                <DraggableField
                  key={`image-drag-${field.id}`}
                  id={field.id}
                  x={MM_TO_PX(field.placeholder!.x)}
                  y={MM_TO_PX(field.placeholder!.y)}
                  width={MM_TO_PX(field.placeholder!.width)}
                  height={MM_TO_PX(field.placeholder!.height)}
                  onDragStop={(id, x, y) => updateFieldPartPosition(field.id, 'placeholder', x, y)}
                  onResizeStop={(id, w, h) => updateFieldPartSize(field.id, 'placeholder', w, h)}
                  onClick={handleSelectField}
                  isSelected={field.id === selectedFieldId}
                  borderColor='purple'
                />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}

    