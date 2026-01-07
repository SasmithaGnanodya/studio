
// src/components/ReportPage.tsx
import React from 'react';

export type PrintField = {
  id: string;
  value: string | React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  className?: string;
};

type ReportPageProps = {
  staticLabels: PrintField[];
  dynamicValues: PrintField[];
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

export const ReportPage = ({ staticLabels, dynamicValues, isCalibrating }: ReportPageProps) => {
  return (
    <div className={`report-page ${isCalibrating ? 'calibration-mode' : ''}`}>
      {/* Render static labels */}
      {staticLabels.map(renderField)}
      
      {/* Render dynamic data fields */}
      {dynamicValues.map(renderField)}
    </div>
  );
};
