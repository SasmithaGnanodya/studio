'use client';

import React from 'react';
import type { ImageData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageAdjustmentControl } from './ImageAdjustmentControl';

export type PrintField = {
  id: string;
  fieldId: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isBold?: boolean;
  color?: string;
  fontSize?: number;
  inputType?: 'text' | 'dropdown';
  options?: string[];
};

export type PrintImageField = {
  id: string;
  fieldId: string;
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
  isEditable?: boolean;
  onValueChange?: (fieldId: string, value: string | ImageData) => void;
};

export const ReportPage = ({ 
  staticLabels = [], 
  dynamicValues = [], 
  imageValues = [], 
  isEditable = false,
  onValueChange 
}: ReportPageProps) => {

  const renderTextField = (field: PrintField, isStatic: boolean) => {
    const style: React.CSSProperties = {
      top: `${field.y}mm`,
      left: `${field.x}mm`,
      width: `${field.width}mm`,
      height: `${field.height}mm`,
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      fontWeight: field.isBold ? 'bold' : 'normal',
      color: field.color || '#000000',
      fontSize: field.fontSize ? `${field.fontSize}pt` : '10pt',
    };

    if (isStatic) {
      return (
        <div key={field.id} className="field z-0 pointer-events-none" style={style}>
          {field.value}
        </div>
      );
    }

    if (!isEditable) {
      return (
        <div key={field.id} className="field font-mono" style={style}>
          {field.value}
        </div>
      );
    }

    return (
      <div key={field.id} style={style} className="z-10 group">
        {field.inputType === 'dropdown' ? (
          <Select
            value={field.value}
            onValueChange={(val) => onValueChange?.(field.fieldId, val)}
          >
            <SelectTrigger className="h-full w-full bg-white/70 backdrop-blur-sm border-primary/30 hover:border-primary transition-colors p-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(field.options || [])
                .filter((opt) => typeof opt === 'string' && opt.trim() !== "")
                .map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={field.fieldId.toLowerCase().includes('date') ? 'date' : 'text'}
            value={field.value}
            onChange={(e) => onValueChange?.(field.fieldId, e.target.value)}
            className="h-full w-full bg-white/70 backdrop-blur-sm border-primary/30 focus:border-primary font-mono text-center p-0"
            style={{ fontSize: style.fontSize }}
            disabled={field.fieldId === 'regNumber'}
          />
        )}
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
      border: isEditable ? '1px dashed rgba(6, 182, 212, 0.5)' : 'none',
      backgroundColor: field.value.url ? 'transparent' : 'rgba(0,0,0,0.03)'
    };

    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: field.objectFit || 'cover',
      transform: `scale(${field.value.scale}) translate(${field.value.x}px, ${field.value.y}px)`,
      transition: 'transform 0.1s ease-out'
    };

    return (
      <div key={field.id} style={containerStyle} className="group overflow-visible">
        {field.value.url ? (
          <img src={field.value.url} alt="field" style={imageStyle} />
        ) : (
          isEditable && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
              <span className="text-[10px] font-bold uppercase tracking-widest">Image Area</span>
            </div>
          )
        )}
        
        {isEditable && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center z-20 pointer-events-none overflow-visible">
            <div className="pointer-events-auto">
              <ImageAdjustmentControl
                value={field.value}
                onChange={(val) => onValueChange?.(field.fieldId, val)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="report-page shadow-2xl overflow-visible relative">
      {staticLabels.map(f => renderTextField(f, true))}
      {dynamicValues.map(f => renderTextField(f, false))}
      {imageValues.map(renderImageField)}
    </div>
  );
};