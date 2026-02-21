
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, PlusCircle, Image as ImageIcon, Type, LayoutTemplate, Wand2 } from 'lucide-react';
import { DraggableField } from '@/components/DraggableField';
import { useFirebase } from '@/firebase';
import { doc, getDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { fixedLayout, initialReportState } from '@/lib/initialReportState';
import type { FieldLayout, FieldPart, LayoutDocument } from '@/lib/types';
import { EditorSidebar } from '@/components/EditorSidebar';
import { ReportPage } from '@/components/ReportPage';
import { useRouter } from 'next/navigation';

const DPI = 96;
const INCH_PER_MM = 0.0393701;
const MM_TO_PX = (mm: number) => mm * INCH_PER_MM * DPI;
const PX_TO_MM = (px: number) => px / (INCH_PER_MM * DPI);

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const PROTECTED_FIELDS = ['regNumber', 'engineNumber', 'chassisNumber', 'reportNumber', 'date'];

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
      options: [],
      objectFit: 'cover',
    };
  
    if (typeof part !== 'object' || part === null) {
      return { ...defaults, text: String(part || '') };
    }
  
    return {
      text: part.text ?? defaults.text,
      x: part.x ?? defaults.x,
      y: part.y ?? defaults.y,
      width: part.width ?? defaults.width,
      height: part.height ?? defaults.height,
      isBold: part.isBold ?? defaults.isBold,
      color: part.color ?? defaults.color,
      fontSize: part.fontSize ?? defaults.fontSize,
      inputType: part.inputType ?? defaults.inputType,
      options: Array.isArray(part.options) ? part.options : defaults.options,
      objectFit: part.objectFit ?? defaults.objectFit,
    };
};

export default function EditorPage() {
  const [fields, setFields] = useState<FieldLayout[]>(fixedLayout);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (user && firestore && user.email && ADMIN_EMAILS.includes(user.email)) {
      const fetchLatestLayout = async () => {
        const configRef = doc(firestore, 'layouts', 'config');
        const configSnap = await getDoc(configRef);

        if (configSnap.exists()) {
            const currentLayoutId = configSnap.data().currentId;
            if (currentLayoutId) {
                const layoutDocRef = doc(firestore, 'layouts', currentLayoutId);
                const layoutDoc = await getDoc(layoutDocRef);
                if (layoutDoc.exists()) {
                    const data = layoutDoc.data() as LayoutDocument;
                     if (data.fields && Array.isArray(data.fields)) {
                        const validatedFields = data.fields.map((f: any) => ({
                          ...f,
                          fieldType: f.fieldType || 'text',
                          label: f.fieldType === 'image' ? ({} as FieldPart) : validateAndCleanFieldPart(f.label),
                          value: f.fieldType === 'text' ? validateAndCleanFieldPart(f.value) : ({} as FieldPart),
                          placeholder: f.fieldType === 'image' ? validateAndCleanFieldPart(f.placeholder) : undefined,
                        }));
                        setFields(validatedFields as FieldLayout[]);
                      }
                }
            }
        }
      };
      fetchLatestLayout();
    }
  }, [user, firestore]);

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
  
  const handleAddNewField = (type: 'text' | 'image' | 'staticText' | 'wordConverter') => {
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
    } else if (type === 'wordConverter') {
      const newField: FieldLayout = {
        id: newId,
        fieldId: 'valueInWords',
        fieldType: 'text',
        label: { text: 'In Words:', x: 10, y: 30, width: 35, height: 5, isBold: false, color: '#000000', fontSize: 9 },
        value: { text: 'valueInWords', x: 45, y: 30, width: 140, height: 10, isBold: false, color: '#000000', inputType: 'text', options: [], fontSize: 10 },
        autoFillType: 'numberToWords',
        autoFillSource: 'marketValueNum'
      };
      setFields(prev => [...prev, newField]);
    } else if (type === 'image') {
       const newImageField: FieldLayout = {
        id: newId,
        fieldId: 'newImage',
        fieldType: 'image',
        placeholder: { text: 'newImage', x: 10, y: 150, width: 90, height: 60, color: '#0000FF', objectFit: 'cover' },
        label: {} as any,
        value: {} as any,
      };
      setFields(prev => [...prev, newImageField]);
    } else if (type === 'staticText') {
      const newStaticField: FieldLayout = {
        id: newId,
        fieldId: `static_${newId}`,
        fieldType: 'staticText',
        label: { text: 'Static Text', x: 10, y: 50, width: 80, height: 10, isBold: true, color: '#000000', fontSize: 16 },
        value: {} as any,
      };
      setFields(prev => [...prev, newStaticField]);
    }
    setSelectedFieldId(newId);
  }

  const handleUpdateField = useCallback((id: string, updates: Partial<FieldLayout>) => {
    setFields(prev => prev.map(f => {
      if (f.id === id) {
        // PROTECTION: Prevent renaming mandatory field IDs
        if (updates.fieldId && PROTECTED_FIELDS.includes(f.fieldId) && updates.fieldId !== f.fieldId) {
          return f;
        }
        return { ...f, ...updates };
      }
      return f;
    }));
  }, []);
  
  const handleDeleteField = (id: string) => {
    const fieldToDelete = fields.find(f => f.id === id);
    if (!fieldToDelete) return;

    // PROTECTION: Prevent deleting locked or system mandatory fields
    const isSystemMandatory = PROTECTED_FIELDS.includes(fieldToDelete.fieldId);
    if (fieldToDelete.isLocked || isSystemMandatory) {
        toast({
            variant: "destructive",
            title: "Action Restricted",
            description: isSystemMandatory 
              ? `The mandatory field '${fieldToDelete.fieldId}' is required for database indexing. It cannot be deleted.`
              : "This field is locked. Unlock it in the sidebar to delete it.",
        });
        return;
    }

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

    const sanitizedFields = JSON.parse(JSON.stringify(fields)).map((field: any) => {
        if (field.fieldType === 'image') {
            delete field.label;
            delete field.value;
        } else if (field.fieldType === 'text') {
            delete field.placeholder;
        } else if (field.fieldType === 'staticText') {
            delete field.value;
            delete field.placeholder;
        }
        return field;
    });

    try {
        await runTransaction(firestore, async (transaction) => {
            const configRef = doc(firestore, 'layouts', 'config');
            const configSnap = await transaction.get(configRef);
            
            let currentVersion = 0;
            if (configSnap.exists()) {
                currentVersion = configSnap.data().version || 0;
            }
            const newVersion = currentVersion + 1;

            const newLayoutRef = doc(collection(firestore, 'layouts'));
            const newLayoutData = {
                id: newLayoutRef.id,
                fields: sanitizedFields,
                version: newVersion,
                createdAt: serverTimestamp(),
            };

            transaction.set(newLayoutRef, newLayoutData);
            transaction.set(configRef, { 
                version: newVersion,
                currentId: newLayoutRef.id 
            }, { merge: true });

            toast({
                title: "Layout Updated",
                description: `Master layout (v${newVersion}) has been saved and applied system-wide.`,
            });
        });
    } catch (error) {
        console.error("Error saving layout: ", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the layout. Check permissions.",
        });
    }
  };
  
  const { staticLabels, valuePlaceholders, imagePlaceholders } = useMemo(() => {
    const staticLabels = fields.filter(f => f.fieldType === 'text' || f.fieldType === 'staticText').map(field => ({
      id: `label-${field.id}`,
      fieldId: field.fieldId,
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
        fieldId: field.fieldId,
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
      const imageUrl = "https://placehold.co/600x400?text=Image";
      return {
        id: `image-${field.id}`,
        fieldId: field.fieldId,
        value: { url: imageUrl, scale: 1, x: 0, y: 0 },
        x: field.placeholder!.x,
        y: field.placeholder!.y,
        width: field.placeholder!.width,
        height: field.placeholder!.height,
      };
    });

    return { staticLabels, valuePlaceholders, imagePlaceholders };
  }, [fields]);

  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  const availableFieldIds = useMemo(() => {
    return Array.from(new Set(fields.filter(f => f.fieldType === 'text').map(f => f.fieldId)));
  }, [fields]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutTemplate className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Master Template Editor</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddNewField('text')}><PlusCircle className="mr-2 h-4 w-4" /> Add Field</Button>
                <Button variant="outline" size="sm" onClick={() => handleAddNewField('staticText')}><Type className="mr-2 h-4 w-4" /> Add Text</Button>
                <Button variant="outline" size="sm" onClick={() => handleAddNewField('image')}><ImageIcon className="mr-2 h-4 w-4" /> Add Photo</Button>
                <Button variant="outline" size="sm" onClick={() => handleAddNewField('wordConverter')} className="text-primary border-primary/20 hover:bg-primary/5">
                  <Wand2 className="mr-2 h-4 w-4" /> Add Word Converter
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button size="sm" onClick={handleSaveLayout}><Save className="mr-2 h-4 w-4" /> Save Master Layout</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-6 relative min-h-[600px]">
          {/* Editor Sidebar */}
          <div className="w-full lg:w-96 shrink-0 h-fit lg:sticky lg:top-24">
            {selectedField ? (
                <EditorSidebar 
                  field={selectedField}
                  onUpdate={handleUpdateField}
                  onDelete={handleDeleteField}
                  onClose={() => setSelectedFieldId(null)}
                  availableFieldIds={availableFieldIds}
                />
            ) : (
                <Card className="p-6 text-center border-dashed">
                  <p className="text-sm text-muted-foreground">Select a field on the canvas to edit its properties.</p>
                </Card>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 rounded-lg bg-white shadow-2xl overflow-auto p-8 border border-muted ring-1 ring-black/5">
            <div className="relative mx-auto w-fit preview-mode">
                <ReportPage 
                  staticLabels={staticLabels} 
                  dynamicValues={valuePlaceholders} 
                  imageValues={imagePlaceholders} 
                />
                
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

                {fields.filter(f => f.fieldType === 'staticText').map(field => (
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
                    borderColor='orange'
                  />
                ))}

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
                    isImage={true}
                  />
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
