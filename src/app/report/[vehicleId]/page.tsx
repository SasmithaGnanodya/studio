'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, Save, LockKeyhole, AlertTriangle } from 'lucide-react';
import { ReportPage } from '@/components/ReportPage';
import { initialReportState, fixedLayout } from '@/lib/initialReportState';
import { useFirebase } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs, serverTimestamp, runTransaction } from 'firebase/firestore';
import type { ImageData, Report } from '@/lib/types';
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
      <Card className="w-full max-w-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LockKeyhole className="text-primary" /> Secure Access</CardTitle>
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
  const vehicleId = decodeURIComponent(resolvedParams.vehicleId);

  const [reportId, setReportId] = useState<string | null>(null);
  const [reportData, setReportData] = useState(initialReportState);
  const [isFilling, setIsFilling] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const isAdmin = useMemo(() => user?.email && ADMIN_EMAILS.includes(user.email), [user]);

  useEffect(() => { if (isAdmin) setIsAuthorized(true); }, [isAdmin]);

  useEffect(() => {
    if (!user || !firestore || !isAuthorized) return;

    const fetchReport = async () => {
      setIsLoading(true);
      const reportsRef = collection(firestore, 'reports');
      const q = query(reportsRef, where('vehicleId', '==', vehicleId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const report = querySnapshot.docs[0].data() as Report;
        setReportId(querySnapshot.docs[0].id);
        setReportData({ ...initialReportState, ...report.reportData, regNumber: vehicleId });
      } else {
        setReportData({ ...initialReportState, regNumber: vehicleId });
      }
      setIsLoading(false);
    };

    fetchReport();
  }, [user, firestore, vehicleId, isAuthorized]);

  const handleDataChange = (fieldId: string, value: string | ImageData) => {
    setReportData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!user || !firestore) return;

    try {
      await runTransaction(firestore, async (transaction) => {
        const now = serverTimestamp();
        if (reportId) {
          const reportRef = doc(firestore, 'reports', reportId);
          transaction.update(reportRef, {
            reportData: reportData,
            updatedAt: now,
            userId: user.uid,
            userName: user.displayName,
          });
        } else {
          const newReportRef = doc(collection(firestore, 'reports'));
          transaction.set(newReportRef, {
            id: newReportRef.id,
            vehicleId,
            userId: user.uid,
            userName: user.displayName,
            reportData: reportData,
            createdAt: now,
            updatedAt: now,
          });
          setReportId(newReportRef.id);
        }
      });
      toast({ title: "Success", description: "Report saved successfully." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save report." });
    }
  };

  const { staticLabels, dynamicValues, imageValues } = useMemo(() => {
    const labels = fixedLayout.filter(f => f.fieldType === 'staticText').map(f => ({
      ...f.label,
      id: `l-${f.id}`,
      fieldId: f.fieldId,
      value: f.label.text
    }));

    const values = fixedLayout.filter(f => f.fieldType === 'text').map(f => ({
      ...f.value,
      id: `v-${f.id}`,
      fieldId: f.fieldId,
      value: String(reportData[f.fieldId] || ''),
      inputType: f.value.inputType,
      options: f.value.options
    }));

    const images = fixedLayout.filter(f => f.fieldType === 'image').map(f => ({
      ...f.placeholder!,
      id: `i-${f.id}`,
      fieldId: f.fieldId,
      value: reportData[f.fieldId] || { url: '', scale: 1, x: 0, y: 0 }
    }));

    return { staticLabels: labels, dynamicValues: values, imageValues: images };
  }, [reportData]);

  if (!isAuthorized) return <PasswordGate onPasswordCorrect={() => setIsAuthorized(true)} />;

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 flex flex-col p-4 no-print">
        <Card className="mb-6 border-primary/10">
          <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="fill-mode" checked={isFilling} onCheckedChange={setIsFilling} />
                <Label htmlFor="fill-mode">Filling Mode</Label>
              </div>
              <div className="text-sm font-medium">Vehicle: <span className="text-primary">{vehicleId}</span></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="mr-2 h-4 w-4" /> Save</Button>
              <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
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
