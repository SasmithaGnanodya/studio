
"use client";

import React, { useState, useRef, useCallback } from 'react';

type DraggableFieldProps = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragStop: (id: string, x: number, y: number) => void;
  className?: string;
};

export const DraggableField = ({ id, label, x, y, width, height, onDragStop, className }: DraggableFieldProps) => {
  const [position, setPosition] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: position.x, y: position.y };
    e.preventDefault();
  }, [position.x, position.y]);

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
  }, [isDragging, id, position.x, position.y, onDragStop]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: '1px dashed blue',
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
    userSelect: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
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
        <div style={style} className={`flex items-center justify-center text-blue-800 text-xs ${className || ''}`}>
            {label}
        </div>
    </div>
  );
};
