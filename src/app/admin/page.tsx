
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldOff, Search, History, Save, TrendingUp, Eye, LayoutTemplate, Filter, Car, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 6;

function PasswordManager({ firestore }: { firestore: any }) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPassword = async () => {
            const settingsRef = doc(firestore, 'config', 'settings');
            const docSnap = await getDoc(settingsRef);
            if (docSnap.exists()) {
                setPassword(docSnap.data().privateDataPassword || '');
            }
            setIsLoading(false);
        };
        fetchPassword();
    }, [firestore]);

    const handleSavePassword = async () => {
        const settingsRef = doc(firestore, 'config', 'settings');
        try {
            await setDoc(settingsRef, { privateDataPassword: password }, { merge: true });
            toast({
                title: 'Password Saved',
                description: 'The private data password has been updated.',
            });
        } catch (error) {
            console.error("Error saving password: ", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not save the password.',
            });
        }
    };
    
    if (isLoading) {
        return <Skeleton className="h-24 w-full" />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Private Data Password</CardTitle>
                <CardDescription>Set the password non-admins must enter to view report details.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Input
                    type="text"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleSavePassword}><Save className="mr-2 h-4 w-4" /> Save</Button>
            </CardContent>
        </Card>
    );
}

function ReportStats({ reports }: { reports: Report[] }) {
    const [filter, setFilter] = useState('all');

    const filteredCount = useMemo(() => {
        if (!reports || reports.length === 0) return 0;
        
        const now = new Date();
        switch (filter) {
            case 'today':
                const todayStart = startOfDay(now);
                return reports.filter(r => r.createdAt && new Date(r.createdAt.seconds * 1000) >= todayStart).length;
            case 'week':
                const weekStart = startOfWeek(now);
                return reports.filter(r => r.createdAt && new Date(r.createdAt.seconds * 1000) >= weekStart).length;
            case 'month':
                const monthStart = startOfMonth(now);
                return reports.filter(r => r.createdAt && new Date(r.createdAt.seconds * 1000) >= monthStart).length;
            case 'all':
            default:
                return reports.length;
        }
    }, [reports, filter]);
    
    return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Report Statistics</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{filteredCount}</div>
                <p className="text-xs text-muted-foreground">
                    Total reports for the selected period
                </p>
                <Tabs defaultValue="all" onValueChange={setFilter} className="mt-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="week">This Week</TabsTrigger>
                        <TabsTrigger value="month">This Month</TabsTrigger>
                        <TabsTrigger value="all">All Time</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default function AdminPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [visibleReportsCount, setVisibleReportsCount] = useState(INITIAL_VISIBLE_REPORTS);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
      router.replace('/');
      return;
    }

    if (firestore) {
      setIsLoading(true);
      const reportsRef = collection(firestore, 'reports');
      const q = query(reportsRef, orderBy('updatedAt', 'desc'));

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

      return () => unsubscribe();
    }
  }, [user, firestore, isUserLoading, router]);

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    const term = searchTerm.toUpperCase().trim();
    
    return reports.filter(report => {
      if (searchCategory === 'all') {
        return (
          report.vehicleId.toUpperCase().includes(term) ||
          (report.engineNumber || report.reportData?.engineNumber || '').toUpperCase().includes(term) ||
          (report.chassisNumber || report.reportData?.chassisNumber || '').toUpperCase().includes(term) ||
          (report.reportNumber || report.reportData?.reportNumber || '').toUpperCase().includes(term)
        );
      } else {
        const value = report[searchCategory as keyof Report] || report.reportData?.[searchCategory];
        return typeof value === 'string' && value.toUpperCase().includes(term);
      }
    });
  }, [reports, searchTerm, searchCategory]);

  const handleShowMore = () => {
    setVisibleReportsCount(prevCount => prevCount + INITIAL_VISIBLE_REPORTS);
  };
  
  const visibleReports = useMemo(() => {
      return filteredReports.slice(0, visibleReportsCount);
  }, [filteredReports, visibleReportsCount]);


  const renderContent = () => {
    if (isLoading || isUserLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                         <div className="relative pt-4 flex items-center gap-4">
                           <Skeleton className="h-10 w-full" />
                         </div>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                           <Skeleton key={i} className="h-48 w-full" />
                        ))}
                       </div>
                    </CardContent>
                </Card>
            </div>
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
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <ReportStats reports={reports} />
            </div>
            <div className="flex-1">
                 <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Layout Management</CardTitle>
                        <CardDescription>Customize the visual template used for all reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <Link href="/editor" passHref>
                            <Button size="lg" className="w-full">
                                <LayoutTemplate className="mr-2 h-5 w-5" />
                                Edit Master Layout
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
        
        <PasswordManager firestore={firestore} />

        <Card>
            <CardHeader>
                <CardTitle>All Reports ({reports.length})</CardTitle>
                <CardDescription>
                  Filter the database by specific identifier.
                </CardDescription>
                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <div className="w-full sm:w-48">
                        <Select value={searchCategory} onValueChange={setSearchCategory}>
                          <SelectTrigger>
                            <Filter className="mr-2 h-4 w-4 opacity-50" />
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Identifiers</SelectItem>
                            <SelectItem value="vehicleId">Registration No</SelectItem>
                            <SelectItem value="engineNumber">Engine No</SelectItem>
                            <SelectItem value="chassisNumber">Chassis No</SelectItem>
                            <SelectItem value="reportNumber">Report No</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Filter reports..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
            {visibleReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleReports.map(report => (
                        <Card key={report.id} className="border border-primary/10 shadow-sm overflow-hidden flex flex-col">
                             <CardHeader className="pb-3 bg-muted/30">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="font-mono text-primary font-bold text-xl">
                                    {report.vehicleId}
                                  </CardTitle>
                                  {(report.reportNumber || report.reportData?.reportNumber) && (
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-mono">
                                      {report.reportNumber || report.reportData?.reportNumber}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Calendar size={12} />
                                  {report.reportDate || 'No Date'}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Engine No:</span>
                                    <span className="font-bold">{report.engineNumber || report.reportData?.engineNumber || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Chassis No:</span>
                                    <span className="font-bold truncate max-w-[120px]">{report.chassisNumber || report.reportData?.chassisNumber || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="pt-2 border-t text-[10px] text-muted-foreground flex justify-between items-center">
                                    <span>Last Saved By: <span className="text-foreground/80 font-medium">{report.userName?.split(' ')[0] || 'Unknown'}</span></span>
                                    <span className="opacity-70">
                                      {report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-2 border-t mt-auto bg-muted/10">
                                <Link href={`/admin/history/${report.id}`} passHref>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                        <History className="mr-1.5 h-3 w-3" /> History
                                    </Button>
                                </Link>
                                <Link href={`/report/${report.vehicleId}`} passHref>
                                <Button variant="outline" size="sm" className="h-8 text-xs border-primary/20 hover:border-primary hover:text-primary">
                                    <Eye className="mr-1.5 h-3 w-3" /> View
                                </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No reports found{searchTerm ? ` for "${searchTerm}"` : ""}.</p>
                </div>
            )}
             {filteredReports.length > visibleReportsCount && (
                <div className="mt-6 text-center">
                    <Button onClick={handleShowMore} variant="secondary">See More Reports</Button>
                </div>
            )}
            </CardContent>
        </Card>
    </div>
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
