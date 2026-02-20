'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldOff, Search, History, Save, TrendingUp, Eye, LayoutTemplate, Filter, Car, Calendar as CalendarIcon, Hash, Fingerprint, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 12;

function getIdentifiers(report: Report) {
  const data = report.reportData || {};
  return {
    engine: String(report.engineNumber || data.engineNumber || 'N/A').toUpperCase().trim(),
    chassis: String(report.chassisNumber || data.chassisNumber || 'N/A').toUpperCase().trim(),
    reportNum: String(report.reportNumber || data.reportNumber || 'N/A').toUpperCase().trim(),
    date: report.reportDate || data.reportDate || 'N/A'
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
        <Card>
          <CardHeader>
            <CardTitle>Admin Control Panel</CardTitle>
            <CardDescription>Manage master reports and visual templates.</CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Select value={searchCategory} onValueChange={(val) => { setSearchCategory(val); setSearchTerm(''); }}>
                <SelectTrigger className="w-full sm:w-48"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="Category" /></SelectTrigger>
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
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-10">{searchTerm ? searchTerm : <span>Filter by Date</span>}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={searchTerm ? new Date(searchTerm) : undefined} onSelect={(date) => setSearchTerm(date ? format(date, "yyyy-MM-dd") : '')} /></PopoverContent>
                  </Popover>
                ) : (
                  <Input type="text" placeholder="Search vehicle records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value.toUpperCase())} className="w-full h-10" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReports.slice(0, visibleReportsCount).map(report => {
                const ids = getIdentifiers(report);
                return (
                  <Card key={report.id} className="border flex flex-col hover:border-primary transition-all">
                    <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex justify-between items-center"><CardTitle className="font-mono text-primary">{report.vehicleId}</CardTitle><span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded">#{ids.reportNum}</span></div>
                      <p className="text-[10px] text-muted-foreground">Date: {ids.date}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4 flex-grow">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between"><span>Eng:</span><span className="font-bold">{ids.engine}</span></div>
                        <div className="flex justify-between"><span>Chas:</span><span className="font-bold">{ids.chassis}</span></div>
                      </div>
                      <div className="pt-2 border-t text-[10px] flex justify-between"><span>{report.userName?.split(' ')[0]}</span><span>{report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span></div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-2 bg-muted/10">
                      <Link href={`/admin/history/${report.id}`} passHref><Button variant="ghost" size="sm" className="h-8 text-[10px]">History</Button></Link>
                      <Link href={`/report/${report.vehicleId}`} passHref><Button variant="outline" size="sm" className="h-8 text-[10px]">View</Button></Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            {filteredReports.length > visibleReportsCount && (
              <div className="mt-6 text-center"><Button onClick={() => setVisibleReportsCount(p => p + 12)} variant="secondary">Show More</Button></div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}