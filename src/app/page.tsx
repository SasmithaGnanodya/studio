'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, PlusCircle, Car, FileText, Wrench, Shield, Filter, Calendar as CalendarIcon, Hash, Fingerprint } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 6;

/**
 * Robust utility to extract identifiers from a report even if field names vary.
 */
function getIdentifiers(report: Report) {
  const data = report.reportData || {};
  
  const engine = report.engineNumber || 
                 data.engineNumber || 
                 Object.entries(data).find(([k]) => 
                   k.toLowerCase().includes('engine') || 
                   k.toLowerCase().includes('engno')
                 )?.[1] || 
                 'N/A';
                 
  const chassis = report.chassisNumber || 
                  data.chassisNumber || 
                  Object.entries(data).find(([k]) => 
                    k.toLowerCase().includes('chassis') || 
                    k.toLowerCase().includes('serial')
                  )?.[1] || 
                  'N/A';

  const reportNum = report.reportNumber || 
                    data.reportNumber || 
                    Object.entries(data).find(([k]) => 
                      k.toLowerCase().includes('reportnum') ||
                      k.toLowerCase().includes('reportno')
                    )?.[1] || 
                    'N/A';

  return {
    engine: String(engine).toUpperCase().trim(),
    chassis: String(chassis).toUpperCase().trim(),
    reportNum: String(reportNum).toUpperCase().trim(),
    date: report.reportDate || data.reportDate || data.date || 'N/A'
  };
}

/**
 * Utility to filter out duplicate vehicle reports, keeping only the most recent version.
 */
function getUniqueReports(reports: Report[]) {
  const seen = new Set<string>();
  return reports.filter(report => {
    const normalizedId = (report.vehicleId || '').toUpperCase().trim();
    if (!normalizedId) return false;
    const isDuplicate = seen.has(normalizedId);
    seen.add(normalizedId);
    return !isDuplicate;
  });
}

function ReportStats({ reports }: { reports: Report[] }) {
    const uniqueCount = useMemo(() => {
        if (!reports || reports.length === 0) return 0;
        return getUniqueReports(reports).length;
    }, [reports]);

    return (
         <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{uniqueCount}</div>
                <p className="text-xs text-muted-foreground">
                    Unique vehicles in the database
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
        if (!isUserLoading) {
            setAllReports([]);
            setIsLoadingReports(false);
        }
    }
  }, [user, firestore, isUserLoading]);

  const uniqueReports = useMemo(() => getUniqueReports(allReports), [allReports]);

  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 1) return [];
    const term = searchTerm.toUpperCase().trim();
    
    return uniqueReports.filter(report => {
      const ids = getIdentifiers(report);
      const vid = (report.vehicleId || '').toUpperCase();
      const en = ids.engine.toUpperCase();
      const ch = ids.chassis.toUpperCase();
      const rn = ids.reportNum.toUpperCase();
      const dt = ids.date.toUpperCase();

      if (searchCategory === 'all') {
        return vid.includes(term) || en.includes(term) || ch.includes(term) || rn.includes(term) || dt.includes(term);
      } else if (searchCategory === 'vehicleId') {
        return vid.includes(term);
      } else if (searchCategory === 'engineNumber') {
        return en.includes(term);
      } else if (searchCategory === 'chassisNumber') {
        return ch.includes(term);
      } else if (searchCategory === 'reportNumber') {
        return rn.includes(term);
      } else if (searchCategory === 'reportDate') {
        return dt.includes(term);
      }
      return false;
    }).slice(0, 15);
  }, [uniqueReports, searchTerm, searchCategory]);

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
    setSearchTerm(e.target.value.toUpperCase());
  };
  
  const handleShowMore = () => {
    setVisibleReportsCount(prevCount => prevCount + INITIAL_VISIBLE_REPORTS);
  };
  
  const visibleRecentReports = useMemo(() => {
      return uniqueReports.slice(0, visibleReportsCount);
  }, [uniqueReports, visibleReportsCount]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/10">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
           <Skeleton className="h-64 w-full max-w-4xl rounded-xl" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/10">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-3xl text-center bg-card/50 backdrop-blur-sm border-primary/20 shadow-2xl">
              <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">Valuation Report Generator</CardTitle>
                  <CardDescription className="text-lg">Sign in to manage vehicle records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 py-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2"><FileText className="mx-auto h-10 w-10 text-accent" /><h3 className="font-semibold">Reports</h3></div>
                      <div className="space-y-2"><Wrench className="mx-auto h-10 w-10 text-accent" /><h3 className="font-semibold">Real-time</h3></div>
                      <div className="space-y-2"><Shield className="mx-auto h-10 w-10 text-accent" /><h3 className="font-semibold">Secure</h3></div>
                  </div>
              </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 flex flex-col items-center p-4 space-y-6">
        <div className="w-full max-w-4xl grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm shadow-xl border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><Search className="h-6 w-6 text-primary" /> Vehicle Search</CardTitle>
                <CardDescription>Filter reports by Engine, Chassis, Report Number or Date.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="w-full sm:w-48 shrink-0">
                      <Select value={searchCategory} onValueChange={(val) => { setSearchCategory(val); setSearchTerm(''); }}>
                        <SelectTrigger className="h-12 bg-background/50">
                          <Filter className="mr-2 h-4 w-4 opacity-50 text-primary" /><SelectValue placeholder="Category" />
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
                      {searchCategory === 'reportDate' ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full h-12 justify-start border-primary/20 bg-background/50 pl-10", !searchTerm && "text-muted-foreground")}>
                              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
                              {searchTerm ? searchTerm : <span>Select Date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={searchTerm ? new Date(searchTerm) : undefined} onSelect={(date) => setSearchTerm(date ? format(date, "yyyy-MM-dd") : '')} initialFocus />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <>
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchChange} onKeyDown={handleKeyDown} className="pl-10 text-lg w-full h-12 border-primary/20 bg-background/50" />
                        </>
                      )}
                    </div>
                  </div>
                  {noResults && searchTerm && (searchCategory === 'all' || searchCategory === 'vehicleId') && (
                    <Button onClick={handleCreateNew} size="lg" className="w-full"><PlusCircle className="mr-2 h-5 w-5" /> Create New Report for "{searchTerm}"</Button>
                  )}
                </div>

                <div className="mt-6">
                  {isLoadingReports ? (
                    <div className="flex flex-col items-center py-6 gap-2"><Wrench className="animate-spin" /><p className="text-sm">Searching...</p></div>
                  ) : searchResults.length > 0 ? (
                    <ul className="space-y-3">
                      {searchResults.map((report) => {
                        const ids = getIdentifiers(report);
                        return (
                          <li key={report.id}>
                            <Link href={`/report/${report.vehicleId}`} passHref>
                              <div className="flex items-center p-4 rounded-xl border bg-card/80 hover:bg-primary/5 cursor-pointer shadow-sm">
                                <div className="p-3 rounded-full bg-primary/10 mr-4"><Car className="h-6 w-6 text-primary" /></div>
                                <div className='flex-grow overflow-hidden'>
                                  <div className="flex justify-between items-center"><p className="font-bold text-xl font-mono text-primary">{report.vehicleId}</p><span className="text-[10px] bg-primary/10 px-2 py-1 rounded">#{ids.reportNum}</span></div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[11px]">
                                    <span className="flex items-center gap-1"><Fingerprint size={12} /> Eng: <strong>{ids.engine}</strong></span>
                                    <span className="flex items-center gap-1"><Hash size={12} /> Chas: <strong>{ids.chassis}</strong></span>
                                    <span className="flex items-center gap-1"><CalendarIcon size={12} /> Date: {ids.date}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : searchTerm && <div className="text-center p-8 border-2 border-dashed rounded-xl"><p>No results found matching "{searchTerm}"</p></div>}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <ReportStats reports={allReports} />
            <Card className="bg-card/50 backdrop-blur-sm"><CardHeader><CardTitle className="text-sm">Help</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground"><p>• Filter by any ID to find reports instantly.</p></CardContent></Card>
          </div>
        </div>
      </main>
    </div>
  );
}