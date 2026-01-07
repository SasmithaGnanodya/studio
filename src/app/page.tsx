"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { PdfWorkspace } from '@/components/pdf-workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, PlusCircle, Trash2, Upload } from 'lucide-react';
import { usePDF } from '@react-pdf/renderer';
import { GeneratedPdfDocument } from '@/components/generated-pdf-document';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

export type Field = {
  id: string;
  page: number;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  value: string;
};

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number}[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const [instance, updateInstance] = usePDF({
    document: (
      <GeneratedPdfDocument 
        pageImages={pageImages}
        pageDimensions={pageDimensions}
        fields={fields}
      />
    ),
  });

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

  const selectedField = fields.find(f => f.id === selectedFieldId);

  useEffect(() => {
    updateInstance();
  }, [fields, pageImages, pageDimensions, updateInstance]);


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
          
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PlusCircle className="h-5 w-5" />
                <span>2. Add & Edit Fields</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">Click on the PDF preview to add an input field. Select a field to edit its content here.</p>
              {selectedField ? (
                <div className="space-y-2">
                  <Label htmlFor="field-content">Selected Field Content</Label>
                  <Textarea
                    id="field-content"
                    className="min-h-[100px]"
                    value={selectedField.value}
                    onChange={(e) => updateField(selectedField.id, { value: e.target.value })}
                  />
                  <Button variant="destructive" size="sm" onClick={() => deleteField(selectedField.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Field
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic border rounded-lg p-4 text-center">No field selected.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-5 w-5" />
                <span>3. Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={instance.url ?? '#'}
                download={`filled-${pdfFile?.name || 'document.pdf'}`}
                className={`w-full ${!instance.url || instance.loading ? 'pointer-events-none' : ''}`}
              >
                <Button 
                  className="w-full" 
                  disabled={!pdfFile || instance.loading || !pageImages.length}
                >
                  {instance.loading ? 'Generating...' : 'Download Filled PDF'}
                </Button>
              </a>
              {instance.error && <p className="mt-2 text-sm text-destructive">Error: {instance.error}</p>}
            </CardContent>
          </Card>
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
