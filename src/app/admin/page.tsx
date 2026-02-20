
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, LayoutTemplate, Calendar as CalendarIcon, History, Eye, Search, Hash, Fingerprint, Clock, Car, KeyRound, ShieldCheck, Loader2, BarChart3, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 12;

function getIdentifiers(report: Report) {
  const data = report.reportData || {};
  
  const engine = report.engineNumber || 
                 data.engineNumber || 
                 Object.entries(data).find(([k]) => 
                   ['engine', 'engno', 'motor', 'engnum'].some(p => k.toLowerCase().includes(p))
                 )?.[1] || 
                 'N/A';
                 
  const chassis = report.chassisNumber || 
                  data.chassisNumber || 
                  Object.entries(data).find(([k]) => 
                    ['chassis', 'serial', 'vin', 'chas'].some(p => k.toLowerCase().includes(p))
                  )?.[1] || 
                  'N/A';

  const reportNum = report.reportNumber || 
                    data.reportNumber || 
                    Object.entries(data).find(([k]) => 
                      ['reportnum', 'reportno', 'ref-', 'val-', 'v-'].some(p => k.toLowerCase().includes(p))
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
  const { toast } = useToast();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [visibleReportsCount, setVisibleReportsCount] = useState(INITIAL_VISIBLE_REPORTS);

  const [accessPassword, setAccessPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

      getDoc(doc(firestore, 'config', 'settings')).then(snap => {
        if (snap.exists()) {
          setAccessPassword(snap.data().privateDataPassword || '');
        }
      });

      return () => unsubscribe();
    }
  }, [user, firestore, isUserLoading, router]);

  const uniqueReports = useMemo(() => getUniqueReports(reports), [reports]);

  const stats = useMemo(() => {
    const today = new Date();
    const reportsToday = reports.filter(r => {
      if (!r.updatedAt?.seconds) return false;
      return isSameDay(new Date(r.updatedAt.seconds * 1000), today);
    }).length;

    const chartData = [...Array(7)].map((_, i) => {
      const d = subDays(today, 6 - i);
      const dayStr = format(d, 'MMM dd');
      const count = reports.filter(r => {
        if (!r.updatedAt?.seconds) return false;
        return isSameDay(new Date(r.updatedAt.seconds * 1000), d);
      }).length;
      return { day: dayStr, reports: count };
    });

    return { reportsToday, chartData };
  }, [reports]);

  const handleUpdatePassword = async () => {
    if (!firestore) return;
    setIsUpdatingPassword(true);
    try {
      await setDoc(doc(firestore, 'config', 'settings'), {
        privateDataPassword: accessPassword
      }, { merge: true });
      toast({
        title: "Settings Updated",
        description: "The global access password has been changed.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the access password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
        
        {/* TOP DASHBOARD: 4 STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Car size={48} className="text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Unique Vehicles</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">{uniqueReports.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <TrendingUp size={10} className="text-green-500" /> Active Database
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <History size={48} className="text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Total Syncs</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">{reports.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock size={10} className="text-primary" /> Audit Logs
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap size={48} className="text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Today's Activity</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">{stats.reportsToday}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <TrendingUp size={10} className="text-primary" /> New Updates
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-0 pt-4 flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider">7-Day Activity</CardDescription>
              </div>
              <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="h-[60px] pt-2">
              <ChartContainer config={{ reports: { label: "Reports", color: "hsl(var(--primary))" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <Bar dataKey="reports" fill="var(--color-reports)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Car className="text-primary" /> Admin Control Panel
                  </CardTitle>
                  <CardDescription>Manage all vehicle reports and search records.</CardDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 border-t py-2 bg-muted/5">
                        <Link href={`/admin/history/${report.id}`} passHref>
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] gap-1.5 text-muted-foreground hover:text-primary">
                            <History size={12} /> History
                          </Button>
                        </Link>
                        <Link href={`/report/${report.vehicleId}`} passHref>
                          <Button variant="outline" size="sm" className="h-8 text-[10px] gap-1.5 border-primary/20 text-primary hover:bg-primary/10">
                            <Eye size={12} /> View
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
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <KeyRound className="text-primary" /> Security & Access Settings
                </CardTitle>
                <CardDescription>Manage the global password for vehicle reports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Global Access Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="text" 
                      placeholder="Enter new password" 
                      value={accessPassword} 
                      onChange={(e) => setAccessPassword(e.target.value)} 
                      className="pl-10 bg-background/50 border-primary/20"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic flex items-start gap-1.5 mt-2">
                    <ShieldCheck size={12} className="text-primary shrink-0 mt-0.5" />
                    This password is required for non-admin users to unlock and edit vehicle reports.
                  </p>
                </div>
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={isUpdatingPassword} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  {isUpdatingPassword ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                  ) : (
                    "Save Access Password"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" /> Current Administrators
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {ADMIN_EMAILS.map(email => (
                      <div key={email} className="text-[10px] bg-muted/20 p-2 rounded flex items-center justify-between border">
                        <span className="truncate max-w-[150px]">{email}</span>
                        <ShieldCheck size={12} className="text-primary" />
                      </div>
                    ))}
                    <div className="text-[10px] text-muted-foreground text-center pt-2 italic">
                        Access is restricted by email identity.
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
