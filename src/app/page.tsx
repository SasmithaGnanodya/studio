
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, PlusCircle, Car, FileText, Wrench, Shield, Filter, Calendar as CalendarIcon, Hash, Fingerprint, Clock, ChevronRight } from 'lucide-react';
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
 * Robust utility to extract identifiers from a report using greedy scanning.
 * This ensures that critical data is never missed in search results, even with unique IDs.
 */
function getIdentifiers(report: Report) {
  const data = report.reportData || {};
  
  // Greedy scanning for engine patterns
  const engine = report.engineNumber || 
                 data.engineNumber || 
                 Object.entries(data).find(([k]) => 
                   ['engine', 'engno', 'motor', 'engnum', 'eng'].some(p => k.toLowerCase().includes(p))
                 )?.[1] || 
                 'N/A';
                 
  // Greedy scanning for chassis patterns
  const chassis = report.chassisNumber || 
                  data.chassisNumber || 
                  Object.entries(data).find(([k]) => 
                    ['chassis', 'serial', 'vin', 'chas'].some(p => k.toLowerCase().includes(p))
                  )?.[1] || 
                  'N/A';

  // Greedy scanning for report number patterns
  const reportNum = report.reportNumber || 
                    data.reportNumber || 
                    Object.entries(data).find(([k]) => 
                      ['reportnumber', 'reportno', 'ref', 'val', 'v-', 'valuation', 'id'].some(p => k.toLowerCase().includes(p))
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

function ReportCard({ report }: { report: Report }) {
    const ids = getIdentifiers(report);
    return (
        <Link href={`/report/${report.vehicleId}`} passHref>
            <Card className="group hover:border-primary/50 transition-all cursor-pointer bg-card/40 backdrop-blur-md shadow-lg overflow-hidden h-full">
                <CardHeader className="pb-3 bg-muted/20">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg font-bold font-mono text-primary group-hover:underline">
                                {report.vehicleId}
                            </CardTitle>
                        </div>
                        <Badge variant="outline" className="font-mono text-[10px] bg-primary/5">
                            #{ids.reportNum}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Engine Number</span>
                            <span className="font-bold flex items-center gap-1"><Fingerprint size={12} className="text-primary" /> {ids.engine}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Chassis Number</span>
                            <span className="font-bold flex items-center gap-1"><Hash size={12} className="text-primary" /> {ids.chassis}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Report Date</span>
                            <span className="flex items-center gap-1"><CalendarIcon size={12} className="text-primary" /> {ids.date}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Last Sync</span>
                            <span className="flex items-center gap-1 text-muted-foreground"><Clock size={12} /> {report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
                <div className="px-6 py-2 bg-muted/10 border-t flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">By: {report.userName || 'Unknown'}</span>
                    <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </Card>
        </Link>
    );
}

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) {
    return (
        <div className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variant === "outline" ? "text-foreground" : "bg-primary text-primary-foreground",
            className
        )}>
            {children}
        </div>
    );
}

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [visibleReportsCount, setVisibleReportsCount] = useState(INITIAL_VISIBLE_REPORTS);

  const router = useRouter();
  const { firestore, user, isUserLoading } = useFirebase();

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
      <main className="flex-1 flex flex-col items-center p-4 space-y-12">
        {/* Main Search & Stats Section */}
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
                    <div className="flex flex-col items-center py-6 gap-2"><Wrench className="animate-spin text-primary" /><p className="text-sm">Searching Database...</p></div>
                  ) : searchResults.length > 0 ? (
                    <ul className="space-y-3">
                      {searchResults.map((report) => (
                        <li key={report.id}>
                          <ReportCard report={report} />
                        </li>
                      ))}
                    </ul>
                  ) : searchTerm && <div className="text-center p-8 border-2 border-dashed rounded-xl"><p>No results found matching "{searchTerm}"</p></div>}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <ReportStats reports={allReports} />
            <Card className="bg-card/50 backdrop-blur-sm shadow-lg border-primary/10">
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Help & Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-3">
                    <p>• Use <strong>Registration Number</strong> for direct matching and new report creation.</p>
                    <p>• Filter by <strong>Engine</strong>, <strong>Chassis</strong> or <strong>Report No</strong> to find specific vehicle records.</p>
                    <p>• The <strong>Calendar</strong> helps find reports created on specific dates.</p>
                    <div className="pt-2 border-t border-primary/10">
                        <p className="italic">Pro Tip: Press 'Enter' after typing a new registration number to start a report instantly.</p>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Reports Section */}
        {!searchTerm && (
            <div className="w-full max-w-6xl space-y-6">
                <div className="flex items-center justify-between border-b pb-4 border-primary/20">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <Clock className="text-primary" /> Recent Valuation Reports
                        </h2>
                        <p className="text-sm text-muted-foreground">Showing the latest synchronized records from all users.</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                        Live Stream Active
                    </Badge>
                </div>
                
                {isLoadingReports ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                ) : visibleRecentReports.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleRecentReports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                        
                        {uniqueReports.length > visibleReportsCount && (
                            <div className="flex justify-center pt-8">
                                <Button onClick={handleShowMore} variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 min-w-[200px]">
                                    Load More Reports
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-card/20 rounded-2xl border-2 border-dashed border-primary/10">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium">No reports found</h3>
                        <p className="text-sm text-muted-foreground">Create your first vehicle report to see it appear here.</p>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}
