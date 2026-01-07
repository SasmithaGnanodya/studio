'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ReportData } from '@/app/page';
import { Edit } from 'lucide-react';

type DataFormProps = {
  data: ReportData;
  setData: React.Dispatch<React.SetStateAction<ReportData>>;
};

export function DataForm({ data, setData }: DataFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Edit className="mr-2 h-5 w-5" />
          Report Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={data.date} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reportNumber">Report Number</Label>
          <Input id="reportNumber" value={data.reportNumber} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="regNumber">Registration Number</Label>
          <Input id="regNumber" value={data.regNumber} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" value={data.manufacturer} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" value={data.model} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="engineCapacity">Engine Capacity</Label>
          <Input id="engineCapacity" value={data.engineCapacity} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="frontImage">Front Image URL</Label>
          <Input id="frontImage" value={data.frontImage ?? ''} onChange={handleChange} />
        </div>
      </CardContent>
    </Card>
  );
}
