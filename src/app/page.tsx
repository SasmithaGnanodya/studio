'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, PlusCircle, Car, FileText, Wrench, Shield, Filter, Calendar as CalendarIcon, Hash, Fingerprint, Clock, ChevronRight, BarChart3, TrendingUp, ShieldCheck, Zap, Megaphone, X, Lock } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, onSnapshot, orderBy, query, doc } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

function getIdentifiers(report: Report) {
  const engine = report.engineNumber || 'N/A';
  const chassis = report.chassisNumber || 'N/A';
  let reportNum = report.reportNumber || 'DRAFT';
  const isIssued = /^(CDH|CDK)\d{9}$/.test(reportNum);
  const rawId = (report.vehicleId || '').toUpperCase();
  const displayId = rawId.startsWith('UR-') ? 'U/R' : rawId;

  return { engine, chassis, reportNum: isIssued ? reportNum : 'DRAFT', date: report.reportDate || 'N/A', displayId };
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

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [visibleReportsCount, setVisibleReportsCount] = useState(6);

  const [announcement, setAnnouncement] = useState<{ message: string, isActive: boolean } | null>(null);
  const [systemStatus, setSystemStatus] = useState({ isLocked: false, maintenanceMessage: '' });
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const router = useRouter();
  const { firestore, user, isUserLoading } = useFirebase();

  useEffect(() => {
    if (user && firestore) {
      setIsLoadingReports(true);
      const unsubReports = onSnapshot(query(collection(firestore, 'reports'), orderBy('updatedAt', 'desc')), (snap) => {
        const fetched: Report[] = [];
        snap.forEach((doc) => fetched.push({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) }));
        setAllReports(fetched);
        setIsLoadingReports(false);
      });

      const unsubAnn = onSnapshot(doc(firestore, 'config', 'announcement'), (snap) => {
        if (snap.exists()) setAnnouncement(snap.data() as any);
      });

      const unsubSys = onSnapshot(doc(firestore, 'config', 'system'), (snap) => {
        if (snap.exists()) setSystemStatus(snap.data() as any);
      });

      return () => { unsubReports(); unsubAnn(); unsubSys(); };
    } else if (!isUserLoading) {
        setAllReports([]); setIsLoadingReports(false);
    }
  }, [user, firestore, isUserLoading]);

  const uniqueReports = useMemo(() => getUniqueReports(allReports), [allReports]);

  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 1) return [];
    const term = searchTerm.toUpperCase().trim();
    return uniqueReports.filter(r => {
      const ids = getIdentifiers(r);
      if (searchCategory === 'all') return ids.displayId.includes(term) || ids.engine.toUpperCase().includes(term) || ids.chassis.toUpperCase().includes(term) || ids.reportNum.includes(term) || ids.date.includes(term);
      if (searchCategory === 'vehicleId') return ids.displayId.includes(term);
      if (searchCategory === 'engineNumber') return ids.engine.toUpperCase().includes(term);
      if (searchCategory === 'chassisNumber') return ids.chassis.toUpperCase().includes(term);
      if (searchCategory === 'reportNumber') return ids.reportNum.includes(term);
      if (searchCategory === 'reportDate') return ids.date.includes(term);
      return false;
    }).slice(0, 15);
  }, [uniqueReports, searchTerm, searchCategory]);

  const handleCreateNew = () => {
    if (searchTerm && !systemStatus.isLocked) {
      router.push(`/report/${searchTerm.toUpperCase().trim()}`);
    }
  };

  if (isUserLoading) return <div className="min-h-screen bg-muted/10"><Header /><main className="p-4 flex justify-center"><Skeleton className="h-64 w-full max-w-4xl" /></main></div>;

  if (!user) return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-4xl border-primary/20 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden grid md:grid-cols-2">
          <div className="p-12 space-y-6 bg-primary/5">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase font-black tracking-widest text-[10px]">Enterprise Secure</Badge>
            <h1 className="text-4xl font-black leading-tight">Professional Vehicle <span className="text-primary">Valuation</span> Management.</h1>
            <p className="text-muted-foreground leading-relaxed font-medium">Industry standard for technical vehicle indexing and layout versioning.</p>
          </div>
          <div className="p-12 flex flex-col items-center justify-center space-y-6 bg-card">
            <div className="text-center space-y-2"><h3 className="text-xl font-bold">Authentication Required</h3><p className="text-sm text-muted-foreground">Authorized personnel only.</p></div>
            <div className="w-full h-48 border-2 border-dashed rounded-3xl bg-muted/20 flex flex-col items-center justify-center gap-4 opacity-50"><ShieldCheck size={48} /><p className="text-[10px] font-black uppercase tracking-widest">Google Identity Verification</p></div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 p-4 sm:p-8 space-y-12">
        
        {systemStatus.isLocked && (
          <Alert variant="destructive" className="max-w-5xl mx-auto border-2 border-destructive/30 bg-destructive/5 shadow-lg animate-in slide-in-from-top-4">
            <Lock className="h-5 w-5" />
            <AlertTitle className="font-black uppercase tracking-widest text-[10px]">System Lock Active</AlertTitle>
            <AlertDescription className="font-bold text-sm">{systemStatus.maintenanceMessage}</AlertDescription>
          </Alert>
        )}

        {announcement?.isActive && showAnnouncement && (
          <Alert className="max-w-5xl mx-auto bg-primary/10 border-primary/20 text-primary relative shadow-md">
            <Megaphone className="h-5 w-5" />
            <div className="ml-3">
              <AlertTitle className="font-black text-[10px] uppercase tracking-widest mb-1">Global Broadcast</AlertTitle>
              <AlertDescription className="text-sm font-bold text-foreground/80 pr-10">{announcement.message}</AlertDescription>
            </div>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-40 hover:opacity-100" onClick={() => setShowAnnouncement(false)}><X size={16} /></Button>
          </Alert>
        )}

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-primary/10 shadow-2xl overflow-visible bg-card">
            <CardHeader><CardTitle className="text-3xl font-black flex items-center gap-3"><Search className="text-primary h-7 w-7" /> Global Records</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-3">
                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger className="h-14 bg-muted/50 border-primary/20 font-bold"><Filter className="mr-2 h-4 w-4 text-primary" /><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Identifiers</SelectItem>
                    <SelectItem value="vehicleId">Registration No</SelectItem>
                    <SelectItem value="engineNumber">Engine No</SelectItem>
                    <SelectItem value="chassisNumber">Chassis No</SelectItem>
                    <SelectItem value="reportNumber">Report No</SelectItem>
                    <SelectItem value="reportDate">Report Date</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value.toUpperCase())} className="h-14 pl-12 text-lg font-mono border-primary/20 bg-muted/50 focus:border-primary shadow-inner" />
                </div>
              </div>
              
              {searchTerm && !uniqueReports.some(r => r.vehicleId.toUpperCase() === searchTerm.trim()) && !systemStatus.isLocked && (
                <Button onClick={handleCreateNew} size="lg" className="w-full h-14 text-lg font-black shadow-xl animate-in zoom-in-95"><PlusCircle className="mr-2" /> Create Report: "{searchTerm}"</Button>
              )}

              {searchTerm && (
                <div className="pt-8 border-t border-muted">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2"><Car size={14} className="text-primary" /> Matching Records</h4>
                  {isLoadingReports ? <div className="py-10 text-center font-bold text-muted-foreground animate-pulse">SCANNING DATABASE...</div> : searchResults.length > 0 ? (
                    <div className="space-y-4">{searchResults.map(r => (
                      <Link key={r.id} href={`/report/${r.vehicleId}`} className="block"><Card className="hover:border-primary transition-all bg-muted/10 border-primary/5 p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4"><Car className="text-primary h-5 w-5" /><div className="font-mono font-black text-lg group-hover:underline">{getIdentifiers(r).displayId}</div></div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transition-all text-primary" />
                      </Card></Link>
                    ))}</div>
                  ) : <div className="py-12 text-center border-2 border-dashed rounded-3xl bg-muted/20 text-muted-foreground font-medium italic">No indexed records found matching "{searchTerm}"</div>}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/10 shadow-lg p-6 flex flex-col items-center justify-center text-center space-y-2">
              <BarChart3 className="text-primary h-8 w-8 mb-2" />
              <div className="text-3xl font-black text-primary">{uniqueReports.length}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unique Vehicle Records</p>
            </Card>
            <Card className="border-primary/10 shadow-lg bg-card/50">
              <CardHeader><CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Shield className="h-4 w-4" /> Platform Integrity</CardTitle></CardHeader>
              <CardContent className="text-[11px] font-medium text-muted-foreground space-y-4 leading-relaxed">
                <div className="p-3 bg-muted/50 rounded-xl border">Engine and Chassis numbers are indexed in real-time for secure discoverability.</div>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">All synchronization operations are audit-logged with high-resolution timestamps.</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!searchTerm && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-end justify-between border-b pb-6 border-primary/20"><h2 className="text-3xl font-black tracking-tight flex items-center gap-4"><Clock className="text-primary" /> Recent Synchronizations</h2><Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest animate-pulse border-primary/30">Live Stream</Badge></div>
            {isLoadingReports ? <div className="grid md:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}</div> : uniqueReports.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">{uniqueReports.slice(0, visibleReportsCount).map(r => {
                const ids = getIdentifiers(r);
                return (
                  <Link key={r.id} href={`/report/${r.vehicleId}`}>
                    <Card className="group hover:border-primary/50 transition-all cursor-pointer bg-card overflow-hidden shadow-lg h-full border-primary/5">
                      <div className="bg-muted/30 p-4 border-b flex justify-between items-center"><div className="font-mono font-black text-primary group-hover:underline">{ids.displayId}</div><Badge variant="outline" className="text-[9px] font-black border-primary/20">{ids.reportNum}</Badge></div>
                      <CardContent className="p-4 grid grid-cols-2 gap-y-4 text-[10px] font-medium text-muted-foreground">
                        <div><div className="uppercase font-black text-[8px] mb-1">Engine Number</div><div className="text-foreground truncate font-bold">{ids.engine}</div></div>
                        <div><div className="uppercase font-black text-[8px] mb-1">Chassis Number</div><div className="text-foreground truncate font-bold">{ids.chassis}</div></div>
                        <div><div className="uppercase font-black text-[8px] mb-1">Report Date</div><div className="text-foreground font-bold">{ids.date}</div></div>
                        <div className="text-right"><div className="uppercase font-black text-[8px] mb-1">By</div><div className="truncate">{r.userName || 'System'}</div></div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}</div>
            ) : <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10 opacity-50"><FileText className="mx-auto h-12 w-12 mb-4" /><p className="font-bold">No Records Available</p></div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
