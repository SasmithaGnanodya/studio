
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, ShieldOff, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const ADMIN_EMAIL = 'sasmithagnanodya@gmail.com';

export default function AdminPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || user.email !== ADMIN_EMAIL) {
      router.replace('/');
      return;
    }

    if (firestore) {
      setIsLoading(true);
      const reportsRef = collection(firestore, 'reports');
      const q = query(reportsRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedReports: Report[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) });
        });
        setReports(fetchedReports);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching real-time reports: ", error);
        setIsLoading(false);
      });

      return () => unsubscribe(); // Cleanup subscription on component unmount
    }
  }, [user, firestore, isUserLoading, router]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    return reports.filter(report => 
      report.vehicleId.toUpperCase().includes(searchTerm.toUpperCase())
    );
  }, [reports, searchTerm]);

  const reportsByDay = useMemo(() => {
    return filteredReports.reduce((acc, report) => {
      if (!report.createdAt) return acc;
      const date = new Date(report.createdAt.seconds * 1000).toLocaleDateString('en-CA');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(report);
      return acc;
    }, {} as Record<string, Report[]>);
  }, [filteredReports]);

  const renderContent = () => {
    if (isLoading || isUserLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-1/3" />
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                                        <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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

    const reportDays = Object.keys(reportsByDay);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Overview of all valuation reports in the system.</CardDescription>
                 <div className="relative pt-4 flex items-center gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by Vehicle ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                    <Link href="/editor" passHref>
                        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Layout</Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
            {reportDays.length > 0 ? reportDays.map((day) => (
                <div key={day}>
                <h3 className="text-lg font-semibold">
                    {new Date(day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">({reportsByDay[day].length} reports)</span>
                </h3>
                <div className="border rounded-md mt-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vehicle ID</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportsByDay[day].map((report) => (
                                <TableRow key={report.id}>
                                <TableCell className="font-mono">{report.vehicleId}</TableCell>
                                <TableCell>{report.userName || 'Unknown'}</TableCell>
                                <TableCell>
                                    {report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleTimeString() : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/report/${report.vehicleId}`} passHref>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-3 w-3" /> Edit
                                    </Button>
                                    </Link>
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                </div>
            )) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No reports found{searchTerm ? ` for "${searchTerm}"` : ""}.</p>
                </div>
            )}
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        {renderContent()}
      </main>
    </div>
  );
}
