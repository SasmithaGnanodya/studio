"use client";

import { useState } from 'react';
import { Header } from '@/components/header';
import { DataForm } from '@/components/DataForm';
import { ReportPage } from '@/components/ReportPage';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';

export type ReportData = {
  date: string;
  reportNumber: string;
  regNumber: string;
  manufacturer: string;
  model: string;
  frontImage: string | null;
  engineCapacity: string;
};

export default function Home() {
  const [data, setData] = useState<ReportData>({
    date: '2024-07-31',
    reportNumber: 'VRN-12345',
    regNumber: 'GHI-678',
    manufacturer: 'Toyota',
    model: 'Corolla',
    frontImage: 'https://picsum.photos/seed/car/400/300',
    engineCapacity: '1800cc',
  });
  const [isCalibrationMode, setIsCalibrationMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const handlePrint = () => {
    // Ensure calibration and preview modes are off for printing
    const originalCalibration = isCalibrationMode;
    const originalPreview = isPreviewMode;
    setIsCalibrationMode(false);
    setIsPreviewMode(false);

    // Allow state to update before printing
    setTimeout(() => {
      window.print();
      // Restore previous state after printing dialog closes
      setIsCalibrationMode(originalCalibration);
      setIsPreviewMode(originalPreview);
    }, 100);
  };
  
  const handleLogin = async () => {
     if (!user && !isUserLoading) {
        try {
            await initiateAnonymousSignIn(auth);
            toast({ title: 'Signed in anonymously' });
        } catch (error) {
            toast({ title: 'Authentication Error', variant: 'destructive' });
        }
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4 lg:gap-6 lg:p-6">
        <aside className="w-full md:w-96 flex flex-col gap-4 no-print">
          <DataForm data={data} setData={setData} />
          <div className="bg-card p-4 rounded-lg shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="preview-mode" className="flex items-center gap-2 cursor-pointer">
                    <Eye className="h-5 w-5" />
                    <span>Preview BG</span>
                </Label>
                <Switch
                    id="preview-mode"
                    checked={isPreviewMode}
                    onCheckedChange={setIsPreviewMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="calibration-mode" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-5 h-5 border border-red-500 rounded-sm" />
                    <span>Calibration Mode</span>
                </Label>
                <Switch
                    id="calibration-mode"
                    checked={isCalibrationMode}
                    onCheckedChange={setIsCalibrationMode}
                />
              </div>
              <Button onClick={handlePrint} className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print Valuation Report
              </Button>
               {!user && (
                 <Button onClick={handleLogin} variant="outline" className="w-full">
                    Sign In to Save
                </Button>
               )}
          </div>
        </aside>

        <div className="flex-1 rounded-lg bg-white shadow-sm p-4 min-h-[600px] md:min-h-0 overflow-auto">
           <div
            className={`
              ${isCalibrationMode ? 'calibration-mode' : ''}
              ${isPreviewMode ? 'preview-mode print-background' : ''}
            `}
          >
            <ReportPage data={data} />
          </div>
        </div>
      </main>
    </div>
  );
}
