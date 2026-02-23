'use client';

import React, { useEffect, useState, use } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import type { Report, ReportHistory } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldOff, Eye, Clock, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];

function getIdentifiers(entry: ReportHistory) {
  const data = entry.reportData || {};
  
  const reportNum = entry.reportNumber || 
                    data.reportNumber || 
                    Object.entries(data).find(([k]) => 
                      ['reportnumber', 'reportno', 'ref', 'val', 'v-', 'valuation', 'id'].some(p => k.toLowerCase().includes(p))
                    )?.[1] || 
                    'DRAFT';

  return {
    reportNum: String(reportNum).toUpperCase().trim()
  };
}

export default function ReportHistoryPage({ params }: { params: Promise<{ reportId: string }> }) {
  const resolvedParams = use(params);
  const { reportId } = resolvedParams;

  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();

  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      router.replace('/');
      return;
    }

    if (firestore && reportId) {
      setIsLoading(true);

      // Fetch the main report document for context
      const reportRef = doc(firestore, 'reports', reportId);
      getDoc(reportRef).then(docSnap => {
        if (docSnap.exists()) {
          setReport(docSnap.data() as Report);
        }
      });
      
      // Subscribe to the history subcollection
      const historyColRef = collection(firestore, 'reports', reportId, 'history');
      const q = query(historyColRef, orderBy('savedAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedHistory: ReportHistory[] = [];
        querySnapshot.forEach((doc) => {
          fetchedHistory.push({ id: doc.id, ...(doc.data() as Omit<ReportHistory, 'id'>) } as ReportHistory);
        });
        setHistory(fetchedHistory);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching report history: ", error);
        setIsLoading(false);
      });

      return () => unsubscribe(); // Cleanup subscription
    }
  }, [user, firestore, isUserLoading, router, reportId]);

  const renderContent = () => {
    if (isLoading || isUserLoading) {
      return (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>You do not have permission to view this page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ShieldOff className="mx-auto h-16 w-16 text-destructive" />
                </CardContent>
            </Card>
        )
    }

    return (
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-black">History for Report: <span className="font-mono text-primary">{report?.vehicleId || 'Loading...'}</span></CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock size={14} className="text-primary" /> Audit log of all saved snapshots and generated versions.
              </CardDescription>
            </div>
            <Link href="/admin" passHref>
                <Button variant="outline" className="border-primary/20"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Panel</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-xl overflow-hidden bg-background/50">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Saved At</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Saved By</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Report Number (Issued)</TableHead>
                  <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((entry) => {
                    const ids = getIdentifiers(entry);
                    return (
                      <TableRow key={entry.id} className="group transition-colors hover:bg-primary/5">
                        <TableCell className="font-medium">
                          {entry.savedAt ? new Date(entry.savedAt.seconds * 1000).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{entry.userName}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{entry.userId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileCheck size={14} className="text-primary" />
                            <span className="font-mono text-xs font-bold text-foreground bg-primary/5 px-2 py-1 rounded border border-primary/10">
                              {ids.reportNum}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/history/${reportId}/${entry.id}`} passHref>
                            <Button size="sm" variant="ghost" className="h-8 gap-2 text-primary hover:text-primary-foreground hover:bg-primary transition-all">
                              <Eye size={14} /> View Version
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-48 text-muted-foreground font-medium italic">
                      No save history found for this report.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <div className="container mx-auto max-w-6xl">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
