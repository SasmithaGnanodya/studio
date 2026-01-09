
"use client";

import { useState, useEffect, useMemo, use } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Wrench, Save, User as UserIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { ReportPage } from '@/components/ReportPage';
import { initialReportState, initialLayout } from '@/lib/initialReportState';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, limit } from 'firebase/firestore';
import type { FieldLayout, FieldPart, ImageData, Report, LayoutDocument } from '@/lib/types';
import { DataForm } from '@/components/DataForm';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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
  const [reportCreator, setReportCreator] = useState<string | null>(null);
  const [reportData, setReportData] = useState(initialReportState);
  const [layout, setLayout] = useState<FieldLayout[]>(initialLayout);
  const [layoutVersion, setLayoutVersion] = useState<number | null>(null);
  const [currentReportLayoutId, setCurrentReportLayoutId] = useState<string | null>(null);
  const [latestLayoutId, setLatestLayoutId] = useState<string | null>(null);
  const [isLatestLayout, setIsLatestLayout] = useState(true);
  const [isPreview, setIsPreview] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const resolvedParams = use(params);
  const vehicleId = decodeURIComponent(resolvedParams.vehicleId);

  // Set document title for printing
  useEffect(() => {
    if (vehicleId) {
      document.title = vehicleId;
    }
    return () => {
      document.title = 'FormFlow PDF Filler';
    };
  }, [vehicleId]);

  // Combined fetch logic for layout and report
  useEffect(() => {
    if (!user || !firestore) return;

    const fetchLayoutById = async (layoutId: string) => {
        if (!firestore) return null;
        const layoutDocRef = doc(firestore, 'layouts', layoutId);
        const layoutDoc = await getDoc(layoutDocRef);
        if (layoutDoc.exists()) {
            const data = layoutDoc.data() as LayoutDocument;
            if (data.fields && Array.isArray(data.fields)) {
                const validatedFields = data.fields.map((f: any) => ({
                    ...f,
                    fieldType: f.fieldType || 'text',
                    label: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.label) : ({} as FieldPart),
                    value: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.value) : ({} as FieldPart),
                    placeholder: f.fieldType === 'image' ? validateAndCleanFieldPart(f.placeholder) : undefined,
                }));
                setLayout(validatedFields as FieldLayout[]);
                setLayoutVersion(data.version);
            }
        }
    };
    
    const fetchReportData = async () => {
      // 1. Get the latest layout configuration first
      const configRef = doc(firestore, 'layouts', 'config');
      const configSnap = await getDoc(configRef);
      const latestId = configSnap.exists() ? configSnap.data().currentId : null;
      setLatestLayoutId(latestId);

      // 2. Check for an existing report
      const reportsRef = collection(firestore, `reports`);
      const q = query(reportsRef, where('vehicleId', '==', vehicleId), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) { // Existing report found
        const reportDoc = querySnapshot.docs[0];
        const report = reportDoc.data() as Report;
        
        setReportId(reportDoc.id);
        setReportData({ ...initialReportState, ...report.reportData, regNumber: vehicleId });
        setReportCreator(report.userName || null);

        const reportLayoutId = report.layoutId;
        setCurrentReportLayoutId(reportLayoutId);
        setIsLatestLayout(reportLayoutId === latestId);
        
        // Ensure we have a layoutId before trying to fetch it.
        // Fallback to latestId if the report doesn't have one.
        if (reportLayoutId) {
            await fetchLayoutById(reportLayoutId);
        } else if (latestId) {
            await fetchLayoutById(latestId);
        }
        
        toast({
          title: "Report Loaded",
          description: `Loaded existing report for ${vehicleId}.`,
        });
      } else { // This is a new report
        setReportId(null);
        setReportCreator(user.displayName);
        setReportData({ ...initialReportState, regNumber: vehicleId });
        setIsLatestLayout(true);
        
        if (latestId) {
            await fetchLayoutById(latestId); // Use the LATEST layout for new reports
            setCurrentReportLayoutId(latestId);
        }
        
        toast({
          title: "New Report",
          description: `Creating a new report for ${vehicleId}.`,
        });
      }
    };

    fetchReportData();

  }, [user, firestore, vehicleId, toast]);


  const fetchLayoutById = async (layoutId: string) => {
    if (!firestore || !layoutId) return null; // Added guard for layoutId
    const layoutDocRef = doc(firestore, 'layouts', layoutId);
    const layoutDoc = await getDoc(layoutDocRef);
    if (layoutDoc.exists()) {
      const data = layoutDoc.data() as LayoutDocument;
      if (data.fields && Array.isArray(data.fields)) {
        const validatedFields = data.fields.map((f: any) => ({
          ...f,
          fieldType: f.fieldType || 'text',
          label: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.label) : ({} as FieldPart),
          value: f.fieldType !== 'image' ? validateAndCleanFieldPart(f.value) : ({} as FieldPart),
          placeholder: f.fieldType === 'image' ? validateAndCleanFieldPart(f.placeholder) : undefined,
        }));
        setLayout(validatedFields as FieldLayout[]);
        setLayoutVersion(data.version);
        return data;
      }
    }
    return null;
  }

  const handleDataChange = (name: string, value: string | ImageData) => {
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveReport = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save.' });
      return;
    }

    if (!currentReportLayoutId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not determine layout version for saving.' });
      return;
    }

    try {
      const reportToSave = { ...reportData };

      if (reportId) { // Existing report, update it
        const reportRef = doc(firestore, 'reports', reportId);
        await updateDoc(reportRef, {
          reportData: reportToSave,
          updatedAt: serverTimestamp(),
          layoutId: currentReportLayoutId, // Persist the potentially upgraded layout ID
        });
        toast({ title: 'Report Updated', description: 'Your changes have been saved.' });
      } else { // New report, create it
        const reportsRef = collection(firestore, 'reports');
        const newReportRef = doc(reportsRef);
        await setDoc(newReportRef, {
          id: newReportRef.id,
          vehicleId,
          userId: user.uid,
          userName: user.displayName,
          reportData: reportToSave,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          layoutId: currentReportLayoutId, // Link to the layout version being used
        });
        setReportId(newReportRef.id);
        setReportCreator(user.displayName);
        toast({ title: 'Report Saved', description: 'New report has been saved successfully.' });
      }
    } catch (error) {
      console.error("Error saving report: ", error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the report.' });
    }
  };

  const handleUpgradeLayout = async () => {
    if (latestLayoutId) {
        await fetchLayoutById(latestLayoutId);
        setCurrentReportLayoutId(latestLayoutId); // Set the current layout to the latest one
        setIsLatestLayout(true);
        toast({
            title: "Layout Upgraded",
            description: "Now using the latest layout. Don't forget to save the report to persist this change."
        });
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
        value: String(value), // Ensure value is a string
        x: field.value.x,
        y: field.value.y,
        width: field.value.width,
        height: field.value.height,
        isBold: field.value.isBold,
        color: field.value.color,
        fontSize: field.value.fontSize,
      };
    });

    const imageValues = layout.filter(f => f.fieldType === 'image' && f.placeholder).map(field => {
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
      <main className="flex flex-1 flex-col lg:flex-row gap-4 p-4 lg:gap-6 lg:p-6 no-print">
        <div className="w-full lg:w-1/3 xl:w-1/4 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-20">
            <Card className="hidden lg:block h-full">
                <CardHeader>
                    <CardTitle>Report Data</CardTitle>
                    <CardDescription>
                        Vehicle No: <span className='font-semibold text-primary'>{vehicleId}</span>
                    </CardDescription>
                     {reportCreator && (
                        <CardDescription className="flex items-center gap-2 pt-2">
                           <UserIcon size={14} className="text-muted-foreground" />
                           Created by: <span className='font-semibold'>{reportCreator}</span>
                        </CardDescription>
                    )}
                     {layoutVersion !== null && (
                        <CardDescription className="flex items-center gap-2 pt-2">
                           Layout Version: <span className={`font-semibold ${isLatestLayout ? 'text-green-600' : 'text-amber-600'}`}>{layoutVersion}</span>
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="pt-0">
                    <DataForm layout={layout} data={reportData} onDataChange={handleDataChange} />
                </CardContent>
            </Card>
            <div className="block lg:hidden">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className='bg-card px-4 rounded-t-lg'>
                             <CardHeader className="p-0 text-left">
                                <CardTitle>Report Data</CardTitle>
                                <CardDescription>
                                    Vehicle No: <span className='font-semibold text-primary'>{vehicleId}</span>
                                </CardDescription>
                                {reportCreator && (
                                    <CardDescription className="flex items-center gap-2 pt-2">
                                       <UserIcon size={14} className="text-muted-foreground" />
                                       Created by: <span className='font-semibold'>{reportCreator}</span>
                                    </CardDescription>
                                )}
                                {layoutVersion !== null && (
                                    <CardDescription className="flex items-center gap-2 pt-2">
                                    Layout Version: <span className={`font-semibold ${isLatestLayout ? 'text-green-600' : 'text-amber-600'}`}>{layoutVersion}</span>
                                    </CardDescription>
                                )}
                            </CardHeader>
                        </AccordionTrigger>
                        <AccordionContent className='bg-card p-4 rounded-b-lg'>
                            <DataForm layout={layout} data={reportData} onDataChange={handleDataChange} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4 self-start">
                <div className="flex items-center space-x-2">
                  <Switch id="preview-mode" checked={isPreview} onCheckedChange={setIsPreview} />
                  <Label htmlFor="preview-mode" className="flex items-center gap-2"><Eye size={16}/> Preview</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="calibration-mode" checked={isCalibrating} onCheckedChange={setIsCalibrating} />
                  <Label htmlFor="calibration-mode" className="flex items-center gap-2"><Wrench size={16}/> Calibrate</Label>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                 {!isLatestLayout && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Upgrade Layout</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to upgrade?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will apply the latest layout to this report. Fields may shift, and new fields may be added. You should review the report carefully after upgrading. This action cannot be undone until you save the report.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUpgradeLayout}>Upgrade</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 )}
                <Button onClick={handleSaveReport}><Save className="mr-2 h-4 w-4" /> Save Report</Button>
                <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print to PDF</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex-1 rounded-lg bg-white shadow-sm overflow-auto p-4">
            <div className={`relative mx-auto w-fit ${isPreview ? "preview-mode" : ""}`}>
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

    

    

    