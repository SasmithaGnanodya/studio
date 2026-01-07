import React from 'react';
import type { ReportData } from '@/app/page';

type ReportPageProps = {
  data: ReportData;
};

export const ReportPage: React.FC<ReportPageProps> = ({ data }) => {
  return (
    <div className="report-page">
      {/* --- Header Data (Top Right) --- */}
      {/* Date */}
      <div className="field" style={{ top: '42mm', left: '150mm', width: '40mm', height: '8mm' }}>
        {data.date}
      </div>
      {/* Report Num */}
      <div className="field" style={{ top: '36mm', left: '150mm', width: '40mm', height: '8mm' }}>
        {data.reportNumber}
      </div>

      {/* --- Row 1: Reg No, Manufacturer, Model --- */}
      <div className="field" style={{ top: '55mm', left: '10mm', width: '22mm', height: '8mm' }}>
        {data.regNumber}
      </div>
      <div className="field" style={{ top: '55mm', left: '32mm', width: '34mm', height: '8mm' }}>
        {data.manufacturer}
      </div>
       <div className="field" style={{ top: '55mm', left: '66mm', width: '59mm', height: '8mm' }}>
        {data.model}
      </div>

      {/* --- Photos --- */}
      {data.frontImage && (
        <img 
          src={data.frontImage} 
          style={{ position: 'absolute', top: '50mm', left: '150mm', width: '40mm', height: '30mm', objectFit: 'cover' }} 
          alt="Car Front" 
        />
      )}

      {/* --- The Grid Data --- */}
      {/* Example: Engine Capacity */}
      <div className="field" style={{ top: '120mm', left: '22mm', width: '41mm', height: '8mm' }}>
        {data.engineCapacity}
      </div>
    </div>
  );
};
