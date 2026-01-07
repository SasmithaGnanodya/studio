
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Home, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { DraggableField } from '@/components/DraggableField';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initialLayout, initialReportState } from '@/lib/initialReportState';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { EditorSidebar } from '@/components/EditorSidebar';
import { ReportPage } from '@/components/ReportPage';

// Standard DPI for screen, used for mm to px conversion
const DPI = 96;
const INCH_PER_MM = 0.0393701;
const MM_TO_PX = (mm: number) => mm * INCH_PER_MM * DPI;
const PX_TO_MM = (px: number) => px / (INCH_PER_MM * DPI);

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
          const validatedFields = data.fields.map((f: any) => ({
            ...f,
            label: f.label || { text: 'Label', x: 10, y: 10, width: 50, height: 5, className: '' },
            value: f.value || { text: f.fieldId, x: 10, y: 20, width: 50, height: 5, className: '' }
          }));
          setFields(validatedFields as FieldLayout[]);
        }
      };
      fetchLayout();
    }
  }, [user, firestore]);

  const updateFieldPartPosition = useCallback((fieldId: string, part: 'label' | 'value', xInPx: number, yInPx: number) => {
    setFields(prevFields =>
      prevFields.map(field => {
        if (field.id === fieldId) {
          return {
            ...field,
            [part]: {
              ...field[part],
              x: PX_TO_MM(xInPx),
              y: PX_TO_MM(yInPx),
            }
          };
        }
        return field;
      })
    );
  }, []);
  
  const updateFieldPartSize = useCallback((fieldId: string, part: 'label' | 'value', widthInPx: number, heightInPx: number) => {
    setFields(prevFields =>
      prevFields.map(field => {
        if (field.id === fieldId) {
          return {
            ...field,
            [part]: {
              ...field[part],
              width: PX_TO_MM(widthInPx),
              height: PX_TO_MM(heightInPx),
            }
          };
        }
        return field;
      })
    );
  }, []);

  const handleSelectField = (id: string) => {
    const baseId = id.replace(/-(label|value)$/, '');
    setSelectedFieldId(baseId);
  };
  
  const handleAddNewField = () => {
    const newId = `field_${Date.now()}`;
    const newField: FieldLayout = {
      id: newId,
      fieldId: 'newField',
      label: { text: 'New Label', x: 10, y: 10, width: 50, height: 5, className: '' },
      value: { text: 'newField', x: 10, y: 20, width: 50, height: 5, className: '' },
    };
    setFields(prev => [...prev, newField]);
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
        // Create a deep copy and clean the data for Firestore
        const cleanedFields = JSON.parse(JSON.stringify(fields)).map((field: FieldLayout) => {
          if (typeof field.label.className === 'undefined') {
            field.label.className = '';
          }
          if (typeof field.value.className === 'undefined') {
            field.value.className = '';
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
  
  const { staticLabels, valuePlaceholders } = useMemo(() => {
    const staticLabels = fields.map(field => ({
      id: `label-${field.id}`,
      value: field.label.text,
      x: field.label.x,
      y: field.label.y,
      width: field.label.width,
      height: field.label.height,
      className: field.label.className
    }));

    const valuePlaceholders = fields.map(field => {
      const value = initialReportState[field.fieldId as keyof typeof initialReportState] || `[${field.fieldId}]`;
      return {
        id: `value-${field.id}`,
        value: value,
        x: field.value.x,
        y: field.value.y,
        width: field.value.width,
        height: field.value.height,
        className: field.value.className
      };
    });

    return { staticLabels, valuePlaceholders };
  }, [fields]);

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 flex flex-row gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex-1 flex flex-col gap-4">
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Layout Editor</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleAddNewField}><PlusCircle className="mr-2 h-4 w-4" /> Add Field</Button>
                    <Link href="/" passHref>
                        <Button variant="outline"><Home className="mr-2 h-4 w-4" /> Go to Form</Button>
                    </Link>
                    <Button onClick={handleSaveLayout}><Save className="mr-2 h-4 w-4" /> Save Layout</Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex-1 rounded-lg bg-white shadow-sm overflow-auto p-4">
              <div className="relative mx-auto preview-mode">
                  <ReportPage staticLabels={staticLabels} dynamicValues={valuePlaceholders} isCalibrating={true} />
                  
                  {/* Draggable handles for labels */}
                  {fields.map(field => (
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
                    />
                  ))}

                   {/* Draggable handles for values */}
                   {fields.map(field => (
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
                  ))}
              </div>
            </div>
        </div>
        
        {selectedField && (
          <EditorSidebar 
            field={selectedField}
            onUpdate={handleUpdateField}
            onDelete={handleDeleteField}
            onClose={() => setSelectedFieldId(null)}
          />
        )}
      </main>
    </div>
  );
}

    