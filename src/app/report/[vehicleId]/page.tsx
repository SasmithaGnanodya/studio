'use client';

import React, { useState, useEffect, useMemo, use, useRef } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, Save, ShieldAlert, Lock, LayoutTemplate, RefreshCw, LogOut, ChevronLeft, Loader2, Copy, Search, X, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { ReportPage } from '@/components/ReportPage';
import { initialReportState, fixedLayout } from '@/lib/initialReportState';
import { useFirebase } from '@/firebase';
import { doc, getDoc, getDocs, collection, query, where, serverTimestamp, runTransaction, setDoc, onSnapshot } from 'firebase/firestore';
import type { ImageData, Report, FieldLayout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { numberToWords, getDayOfYear, cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];

const VEHICLE_CLASSES = [
  "MOTOR CAR",
  "MOTOR LORRY",
  "DUAL PURPOSE",
  "MOTOR CYCLE",
  "MOTOR TRICYCLE",
  "SPECIAL PURPOSE",
  "LAND VEHICLE"
];

function UnauthorizedAccess() {
  const { auth } = useFirebase();
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 shadow-2xl bg-card/50 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-foreground">Access Restricted</CardTitle>
          <CardDescription className="text-base pt-2">
            Your account is not authorized to access this technical environment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="p-4 bg-muted/30 rounded-xl border border-dashed text-sm space-y-3">
             <p className="font-medium text-muted-foreground italic">Contact a system administrator to request authorization for your email address.</p>
             <div className="flex items-center gap-2 pt-2 border-t">
               <Lock size={14} className="text-primary" />
               <span className="text-xs font-bold uppercase tracking-widest text-primary">Security Protocol Active</span>
             </div>
          </div>
          <div className="flex flex-col gap-3">
             <Button asChild variant="outline" className="w-full h-12 font-bold gap-2">
                <Link href="/"><ChevronLeft size={18} /> Back to Dashboard</Link>
             </Button>
             <Button onClick={() => auth.signOut()} variant="ghost" className="w-full text-muted-foreground hover:text-destructive">
                <LogOut size={16} className="mr-2" /> Sign Out
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportBuilderPage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const resolvedParams = use(params);
  const rawVehicleId = decodeURIComponent(resolvedParams.vehicleId);
  const vehicleId = rawVehicleId.toUpperCase().trim();
  const isUnregistered = vehicleId.startsWith('UR-');
  const displayVehicleId = isUnregistered ? 'U/R' : vehicleId;

  const [reportData, setReportData] = useState(initialReportState);
  const [currentLayout, setCurrentLayout] = useState<FieldLayout[]>(fixedLayout);
  const [layoutVersion, setLayoutVersion] = useState<number>(0);
  const [latestLayoutId, setLatestLayoutId] = useState<string | null>(null);
  
  const [isFilling, setIsFilling] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userBranch, setUserBranch] = useState<string>('CDH');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemIsLocked, setSystemIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');

  // Save Confirmation State
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isFinalSaving, setIsFinalSaving] = useState(false);

  // Cloning State
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [isCloneErrorOpen, setIsCloneErrorOpen] = useState(false);
  const [cloneSearchTerm, setCloneSearchTerm] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const isAdmin = useMemo(() => user?.email && ADMIN_EMAILS.includes(user.email), [user]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Technical mapping for the 9th digit of the Valuation Code.
   */
  const getScoreDigit = (score: string, layout: FieldLayout[]) => {
    const scoringField = layout.find(f => f.fieldId === 'conditionScore');
    const selectedOption = score || '';
    const weight = scoringField?.value?.optionWeights?.[selectedOption];
    
    if (weight !== undefined && weight !== null) {
      return String(weight).charAt(0);
    }
    return '5'; // Default technical grade
  };

  useEffect(() => {
    const isIssued = /^[A-Z]{3}\d{9}$/.test(reportData.reportNumber || '');
    if (isIssued) {
      document.title = `${reportData.reportNumber} - ${displayVehicleId}`;
    } else {
      document.title = `Draft - ${displayVehicleId}`;
    }
  }, [reportData.reportNumber, displayVehicleId]);

  useEffect(() => {
    if (!firestore) return;
    const sysRef = doc(firestore, 'config', 'system');
    const unsub = onSnapshot(sysRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSystemIsLocked(data.isLocked || false);
        setLockMessage(data.maintenanceMessage || 'Creation is temporarily disabled.');
      }
    });
    return () => unsub();
  }, [firestore]);

  useEffect(() => {
    if (!isAuthorized || isLoading) return;

    const currentScore = reportData['conditionScore'];
    if (!currentScore || String(currentScore).trim() === '') return;

    const scoreDigit = getScoreDigit(String(currentScore), currentLayout);
    const nowObj = new Date();
    const yearYY = nowObj.getFullYear().toString().slice(-2);
    const dayOfYear = getDayOfYear(nowObj);
    const todayDateCode = `${yearYY}${dayOfYear}`;
    const branchCode = userBranch || 'CDH';

    const currentNum = reportData.reportNumber || 'V-PENDING';
    const isIssued = /^[A-Z]{3}\d{9}$/.test(currentNum);
    const issuedDateCode = isIssued ? currentNum.substring(3, 8) : null;

    let nextNum = currentNum;

    if (!isIssued) {
      nextNum = `${branchCode}${todayDateCode}${scoreDigit}---`;
    } else if (issuedDateCode === todayDateCode) {
      const prefix = currentNum.substring(0, 8);
      const suffix = currentNum.substring(9);
      nextNum = `${prefix}${scoreDigit}${suffix}`;
    }

    if (currentNum !== nextNum) {
      setReportData(prev => ({ 
        ...prev, 
        reportNumber: nextNum,
        valuationCode: nextNum 
      }));
    }
  }, [reportData.conditionScore, reportData.vehicleClass, userBranch, isAuthorized, isLoading, currentLayout]);

  useEffect(() => {
    if (!user || !firestore) {
      if (!user) setIsAuthorized(false);
      return;
    }

    if (isAdmin) {
      setIsAuthorized(true);
      return;
    }

    const authRef = doc(firestore, 'config', 'authorizedUsers');
    const unsubscribe = onSnapshot(authRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const emailKey = user.email?.toLowerCase().replace(/[.@]/g, '_') || '';
        if (data[emailKey]) {
          setIsAuthorized(true);
          setUserBranch(data[emailKey].branch || 'CDH');
        } else {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    });

    return () => unsubscribe();
  }, [user, firestore, isAdmin]);

  useEffect(() => {
    if (isAuthorized) {
      setReportData(prev => {
        if (prev.date) return prev;
        return {
          ...prev,
          date: new Date().toLocaleDateString('en-CA') 
        };
      });
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!user || !firestore || isAuthorized !== true) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      const configRef = doc(firestore, 'layouts', 'config');
      const configSnap = await getDoc(configRef);
      let latestId = null;
      if (configSnap.exists()) {
          latestId = configSnap.data().currentId;
          setLatestLayoutId(latestId);
      }

      const reportRef = doc(firestore, 'reports', vehicleId);
      const docSnap = await getDoc(reportRef);

      if (docSnap.exists()) {
        const report = docSnap.data() as Report;
        setReportData(prev => ({ 
          ...prev, 
          ...report.reportData, 
          regNumber: isUnregistered ? 'U/R' : vehicleId
        }));
        
        const layoutToLoad = latestId || report.layoutId;
        if (layoutToLoad) {
            const layoutDoc = await getDoc(doc(firestore, 'layouts', layoutToLoad));
            if (layoutDoc.exists()) {
                setCurrentLayout(layoutDoc.data().fields);
                setLayoutVersion(layoutDoc.data().version);
            }
        }
      } else {
        setReportData(prev => ({ ...prev, regNumber: isUnregistered ? 'U/R' : vehicleId }));
        if (latestId) {
            const latestDoc = await getDoc(doc(firestore, 'layouts', latestId));
            if (latestDoc.exists()) {
                setCurrentLayout(latestDoc.data().fields);
                setLayoutVersion(latestDoc.data().version);
            }
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [user, firestore, vehicleId, isAuthorized, isUnregistered]);

  const findIdentifier = (patterns: string[]) => {
    const direct = patterns.map(p => reportData[p]).find(v => !!v);
    if (direct) return direct;
    const layoutField = currentLayout.find(f => f.fieldType === 'text' && f.label && f.label.text && patterns.some(p => f.label.text.toLowerCase().includes(p.toLowerCase())));
    if (layoutField && reportData[layoutField.fieldId]) return reportData[layoutField.fieldId];
    const entry = Object.entries(reportData).find(([key, val]) => val && patterns.some(p => key.toLowerCase().includes(p.toLowerCase())));
    return entry ? entry[1] : '';
  };

  useEffect(() => {
    if (!firestore || isAuthorized !== true || !user || isLoading || systemIsLocked) return;

    const engineVal = findIdentifier(['engineNumber', 'engineNo', 'engine', 'motor', 'engnum', 'eng']);
    const chassisVal = findIdentifier(['chassisNumber', 'chassisNo', 'chassis', 'serial', 'vin', 'chas']);
    const reportNumVal = findIdentifier(['reportNumber']);
    const dateVal = findIdentifier(['date', 'reportDate', 'inspectionDate', 'inspectedOn']);

    if (!engineVal && !chassisVal && !reportNumVal && !dateVal) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        const dataToSync = {
          vehicleId: vehicleId,
          engineNumber: String(engineVal || '').toUpperCase().trim(),
          chassisNumber: String(chassisVal || '').toUpperCase().trim(),
          reportNumber: String(reportNumVal || 'DRAFT').toUpperCase().trim(),
          reportDate: String(dateVal || ''),
          updatedAt: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email,
        };

        const reportRef = doc(firestore, 'reports', vehicleId);
        await setDoc(reportRef, {
            ...dataToSync,
            id: vehicleId,
            reportData: { ...reportData, regNumber: isUnregistered ? 'U/R' : vehicleId }
        }, { merge: true });

      } catch (err) {
        console.error("Indexing sync failed:", err);
      } finally {
        setIsSyncing(false);
      }
    }, 1000); 

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [reportData, firestore, isAuthorized, user, vehicleId, isLoading, currentLayout, isUnregistered, systemIsLocked]);

  const handleDataChange = (fieldId: string, value: string | ImageData) => {
    const fieldIdLower = fieldId.toLowerCase();
    if (fieldIdLower === 'reportnumber' || fieldIdLower === 'regnumber' || fieldIdLower === 'valuationcode' || fieldIdLower.includes('reportnum')) return; 

    let finalValue = value;
    if (typeof value === 'string') {
      const layoutField = currentLayout.find(f => f.fieldId === fieldId);
      if (layoutField?.value?.isPriceFormat) {
        const clean = value.replace(/[^\d.]/g, '');
        const parts = clean.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        finalValue = parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
      }
    }

    setReportData(prev => {
      const updated = { ...prev, [fieldId]: finalValue };
      if (typeof finalValue === 'string' && VEHICLE_CLASSES.includes(finalValue.toUpperCase())) updated.vehicleClass = finalValue.toUpperCase();
      currentLayout.forEach(layoutField => {
        if (layoutField.autoFillType === 'numberToWords' && layoutField.autoFillSource === fieldId && typeof finalValue === 'string') {
          const cleanVal = finalValue.replace(/[^\d.]/g, ''); 
          const num = parseFloat(cleanVal);
          if (!isNaN(num)) updated[layoutField.fieldId] = numberToWords(num);
          else if (cleanVal === '') updated[layoutField.fieldId] = '';
        }
      });
      return updated;
    });
  };

  const handleBlur = (fieldId: string, value: string) => {
    if (typeof value !== 'string') return;
    const layoutField = currentLayout.find(f => f.fieldId === fieldId);
    if (layoutField?.value?.isPriceFormat && value.trim() !== '') {
      const clean = value.replace(/,/g, '');
      if (clean !== '' && !clean.includes('.')) handleDataChange(fieldId, `${clean}.00`);
    }
  };

  const handleSave = async () => {
    if (!user || !firestore || systemIsLocked) return;

    let finalClass = reportData.vehicleClass;
    if (!finalClass || !VEHICLE_CLASSES.includes(finalClass.toUpperCase())) {
      const foundMatch = Object.values(reportData).find(v => typeof v === 'string' && VEHICLE_CLASSES.includes(v.toUpperCase()));
      finalClass = foundMatch ? String(foundMatch).toUpperCase() : 'MOTOR CAR';
    }

    const conditionValue = reportData['conditionScore'];
    if (!conditionValue || String(conditionValue).trim() === '') {
      toast({ variant: "destructive", title: "Input Required", description: "Condition Score is essential." });
      return;
    }

    setIsFinalSaving(true);
    try {
      const nowObj = new Date();
      const yearYY = nowObj.getFullYear().toString().slice(-2);
      const dayOfYear = getDayOfYear(nowObj);
      const todayDateCode = `${yearYY}${dayOfYear}`;
      const dateVal = nowObj.toLocaleDateString('en-CA');
      const scoreDigit = getScoreDigit(String(reportData['conditionScore']), currentLayout);

      let finalReportNumber = reportData.reportNumber;
      const isIssued = /^[A-Z]{3}\d{9}$/.test(finalReportNumber || '');
      const issuedDateCode = isIssued ? finalReportNumber.substring(3, 8) : null;

      if (!isIssued || issuedDateCode !== todayDateCode) {
        const branchCode = userBranch || 'CDH';
        const daySnap = await getDocs(query(collection(firestore, 'reports'), where('branch', '==', branchCode), where('reportDate', '==', dateVal), where('reportData.vehicleClass', '==', finalClass)));
        finalReportNumber = `${branchCode}${todayDateCode}${scoreDigit}${(daySnap.size + 1).toString().padStart(3, '0')}`;
      } else if (isIssued && issuedDateCode === todayDateCode) {
        finalReportNumber = `${finalReportNumber.substring(0, 8)}${scoreDigit}${finalReportNumber.substring(9)}`;
      }

      const updatedReportData = { ...reportData, vehicleClass: finalClass, reportNumber: finalReportNumber, valuationCode: finalReportNumber, date: dateVal };

      await runTransaction(firestore, async (transaction) => {
        const now = serverTimestamp();
        const activeLayoutId = (await transaction.get(doc(firestore, 'layouts', 'config'))).data()?.currentId;
        const engineVal = findIdentifier(['engineNumber', 'engineNo', 'engine', 'motor', 'engnum', 'eng']);
        const chassisVal = findIdentifier(['chassisNumber', 'chassisNo', 'chassis', 'serial', 'vin', 'chas']);

        const reportHeaderData = {
          vehicleId, branch: userBranch || 'CDH', engineNumber: String(engineVal || '').toUpperCase().trim(),
          chassisNumber: String(chassisVal || '').toUpperCase().trim(), reportNumber: finalReportNumber, reportDate: dateVal,
          userId: user.uid, userEmail: user.email, userName: user.displayName || user.email, reportData: updatedReportData,
          updatedAt: now, layoutId: activeLayoutId
        };

        const reportRef = doc(firestore, 'reports', vehicleId);
        const docSnap = await transaction.get(reportRef);
        if (docSnap.exists()) transaction.update(reportRef, reportHeaderData);
        else transaction.set(reportRef, { ...reportHeaderData, id: vehicleId, createdAt: now });
        transaction.set(doc(collection(firestore, 'reports', vehicleId, 'history')), { ...reportHeaderData, reportId: vehicleId, savedAt: now });
      });
      
      setReportData(updatedReportData);
      toast({ title: "Success", description: `Report saved as ${finalReportNumber}` });
      setIsSaveDialogOpen(false);
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save report." });
    } finally {
      setIsFinalSaving(false);
    }
  };

  const handleCloneData = async (sourceId: string) => {
    if (!firestore || !sourceId) return;
    setIsCloning(true);
    try {
      const snap = await getDoc(doc(firestore, 'reports', sourceId.toUpperCase().trim()));
      if (snap.exists()) {
        const source = snap.data() as Report;
        const cloned = { ...source.reportData };
        const technicalIds = currentLayout.filter(f => f.fieldType === 'text' && f.label?.text && ['engine', 'chassis', 'reg', 'report', 'vin', 'serial', 'motor'].some(p => f.label.text.toLowerCase().includes(p))).map(f => f.fieldId);
        Object.keys(cloned).forEach(k => {
          const kl = k.toLowerCase();
          if (['engine', 'chassis', 'vin', 'serial', 'reportnum', 'regnumber', 'valuation', 'vehicleid', 'vehicleclass', 'image1', 'date', 'id'].some(p => kl.includes(p)) || technicalIds.includes(k)) delete cloned[k];
        });
        setReportData(prev => ({ ...prev, ...cloned, regNumber: isUnregistered ? 'U/R' : vehicleId, date: prev.date, chassisNumber: "", engineNumber: "", reportNumber: "V-PENDING", valuationCode: "V-PENDING", vehicleClass: "" }));
        toast({ title: "Data Imported", description: `Specs from ${sourceId} loaded.` });
        setIsCloneDialogOpen(false); setCloneSearchTerm('');
      } else {
        setIsCloneDialogOpen(false); setIsCloneErrorOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Import Error", description: "Failed to retrieve source data." });
    } finally { setIsCloning(false); }
  };

  const upgradeLayout = async () => {
      if (!latestLayoutId || !firestore) return;
      setIsLoading(true);
      const snap = await getDoc(doc(firestore, 'layouts', latestLayoutId));
      if (snap.exists()) {
          setCurrentLayout(snap.data().fields);
          setLayoutVersion(snap.data().version);
          toast({ title: "Layout Upgraded", description: "Using latest version." });
      }
      setIsLoading(false);
  }

  const { staticLabels, dynamicValues, imageValues } = useMemo(() => {
    const labels = currentLayout.filter(f => f.fieldType === 'staticText' || f.fieldType === 'text').map(f => ({ ...f.label, id: `l-${f.id}`, fieldId: f.fieldId, value: f.label.text }));
    const values = currentLayout.filter(f => f.fieldType === 'text').map(f => ({ ...f.value, id: `v-${f.id}`, fieldId: f.fieldId, value: String(reportData[f.fieldId] || ''), inputType: f.value.inputType, options: f.value.options }));
    const images = currentLayout.filter(f => f.fieldType === 'image').map(f => ({ ...f.placeholder!, id: `i-${f.id}`, fieldId: f.fieldId, value: reportData[f.fieldId] || { url: '', scale: 1, x: 0, y: 0 } }));
    return { staticLabels: labels, dynamicValues: values, imageValues: images };
  }, [reportData, currentLayout]);

  const currentDisplayClass = useMemo(() => {
    if (reportData.vehicleClass && VEHICLE_CLASSES.includes(reportData.vehicleClass.toUpperCase())) return reportData.vehicleClass.toUpperCase();
    const foundMatch = Object.values(reportData).find(v => typeof v === 'string' && VEHICLE_CLASSES.includes(v.toUpperCase()));
    return foundMatch ? String(foundMatch).toUpperCase() : 'NOT SELECTED';
  }, [reportData]);

  if (isAuthorized === false) return <UnauthorizedAccess />;
  if (isAuthorized === null) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 flex flex-col p-4 no-print overflow-hidden">
        
        {systemIsLocked && (
          <Alert variant="destructive" className="mb-6 border-2 bg-destructive/5 animate-pulse">
            <Activity className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">Site-Wide Lock Active</AlertTitle>
            <AlertDescription className="font-bold text-sm">{lockMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 border-primary/20 shadow-sm shrink-0">
          <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="fill-mode" checked={isFilling} onCheckedChange={setIsFilling} />
                <Label htmlFor="fill-mode" className="cursor-pointer">Filling Mode</Label>
              </div>
              <div className="flex items-center gap-6 border-l pl-6">
                <div className="text-sm font-medium flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">Vehicle ID</span>
                  <span className={cn("font-mono", isUnregistered ? "text-primary font-black bg-primary/5 px-2 rounded" : "text-primary")}>
                    {displayVehicleId}
                  </span>
                </div>
                {isSyncing && (
                  <div className="flex flex-col justify-center">
                    <span className="flex items-center gap-1.5 text-[10px] text-primary font-bold animate-pulse bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      <RefreshCw size={10} className="animate-spin" /> Syncing...
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Layout v{layoutVersion}</div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="font-bold border-primary/20 text-primary hover:bg-primary/5">
                    <Copy className="mr-2 h-4 w-4" /> Clone From Existing
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-2 border-primary/20 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary font-black">
                      <Search className="h-5 w-5" /> Only Search Via Reg.Number.
                    </DialogTitle>
                    <DialogDescription>Unique IDs will be cleared. Imported specs only.</DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2 py-4">
                    <Input
                      placeholder="e.g. WP CAA-1234" value={cloneSearchTerm} onChange={(e) => setCloneSearchTerm(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleCloneData(cloneSearchTerm)} className="h-12 text-lg font-mono tracking-widest border-primary/30"
                    />
                    <Button size="icon" className="h-12 w-12 shrink-0 bg-primary" onClick={() => handleCloneData(cloneSearchTerm)} disabled={!cloneSearchTerm || isCloning}>
                      {isCloning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isCloneErrorOpen} onOpenChange={setIsCloneErrorOpen}>
                <DialogContent className="sm:max-w-md border-2 border-destructive/20 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive font-black"><AlertTriangle /> Record Not Found</DialogTitle>
                    <DialogDescription className="font-bold">Try with another Vehicle Reg.Number.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsCloneErrorOpen(false)}>Close</Button>
                    <Button onClick={() => { setIsCloneErrorOpen(false); setIsCloneDialogOpen(true); }} className="bg-primary font-black">Try Again</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {isAdmin && latestLayoutId && <Button variant="outline" size="sm" onClick={upgradeLayout}><LayoutTemplate className="mr-2 h-4 w-4" /> Upgrade Layout</Button>}
              
              {!systemIsLocked ? (
                reportData['conditionScore'] && String(reportData['conditionScore']).trim() !== '' && (
                  <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogTrigger asChild><Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg"><Save className="mr-2 h-4 w-4" /> Save Report</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-md border-2 border-primary/20 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary font-black"><CheckCircle2 /> Save Verification</DialogTitle>
                        <DialogDescription className="font-bold text-foreground">Double check classification before finalizing.</DialogDescription>
                      </DialogHeader>
                      <div className="py-6 space-y-6">
                        <div className="space-y-2 p-4 bg-muted/30 rounded-xl border-2 border-dashed border-primary/20">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground">Verified Classification</Label>
                          <div className="text-2xl font-black text-primary font-mono">{currentDisplayClass}</div>
                        </div>
                        <Alert variant="destructive" className="border-2 animate-pulse"><AlertTriangle /><AlertDescription className="font-black text-xs uppercase">IMPORTANT: Incorrect classification breaks sequential Valuation Code numbering.</AlertDescription></Alert>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsSaveDialogOpen(false)} disabled={isFinalSaving}>Cancel</Button>
                        <Button onClick={() => handleSave()} className="bg-primary font-black px-8" disabled={isFinalSaving}>{isFinalSaving ? "Committing..." : "Confirm & Save"}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )
              ) : (
                <Button variant="outline" disabled className="bg-muted cursor-not-allowed border-destructive/20 text-destructive font-black opacity-50"><Lock size={14} className="mr-2" /> System Locked</Button>
              )}

              <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 w-full overflow-auto pb-20 pt-4 flex justify-start md:justify-center">
          <div className="min-w-fit px-4 h-fit">
            {isLoading ? <div className="animate-pulse bg-white w-[210mm] h-[297mm] shadow-2xl rounded-lg" /> : <div className={isFilling ? "preview-mode" : ""}><ReportPage staticLabels={staticLabels} dynamicValues={dynamicValues} imageValues={imageValues} isEditable={isFilling} onValueChange={handleDataChange} onBlur={handleBlur} /></div>}
          </div>
        </div>
      </main>
      <div className="hidden print-view"><ReportPage staticLabels={staticLabels} dynamicValues={dynamicValues} imageValues={imageValues} /></div>
    </div>
  );
}
