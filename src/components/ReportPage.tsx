
// src/components/ReportPage.tsx
import React from 'react';

export type PrintField = {
  id: string;
  value: string | React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isBold?: boolean;
  color?: string;
};

type ReportPageProps = {
  staticLabels: PrintField[];
  dynamicValues: PrintField[];
  isCalibrating: boolean;
};

const renderField = (field: PrintField) => {
  const style: React.CSSProperties = {
    top: `${field.y}mm`,
    left: `${field.x}mm`,
    width: `${field.width}mm`,
    height: `${field.height}mm`,
    whiteSpace: 'pre-wrap', // Allows rendering of \n
    fontWeight: field.isBold ? 'bold' : 'normal',
    color: field.color || '#000000',
  };

  return (
    <div
      key={field.id}
      className="field"
      style={style}
    >
      {field.value}
    </div>
  );
};

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
