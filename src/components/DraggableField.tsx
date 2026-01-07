
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const currentPositionRef = useRef(position);

  // Update internal position if props change from outside
  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);
  
  useEffect(() => {
    currentPositionRef.current = position;
  }, [position]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onClick(id); 
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: position.x, y: position.y };
    e.preventDefault();
    e.stopPropagation();
  }, [id, onClick, position.x, position.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
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
      onDragStop(id, currentPositionRef.current.x, currentPositionRef.current.y);
    }
  }, [isDragging, id, onDragStop]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


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
    boxSizing: 'border-box',
    zIndex: isSelected ? 10 : 1,
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
        style={containerStyle}
        className="field-container"
        onMouseDown={handleMouseDown}
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
    >
      <div className="text-blue-800 text-xs font-bold p-1 overflow-hidden pointer-events-none" style={{ width: '100%' }}>{label}</div>
      <div className="relative w-full h-full pointer-events-none">
        {(subFields || []).map(sub => (
          <div key={sub.id} style={subFieldStyle(sub)} className="sub-field-preview">
            {sub.label}
          </div>
        ))}
      </div>
    </div>
  );
};
