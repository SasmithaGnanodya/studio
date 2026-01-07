"use client";

import { useEffect } from 'react';
import { usePDF } from '@react-pdf/renderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, PlusCircle, Trash2 } from 'lucide-react';
import { GeneratedPdfDocument } from '@/components/generated-pdf-document';
import type { Field } from '@/types';

type PdfControlsProps = {
  fields: Field[];
  selectedFieldId: string | null;
  updateField: (id: string, newProps: Partial<Field>) => void;
  deleteField: (id: string) => void;
  pdfFile: File | null;
  pageImages: string[];
  pageDimensions: {width: number, height: number}[];
};

export function PdfControls({
  fields,
  selectedFieldId,
  updateField,
  deleteField,
  pdfFile,
  pageImages,
  pageDimensions
}: PdfControlsProps) {

  const [instance, updateInstance] = usePDF({
    document: (
      <GeneratedPdfDocument 
        pageImages={pageImages}
        pageDimensions={pageDimensions}
        fields={fields}
      />
    ),
  });
  
  useEffect(() => {
    updateInstance();
  }, [fields, pageImages, pageDimensions, updateInstance]);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <>
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
    </>
  );
}
