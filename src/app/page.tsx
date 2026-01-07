
"use client";

import { useState } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Printer, Eye, Wrench } from 'lucide-react';
import { DataForm } from '@/components/DataForm';
import { ReportPage } from '@/components/ReportPage';
import { initialReportState } from '@/lib/initialReportState';

export default function Home() {
  const [reportData, setReportData] = useState(initialReportState);
  const [isPreview, setIsPreview] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row gap-4 p-4 lg:gap-6 lg:p-6 no-print">
        <aside className="w-full md:w-[450px] flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <DataForm data={reportData} onChange={handleDataChange} />
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch id="preview-mode" checked={isPreview} onCheckedChange={setIsPreview} />
                  <Label htmlFor="preview-mode" className="flex items-center gap-2"><Eye size={16}/> Preview</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="calibration-mode" checked={isCalibrating} onCheckedChange={setIsCalibrating} />
                  <Label htmlFor="calibration-mode" className="flex items-center gap-2"><Wrench size={16}/> Calibrate</Label>
                </div>
              </div>
              <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print to PDF</Button>
            </CardContent>
          </Card>
          
          <div className="flex-1 rounded-lg bg-white shadow-sm overflow-auto p-4">
            <div className={isPreview ? "preview-mode" : ""}>
               <ReportPage data={reportData} isCalibrating={isCalibrating} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Print-only view */}
      <div className="hidden print-view">
        <ReportPage data={reportData} isCalibrating={false} />
      </div>
    </div>
  );
}
