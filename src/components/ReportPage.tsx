
// src/components/ReportPage.tsx
import React from 'react';
import type { ImageData } from '@/lib/types';

export type PrintField = {
  id: string;
  value: string | React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isBold?: boolean;
  color?: string;
  fontSize?: number;
};

export type PrintImageField = {
  id: string;
  value: ImageData;
  x: number;
  y: number;
  width: number;
  height: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

type ReportPageProps = {
  staticLabels: PrintField[];
  dynamicValues: PrintField[];
  imageValues: PrintImageField[];
  isCalibrating: boolean;
};

const renderTextField = (field: PrintField) => {
  const style: React.CSSProperties = {
    top: `${field.y}mm`,
    left: `${field.x}mm`,
    width: `${field.width}mm`,
    height: `${field.height}mm`,
    whiteSpace: 'pre-wrap', // Allows rendering of \n
    fontWeight: field.isBold ? 'bold' : 'normal',
    color: field.color || '#000000',
    fontSize: field.fontSize ? `${field.fontSize}pt` : '12pt',
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

const renderImageField = (field: PrintImageField) => {
  const containerStyle: React.CSSProperties = {
    top: `${field.y}mm`,
    left: `${field.x}mm`,
    width: `${field.width}mm`,
    height: `${field.height}mm`,
    position: 'absolute',
    overflow: 'hidden',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: field.objectFit || 'cover',
    transform: `scale(${field.value.scale}) translateX(${field.value.x}px) translateY(${field.value.y}px)`,
    transition: 'transform 0.1s ease-out',
  };

  return (
    <div key={field.id} style={containerStyle}>
      {field.value.url && <img src={field.value.url} alt={`report-image-${field.id}`} style={imageStyle} />}
    </div>
  );
};

export const ReportPage = ({ staticLabels, dynamicValues, imageValues, isCalibrating }: ReportPageProps) => {
  return (
    <div className={`report-page ${isCalibrating ? 'calibration-mode' : ''}`}>
      {/* Render static labels */}
      {staticLabels.map(renderTextField)}
      
      {/* Render dynamic data fields */}
      {dynamicValues.map(renderTextField)}
      
      {/* Render image fields */}
      {imageValues.map(renderImageField)}
    </div>
  );
};
