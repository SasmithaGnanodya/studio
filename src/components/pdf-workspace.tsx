"use client";

import { useState, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { DraggableInputField } from './draggable-input-field';
import type { Field } from '@/app/page';
import { Loader2, UploadCloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type PdfWorkspaceProps = {
  pdfFile: File | null;
  fields: Field[];
  selectedFieldId: string | null;
  onFieldAdd: (page: number, x: number, y: number) => void;
  onFieldChange: (id: string, newProps: Partial<Field>) => void;
  onFieldSelect: (id: string | null) => void;
  onPdfLoadSuccess: (data: { images: string[], dimensions: {width: number, height: number}[] }) => void;
};

export function PdfWorkspace({
  pdfFile,
  fields,
  selectedFieldId,
  onFieldAdd,
  onFieldChange,
  onFieldSelect,
  onPdfLoadSuccess,
}: PdfWorkspaceProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDocumentLoadSuccess = useCallback(async (pdf: PDFDocumentProxy) => {
    setIsLoading(true);
    setNumPages(pdf.numPages);
    const images: string[] = [];
    const dimensions: {width: number, height: number}[] = [];
    
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        dimensions.push({width: viewport.width, height: viewport.height});

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          images.push(canvas.toDataURL('image/png'));
        }
      }
      onPdfLoadSuccess({images, dimensions});
    } catch (error) {
      console.error("Failed to render PDF pages:", error);
      toast({
        title: "PDF Render Error",
        description: "Could not render the PDF pages. The file might be corrupted or unsupported.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onPdfLoadSuccess, toast]);

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if ((e.target as HTMLElement).closest('.draggable-field')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onFieldAdd(pageNumber, x, y);
  };

  const memoizedDocument = useMemo(() => (
    <Document
      file={pdfFile}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={(error) => {
        toast({
          title: "PDF Load Error",
          description: error.message,
          variant: "destructive",
        })
      }}
      loading={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading PDF...</span></div>}
      error="Failed to load PDF file."
      className="flex flex-col items-center"
    >
      {isLoading && Array.from(new Array(numPages || 0), (el, index) => (
        <Skeleton key={`skeleton-${index}`} className="w-full max-w-4xl aspect-[8.5/11] mb-4" />
      ))}
      {!isLoading && Array.from(new Array(numPages || 0), (el, index) => (
        <div
          key={`page-wrapper-${index + 1}`}
          className="relative mb-4 shadow-lg mx-auto"
          onClick={(e) => {
            e.stopPropagation();
            handlePageClick(e, index + 1);
          }}
        >
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
          {fields.filter(f => f.page === index + 1).map(field => (
            <DraggableInputField
              key={field.id}
              field={field}
              onUpdate={onFieldChange}
              onSelect={onFieldSelect}
              isSelected={selectedFieldId === field.id}
            />
          ))}
        </div>
      ))}
    </Document>
  ), [pdfFile, onDocumentLoadSuccess, isLoading, numPages, fields, selectedFieldId, onFieldChange, onFieldSelect, toast]);

  if (!pdfFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed">
        <UploadCloud className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Upload a PDF</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start by uploading your PDF template using the panel on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-muted/20 p-4 rounded-lg" onClick={() => onFieldSelect(null)}>
      {memoizedDocument}
    </div>
  );
}
