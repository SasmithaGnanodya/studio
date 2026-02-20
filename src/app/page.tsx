'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, PlusCircle, Car, FileText, Wrench, Shield, Filter, Calendar, Hash, Fingerprint } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 6;

function ReportStats({ reports }: { reports: Report[] }) {
    const totalCount = useMemo(() => {
        if (!reports || reports.length === 0) return 0;
        return reports.length;
    }, [reports]);

    return (
         <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-xs text-muted-foreground">
                    Number of reports in the system
                </p>
            </CardContent>
        </Card>
    )
}

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [visibleReportsCount, setVisibleReportsCount] = useState(INITIAL_VISIBLE_REPORTS);

  const router = useRouter();
  const { firestore, user, isUserLoading } = useFirebase();

  const isAdmin = useMemo(() => {
    return user?.email && ADMIN_EMAILS.includes(user.email);
  }, [user]);

  // Fetch all reports in real-time to allow for substring "similar" search
  useEffect(() => {
    if (user && firestore) {
      setIsLoadingReports(true);
      const reportsRef = collection(firestore, 'reports');
      const q = query(reportsRef, orderBy('updatedAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedReports: Report[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) });
        });
        setAllReports(fetchedReports);
        setIsLoadingReports(false);
      }, (error) => {
        console.error("Error fetching all reports: ", error);
        setIsLoadingReports(false);
      });

      return () => unsubscribe();
    } else {
        setAllReports([]);
        setIsLoadingReports(false);
    }
  }, [user, firestore]);

  // Filter reports locally to show "similar" results (substring match)
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) return [];
    const term = searchTerm.toUpperCase().trim();
    
    return allReports.filter(report => {
      if (searchCategory === 'all') {
        return (
          report.vehicleId.toUpperCase().includes(term) ||
          (report.engineNumber || report.reportData?.engineNumber || '').toUpperCase().includes(term) ||
          (report.chassisNumber || report.reportData?.chassisNumber || '').toUpperCase().includes(term) ||
          (report.reportNumber || report.reportData?.reportNumber || '').toUpperCase().includes(term) ||
          (report.reportDate || '').toUpperCase().includes(term)
        );
      } else {
        const value = report[searchCategory as keyof Report] || report.reportData?.[searchCategory];
        return typeof value === 'string' && value.toUpperCase().includes(term);
      }
    }).slice(0, 10);
  }, [allReports, searchTerm, searchCategory]);

  const noResults = searchTerm.length >= 2 && searchResults.length === 0;

  const handleCreateNew = () => {
    if (searchTerm) {
      const normalizedId = searchTerm.toUpperCase().trim();
      router.push(`/report/${normalizedId}`);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        router.push(`/report/${searchResults[0].vehicleId}`);
      } else if (searchTerm && (searchCategory === 'all' || searchCategory === 'vehicleId')) {
        handleCreateNew();
      }
    }
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value.toUpperCase();
    setSearchTerm(formattedValue);
  };
  
  const handleShowMore = () => {
    setVisibleReportsCount(prevCount => prevCount + INITIAL_VISIBLE_REPORTS);
  };
  
  const visibleReports = useMemo(() => {
      return allReports.slice(0, visibleReportsCount);
  }, [allReports, visibleReportsCount]);

  const renderContent = () => {
    if (isUserLoading) {
      return (
        <Card className="w-full max-w-4xl bg-card/50 backdrop-blur-sm">
          <CardHeader>
             <Skeleton className="h-8 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex w-full items-center space-x-2">
               <Skeleton className="h-12 w-full" />
            </div>
            <div className="mt-6 min-h-[150px] border-2 border-dashed rounded-lg flex items-center justify-center">
               <Skeleton className="h-6 w-1/4" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!user) {
      return (
        <Card className="w-full max-w-3xl text-left bg-card/50 backdrop-blur-sm border-primary/20 shadow-primary/10 shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary">Welcome to the Valuation Report Generator</CardTitle>
                <CardDescription className="text-lg">
                  A powerful tool to create, manage, and collaborate on vehicle valuation reports.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                        <FileText className="mx-auto h-10 w-10 text-accent" />
                        <h3 className="font-semibold">Dynamic Reports</h3>
                        <p className="text-sm text-muted-foreground">Instantly create new reports or search for existing ones by ID. Enjoy a live preview as you fill in data.</p>
                    </div>
                    <div className="space-y-2">
                        <Wrench className="mx-auto h-10 w-10 text-accent" />
                        <h3 className="font-semibold">Interactive Editing</h3>
                        <p className="text-sm text-muted-foreground">Fill out reports directly within the PDF layout. Drag and drop fields in the admin editor for pixel-perfect templates.</p>
                    </div>
                    <div className="space-y-2">
                        <Shield className="mx-auto h-10 w-10 text-accent" />
                        <h3 className="font-semibold">Advanced Search</h3>
                        <p className="text-sm text-muted-foreground">Quickly find reports using Registration Number, Engine Number, Chassis Number, or Report ID.</p>
                    </div>
                </div>
                <div className="text-center pt-4 border-t">
                    <p className="mt-4 text-base text-muted-foreground">
                        Please sign in to access the dashboard and begin.
                    </p>
                </div>
            </CardContent>
        </Card>
      );
    }

    return (
      <div className="w-full max-w-4xl space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card className="bg-card/50 backdrop-blur-sm shadow-xl border-primary/10">
                    <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Search className="h-6 w-6 text-primary" />
                      Search Report Database
                    </CardTitle>
                    <CardDescription>
                        Find existing reports by any identifier or enter a new Registration Number.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="w-full sm:w-48 shrink-0">
                            <Select value={searchCategory} onValueChange={setSearchCategory}>
                              <SelectTrigger className="w-full h-12 bg-background/50">
                                <Filter className="mr-2 h-4 w-4 opacity-50 text-primary" />
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Identifiers</SelectItem>
                                <SelectItem value="vehicleId">Registration No</SelectItem>
                                <SelectItem value="engineNumber">Engine No</SelectItem>
                                <SelectItem value="chassisNumber">Chassis No</SelectItem>
                                <SelectItem value="reportNumber">Report No</SelectItem>
                                <SelectItem value="reportDate">Report Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="relative flex-grow w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={`Enter ${searchCategory === 'all' ? 'any identifier' : searchCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                className="pl-10 text-lg w-full h-12 border-primary/20 bg-background/50 focus:ring-primary"
                            />
                          </div>
                        </div>
                        {noResults && searchTerm && (searchCategory === 'all' || searchCategory === 'vehicleId') && (
                        <Button onClick={handleCreateNew} size="lg" className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add New Report for "{searchTerm}"
                        </Button>
                        )}
                    </div>

                    <div className="mt-6 min-h-[100px]">
                        {isLoadingReports ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                          <Wrench className="h-6 w-6 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Loading database...</p>
                        </div>
                        ) : searchResults.length > 0 ? (
                        <ul className="space-y-2">
                            {searchResults.map((report) => (
                            <li key={report.id}>
                                <Link href={`/report/${report.vehicleId}`} passHref>
                                <div className="flex items-center p-4 rounded-xl border bg-card/80 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer shadow-sm group">
                                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mr-4 shrink-0">
                                      <Car className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className='flex-grow overflow-hidden'>
                                        <div className="flex items-center justify-between gap-2">
                                          <p className="font-bold text-xl tracking-tight font-mono text-primary truncate">
                                            {report.vehicleId}
                                          </p>
                                          {(report.reportNumber || report.reportData?.reportNumber) && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-mono border border-primary/20 flex items-center gap-1">
                                              <Hash size={10} />
                                              {report.reportNumber || report.reportData?.reportNumber}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-1">
                                          <span className="flex items-center gap-1">
                                            <Fingerprint size={10} />
                                            Eng: <span className="font-bold text-foreground">{report.engineNumber || report.reportData?.engineNumber || 'N/A'}</span>
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <Hash size={10} />
                                            Chassis: <span className="font-bold text-foreground truncate max-w-[150px]">{report.chassisNumber || report.reportData?.chassisNumber || 'N/A'}</span>
                                          </span>
                                          <span className="flex items-center gap-1 ml-auto">
                                            <Calendar size={10} />
                                            {report.reportDate || 'N/A'}
                                          </span>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                            </li>
                            ))}
                        </ul>
                        ) : noResults ? (
                            <div className="text-center p-8 border-2 border-dashed rounded-xl bg-muted/20">
                            <p className="text-muted-foreground text-lg">No records found matching '<span className='font-bold text-primary'>{searchTerm}</span>'</p>
                            <p className="text-sm text-muted-foreground mt-1">Check the identifiers or start a new entry using the button above.</p>
                        </div>
                        ) : (
                        !searchTerm && (
                            <div className="text-center p-8 border-2 border-dashed rounded-xl bg-muted/10 opacity-60">
                              <p className="text-muted-foreground flex flex-col items-center gap-2">
                                <Filter size={24} />
                                Search for existing reports or enter a Reg No to create a new one.
                              </p>
                            </div>
                        )
                        )}
                    </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                 <ReportStats reports={allReports} />
            </div>
        </div>

        {isAdmin && (
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recently Updated</CardTitle>
                  <CardDescription>Latest vehicle valuations in the system.</CardDescription>
                </div>
                <Link href="/admin" passHref>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {isLoadingReports ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                     <Skeleton key={i} className="h-48 w-full rounded-xl" />
                  ))}
                </div>
              ) : visibleReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleReports.map(report => (
                        <Link key={report.id} href={`/report/${report.vehicleId}`} passHref>
                            <Card className="h-full hover:bg-primary/5 transition-all cursor-pointer border-primary/10 hover:border-primary/40 group overflow-hidden shadow-sm">
                                <CardHeader className="pb-3 bg-muted/10">
                                    <div className="flex justify-between items-start">
                                      <CardTitle className="font-mono text-primary text-xl font-bold tracking-tight">
                                        {report.vehicleId}
                                      </CardTitle>
                                      {(report.reportNumber || report.reportData?.reportNumber) && (
                                        <span className="text-[9px] bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 font-mono">
                                          {report.reportNumber || report.reportData?.reportNumber}
                                        </span>
                                      )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-4">
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-muted-foreground flex items-center gap-1"><Fingerprint size={10} /> Engine No:</span>
                                        <span className="font-bold text-foreground">{report.engineNumber || report.reportData?.engineNumber || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-muted-foreground flex items-center gap-1"><Hash size={10} /> Chassis:</span>
                                        <span className="font-bold text-foreground truncate max-w-[120px]">{report.chassisNumber || report.reportData?.chassisNumber || 'N/A'}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 border-t mt-2 text-[10px] text-muted-foreground">
                                        <Calendar size={12} className="shrink-0 text-primary/70" />
                                        <span className="font-medium">{report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                                        <span className="ml-auto opacity-70 truncate bg-muted px-1.5 py-0.5 rounded-sm">{report.userName?.split(' ')[0] || 'User'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 opacity-60">
                  <p className="text-muted-foreground">No reports found in the system.</p>
                </div>
              )}
               {allReports.length > visibleReportsCount && (
                <div className="mt-6 text-center">
                    <Button onClick={handleShowMore} variant="secondary" className="px-10">See More Reports</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        {renderContent()}
      </main>
    </div>
  );
}
