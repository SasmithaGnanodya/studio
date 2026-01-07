
"use client";

import React, { useState, useRef, useCallback } from 'react';
import type { SubField } from '@/lib/types';

type DraggableFieldProps = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragStop: (id: string, x: number, y: number) => void;
  onClick: (id: string) => void;
  isSelected: boolean;
  subFields: SubField[];
};

export const DraggableField = ({ id, label, x, y, width, height, onDragStop, onClick, isSelected, subFields }: DraggableFieldProps) => {
  const [position, setPosition] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only start drag on the main container, not on sub-fields if they were interactive
    if ((e.target as HTMLElement).closest('.sub-field-preview')) {
        onClick(id); // Allow selection by clicking subfields
        return;
    }
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: position.x, y: position.y };
    e.preventDefault();
    e.stopPropagation();
  }, [position.x, position.y, id, onClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    setPosition({
      x: elementStartPos.current.x + dx,
      y: elementStartPos.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragStop(id, position.x, position.y);
    }
    onClick(id);
  }, [isDragging, id, position.x, position.y, onDragStop, onClick]);

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? '2px solid blue' : '1px dashed grey',
    backgroundColor: isSelected ? 'rgba(0, 0, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    userSelect: 'none',
    boxSizing: 'border-box'
  };

  const subFieldStyle = (sub: SubField): React.CSSProperties => ({
    position: 'absolute',
    left: `${sub.x || 0}mm`,
    top: `${sub.y || 0}mm`,
    width: `${sub.width}mm`,
    height: `${sub.height}mm`,
    fontSize: '8px',
    border: '1px dotted rgba(0,0,0,0.3)',
    backgroundColor: 'rgba(0,100,255,0.1)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '1px',
    boxSizing: 'border-box'
  });

  return (
    <div
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={isDragging ? handleMouseUp : undefined}
        // This outer div is for capturing mouse events outside the component bounds during a drag
        style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            display: isDragging ? 'block' : 'none',
            zIndex: 1000
        }}
    >
        <div style={containerStyle} className="field-container">
          <div className="text-blue-800 text-xs font-bold p-1 overflow-hidden" style={{ width: '100%' }}>{label}</div>
          <div className="relative w-full h-full">
            {(subFields || []).map(sub => (
              <div key={sub.id} style={subFieldStyle(sub)} className="sub-field-preview">
                {sub.label}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};
