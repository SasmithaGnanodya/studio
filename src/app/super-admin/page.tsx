'use client';

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Megaphone, Lock, Unlock, Loader2, Save, AlertTriangle, Activity, Shield, Sparkles, Link as LinkIcon, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SUPER_ADMIN_EMAIL = 'sasmithagnanodya@gmail.com';

export default function SuperAdminPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [announcement, setAnnouncement] = useState({ message: '', isActive: false });
  const [systemStatus, setSystemStatus] = useState({ isLocked: false, maintenanceMessage: '' });
  const [billing, setBilling] = useState({ isPending: true, deadline: 'Feb 28', benefit: 'Unlocks 3-Month Extended Access' });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      router.replace('/');
      return;
    }

    if (firestore) {
      const annRef = doc(firestore, 'config', 'announcement');
      const unsubAnn = onSnapshot(annRef, (snap) => {
        if (snap.exists()) setAnnouncement(snap.data() as any);
      });

      const sysRef = doc(firestore, 'config', 'system');
      const unsubSys = onSnapshot(sysRef, (snap) => {
        if (snap.exists()) setSystemStatus(snap.data() as any);
      });

      const billRef = doc(firestore, 'config', 'billing');
      const unsubBill = onSnapshot(billRef, (snap) => {
        if (snap.exists()) setBilling(snap.data() as any);
      });

      setIsLoading(false);

      return () => {
        unsubAnn();
        unsubSys();
        unsubBill();
      };
    }
  }, [user, firestore, isUserLoading, router]);

  const handleSaveAnnouncement = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'config', 'announcement'), announcement, { merge: true });
      toast({ title: "Broadcast Synchronized", description: "All active users will see the updated message." });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Check permissions." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSystemStatus = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'config', 'system'), systemStatus, { merge: true });
      toast({ 
        title: systemStatus.isLocked ? "System Locked" : "System Restored", 
        description: systemStatus.isLocked ? "Report creation has been disabled site-wide." : "Normal operations have resumed." 
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Check permissions." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBilling = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, 'config', 'billing'), billing, { merge: true });
      toast({ 
        title: "Billing Synchronized", 
        description: "Payment details updated on administrative dashboards." 
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Check permissions." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 p-6 space-y-8 max-w-4xl mx-auto w-full">
        
        <div className="flex items-center justify-between gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg">
                  <ShieldCheck size={24} />
              </div>
              <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground">Command Center</h1>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Master Identity: {user?.email}</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
             <Link href="/admin" passHref>
                <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 bg-background/50 font-black text-[10px] uppercase text-muted-foreground hover:text-primary transition-all">
                  <Shield size={14} /> Admin Panel
                </Button>
             </Link>
           </div>
        </div>

        <div className="grid gap-8">
          <Card className="border-primary/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="text-primary h-5 w-5" />
                  <CardTitle className="text-lg">Global Announcement</CardTitle>
                </div>
                <Badge variant={announcement.isActive ? "default" : "secondary"}>
                  {announcement.isActive ? "LIVE BROADCAST" : "DRAFT"}
                </Badge>
              </div>
              <CardDescription>Draft and broadcast a custom welcome message to all active sessions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-dashed">
                <div className="space-y-0.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Broadcast Status</Label>
                  <p className="text-[10px] text-muted-foreground italic">When active, users see a banner on the landing page.</p>
                </div>
                <Switch 
                  checked={announcement.isActive} 
                  onCheckedChange={(val) => setAnnouncement(prev => ({ ...prev, isActive: val }))}
                />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase text-muted-foreground">Message Content</Label>
                    <span className="text-[10px] text-primary font-bold italic flex items-center gap-1">
                      <Sparkles size={10} /> Pro Tip: Embed links inside words!
                    </span>
                  </div>
                  <Textarea 
                    value={announcement.message} 
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Example: Welcome to the safe zone! Visit [our website](https://www.ceylonar.com/) for more."
                    className="min-h-[120px] bg-background font-medium text-sm leading-relaxed border-primary/20 focus:border-primary shadow-inner"
                  />
                </div>

                <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-primary flex items-center gap-1.5">
                    <LinkIcon size={12} /> Link Creation Tip
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    To hide a link in a word, use the format: <code className="bg-primary/10 px-1 rounded text-primary font-bold">[Word to click](https://link.com)</code>. 
                    Standard URLs (starting with http) will still be automatically linked.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t py-4">
              <Button onClick={handleSaveAnnouncement} disabled={isSaving} className="ml-auto font-black px-8 shadow-lg hover:shadow-primary/20 transition-all">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Sync Announcement
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-destructive/5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="text-destructive h-5 w-5" />
                  <CardTitle className="text-lg">Operational Command</CardTitle>
                </div>
                <Badge variant={systemStatus.isLocked ? "destructive" : "outline"} className={!systemStatus.isLocked ? "bg-green-50 text-green-700 border-green-200" : ""}>
                  {systemStatus.isLocked ? "LOCKED" : "OPERATIONAL"}
                </Badge>
              </div>
              <CardDescription>Restrict report creation globally for maintenance or security reasons.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${systemStatus.isLocked ? "bg-destructive/20 text-destructive" : "bg-green-100 text-green-600"}`}>
                    {systemStatus.isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-xs font-black uppercase text-muted-foreground">Allow Report Creation</Label>
                    <p className="text-[10px] text-muted-foreground italic">Disabling this prevents users from saving new vehicle valuations.</p>
                  </div>
                </div>
                <Switch 
                  checked={!systemStatus.isLocked} 
                  onCheckedChange={(val) => setSystemStatus(prev => ({ ...prev, isLocked: !val }))}
                />
              </div>

              {systemStatus.isLocked && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="text-destructive h-4 w-4" />
                    <Label className="text-xs font-black uppercase text-destructive tracking-widest">Maintenance Message</Label>
                  </div>
                  <Input 
                    value={systemStatus.maintenanceMessage}
                    onChange={(e) => setSystemStatus(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                    placeholder="The system is currently undergoing scheduled maintenance. Creation is disabled."
                    className="border-destructive/30 focus:border-destructive bg-background"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-destructive/5 border-t py-4">
              <Button 
                variant={systemStatus.isLocked ? "destructive" : "default"} 
                onClick={handleSaveSystemStatus} 
                disabled={isSaving} 
                className="ml-auto font-black px-8"
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update System Status
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/20 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-primary h-5 w-5" />
                  <CardTitle className="text-lg">Billing Management</CardTitle>
                </div>
                <Badge variant="secondary">CONFIG</Badge>
              </div>
              <CardDescription>Update payment status and subscription deadlines.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-dashed">
                <div className="space-y-0.5">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Payment Status</Label>
                  <p className="text-[10px] text-muted-foreground italic">Toggle the "Payment Pending" warning on the dashboard.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold uppercase", !billing.isPending ? "text-green-600" : "text-muted-foreground")}>Active</span>
                  <Switch 
                    checked={billing.isPending} 
                    onCheckedChange={(val) => setBilling(prev => ({ ...prev, isPending: val }))}
                  />
                  <span className={cn("text-[10px] font-bold uppercase", billing.isPending ? "text-destructive" : "text-muted-foreground")}>Pending</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Deadline Date</Label>
                  <Input 
                    value={billing.deadline} 
                    onChange={(e) => setBilling(prev => ({ ...prev, deadline: e.target.value }))}
                    placeholder="e.g. Feb 28"
                    className="bg-background border-primary/20 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Benefit / Note</Label>
                  <Input 
                    value={billing.benefit} 
                    onChange={(e) => setBilling(prev => ({ ...prev, benefit: e.target.value }))}
                    placeholder="e.g. Unlocks 3-Month Access"
                    className="bg-background border-primary/20 font-bold"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t py-4">
              <Button onClick={handleSaveBilling} disabled={isSaving} className="ml-auto font-black px-8 shadow-lg hover:shadow-primary/20 transition-all">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Billing Details
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center pt-8 opacity-40">
           <Separator className="mb-4" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Authorized System Terminal v1.2.4</p>
        </div>

      </main>
    </div>
  );
}
