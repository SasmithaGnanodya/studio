
'use client';

import React, { useEffect, useState, use } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import type { Report, ReportHistory } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_EMAIL = 'sasmithagnanodya@gmail.com';

export default function ReportHistoryPage({ params }: { params: { reportId: string } }) {
  const resolvedParams = use(params);
  const { reportId } = resolvedParams;

  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();

  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || user.email !== ADMIN_EMAIL) {
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
          fetchedHistory.push({ id: doc.id, ...(doc.data() as Omit<ReportHistory, 'id'>) });
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!user || user.email !== ADMIN_EMAIL) {
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
      <Card>
        <CardHeader>
          <CardTitle>History for Report: <span className="font-mono text-primary">{report?.vehicleId || 'Loading...'}</span></CardTitle>
          <CardDescription>Showing all saved versions of this report, from newest to oldest.</CardDescription>
            <div className="pt-4">
                <Link href="/admin" passHref>
                    <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Panel</Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Saved At</TableHead>
                  <TableHead>Saved By</TableHead>
                  <TableHead>History ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {entry.savedAt ? new Date(entry.savedAt.seconds * 1000).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>{entry.userName}</TableCell>
                      <TableCell className="font-mono">{entry.id}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
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
        {renderContent()}
      </main>
    </div>
  );
}

    