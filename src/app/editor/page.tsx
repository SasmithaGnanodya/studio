
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Home } from 'lucide-react';
import Link from 'next/link';
import { DraggableField } from '@/components/DraggableField';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initialLayout } from '@/lib/initialReportState';
import type { FieldLayout } from '@/lib/types';

// Approximate conversion factor
const PX_TO_MM = 210 / 800; // A4 width in mm / approx pixel width

export default function EditorPage() {
  const [fields, setFields] = useState<FieldLayout[]>(initialLayout);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    if (user && firestore) {
      const fetchLayout = async () => {
        const layoutDocRef = doc(firestore, `layouts/${user.uid}`);
        const layoutDoc = await getDoc(layoutDocRef);
        if (layoutDoc.exists()) {
          setFields(layoutDoc.data().fields as FieldLayout[]);
        }
      };
      fetchLayout();
    }
  }, [user, firestore]);

  const updateFieldPosition = useCallback((id: string, x: number, y: number) => {
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === id ? { ...field, x: x * PX_TO_MM, y: y * PX_TO_MM } : field
      )
    );
  }, []);
  
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
        const layoutDocRef = doc(firestore, `layouts/${user.uid}`);
        await setDoc(layoutDocRef, { fields });
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Layout Editor</h2>
            <div className="flex items-center gap-2">
                <Link href="/" passHref>
                    <Button variant="outline"><Home className="mr-2 h-4 w-4" /> Go to Form</Button>
                </Link>
                <Button onClick={handleSaveLayout}><Save className="mr-2 h-4 w-4" /> Save Layout</Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex-1 rounded-lg bg-white shadow-sm overflow-auto p-4">
          <div className="preview-mode relative" style={{ height: '1131px' /* A4 height at ~96DPI */ }}>
            <div 
                className="report-page"
                style={{
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    height: '100%',
                    width: '100%'
                }}
            >
              {fields.map(field => (
                <DraggableField
                  key={field.id}
                  id={field.id}
                  label={field.label}
                  x={field.x / PX_TO_MM}
                  y={field.y / PX_TO_MM}
                  width={field.width / PX_TO_MM}
                  height={field.height / PX_TO_MM}
                  onDragStop={updateFieldPosition}
                  className={field.className}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
