
// src/components/ReportPage.tsx
import React from 'react';
import type { SubField } from '@/lib/types';

type ReportPageProps = {
  fields: (SubField & { value: string })[];
  isCalibrating: boolean;
};

export const ReportPage = ({ fields, isCalibrating }: ReportPageProps) => {
  return (
    <div className={`report-page ${isCalibrating ? 'calibration-mode' : ''}`}>
      {fields.map(({ id, x, y, width, height, value, className }) => (
        <div
          key={id}
          className={`field ${className || ''}`}
          style={{
            top: `${y}mm`,
            left: `${x}mm`,
            width: `${width}mm`,
            height: `${height}mm`,
          }}
        >
          {value}
        </div>
      ))}
    </div>
  );
};
