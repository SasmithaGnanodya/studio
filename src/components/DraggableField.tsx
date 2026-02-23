"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Image } from 'lucide-react';

type DraggableFieldProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragStop: (id: string, x: number, y: number) => void;
  onResizeStop: (id: string, width: number, height: number) => void;
  onClick: (id: string) => void;
  isSelected: boolean;
  borderColor?: string;
  isImage?: boolean;
};

export const DraggableField = ({ id, x, y, width, height, onDragStop, onResizeStop, onClick, isSelected, borderColor = 'blue', isImage = false }: DraggableFieldProps) => {
  // Internal state for smooth dragging without causing parent re-renders on every mouse move
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });

  // Update internal state if props change from outside (e.g., loading new layout)
  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  useEffect(() => {
    setSize({ width, height });
  }, [width, height]);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartRect = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onClick(id);
    const target = e.target as HTMLElement;
    const resizeHandle = target.dataset.resize;
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartRect.current = { x: position.x, y: position.y, width: size.width, height: size.height };

    if (resizeHandle) {
        setIsResizing(resizeHandle);
    } else {
        setIsDragging(true);
    }

    e.preventDefault();
    e.stopPropagation();
  }, [id, onClick, position, size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    if (isResizing) {
        let newWidth = elementStartRect.current.width;
        let newHeight = elementStartRect.current.height;
        let newX = elementStartRect.current.x;
        let newY = elementStartRect.current.y;

        if (isResizing.includes('right')) newWidth += dx;
        if (isResizing.includes('bottom')) newHeight += dy;
        
        if (isResizing.includes('left')) {
            newWidth -= dx;
            newX += dx;
        }
        if (isResizing.includes('top')) {
            newHeight -= dy;
            newY += dy;
        }
        
        setPosition({ x: newX, y: newY });
        setSize({ width: Math.max(10, newWidth), height: Math.max(10, newHeight) });

    } else if (isDragging) {
        const newX = elementStartRect.current.x + dx;
        const newY = elementStartRect.current.y + dy;
        setPosition({ x: newX, y: newY });
    }
  }, [isDragging, isResizing]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onDragStop(id, position.x, position.y);
    }
    if (isResizing) {
      onDragStop(id, position.x, position.y); // Also update position on resize
      onResizeStop(id, size.width, size.height);
    }

    setIsDragging(false);
    setIsResizing(null);
  }, [isDragging, isResizing, id, position, size, onDragStop, onResizeStop]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true }); // Use once to auto-cleanup
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);


  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? `2px solid ${borderColor}` : `1px dashed ${borderColor}`,
    backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    boxSizing: 'border-box',
    zIndex: isSelected ? 100 : 50, // Higher z-index to stay above rendered report text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: (isDragging || isResizing) ? 'none' : 'all 0.1s ease', // No transition while dragging
  };
  
  const resizeHandleStyle: React.CSSProperties = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: isSelected ? borderColor : 'transparent',
      border: '1px solid white',
      borderRadius: '50%',
      boxShadow: '0 0 3px rgba(0,0,0,0.5)',
      zIndex: 101,
  };

  return (
    <div
        style={containerStyle}
        className="field-container"
        onMouseDown={handleMouseDown}
        onClick={(e) => { e.stopPropagation(); onClick(id); }}
    >
        {isImage && <Image className="w-1/2 h-1/2 opacity-20" />}
        {isSelected && (
            <>
                <div data-resize="top-left" style={{...resizeHandleStyle, top: '-5px', left: '-5px', cursor: 'nwse-resize'}}></div>
                <div data-resize="top-right" style={{...resizeHandleStyle, top: '-5px', right: '-5px', cursor: 'nesw-resize'}}></div>
                <div data-resize="bottom-left" style={{...resizeHandleStyle, bottom: '-5px', left: '-5px', cursor: 'nesw-resize'}}></div>
                <div data-resize="bottom-right" style={{...resizeHandleStyle, bottom: '-5px', right: '-5px', cursor: 'nwse-resize'}}></div>
                <div data-resize="top" style={{...resizeHandleStyle, top: '-5px', left: 'calc(50% - 5px)', cursor: 'ns-resize'}}></div>
                <div data-resize="bottom" style={{...resizeHandleStyle, bottom: '-5px', left: 'calc(50% - 5px)', cursor: 'ns-resize'}}></div>
                <div data-resize="left" style={{...resizeHandleStyle, top: 'calc(50% - 5px)', left: '-5px', cursor: 'ew-resize'}}></div>
                <div data-resize="right" style={{...resizeHandleStyle, top: 'calc(50% - 5px)', right: '-5px', cursor: 'ew-resize'}}></div>
            </>
        )}
    </div>
  );
};
