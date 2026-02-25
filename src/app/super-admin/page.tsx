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
import { ShieldCheck, Megaphone, Lock, Unlock, Loader2, Save, AlertTriangle, Activity, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SUPER_ADMIN_EMAIL = 'sasmithagnanodya@gmail.com';

export default function SuperAdminPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [announcement, setAnnouncement] = useState({ message: '', isActive: false });
  const [systemStatus, setSystemStatus] = useState({ isLocked: false, maintenanceMessage: '' });
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
        setIsLoading(false);
      });

      return () => {
        unsubAnn();
        unsubSys();
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
        
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl">
           <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg">
              <ShieldCheck size={24} />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tight">Super Admin Command Center</h1>
              <p className="text-xs font-bold text-primary uppercase tracking-widest">Authorized Access: {user?.email}</p>
           </div>
        </div>

        <div className="grid gap-8">
          {/* Section 1: Announcement Manager */}
          <Card className="border-primary/20 shadow-xl overflow-hidden">
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
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-muted-foreground">Message Content</Label>
                <Textarea 
                  value={announcement.message} 
                  onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Welcome to the updated Drive Care Valuation system..."
                  className="min-h-[120px] bg-background font-medium text-sm leading-relaxed"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t py-4">
              <Button onClick={handleSaveAnnouncement} disabled={isSaving} className="ml-auto font-black px-8">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Sync Announcement
              </Button>
            </CardFooter>
          </Card>

          {/* Section 2: Operational Status (Kill Switch) */}
          <Card className="border-destructive/20 shadow-xl overflow-hidden">
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
        </div>

        <div className="text-center pt-8 opacity-40">
           <Separator className="mb-4" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Authorized System Terminal v1.2.4</p>
        </div>

      </main>
    </div>
  );
}

import { Input } from '@/components/ui/input';
