
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';

type DraggableFieldProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragStop: (id: string, x: number, y: number) => void;
  onClick: (id: string) => void;
  isSelected: boolean;
  borderColor?: string;
};

export const DraggableField = ({ id, x, y, width, height, onDragStop, onClick, isSelected, borderColor = 'blue' }: DraggableFieldProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onClick(id); 
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x, y }; // Use the passed-in position
    e.preventDefault();
    e.stopPropagation();
  }, [id, onClick, x, y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const newX = elementStartPos.current.x + dx;
    const newY = elementStartPos.current.y + dy;
    // We call onDragStop continuously to provide real-time updates to the parent
    onDragStop(id, newX, newY);
  }, [isDragging, id, onDragStop]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Final position is already set by handleMouseMove, no extra call needed here
    }
  }, [isDragging]);

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
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? `2px solid ${borderColor}` : `1px dashed ${borderColor}`,
    backgroundColor: isSelected ? `rgba(0, 0, 255, 0.1)` : 'rgba(0, 0, 0, 0.05)',
    boxSizing: 'border-box',
    zIndex: isSelected ? 10 : 1,
  };

  return (
    <div
        style={containerStyle}
        className="field-container"
        onMouseDown={handleMouseDown}
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
    />
  );
};
