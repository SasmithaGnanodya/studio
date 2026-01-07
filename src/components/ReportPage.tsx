
// src/components/ReportPage.tsx
import React from 'react';
import type { SubField } from '@/lib/types';

type PrintField = {
  id: string;
  value: string | React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
};

type ReportPageProps = {
  fields: (SubField & { value: string | React.ReactNode })[];
  staticLabels: PrintField[];
  isCalibrating: boolean;
};

const renderField = (field: PrintField) => (
  <div
    key={field.id}
    className={`field ${field.className || ''}`}
    style={{
      top: `${field.y}mm`,
      left: `${field.x}mm`,
      width: `${field.width}mm`,
      height: `${field.height}mm`,
      whiteSpace: 'pre-wrap', // Allows rendering of \n
    }}
  >
    {field.value}
  </div>
);

export const ReportPage = ({ fields, staticLabels, isCalibrating }: ReportPageProps) => {
  return (
    <div className={`report-page ${isCalibrating ? 'calibration-mode' : ''}`}>
      {/* Render static labels */}
      {isCalibrating && staticLabels.map(renderField)}
      
      {/* Render dynamic data fields */}
      {fields.map(renderField)}
    </div>
  );
};
