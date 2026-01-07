
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Wrench, Edit } from 'lucide-react';
import { ReportPage } from '@/components/ReportPage';
import { initialReportState, initialLayout } from '@/lib/initialReportState';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { FieldLayout, FieldPart } from '@/lib/types';
import { DataForm } from '@/components/DataForm';

const validateAndCleanFieldPart = (part: any): FieldPart => {
  const defaults: FieldPart = {
    text: '',
    x: 0,
    y: 0,
    width: 50,
    height: 5,
    isBold: false,
    color: '#000000',
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
    inputType: part.inputType || 'text',
    options: part.options || []
  };
};

export default function Home() {
  const [reportData, setReportData] = useState(initialReportState);
  const [layout, setLayout] = useState<FieldLayout[]>(initialLayout);
  const [isPreview, setIsPreview] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const { firestore, user } = useFirebase();

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
              label: validateAndCleanFieldPart(f.label),
              value: validateAndCleanFieldPart(f.value)
            }));
            setLayout(validatedFields as FieldLayout[]);
          }
        }
      };
      fetchLayout();
    } else {
      setLayout(initialLayout);
    }
  }, [user, firestore]);

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setReportData(prev => ({...prev, [name]: value}));
  }

  const handlePrint = () => {
    window.print();
  };

  const { staticLabels, dynamicValues } = useMemo(() => {
    const staticLabels = layout.map(field => ({
      id: `label-${field.id}`,
      value: field.label.text,
      x: field.label.x,
      y: field.label.y,
      width: field.label.width,
      height: field.label.height,
      isBold: field.label.isBold,
      color: field.label.color,
    }));

    const dynamicValues = layout.map(field => {
      const value = reportData[field.fieldId as keyof typeof reportData] || '';
      return {
        id: `value-${field.id}`,
        value: value,
        x: field.value.x,
        y: field.value.y,
        width: field.value.width,
        height: field.value.height,
        isBold: field.value.isBold,
        color: field.value.color,
      };
    });

    return { staticLabels, dynamicValues };
  }, [layout, reportData]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4 lg:gap-6 lg:p-6 no-print">
        <Card className="w-full md:w-1/3 lg:w-1/4 h-fit sticky top-6">
            <CardContent className="pt-6">
                <DataForm layout={layout} data={reportData} onChange={handleDataChange} onSelectChange={handleSelectChange} />
            </CardContent>
        </Card>
        
        <div className="flex-1 flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch id="preview-mode" checked={isPreview} onCheckedChange={setIsPreview} />
                  <Label htmlFor="preview-mode" className="flex items-center gap-2"><Eye size={16}/> Preview</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="calibration-mode" checked={isCalibrating} onCheckedChange={setIsCalibrating} />
                  <Label htmlFor="calibration-mode" className="flex items-center gap-2"><Wrench size={16}/> Calibrate</Label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/editor" passHref>
                  <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Layout</Button>
                </Link>
                <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print to PDF</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex-1 rounded-lg bg-white shadow-sm overflow-auto p-4">
            <div className={isPreview ? "preview-mode" : ""}>
               <ReportPage staticLabels={staticLabels} dynamicValues={dynamicValues} isCalibrating={isCalibrating} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Print-only view */}
      <div className="hidden print-view">
        <ReportPage staticLabels={staticLabels} dynamicValues={dynamicValues} isCalibrating={false} />
      </div>
    </div>
  );
}
