'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, PlusCircle, Car, FileText, Wrench, Shield, Filter, Calendar as CalendarIcon, Hash, Fingerprint, Clock, ChevronRight, BarChart3, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
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

function getIdentifiers(report: Report) {
  const data = report.reportData || {};
  
  const engine = report.engineNumber || 
                 data.engineNumber || 
                 Object.entries(data).find(([k]) => 
                   ['engine', 'engno', 'motor', 'engnum', 'eng'].some(p => k.toLowerCase().includes(p))
                 )?.[1] || 
                 'N/A';
                 
  const chassis = report.chassisNumber || 
                  data.chassisNumber || 
                  Object.entries(data).find(([k]) => 
                    ['chassis', 'serial', 'vin', 'chas'].some(p => k.toLowerCase().includes(p))
                  )?.[1] || 
                  'N/A';

  // Strictly use generated valuation ID format, avoid legacy 'V' keys or data-bound fallbacks
  let reportNum = report.reportNumber || 'DRAFT';
  
  // Sanitize legacy formats
  if (reportNum.startsWith('V') && !reportNum.includes('-') && !reportNum.startsWith('CD')) {
    reportNum = 'DRAFT';
  }

  return {
    engine: String(engine).toUpperCase().trim(),
    chassis: String(chassis).toUpperCase().trim(),
    reportNum: String(reportNum).toUpperCase().trim(),
    date: report.reportDate || data.reportDate || data.date || 'N/A'
  };
}

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
         <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Database</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-primary">{uniqueCount}</div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                    <TrendingUp size={10} className="text-green-500" /> Unique Vehicle Records
                </p>
            </CardContent>
        </Card>
    )
}

function ReportCard({ report }: { report: Report }) {
    const ids = getIdentifiers(report);
    const isIssued = ids.reportNum !== 'DRAFT' && ids.reportNum !== 'N/A';

    return (
        <Link href={`/report/${report.vehicleId}`} passHref>
            <Card className="group hover:border-primary/50 transition-all cursor-pointer bg-card/40 backdrop-blur-md shadow-lg overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-3 bg-muted/20 border-b">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            <CardTitle className="text-lg font-bold font-mono text-primary group-hover:underline">
                                {report.vehicleId}
                            </CardTitle>
                        </div>
                        <div className={cn(
                          "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold transition-colors font-mono",
                          isIssued ? "border-primary/20 bg-primary/5 text-primary" : "border-muted-foreground/20 bg-muted/5 text-muted-foreground"
                        )}>
                            {ids.reportNum}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-grow">
                    <div className="grid grid-cols-2 gap-y-3 text-[11px]">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider mb-1">Engine Number</span>
                            <span className="font-bold flex items-center gap-1.5 truncate"><Fingerprint size={12} className="text-primary shrink-0" /> {ids.engine}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider mb-1">Chassis Number</span>
                            <span className="font-bold flex items-center gap-1.5 truncate"><Hash size={12} className="text-primary shrink-0" /> {ids.chassis}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider mb-1">Report Date</span>
                            <span className="flex items-center gap-1.5 font-medium"><CalendarIcon size={12} className="text-primary shrink-0" /> {ids.date}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider mb-1">Last Updated</span>
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium"><Clock size={12} className="shrink-0" /> {report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </CardContent>
                <div className="px-6 py-2.5 bg-muted/10 border-t flex justify-between items-center mt-auto">
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px] font-medium italic">By: {report.userName || 'Unknown User'}</span>
                    <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                </div>
            </Card>
        </Link>
    );
}

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [visibleReportsCount, setVisibleReportsCount] = useState(6);

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
    } else if (!isUserLoading) {
        setAllReports([]);
        setIsLoadingReports(false);
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
      } else if (searchCategory === 'vehicleId') return vid.includes(term);
      else if (searchCategory === 'engineNumber') return en.includes(term);
      else if (searchCategory === 'chassisNumber') return ch.includes(term);
      else if (searchCategory === 'reportNumber') return rn.includes(term);
      else if (searchCategory === 'reportDate') return dt.includes(term);
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
      if (searchResults.length > 0) router.push(`/report/${searchResults[0].vehicleId}`);
      else if (searchTerm && (searchCategory === 'all' || searchCategory === 'vehicleId')) handleCreateNew();
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/10">
        <Header /><main className="flex-1 flex flex-col items-center justify-center p-4"><Skeleton className="h-64 w-full max-w-4xl rounded-xl" /></main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/10">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-4xl bg-card/50 backdrop-blur-sm border-primary/20 shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12 space-y-6 flex flex-col justify-center bg-primary/5">
                      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          <Shield size={14} /> Enterprise Security
                      </div>
                      <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                          Professional Vehicle <span className="text-primary">Valuation</span> Management.
                      </h1>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                          The industry-standard platform for generating precision valuation reports with real-time indexing and layout versioning.
                      </p>
                      <div className="pt-4 flex flex-col gap-4">
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-md text-primary mt-1"><FileText size={18} /></div>
                              <div><h4 className="font-bold text-sm">Dynamic Report Generation</h4><p className="text-xs text-muted-foreground">Live-preview filling on pre-printed layout versions.</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-md text-primary mt-1"><Search size={18} /></div>
                              <div><h4 className="font-bold text-sm">Instant Global Search</h4><p className="text-xs text-muted-foreground">Find records by Engine, Chassis, or Registration instantly.</p></div>
                          </div>
                      </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col items-center justify-center space-y-8 bg-card">
                      <div className="text-center space-y-2">
                          <h3 className="text-2xl font-bold">Secure Access Only</h3>
                          <p className="text-sm text-muted-foreground">Authorized personnel must authenticate via Google to continue.</p>
                      </div>
                      <div className="w-full max-w-xs p-6 border-2 border-dashed rounded-2xl flex flex-col items-center gap-4 bg-muted/20">
                          <ShieldCheck size={48} className="text-primary/40" />
                          <p className="text-[10px] uppercase font-bold text-center tracking-widest opacity-50">Identity Verification Required</p>
                      </div>
                  </div>
              </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 space-y-12">
        {/* Search & Statistics Hero */}
        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card shadow-2xl border-primary/10 overflow-visible">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                    <Search className="h-7 w-7 text-primary" /> Global Records
                </CardTitle>
                <CardDescription className="text-base">Enter vehicle identifiers to retrieve or create valuation records.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="w-full md:w-56 shrink-0">
                      <Select value={searchCategory} onValueChange={(val) => { setSearchCategory(val); setSearchTerm(''); }}>
                        <SelectTrigger className="h-14 bg-muted/50 font-bold border-primary/20">
                          <Filter className="mr-2 h-4 w-4 text-primary" /><SelectValue placeholder="Category" />
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
                            <Button variant="outline" className={cn("w-full h-14 justify-start border-primary/20 bg-muted/50 pl-12 text-lg font-mono", !searchTerm && "text-muted-foreground")}>
                              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                              {searchTerm ? searchTerm : <span>Filter by Inspection Date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-50" align="start">
                            <Calendar mode="single" selected={searchTerm ? new Date(searchTerm) : undefined} onSelect={(date) => setSearchTerm(date ? format(date, "yyyy-MM-dd") : '')} initialFocus />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="text" 
                            placeholder={`Search by ${searchCategory === 'all' ? 'any identifier' : searchCategory.replace(/([A-Z])/g, ' $1')}...`} 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())} 
                            onKeyDown={handleKeyDown} 
                            className="pl-12 text-lg font-mono w-full h-14 border-primary/20 bg-muted/50 focus:border-primary focus:ring-primary shadow-inner" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {noResults && searchTerm && (searchCategory === 'all' || searchCategory === 'vehicleId') && (
                    <Button onClick={handleCreateNew} size="lg" className="w-full h-14 text-lg font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
                        <PlusCircle className="mr-3 h-6 w-6" /> Create New Report: "{searchTerm}"
                    </Button>
                  )}
                </div>

                {searchTerm && (
                    <div className="mt-8 pt-8 border-t border-muted animate-in fade-in duration-300">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Car size={14} className="text-primary" /> Matching Records
                        </h4>
                        {isLoadingReports ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <Wrench className="animate-spin text-primary h-8 w-8" />
                                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Scanning Cloud Database...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <ul className="space-y-4">
                                {searchResults.map((report) => (
                                    <li key={report.id}><ReportCard report={report} /></li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/20">
                                <Car size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-muted-foreground">No indexed records found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                )}
              </CardContent>
            </Card>

            {/* Help Instructions & Workflow Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                            <Search className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-bold">1. Query Database</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                            Utilize unique identifiers like Reg No or Engine No to perform a global search across our secure cloud infrastructure.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-bold">2. Audit Integrity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                            Matching records display detailed technical logs and historical valuations, ensuring full audit transparency.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-bold">3. Instant Dispatch</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                            If no record is found, initialize a new professional report immediately using the latest layout version standards.
                        </p>
                    </CardContent>
                </Card>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <ReportStats reports={allReports} />
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" /> Platform Support
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-[11px] leading-relaxed text-muted-foreground space-y-4 font-medium">
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-primary font-bold mb-1">Registration Matching</p>
                        <p>Search using a vehicle's registration number for direct record matching or to initialize a new report entry.</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="font-bold mb-1 text-foreground">Real-time Syncing</p>
                        <p>Critical identifiers like Engine and Chassis numbers are indexed in real-time as you fill the report for global discoverability.</p>
                    </div>
                    <div className="pt-2 border-t flex items-center gap-2 italic">
                        <ShieldCheck size={14} className="text-primary" />
                        <span>All operations are audit-logged for security.</span>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Section */}
        {!searchTerm && (
            <div className="w-full max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6 border-primary/20">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                            <Clock className="text-primary" /> Recent Synchronizations
                        </h2>
                        <p className="text-muted-foreground font-medium">Live audit log of the most recently updated valuation reports across the platform.</p>
                    </div>
                    <div className="inline-flex items-center rounded-md border px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/30 animate-pulse">
                        <TrendingUp size={12} className="mr-2" /> Live Stream
                    </div>
                </div>
                
                {isLoadingReports ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                ) : uniqueReports.length > 0 ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {uniqueReports.slice(0, visibleReportsCount).map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                        
                        {uniqueReports.length > visibleReportsCount && (
                            <div className="flex justify-center pt-4">
                                <Button onClick={() => setVisibleReportsCount(p => p + 6)} variant="outline" size="lg" className="border-primary/50 text-primary hover:bg-primary/10 px-10 font-bold h-12">
                                    Load Previous Records
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-card/20 rounded-3xl border-2 border-dashed border-primary/10">
                        <FileText className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" />
                        <h3 className="text-xl font-bold">No Records Found</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">Create your first vehicle valuation report to see it appear here in real-time.</p>
                    </div>
                )}
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}