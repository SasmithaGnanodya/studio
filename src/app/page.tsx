"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Field } from '@/types';

const PdfWorkspace = dynamic(() => import('@/components/pdf-workspace').then(mod => mod.PdfWorkspace), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h3 className="mt-4 text-lg font-semibold">Loading PDF Workspace...</h3>
    </div>
  ),
});

const PdfControls = dynamic(() => import('@/components/pdf-controls').then(mod => mod.PdfControls), {
  ssr: false,
  loading: () => (
    <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
      <Card>
        <CardHeader><CardTitle>Loading Controls...</CardTitle></CardHeader>
        <CardContent><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
      </Card>
    </div>
    ),
});


export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setFields([]);
      setPageImages([]);
      setPageDimensions([]);
      setSelectedFieldId(null);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a valid PDF file.",
        variant: "destructive",
      });
      setPdfFile(null);
    }
  };
  
  const addField = (page: number, x: number, y: number) => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      page,
      x,
      y,
      width: 25,
      height: 4,
      value: '',
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };
  
  const updateField = (id: string, newProps: Partial<Field>) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...newProps } : field))
    );
  };
  
  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4 lg:gap-6 lg:p-6">
        <aside className="w-full md:w-80 lg:w-96 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-5 w-5" />
                <span>1. Upload Template</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="pdf-upload" className="sr-only">Upload PDF</Label>
              <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
              {pdfFile && <p className="mt-2 text-sm text-muted-foreground truncate">Loaded: {pdfFile.name}</p>}
            </CardContent>
          </Card>
          
          <PdfControls
            fields={fields}
            selectedFieldId={selectedFieldId}
            updateField={updateField}
            deleteField={deleteField}
            pdfFile={pdfFile}
            pageImages={pageImages}
            pageDimensions={pageDimensions}
          />

        </aside>

        <div className="flex-1 rounded-lg border bg-card shadow-sm p-4 min-h-[600px] md:min-h-0">
          <PdfWorkspace
            pdfFile={pdfFile}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onFieldAdd={addField}
            onFieldChange={updateField}
            onFieldSelect={setSelectedFieldId}
            onPdfLoadSuccess={({images, dimensions}) => {
              setPageImages(images);
              setPageDimensions(dimensions);
            }}
          />
        </div>
      </main>
    </div>
  );
}
