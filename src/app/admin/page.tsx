'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, LayoutTemplate, Calendar as CalendarIcon, History, Eye, Search, Hash, Fingerprint, Clock, Car } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 12;

/**
 * Robust utility to extract identifiers from a report even if field names vary.
 * Matches logic used on the landing page for perfect consistency.
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
      const q = query(collection(firestore, 'reports'), orderBy('updatedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetched: Report[] = [];
        querySnapshot.forEach((doc) => fetched.push({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) }));
        setReports(fetched);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, firestore, isUserLoading, router]);

  const uniqueReports = useMemo(() => getUniqueReports(reports), [reports]);

  const filteredReports = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length === 0) return uniqueReports;
    const term = searchTerm.toUpperCase().trim();
    return uniqueReports.filter(report => {
      const ids = getIdentifiers(report);
      const vid = (report.vehicleId || '').toUpperCase();
      if (searchCategory === 'all') {
        return vid.includes(term) || ids.engine.includes(term) || ids.chassis.includes(term) || ids.reportNum.includes(term);
      } else if (searchCategory === 'vehicleId') return vid.includes(term);
      else if (searchCategory === 'engineNumber') return ids.engine.includes(term);
      else if (searchCategory === 'chassisNumber') return ids.chassis.includes(term);
      else if (searchCategory === 'reportNumber') return ids.reportNum.includes(term);
      else if (searchCategory === 'reportDate') return ids.date.includes(term);
      return false;
    });
  }, [uniqueReports, searchTerm, searchCategory]);

  if (isLoading || isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <Header /><main className="flex-1 p-6"><Skeleton className="h-96 w-full" /></main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-6 space-y-6">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <LayoutTemplate className="text-primary" /> Admin Control Panel
                </CardTitle>
                <CardDescription>Manage all vehicle reports and visual templates.</CardDescription>
              </div>
              <Link href="/editor" passHref>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <LayoutTemplate className="mr-2 h-4 w-4" /> Open Layout Editor
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-4">
              <Select value={searchCategory} onValueChange={(val) => { setSearchCategory(val); setSearchTerm(''); }}>
                <SelectTrigger className="w-full sm:w-48 bg-background/50"><Filter className="mr-2 h-4 w-4 text-primary" /><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Identifiers</SelectItem>
                  <SelectItem value="vehicleId">Reg No</SelectItem>
                  <SelectItem value="engineNumber">Engine No</SelectItem>
                  <SelectItem value="chassisNumber">Chassis No</SelectItem>
                  <SelectItem value="reportNumber">Report No</SelectItem>
                  <SelectItem value="reportDate">Report Date</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-grow">
                {searchCategory === 'reportDate' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-10 bg-background/50 border-primary/20">
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {searchTerm ? searchTerm : <span>Filter by Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={searchTerm ? new Date(searchTerm) : undefined} onSelect={(date) => setSearchTerm(date ? format(date, "yyyy-MM-dd") : '')} />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="text" placeholder="Search vehicle records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value.toUpperCase())} className="w-full h-10 pl-10 bg-background/50 border-primary/20 focus:border-primary" />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReports.slice(0, visibleReportsCount).map(report => {
                const ids = getIdentifiers(report);
                return (
                  <Card key={report.id} className="group border flex flex-col hover:border-primary transition-all bg-card/40 backdrop-blur-md shadow-md overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/20 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="font-mono text-primary group-hover:underline text-lg">{report.vehicleId}</CardTitle>
                        <span className="text-[10px] bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono">#{ids.reportNum}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5 pt-1">
                        <CalendarIcon size={12} className="text-primary" /> {ids.date}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4 flex-grow">
                      <div className="grid grid-cols-1 gap-2 text-[11px]">
                        <div className="flex flex-col bg-muted/10 p-2 rounded">
                          <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Engine Number</span>
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <Fingerprint size={12} className="text-primary" /> {ids.engine}
                          </span>
                        </div>
                        <div className="flex flex-col bg-muted/10 p-2 rounded">
                          <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Chassis Number</span>
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <Hash size={12} className="text-primary" /> {ids.chassis}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t text-[10px] flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1 truncate max-w-[100px]"><Eye size={12} /> {report.userName?.split(' ')[0]}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t py-2 bg-muted/5">
                      <Link href={`/admin/history/${report.id}`} passHref>
                        <Button variant="ghost" size="sm" className="h-8 text-[10px] gap-1.5 text-muted-foreground hover:text-primary">
                          <History size={12} /> History
                        </Button>
                      </Link>
                      <Link href={`/report/${report.vehicleId}`} passHref>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] gap-1.5 border-primary/20 text-primary hover:bg-primary/10">
                          <Eye size={12} /> View Report
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            {filteredReports.length > visibleReportsCount && (
              <div className="mt-8 text-center">
                <Button onClick={() => setVisibleReportsCount(p => p + 12)} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  Show More Records
                </Button>
              </div>
            )}
            
            {filteredReports.length === 0 && !isLoading && (
              <div className="text-center py-20 border-2 border-dashed rounded-xl border-primary/10">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No matching reports found</h3>
                <p className="text-sm text-muted-foreground/60">Try adjusting your search filters or category.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}