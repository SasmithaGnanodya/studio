'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Search, PlusCircle, Car, FileText, Shield, Filter, 
  Clock, ChevronRight, BarChart3, ShieldCheck, Zap, 
  Megaphone, X, Lock, Info, BookOpen, Fingerprint, 
  LayoutTemplate, Database, AlertCircle, Sparkles,
  ExternalLink, FileCheck, Hash
} from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, onSnapshot, orderBy, query, doc } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function getIdentifiers(report: Report) {
  const engine = report.engineNumber || 'N/A';
  const chassis = report.chassisNumber || 'N/A';
  let reportNum = report.reportNumber || 'DRAFT';
  const isIssued = /^(CDH|CDK|KDH)\d{9}$/.test(reportNum);
  const rawId = (report.vehicleId || '').toUpperCase();
  const displayId = rawId.startsWith('UR-') ? 'U/R' : rawId;

  return { 
    engine: String(engine).toUpperCase().trim(), 
    chassis: String(chassis).toUpperCase().trim(), 
    reportNum: isIssued ? reportNum : 'DRAFT', 
    date: report.reportDate || 'N/A', 
    displayId 
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

/**
 * Transforms plain text into a React fragment.
 * Supports:
 * 1. [Link Text](https://url.com) - Markdown style links
 * 2. https://url.com - Auto-linking plain URLs
 */
const renderLinkedText = (text: string) => {
  if (!text) return null;
  
  // Combined regex: [text](url) OR standard URL
  const combinedRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g;
  
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Scenario 1: [Link Text](URL)
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline decoration-2 underline-offset-2 hover:text-white transition-all font-black mx-1 inline-flex items-center gap-1 text-primary"
        >
          {match[1]} <ExternalLink size={10} />
        </a>
      );
    } else if (match[3]) {
      // Scenario 2: Plain URL
      parts.push(
        <a 
          key={match.index} 
          href={match[3]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline decoration-2 underline-offset-2 hover:text-white transition-all font-black mx-1 inline-flex items-center gap-1"
        >
          {match[3].replace(/^https?:\/\//, '')} <ExternalLink size={10} />
        </a>
      );
    }
    lastIndex = combinedRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts;
};

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
      if (searchCategory === 'all') return ids.displayId.includes(term) || ids.engine.includes(term) || ids.chassis.includes(term) || ids.reportNum.includes(term) || ids.date.includes(term);
      if (searchCategory === 'vehicleId') return ids.displayId.includes(term);
      if (searchCategory === 'engineNumber') return ids.engine.includes(term);
      if (searchCategory === 'chassisNumber') return ids.chassis.includes(term);
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

  const handleCreateUnregistered = () => {
    if (!systemStatus.isLocked) {
      const tempId = `UR-${Date.now()}`;
      router.push(`/report/${tempId}`);
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
              <AlertDescription className="text-sm font-bold text-foreground/80 pr-10 leading-relaxed">
                {renderLinkedText(announcement.message)}
              </AlertDescription>
            </div>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-40 hover:opacity-100" onClick={() => setShowAnnouncement(false)}><X size={16} /></Button>
          </Alert>
        )}

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-primary/10 shadow-2xl overflow-visible bg-card relative">
            <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground p-2 rounded-xl shadow-lg z-10 hidden sm:block">
              <Search size={20} />
            </div>
            <CardHeader className="pt-8">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-black tracking-tight">Search Records</CardTitle>
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">REAL-TIME</Badge>
              </div>
              <CardDescription className="text-muted-foreground font-medium space-y-4">
                <p>Scan the global database by Registration, Engine, or Chassis numbers.</p>
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-foreground shadow-inner">
                  <p className="text-xs font-bold leading-relaxed">
                    <span className="text-primary uppercase tracking-widest block mb-1">System Instruction:</span> 
                    To create a <span className="text-primary font-black uppercase">New Report via Reg.Number</span>, simply enter the registration code in the search field below. If no match is found, a <span className="bg-primary text-white px-2 py-0.5 rounded-md inline-flex items-center gap-1 mx-1 shadow-sm font-black uppercase text-[9px]">Create New Report</span> button will automatically appear.
                  </p>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex flex-col gap-2 w-full md:w-[180px]">
                  <Select value={searchCategory} onValueChange={setSearchCategory}>
                    <SelectTrigger className="h-14 w-full bg-muted/30 border-primary/20 font-bold focus:ring-primary shadow-sm">
                      <Filter className="mr-2 h-4 w-4 text-primary" />
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
                  
                  {!systemStatus.isLocked && (
                    <Button 
                      onClick={handleCreateUnregistered} 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] font-black uppercase tracking-tighter text-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <Sparkles className="mr-1.5 h-3 w-3" /> New Unregistered
                    </Button>
                  )}
                </div>

                <div className="relative flex-grow group h-14">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input 
                    placeholder="e.g. WP CAA-1234" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())} 
                    className="h-14 pl-12 text-lg font-mono border-primary/20 bg-muted/30 focus:border-primary focus:bg-background shadow-inner transition-all" 
                  />
                </div>
              </div>
              
              {searchTerm && !uniqueReports.some(r => r.vehicleId.toUpperCase() === searchTerm.trim()) && !systemStatus.isLocked && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <Button onClick={handleCreateNew} size="lg" className="w-full h-14 text-lg font-black shadow-xl hover:shadow-primary/20 transition-all border-2 border-primary">
                    <PlusCircle className="mr-2" /> Create New Report: "{searchTerm}"
                  </Button>
                </div>
              )}

              {searchTerm && (
                <div className="pt-8 border-t border-muted">
                  <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4 flex items-center gap-2">
                    <Car size={14} className="text-primary" /> Matching Indexed Records
                  </h4>
                  {isLoadingReports ? (
                    <div className="py-10 text-center font-bold text-muted-foreground animate-pulse">SYNCHRONIZING WITH CLOUD...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid gap-3">
                      {searchResults.map(r => {
                        const ids = getIdentifiers(r);
                        return (
                          <Link key={r.id} href={`/report/${r.vehicleId}`} className="block">
                            <Card className="hover:border-primary hover:bg-primary/5 transition-all bg-card border-primary/5 p-4 flex flex-col group shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 group-hover:scale-110 transition-transform">
                                    <Car className="text-primary h-5 w-5" />
                                  </div>
                                  <div className="font-mono font-black text-lg group-hover:underline text-primary">{ids.displayId}</div>
                                </div>
                                <Badge variant="outline" className="text-[9px] font-black border-primary/20 bg-background">
                                  {ids.reportNum === 'DRAFT' ? 'PENDING' : ids.reportNum}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-[10px] font-medium text-muted-foreground">
                                <div className="flex flex-col gap-1">
                                  <span className="uppercase font-black text-[8px] flex items-center gap-1">
                                    <Fingerprint size={10} className="text-primary" /> Engine No
                                  </span>
                                  <span className="text-foreground font-bold truncate">{ids.engine}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="uppercase font-black text-[8px] flex items-center gap-1">
                                    <Hash size={10} className="text-primary" /> Chassis No
                                  </span>
                                  <span className="text-foreground font-bold truncate">{ids.chassis}</span>
                                </div>
                                <div className="flex flex-col gap-1 text-right">
                                  <span className="uppercase font-black text-[8px] flex items-center gap-1 justify-end">
                                    <Clock size={10} className="text-primary" /> Sync Date
                                  </span>
                                  <span className="text-foreground font-bold">{ids.date}</span>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed rounded-3xl bg-muted/20 text-muted-foreground font-medium italic">
                      No indexed records found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/10 shadow-lg p-6 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                <BarChart3 size={120} />
              </div>
              <BarChart3 className="text-primary h-8 w-8 mb-2" />
              <div className="text-4xl font-black text-primary tracking-tighter">{uniqueReports.length}</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unique Vehicle Records</p>
            </Card>
            <Card className="border-primary/10 shadow-lg bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Security Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] font-medium text-muted-foreground space-y-4 leading-relaxed">
                <div className="p-3 bg-muted/50 rounded-xl border border-border/50 flex gap-3 items-start">
                  <Fingerprint size={16} className="text-primary shrink-0 mt-0.5" />
                  <p>Engine and Chassis numbers are indexed in real-time for secure discoverability across the workforce.</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex gap-3 items-start">
                  <Clock size={16} className="text-primary shrink-0 mt-0.5" />
                  <p>All synchronization operations are audit-logged with high-resolution timestamps and identity tracking.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-primary/10 rounded-3xl p-8 sm:p-12 shadow-xl">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/3 space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <BookOpen size={14} /> Documentation
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-tight">System Intelligence <span className="text-primary">& Operations</span></h2>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                  The Drive Care platform utilizes layout-aware versioning and real-time indexing to ensure technical valuation accuracy.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>A4 Precision Canvas</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Real-time Cloud Sync</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>Branch-Specific Logic</span>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-primary/10">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 text-primary">
                          <Search size={18} />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">Search & Import Protocol</p>
                          <p className="text-[10px] text-muted-foreground font-medium">How to find and reuse vehicle data.</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-14 pb-6">
                      To ensure data integrity, the system strictly prioritizes search via <strong>Registration Number</strong>. When cloning specifications from an existing report, critical unique identifiers (Engine No, Chassis No, and Valuation Codes) are automatically stripped. This forces a manual verification of the new vehicle's unique IDs to prevent sequence collisions.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2" className="border-primary/10">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 text-primary">
                          <LayoutTemplate size={18} />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">Layout Integrity (Versioning)</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Managing technical template changes.</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-14 pb-6">
                      Every report is permanently locked to the <strong>Layout Version</strong> it was created with. If the master template is updated by an Admin, existing reports will remain unchanged to preserve their visual audit trail. Users can manually "Upgrade Layout" if a visual realignment is technically required.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3" className="border-primary/10">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 text-primary">
                          <Zap size={18} />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">Valuation Code Sequence</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Automatic numbering and classification.</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-14 pb-6">
                      The <strong>Valuation Code</strong> is generated based on your Branch (CDH/CDK), the current Date, and the technical condition score. It is critical to select the correct <strong>Class of Vehicle</strong>, as the system maintains separate daily sequences for each classification to meet banking standards.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4" className="border-primary/10">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/10 text-primary">
                          <Database size={18} />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight">Cloud Indexing & Persistence</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Data sovereignty and storage.</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-14 pb-6">
                      Data is synchronized in 1-second intervals using Firestore optimistic concurrency. High-resolution technical photos are stored in secure buckets linked to the report's UID. All modifications are logged in the <strong>History Audit Trail</strong>, accessible by administrators for compliance review.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {!searchTerm && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-end justify-between border-b pb-6 border-primary/20">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                <Clock className="text-primary" /> Recent Synchronizations
              </h2>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest animate-pulse border-primary/30 bg-primary/5">
                Live Activity
              </Badge>
            </div>
            {isLoadingReports ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
              </div>
            ) : uniqueReports.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {uniqueReports.slice(0, visibleReportsCount).map(r => {
                  const ids = getIdentifiers(r);
                  return (
                    <Link key={r.id} href={`/report/${r.vehicleId}`}>
                      <Card className="group hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer bg-card overflow-hidden shadow-lg h-full border-primary/5 relative">
                        <div className="bg-muted/30 p-4 border-b flex justify-between items-center">
                          <div className="font-mono font-black text-primary group-hover:underline">{ids.displayId}</div>
                          <Badge variant="outline" className="text-[9px] font-black border-primary/20 bg-background">
                            {ids.reportNum === 'DRAFT' ? 'PENDING' : ids.reportNum}
                          </Badge>
                        </div>
                        <CardContent className="p-4 grid grid-cols-2 gap-y-4 text-[10px] font-medium text-muted-foreground">
                          <div>
                            <div className="uppercase font-black text-[8px] mb-1 flex items-center gap-1">
                              <Fingerprint size={10} className="text-primary" /> Engine Number
                            </div>
                            <div className="text-foreground truncate font-bold">{ids.engine}</div>
                          </div>
                          <div>
                            <div className="uppercase font-black text-[8px] mb-1 flex items-center gap-1">
                              <Hash size={10} className="text-primary" /> Chassis Number
                            </div>
                            <div className="text-foreground truncate font-bold">{ids.chassis}</div>
                          </div>
                          <div>
                            <div className="uppercase font-black text-[8px] mb-1 flex items-center gap-1">
                              <Clock size={10} className="text-primary" /> Sync Date
                            </div>
                            <div className="text-foreground font-bold">{ids.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="uppercase font-black text-[8px] mb-1">Assigned To</div>
                            <div className="truncate font-bold text-foreground/70">{r.userName || 'System'}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10 opacity-50">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p className="font-bold">No Records Available in Database</p>
              </div>
            )}
            
            {uniqueReports.length > visibleReportsCount && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setVisibleReportsCount(prev => prev + 6)}
                  className="font-bold border-primary/20 hover:bg-primary/5 text-primary"
                >
                  Load More History
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
