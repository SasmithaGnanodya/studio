
"use client";

import { useState, useEffect, useMemo, use } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Wrench, Edit, Save } from 'lucide-react';
import { ReportPage } from '@/components/ReportPage';
import { initialReportState, initialLayout } from '@/lib/initialReportState';
import Link from 'next/link';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, limit } from 'firebase/firestore';
import type { FieldLayout, FieldPart, ImageData, Report } from '@/lib/types';
import { DataForm } from '@/components/DataForm';
import { useToast } from '@/hooks/use-toast';

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
    objectFit: 'cover'
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
    options: part.options || [],
    objectFit: part.objectFit || 'cover'
  };
};

export default function ReportBuilderPage({ params }: { params: { vehicleId: string } }) {
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportData, setReportData] = useState(initialReportState);
  const [layout, setLayout] = useState<FieldLayout[]>(initialLayout);
  const [isPreview, setIsPreview] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const { vehicleId: encodedVehicleId } = use(params);
  const vehicleId = decodeURIComponent(encodedVehicleId);

  // Fetch layout and report data
  useEffect(() => {
    if (!user || !firestore) return;

    // Fetch Layout
    const fetchLayout = async () => {
      const layoutDocRef = doc(firestore, `layouts/${user.uid}`);
      const layoutDoc = await getDoc(layoutDocRef);
      if (layoutDoc.exists()) {
        const data = layoutDoc.data();
         if (data.fields && Array.isArray(data.fields)) {
          const validatedFields = data.fields.map((f: any) => ({
            ...f,
            fieldType: f.fieldType || 'text',
            label: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.label) : ({} as FieldPart),
            value: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.value) : ({} as FieldPart),
            placeholder: f.fieldType === 'image' ? validateAndCleanFieldPart(f.placeholder) : undefined,
          }));
          setLayout(validatedFields as FieldLayout[]);
        }
      }
    };

    // Fetch Report Data
    const fetchReportData = async () => {
        const reportsRef = collection(firestore, `reports`);
        const q = query(reportsRef, where('vehicleId', '==', vehicleId), where('userId', '==', user.uid), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const reportDoc = querySnapshot.docs[0];
            const report = reportDoc.data() as Omit<Report, 'id'>;
            setReportId(reportDoc.id);
            setReportData({ ...initialReportState, ...report.reportData, regNumber: vehicleId });
            toast({
                title: "Report Loaded",
                description: `Loaded existing report for ${vehicleId}.`,
            });
        } else {
            setReportId(null); // Explicitly a new report
            setReportData({ ...initialReportState, regNumber: vehicleId });
            toast({
                title: "New Report",
                description: `Creating a new report for ${vehicleId}.`,
            });
        }
    };
    
    fetchLayout();
    fetchReportData();
  }, [user, firestore, vehicleId, toast]);

  const handleDataChange = (name: string, value: string | ImageData) => {
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveReport = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
      return;
    }

    try {
      const reportToSave = { ...reportData };
      
      if (reportId) { // Existing report, update it
        const reportRef = doc(firestore, 'reports', reportId);
        await updateDoc(reportRef, {
          reportData: reportToSave,
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Report Updated', description: 'Your changes have been saved.' });
      } else { // New report, create it
        const reportsRef = collection(firestore, 'reports');
        const newReportRef = doc(reportsRef);
        await setDoc(newReportRef, {
          id: newReportRef.id,
          vehicleId,
          userId: user.uid,
          reportData: reportToSave,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setReportId(newReportRef.id); // Set the new ID so subsequent saves are updates
        toast({ title: 'Report Saved', description: 'New report has been saved successfully.' });
      }
    } catch (error) {
      console.error("Error saving report: ", error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the report.' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const { staticLabels, dynamicValues, imageValues } = useMemo(() => {
    const staticLabels = layout.filter(f => f.fieldType === 'text').map(field => ({
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

    const dynamicValues = layout.filter(f => f.fieldType === 'text').map(field => {
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
        fontSize: field.value.fontSize,
      };
    });

    const imageValues = layout.filter(f => f.fieldType === 'image').map(field => {
        const imageData = reportData[field.fieldId] || { url: '', scale: 1, x: 0, y: 0 };
        return {
            id: `image-${field.id}`,
            value: imageData,
            x: field.placeholder!.x,
            y: field.placeholder!.y,
            width: field.placeholder!.width,
            height: field.placeholder!.height,
            objectFit: field.placeholder!.objectFit
        };
    });

    return { staticLabels, dynamicValues, imageValues };
  }, [layout, reportData]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4 lg:gap-6 lg:p-6 no-print">
        <Card className="w-full md:w-1/3 lg:w-1/4 h-fit sticky top-6">
            <CardHeader>
                <CardTitle>Report Data</CardTitle>
                <CardDescription>
                    Vehicle No: <span className='font-semibold text-primary'>{vehicleId}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <DataForm layout={layout} data={reportData} onDataChange={handleDataChange} />
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
                <Button onClick={handleSaveReport}><Save className="mr-2 h-4 w-4" /> Save Report</Button>
                <Link href="/editor" passHref>
                  <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Layout</Button>
                </Link>
                <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print to PDF</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex-1 rounded-lg bg-white shadow-sm overflow-auto p-4">
            <div className={isPreview ? "preview-mode" : ""}>
               <ReportPage 
                  staticLabels={staticLabels} 
                  dynamicValues={dynamicValues}
                  imageValues={imageValues}
                  isCalibrating={isCalibrating} 
                />
            </div>
          </div>
        </div>
      </main>
      
      {/* Print-only view */}
      <div className="hidden print-view">
         <ReportPage 
            staticLabels={staticLabels} 
            dynamicValues={dynamicValues}
            imageValues={imageValues}
            isCalibrating={false} 
          />
      </div>
    </div>
  );
}
