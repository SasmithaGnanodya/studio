
'use client';

import React, { useState } from 'react';
import type { ImageData } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageAdjustmentControl } from './ImageAdjustmentControl';
import { cn } from '@/lib/utils';

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

  const [adjustingFieldId, setAdjustingFieldId] = useState<string | null>(null);

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
        <div key={field.id} className="field z-10 pointer-events-none" style={style}>
          {field.value}
        </div>
      );
    }

    if (!isEditable) {
      return (
        <div key={field.id} className="field font-mono z-10" style={style}>
          {field.value}
        </div>
      );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      
      const sensitivePatterns = ['engine', 'chassis', 'report', 'reg', 'ref', 'val', 'id'];
      if (sensitivePatterns.some(p => field.fieldId.toLowerCase().includes(p))) {
        val = val.toUpperCase();
      }
      
      onValueChange?.(field.fieldId, val);
    };

    const isSystemLocked = field.fieldId === 'regNumber' || field.fieldId === 'reportNumber';

    return (
      <div key={field.id} style={style} className="z-20 group">
        {field.inputType === 'dropdown' ? (
          <Select
            value={field.value}
            onValueChange={(val) => onValueChange?.(field.fieldId, val)}
          >
            <SelectTrigger 
              className="h-full w-full bg-white/70 backdrop-blur-sm border-primary/30 hover:border-primary transition-all p-1"
              style={{ color: style.color, fontWeight: style.fontWeight }}
            >
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
            onChange={handleInputChange}
            className={cn(
              "h-full w-full bg-white/70 backdrop-blur-sm border-primary/30 focus:border-primary font-mono text-center p-0 transition-all",
              isSystemLocked && "bg-muted/10 border-dashed opacity-80 cursor-not-allowed"
            )}
            style={{ 
              fontSize: style.fontSize, 
              color: style.color, 
              fontWeight: style.fontWeight 
            }}
            disabled={isSystemLocked}
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
      zIndex: 5,
    };

    const imageWrapperStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      border: isEditable ? '1px dashed rgba(6, 182, 212, 0.5)' : 'none',
      backgroundColor: field.value.url ? 'transparent' : 'rgba(0,0,0,0.03)',
    };

    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: field.value.fit || field.objectFit || 'cover',
      transform: `scale(${field.value.scale}) translate(${field.value.x}px, ${field.value.y}px)`,
      transition: 'transform 0.1s ease-out'
    };

    return (
      <div key={field.id} style={containerStyle} className="group overflow-visible">
        <div style={imageWrapperStyle}>
          {field.value.url ? (
            <img src={field.value.url} alt="field" style={imageStyle} />
          ) : (
            isEditable && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <span className="text-[10px] font-bold uppercase tracking-widest">Image Area</span>
              </div>
            )
          )}
        </div>
        
        {isEditable && (
          <div className="absolute inset-0 flex items-center justify-center z-[10] pointer-events-none overflow-visible">
            <div className="pointer-events-auto">
              <ImageAdjustmentControl
                value={field.value}
                onChange={(val) => onValueChange?.(field.fieldId, val)}
                width={field.width}
                height={field.height}
                onOpen={() => setAdjustingFieldId(field.fieldId)}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const activeAdjustingField = adjustingFieldId ? imageValues.find(f => f.fieldId === adjustingFieldId) : null;

  // Filter out labels with empty text for cleaner rendering
  const filteredStaticLabels = staticLabels.filter(f => f.value && f.value.trim() !== '');

  return (
    <div className="report-page shadow-2xl overflow-visible relative bg-white">
      {imageValues.map(renderImageField)}
      {filteredStaticLabels.map(f => renderTextField(f, true))}
      {dynamicValues.map(f => renderTextField(f, false))}

      {isEditable && activeAdjustingField && (
        <div className="fixed inset-0 z-[999999] pointer-events-none">
           <ImageAdjustmentControl
              forceOpen={true}
              value={activeAdjustingField.value}
              onChange={(val) => onValueChange?.(activeAdjustingField.fieldId, val)}
              width={activeAdjustingField.width}
              height={activeAdjustingField.height}
              onClose={() => setAdjustingFieldId(null)}
            />
        </div>
      )}
    </div>
  );
};
