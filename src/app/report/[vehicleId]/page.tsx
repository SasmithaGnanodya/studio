
'use client';

import React, { useState, useEffect, useMemo, use, useRef } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, Save, LockKeyhole, AlertTriangle, LayoutTemplate, RefreshCw } from 'lucide-react';
import { ReportPage } from '@/components/ReportPage';
import { initialReportState, fixedLayout } from '@/lib/initialReportState';
import { useFirebase } from '@/firebase';
import { doc, getDoc, collection, serverTimestamp, runTransaction, setDoc } from 'firebase/firestore';
import type { ImageData, Report, FieldLayout } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];

function PasswordGate({ onPasswordCorrect }: { onPasswordCorrect: () => void }) {
  const { firestore } = useFirebase();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const settingsRef = doc(firestore, 'config', 'settings');
    try {
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists() && docSnap.data().privateDataPassword === password) {
        onPasswordCorrect();
      } else {
        setError('Incorrect password.');
      }
    } catch (err) {
      setError('Failed to verify password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-sm:max-w-xs border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary"><LockKeyhole className="h-5 w-5" /> Secure Access</CardTitle>
          <CardDescription>Enter password to unlock this report.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
            {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertTriangle size={14} /> {error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Unlock'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportBuilderPage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const resolvedParams = use(params);
  const rawVehicleId = decodeURIComponent(resolvedParams.vehicleId);
  const vehicleId = rawVehicleId.toUpperCase().trim();

  const [reportData, setReportData] = useState(initialReportState);
  const [currentLayout, setCurrentLayout] = useState<FieldLayout[]>(fixedLayout);
  const [layoutVersion, setLayoutVersion] = useState<number>(0);
  const [latestLayoutId, setLatestLayoutId] = useState<string | null>(null);
  
  const [isFilling, setIsFilling] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const isAdmin = useMemo(() => user?.email && ADMIN_EMAILS.includes(user.email), [user]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { if (isAdmin) setIsAuthorized(true); }, [isAdmin]);

  // Client-side initialization for new reports
  useEffect(() => {
    if (isAuthorized) {
      setReportData(prev => {
        const needsUpdate = prev.reportNumber === "V-PENDING" || prev.date === "";
        if (!needsUpdate) return prev;

        return {
          ...prev,
          reportNumber: prev.reportNumber === "V-PENDING" 
            ? "V" + Math.floor(1000 + Math.random() * 9000) 
            : prev.reportNumber,
          date: prev.date === "" 
            ? new Date().toLocaleDateString('en-CA') 
            : prev.date
        };
      });
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!user || !firestore || !isAuthorized) return;

    const fetchData = async () => {
      setIsLoading(true);
      
      const configRef = doc(firestore, 'layouts', 'config');
      const configSnap = await getDoc(configRef);
      let latestId = null;
      if (configSnap.exists()) {
          latestId = configSnap.data().currentId;
          setLatestLayoutId(latestId);
      }

      // DETERMINISTIC FETCH: Registration number is the document ID
      const reportRef = doc(firestore, 'reports', vehicleId);
      const docSnap = await getDoc(reportRef);

      if (docSnap.exists()) {
        const report = docSnap.data() as Report;
        setReportData({ ...initialReportState, ...report.reportData, regNumber: vehicleId });
        
        const layoutToLoad = latestId || report.layoutId;
        if (layoutToLoad) {
            const layoutDoc = await getDoc(doc(firestore, 'layouts', layoutToLoad));
            if (layoutDoc.exists()) {
                setCurrentLayout(layoutDoc.data().fields);
                setLayoutVersion(layoutDoc.data().version);
            }
        }
      } else {
        setReportData(prev => ({ ...prev, regNumber: vehicleId }));
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
  }, [user, firestore, vehicleId, isAuthorized]);

  // Real-time Debounced Sync for Identifiers
  useEffect(() => {
    if (!firestore || !isAuthorized || !user) return;

    // Detect identifiers robustly by scanning keys if default keys are empty
    const findIdentifier = (patterns: string[]) => {
      const direct = patterns.map(p => reportData[p]).find(v => !!v);
      if (direct) return direct;
      
      // Fallback: scan all reportData keys for similar names
      const entry = Object.entries(reportData).find(([key]) => 
        patterns.some(p => key.toLowerCase().includes(p.toLowerCase()))
      );
      return entry ? entry[1] : '';
    };

    const engineVal = findIdentifier(['engineNumber', 'engineNo', 'engine']);
    const chassisVal = findIdentifier(['chassisNumber', 'chassisNo', 'chassis', 'serial']);
    const reportNumVal = findIdentifier(['reportNumber', 'reportNo']);
    const dateVal = findIdentifier(['date', 'reportDate']);

    const hasData = engineVal || chassisVal || reportNumVal || dateVal;
    if (!hasData) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        const dataToSync = {
          vehicleId: vehicleId,
          engineNumber: String(engineVal || '').toUpperCase().trim(),
          chassisNumber: String(chassisVal || '').toUpperCase().trim(),
          reportNumber: String(reportNumVal || '').toUpperCase().trim(),
          reportDate: String(dateVal || ''),
          updatedAt: serverTimestamp(),
          userId: user.uid,
          userName: user.displayName || user.email,
        };

        const reportRef = doc(firestore, 'reports', vehicleId);
        await setDoc(reportRef, {
            ...dataToSync,
            id: vehicleId,
            reportData: { ...reportData, regNumber: vehicleId }
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
  }, [reportData, firestore, isAuthorized, user, vehicleId]);

  const handleDataChange = (fieldId: string, value: string | ImageData) => {
    setReportData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!user || !firestore) return;

    try {
      await runTransaction(firestore, async (transaction) => {
        const now = serverTimestamp();
        const configRef = doc(firestore, 'layouts', 'config');
        const configSnap = await transaction.get(configRef);
        const activeLayoutId = configSnap.exists() ? configSnap.data().currentId : null;

        // Extract identifiers for the top-level searchable fields
        const findIdentifier = (patterns: string[]) => {
          const direct = patterns.map(p => reportData[p]).find(v => !!v);
          if (direct) return direct;
          const entry = Object.entries(reportData).find(([key]) => patterns.some(p => key.toLowerCase().includes(p.toLowerCase())));
          return entry ? entry[1] : '';
        };

        const reportHeaderData = {
          vehicleId: vehicleId,
          engineNumber: String(findIdentifier(['engineNumber', 'engineNo']) || '').toUpperCase().trim(),
          chassisNumber: String(findIdentifier(['chassisNumber', 'chassisNo', 'serial']) || '').toUpperCase().trim(),
          reportNumber: String(findIdentifier(['reportNumber', 'reportNo']) || '').toUpperCase().trim(),
          reportDate: String(findIdentifier(['date', 'reportDate']) || ''),
          userId: user.uid,
          userName: user.displayName || user.email,
          reportData: reportData,
          updatedAt: now,
          layoutId: activeLayoutId
        };

        const reportRef = doc(firestore, 'reports', vehicleId);
        const docSnap = await transaction.get(reportRef);

        if (docSnap.exists()) {
          transaction.update(reportRef, reportHeaderData);
        } else {
          transaction.set(reportRef, {
            ...reportHeaderData,
            id: vehicleId,
            createdAt: now
          });
        }
        
        const historyRef = doc(collection(firestore, 'reports', vehicleId, 'history'));
        transaction.set(historyRef, {
            ...reportHeaderData,
            reportId: vehicleId,
            savedAt: now
        });
      });
      toast({ title: "Success", description: "Report saved successfully." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Failed to save report." });
    }
  };

  const upgradeLayout = async () => {
      if (!latestLayoutId || !firestore) return;
      setIsLoading(true);
      const latestDoc = await getDoc(doc(firestore, 'layouts', latestLayoutId));
      if (latestDoc.exists()) {
          setCurrentLayout(latestDoc.data().fields);
          setLayoutVersion(latestDoc.data().version);
          toast({ title: "Layout Upgraded", description: "Using latest template version." });
      }
      setIsLoading(false);
  }

  const { staticLabels, dynamicValues, imageValues } = useMemo(() => {
    const labels = currentLayout.filter(f => f.fieldType === 'staticText' || f.fieldType === 'text').map(f => ({
      ...f.label,
      id: `l-${f.id}`,
      fieldId: f.fieldId,
      value: f.label.text
    }));

    const values = currentLayout.filter(f => f.fieldType === 'text').map(f => ({
      ...f.value,
      id: `v-${f.id}`,
      fieldId: f.fieldId,
      value: String(reportData[f.fieldId] || ''),
      inputType: f.value.inputType,
      options: f.value.options
    }));

    const images = currentLayout.filter(f => f.fieldType === 'image').map(f => ({
      ...f.placeholder!,
      id: `i-${f.id}`,
      fieldId: f.fieldId,
      value: reportData[f.fieldId] || { url: '', scale: 1, x: 0, y: 0 }
    }));

    return { staticLabels: labels, dynamicValues: values, imageValues: images };
  }, [reportData, currentLayout]);

  if (!isAuthorized) return <PasswordGate onPasswordCorrect={() => setIsAuthorized(true)} />;

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 flex flex-col p-4 no-print">
        <Card className="mb-6 border-primary/20 shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="fill-mode" checked={isFilling} onCheckedChange={setIsFilling} />
                <Label htmlFor="fill-mode" className="cursor-pointer">Filling Mode</Label>
              </div>
              <div className="text-sm font-medium flex items-center gap-3">
                Vehicle: <span className="text-primary font-mono">{vehicleId}</span>
                {isSyncing && (
                  <span className="flex items-center gap-1.5 text-[10px] text-primary font-bold animate-pulse bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    <RefreshCw size={10} className="animate-spin" /> Syncing Filter Indexes...
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Layout v{layoutVersion}</div>
            </div>
            <div className="flex gap-2">
              {isAdmin && latestLayoutId && (
                  <Button variant="outline" size="sm" onClick={upgradeLayout}>
                      <LayoutTemplate className="mr-2 h-4 w-4" /> Upgrade Layout
                  </Button>
              )}
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> Save Report
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 flex justify-center pb-20 overflow-visible">
          {isLoading ? (
            <div className="animate-pulse bg-white w-[210mm] h-[297mm] shadow-2xl rounded-lg" />
          ) : (
            <div className={isFilling ? "preview-mode" : ""}>
              <ReportPage 
                staticLabels={staticLabels} 
                dynamicValues={dynamicValues}
                imageValues={imageValues}
                isEditable={isFilling}
                onValueChange={handleDataChange}
              />
            </div>
          )}
        </div>
      </main>

      <div className="hidden print-view">
        <ReportPage 
          staticLabels={staticLabels}
          dynamicValues={dynamicValues}
          imageValues={imageValues}
        />
      </div>
    </div>
  );
}
