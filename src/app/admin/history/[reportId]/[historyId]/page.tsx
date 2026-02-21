'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { ReportHistory, FieldLayout } from '@/lib/types';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, History, ShieldAlert, Loader2, Calendar, User } from 'lucide-react';
import { ReportPage } from '@/components/ReportPage';
import { fixedLayout } from '@/lib/initialReportState';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];

export default function HistoryViewerPage({ params }: { params: Promise<{ reportId: string, historyId: string }> }) {
  const resolvedParams = use(params);
  const { reportId, historyId } = resolvedParams;

  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();

  const [historyEntry, setHistoryEntry] = useState<ReportHistory | null>(null);
  const [layout, setLayout] = useState<FieldLayout[]>(fixedLayout);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      router.replace('/');
      return;
    }

    const fetchData = async () => {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const historyRef = doc(firestore, 'reports', reportId, 'history', historyId);
        const historySnap = await getDoc(historyRef);

        if (historySnap.exists()) {
          const data = historySnap.data() as ReportHistory;
          setHistoryEntry(data);

          // Use the layoutId stored in the history if available
          const layoutId = data.layoutId;
          if (layoutId) {
            const layoutSnap = await getDoc(doc(firestore, 'layouts', layoutId));
            if (layoutSnap.exists()) {
              setLayout(layoutSnap.data().fields);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching history entry:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, firestore, isUserLoading, router, reportId, historyId]);

  const { staticLabels, dynamicValues, imageValues } = useMemo(() => {
    if (!historyEntry) return { staticLabels: [], dynamicValues: [], imageValues: [] };

    const reportData = historyEntry.reportData || {};

    const labels = layout.filter(f => f.fieldType === 'staticText' || f.fieldType === 'text').map(f => ({
      ...f.label,
      id: `l-${f.id}`,
      fieldId: f.fieldId,
      value: f.label.text
    }));

    const values = layout.filter(f => f.fieldType === 'text').map(f => ({
      ...f.value,
      id: `v-${f.id}`,
      fieldId: f.fieldId,
      value: String(reportData[f.fieldId] || ''),
      inputType: f.value.inputType,
      options: f.value.options
    }));

    const images = layout.filter(f => f.fieldType === 'image').map(f => ({
      ...f.placeholder!,
      id: `i-${f.id}`,
      fieldId: f.fieldId,
      value: reportData[f.fieldId] || { url: '', scale: 1, x: 0, y: 0 }
    }));

    return { staticLabels: labels, dynamicValues: values, imageValues: images };
  }, [historyEntry, layout]);

  if (isLoading || isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Retrieving Snapshot...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!historyEntry) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <Header />
        <main className="flex-1 p-6">
          <Card className="max-w-md mx-auto border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert /> History Entry Not Found</CardTitle>
              <CardDescription>The requested technical snapshot could not be located in the audit logs.</CardDescription>
            </CardHeader>
            <CardContent>
               <Button asChild className="w-full">
                  <Link href={`/admin/history/${reportId}`}>Back to History List</Link>
               </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 flex flex-col p-4 no-print lg:p-8">
        <Card className="mb-8 border-primary/20 bg-card/50 backdrop-blur-md shadow-xl sticky top-20 z-10">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Technical Snapshot: <span className="font-mono text-primary">{historyId.substring(0, 8)}</span></h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-2 pl-12">
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {new Date(historyEntry.savedAt.seconds * 1000).toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><User size={14} className="text-primary" /> {historyEntry.userName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <Link href={`/admin/history/${reportId}`} passHref>
                  <Button variant="outline" className="border-primary/20 bg-background/50 hover:bg-primary/5">
                    <ArrowLeft size={16} className="mr-2" /> Back to History List
                  </Button>
               </Link>
               <Button onClick={() => window.print()} className="shadow-lg">
                 Print Snapshot
               </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 flex justify-center pb-20 overflow-visible">
          <div className="preview-mode ring-1 ring-black/5 rounded-lg shadow-2xl">
            <ReportPage 
              staticLabels={staticLabels} 
              dynamicValues={dynamicValues}
              imageValues={imageValues}
              isEditable={false}
            />
          </div>
        </div>
      </main>

      <div className="hidden print-view">
        <ReportPage 
          staticLabels={staticLabels} 
          dynamicValues={dynamicValues}
          imageValues={imageValues}
          isEditable={false}
        />
      </div>
    </div>
  );
}
