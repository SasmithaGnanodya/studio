'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, deleteField, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, LayoutTemplate, Calendar as CalendarIcon, History, Eye, Search, Hash, Fingerprint, Clock, Car, KeyRound, ShieldCheck, Loader2, BarChart3, TrendingUp, Users, Zap, ShieldAlert, UserCheck, Building2, UserPlus, Trash2, Mail, Globe, FileCheck, Activity, Settings, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { format, subDays, subMonths, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 12;

function getIdentifiers(report: Report) {
  // Strictly use root reportNumber for generated technical valuation code
  let reportNum = report.reportNumber || 'DRAFT';
  const isIssued = /^(CDH|CDK|KDH)\d{9}$/.test(reportNum);

  const data = report.reportData || {};
  const engine = report.engineNumber || 'N/A';
  const chassis = report.chassisNumber || 'N/A';

  return {
    engine: String(engine).toUpperCase().trim(),
    chassis: String(chassis).toUpperCase().trim(),
    reportNum: isIssued ? String(reportNum).toUpperCase().trim() : 'DRAFT',
    date: report.reportDate || 'N/A'
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
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('7d');
  const [branchFilter, setBranchFilter] = useState<'all' | 'CDH' | 'CDK'>('all');

  const [authorizedUsers, setAuthorizedUsers] = useState<Record<string, { branch: string, email: string }>>({});
  const [newEmail, setNewEmail] = useState('');
  const [newBranch, setNewBranch] = useState('CDH');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeletingReportId, setIsDeletingReportId] = useState<string | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

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
      
      const unsubscribeReports = onSnapshot(q, (querySnapshot) => {
        const fetched: Report[] = [];
        querySnapshot.forEach((doc) => fetched.push({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) }));
        setReports(fetched);
        setIsLoading(false);
      }, async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'reports', operation: 'list' }));
      });

      const authRef = doc(firestore, 'config', 'authorizedUsers');
      const unsubscribeAuth = onSnapshot(authRef, (snap) => {
        if (snap.exists()) {
          setAuthorizedUsers(snap.data() as Record<string, { branch: string, email: string }>);
        }
      }, async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: authRef.path, operation: 'get' }));
      });

      return () => {
        unsubscribeReports();
        unsubscribeAuth();
      };
    }
  }, [user, firestore, isUserLoading, router]);

  const reportsWithBranch = useMemo(() => {
    const emailToBranch: Record<string, string> = {};
    Object.values(authorizedUsers).forEach(u => {
      emailToBranch[u.email.toLowerCase()] = u.branch;
    });

    return reports.map(r => ({
      ...r,
      branch: (r as any).branch || emailToBranch[r.userEmail?.toLowerCase() || r.userName?.toLowerCase() || ''] || 'Unknown'
    }));
  }, [reports, authorizedUsers]);

  const filteredReportsByBranch = useMemo(() => {
    if (branchFilter === 'all') return reportsWithBranch;
    return reportsWithBranch.filter(r => r.branch === branchFilter);
  }, [reportsWithBranch, branchFilter]);

  const uniqueReports = useMemo(() => getUniqueReports(filteredReportsByBranch), [filteredReportsByBranch]);

  const userRegistryStats = useMemo(() => {
    const stats: Record<string, { total: number, today: number, history: { day: string, count: number }[] }> = {};
    const today = new Date();
    const last7DaysStrings = [...Array(7)].map((_, i) => format(subDays(today, 6 - i), 'MM/dd'));

    const emailToKey: Record<string, string> = {};
    Object.entries(authorizedUsers).forEach(([key, data]) => {
      emailToKey[data.email.toLowerCase()] = key;
      stats[key] = { 
        total: 0, 
        today: 0, 
        history: last7DaysStrings.map(d => ({ day: d, count: 0 }))
      };
    });

    reports.forEach(r => {
      const email = r.userEmail || (r.userName?.includes('@') ? r.userName : null);
      if (!email) return;
      
      const key = emailToKey[email.toLowerCase()];
      if (!key) return;

      stats[key].total += 1;

      const updateDate = r.updatedAt?.seconds ? new Date(r.updatedAt.seconds * 1000) : null;
      if (updateDate) {
        if (isSameDay(updateDate, today)) {
          stats[key].today += 1;
        }
        
        const dayStr = format(updateDate, 'MM/dd');
        const historyItem = stats[key].history.find(h => h.day === dayStr);
        if (historyItem) {
          historyItem.count += 1;
        }
      }
    });

    return stats;
  }, [reports, authorizedUsers]);

  const histogramData = useMemo(() => {
    return Object.entries(authorizedUsers).map(([key, data]) => {
      const stats = userRegistryStats[key];
      return {
        name: data.email.split('@')[0],
        total: stats?.total || 0,
        today: stats?.today || 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [authorizedUsers, userRegistryStats]);

  const stats = useMemo(() => {
    const today = new Date();
    const reportsToday = filteredReportsByBranch.filter(r => {
      const date = r.updatedAt?.seconds ? new Date(r.updatedAt.seconds * 1000) : new Date();
      return isSameDay(date, today);
    }).length;

    let chartData: { label: string; count: number }[] = [];

    if (timeRange === '7d') {
      chartData = [...Array(7)].map((_, i) => {
        const d = subDays(today, 6 - i);
        const dayStr = format(d, 'MMM dd');
        const count = filteredReportsByBranch.filter(r => {
          const date = r.updatedAt?.seconds ? new Date(r.updatedAt.seconds * 1000) : new Date();
          return isSameDay(date, d);
        }).length;
        return { label: dayStr, count };
      });
    } else if (timeRange === '30d') {
      chartData = [...Array(30)].map((_, i) => {
        const d = subDays(today, 29 - i);
        const dayStr = format(d, 'MMM dd');
        const count = filteredReportsByBranch.filter(r => {
          const date = r.updatedAt?.seconds ? new Date(r.updatedAt.seconds * 1000) : new Date();
          return isSameDay(date, d);
        }).length;
        return { label: dayStr, count };
      });
    } else if (timeRange === '1y') {
      chartData = [...Array(12)].map((_, i) => {
        const d = subMonths(today, 11 - i);
        const monthStr = format(d, 'MMM');
        const count = filteredReportsByBranch.filter(r => {
          const date = r.updatedAt?.seconds ? new Date(r.updatedAt.seconds * 1000) : new Date();
          return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
        }).length;
        return { label: monthStr, count };
      });
    }

    return { reportsToday, chartData };
  }, [filteredReportsByBranch, timeRange]);

  const handleAddUser = async () => {
    if (!firestore || !newEmail.includes('@')) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Please enter a valid email address." });
      return;
    }
    setIsAddingUser(true);
    try {
      const emailKey = newEmail.toLowerCase().replace(/[.@]/g, '_');
      await setDoc(doc(firestore, 'config', 'authorizedUsers'), {
        [emailKey]: {
          email: newEmail.toLowerCase().trim(),
          branch: newBranch
        }
      }, { merge: true });
      
      setNewEmail('');
      toast({ title: "User Authorized", description: `${newEmail} has been granted access for ${newBranch === 'CDH' ? 'Head Office' : 'Kadawatha'}.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not authorize user." });
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (emailKey: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'config', 'authorizedUsers'), {
        [emailKey]: deleteField()
      });
      toast({ title: "Access Revoked", description: "User has been removed from the system." });
    } catch (err) {
      toast({ variant: "destructive", title: "Action Failed", description: "Could not remove user access." });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!firestore) return;
    try {
      const reportRef = doc(firestore, 'reports', reportId);
      await deleteDoc(reportRef);
      toast({
        title: "Report Deleted",
        description: `Vehicle record ${reportId} has been permanently removed.`,
      });
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "You may not have permission to delete this record.",
      });
    } finally {
      setIsDeletingReportId(null);
      setDeleteConfirmationText('');
    }
  };

  const filteredReportsList = useMemo(() => {
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
        
        <div className="flex items-center justify-between gap-4 bg-card/30 backdrop-blur-sm border border-primary/10 p-2 rounded-xl">
           <div className="flex items-center gap-3 pl-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Overview</span>
           </div>
           <div className="flex items-center gap-4">
              <Tabs value={branchFilter} onValueChange={(v) => setBranchFilter(v as any)} className="h-9">
                  <TabsList className="bg-background/50 h-9 p-1">
                    <TabsTrigger value="all" className="text-[10px] px-4 h-7 uppercase font-black">Global View</TabsTrigger>
                    <TabsTrigger value="CDH" className="text-[10px] px-4 h-7 uppercase font-black">Head Office</TabsTrigger>
                    <TabsTrigger value="CDK" className="text-[10px] px-4 h-7 uppercase font-black">Kadawatha</TabsTrigger>
                  </TabsList>
              </Tabs>

              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 bg-background/50 font-bold text-xs">
                    <Settings size={16} className="text-primary" /> System Settings
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md bg-card border-l-2">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-black flex items-center gap-2">
                      <Settings className="text-primary" /> Admin Controls
                    </SheetTitle>
                    <SheetDescription>Manage system access and layout templates.</SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-10">
                    <section className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <UserPlus size={14} /> Grant Access
                      </h3>
                      <Card className="border-primary/10 bg-muted/20 shadow-none">
                        <CardContent className="pt-6 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Authorized Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="e.g. user@caredrive.lk" 
                                value={newEmail} 
                                onChange={(e) => setNewEmail(e.target.value)} 
                                className="pl-10 h-10 bg-background/50 border-primary/20"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch Designation</Label>
                            <Select value={newBranch} onValueChange={setNewBranch}>
                              <SelectTrigger className="bg-background/50 border-primary/20 h-10">
                                <div className="flex items-center gap-2">
                                  <Building2 size={16} className="text-primary" />
                                  <SelectValue placeholder="Select Branch" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CDH">CDH - Head Office</SelectItem>
                                <SelectItem value="CDK">CDK - Kadawatha Branch</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={handleAddUser} 
                            disabled={isAddingUser} 
                            className="w-full bg-primary font-bold shadow-lg"
                          >
                            {isAddingUser ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing...</> : "Authorize User"}
                          </Button>
                        </CardContent>
                      </Card>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <LayoutTemplate size={14} /> Template Management
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                        Access the master visual editor to modify the pre-printed layout dimensions and field mappings.
                      </p>
                      <Link href="/editor" passHref className="block">
                        <Button className="w-full h-12 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-black shadow-inner gap-2">
                          <LayoutTemplate size={18} /> Open Master Layout Editor
                        </Button>
                      </Link>
                    </section>
                  </div>
                </SheetContent>
              </Sheet>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative min-h-[140px]">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Car size={48} className="text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Unique Vehicles</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">{uniqueReports.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                <TrendingUp size={10} className="text-green-500" /> {branchFilter === 'all' ? 'Active Database' : `${branchFilter} Records`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative min-h-[140px]">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <History size={48} className="text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Total Syncs</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">{filteredReportsByBranch.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock size={10} className="text-primary" /> Audit Logs
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden relative min-h-[140px]">
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

          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-lg relative min-h-[140px] overflow-hidden">
            <CardHeader className="pb-0 pt-4 flex flex-row items-center justify-between">
              <div>
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Activity Trend</CardDescription>
              </div>
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="h-6">
                <TabsList className="bg-muted/50 h-6 p-0.5">
                  <TabsTrigger value="7d" className="text-[9px] px-1.5 h-5">7D</TabsTrigger>
                  <TabsTrigger value="30d" className="text-[9px] px-1.5 h-5">30D</TabsTrigger>
                  <TabsTrigger value="1y" className="text-[9px] px-1.5 h-5">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="h-[100px] pt-4 px-2">
              <ChartContainer config={{ count: { label: "Reports", color: "hsl(var(--primary))" } }} className="aspect-auto h-full w-full">
                  <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="count" fill="var(--color-count)" radius={[2, 2, 0, 0]} />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-20">
          <div className="xl:col-span-2 space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl overflow-visible">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Car className="text-primary" /> Admin Control Panel
                    </CardTitle>
                    <CardDescription>Manage all vehicle reports and search records.</CardDescription>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-4 relative z-30">
                  <Select value={searchCategory} onValueChange={(val) => { setSearchCategory(val); setSearchTerm(''); }}>
                    <SelectTrigger className="w-full sm:w-48 bg-background/50"><Filter className="mr-2 h-4 w-4 text-primary" /><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent className="z-[100]">
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
                        <PopoverContent className="w-auto p-0 z-[100]" align="start">
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
                  {filteredReportsList.slice(0, visibleReportsCount).map(report => {
                    const ids = getIdentifiers(report);
                    const isIssued = ids.reportNum !== 'DRAFT';

                    return (
                      <Card key={report.id} className="group border flex flex-col hover:border-primary transition-all bg-card/40 backdrop-blur-md shadow-md overflow-hidden h-full">
                        <CardHeader className="pb-3 bg-muted/20 border-b">
                          <div className="flex justify-between items-center">
                            <CardTitle className="font-mono text-primary group-hover:underline text-lg">{report.vehicleId}</CardTitle>
                            <Badge variant="outline" className="text-[8px] h-4 border-primary/20 bg-primary/5 text-primary">
                              {ids.date}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <FileCheck size={12} className={cn(isIssued ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn(
                              "text-[10px] font-mono font-bold truncate",
                              isIssued ? "text-foreground" : "text-muted-foreground italic"
                            )}>{ids.reportNum}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 flex-grow">
                          <div className="grid grid-cols-1 gap-2 text-[11px]">
                            <div className="flex flex-col bg-muted/10 p-2 rounded">
                              <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Engine Number</span>
                              <span className="font-bold text-foreground flex items-center gap-1.5 truncate">
                                <Fingerprint size={12} className="text-primary shrink-0" /> {ids.engine}
                              </span>
                            </div>
                            <div className="flex flex-col bg-muted/10 p-2 rounded">
                              <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Chassis Number</span>
                              <span className="font-bold text-foreground flex items-center gap-1.5 truncate">
                                <Hash size={12} className="text-primary shrink-0" /> {ids.chassis}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t py-2 bg-muted/5 mt-auto">
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
                          
                          <AlertDialog onOpenChange={(open) => { if (!open) setDeleteConfirmationText(''); }}>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-[10px] gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={12} /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-2 border-destructive/20 shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5" /> Permanent Deletion Warning
                                </AlertDialogTitle>
                                <AlertDialogDescription className="space-y-4" asChild>
                                  <div className="space-y-4">
                                    <p className="font-bold text-foreground">
                                      Are you absolutely sure you want to delete report <span className="font-mono text-primary">{report.vehicleId}</span>?
                                    </p>
                                    <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-lg">
                                      <p className="text-xs text-destructive leading-relaxed font-medium">
                                        This action cannot be undone. This will permanently delete the valuation report and remove all technical history from our servers.
                                      </p>
                                    </div>
                                    <div className="space-y-2 mt-4 text-left">
                                      <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground">Type "delete report" to confirm</Label>
                                      <Input 
                                        value={deleteConfirmationText}
                                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                        placeholder="Type phrase here..."
                                        className="border-destructive/30 focus:border-destructive h-10 bg-background"
                                      />
                                    </div>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-6">
                                <AlertDialogCancel className="font-bold">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black"
                                  disabled={deleteConfirmationText.toLowerCase() !== 'delete report'}
                                  onClick={() => handleDeleteReport(report.id)}
                                >
                                  Confirm Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
                {filteredReportsList.length > visibleReportsCount && (
                  <div className="mt-8 text-center">
                    <Button onClick={() => setVisibleReportsCount(p => p + 12)} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                      Show More Records
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Users className="text-primary" /> Workforce Performance
                    </CardTitle>
                    <CardDescription>Comparative reporting volume across authorized personnel.</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black">HISTOGRAM</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2 h-[350px]">
                <ChartContainer 
                  config={{ 
                    total: { label: "Total Reports", color: "#4682B4" },
                    today: { label: "Today's Updates", color: "#87CEEB" } 
                  }} 
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold' }} 
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" name="Total Reports" fill="#4682B4" radius={[4, 4, 0, 0]} barSize={40} />
                      <Bar dataKey="today" name="Today" fill="#87CEEB" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t py-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-2 italic">
                  <Activity size={12} className="text-primary" /> Data is aggregated in real-time from all vehicle records.
                </p>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-md flex flex-col h-full min-h-[600px]">
                <CardHeader className="shrink-0 border-b bg-muted/10">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-primary" /> Access Registry
                        </div>
                        <Badge variant="secondary" className="text-[8px] font-black">{Object.keys(authorizedUsers).length} USERS</Badge>
                    </CardTitle>
                    <CardDescription className="text-[10px]">Managed list of authorized system users and their metrics.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                  <ScrollArea className="h-full px-4 pt-4 pb-4">
                    <div className="space-y-3">
                      {Object.entries(authorizedUsers).map(([key, data]) => (
                        <div key={key} className="bg-muted/20 p-3 rounded-lg border border-primary/5 group hover:border-primary/20 transition-all flex flex-col">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold truncate text-foreground">{data.email}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Badge variant="outline" className="text-[8px] h-4 border-primary/20 bg-primary/5 text-primary">
                                  {data.branch}
                                </Badge>
                                {ADMIN_EMAILS.includes(data.email) && (
                                  <Badge className="text-[8px] h-4 bg-primary/20 text-primary border-0">ADMIN</Badge>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={() => handleRemoveUser(key)}
                              disabled={ADMIN_EMAILS.includes(data.email)} // Protected admins
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-[10px] mt-3 pt-3 border-t border-primary/5">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground uppercase font-black text-[8px] flex items-center gap-1">
                                <Zap size={10} className="text-primary" /> Daily
                              </span>
                              <span className="text-base font-black text-primary">{userRegistryStats[key]?.today || 0}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground uppercase font-black text-[8px] flex items-center gap-1">
                                <Activity size={10} className="text-primary" /> Overall
                              </span>
                              <span className="text-base font-black text-foreground">{userRegistryStats[key]?.total || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {Object.keys(authorizedUsers).length === 0 && (
                        <div className="text-center py-10 opacity-30 italic text-[10px]">
                          No authorized users found.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t bg-muted/10 shrink-0">
                  <div className="text-[9px] text-muted-foreground flex items-center gap-1.5 italic font-medium">
                    <ShieldAlert size={10} className="text-primary" /> System administrators are protected from deletion.
                  </div>
                </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
