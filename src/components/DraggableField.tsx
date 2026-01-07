
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartRect = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    onClick(id);
    const target = e.target as HTMLElement;
    const resizeHandle = target.dataset.resize;

    if (resizeHandle) {
        setIsResizing(resizeHandle);
        elementStartRect.current = { x, y, width, height };
        dragStartPos.current = { x: e.clientX, y: e.clientY };
    } else {
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        elementStartRect.current = { x, y, width, height };
    }
    e.preventDefault();
    e.stopPropagation();
  }, [id, onClick, x, y, width, height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    if (isResizing) {
        let newWidth = elementStartRect.current.width;
        let newHeight = elementStartRect.current.height;
        
        if (isResizing.includes('right')) newWidth += dx;
        if (isResizing.includes('left')) newWidth -= dx;
        if (isResizing.includes('bottom')) newHeight += dy;
        if (isResizing.includes('top')) newHeight -= dy;
        
        // The drag stop for resize has to be different because it only updates size, not position
        // The position is updated via the drag handle
        onResizeStop(id, Math.max(10, newWidth), Math.max(10, newHeight));
    } else if (isDragging) {
        const newX = elementStartRect.current.x + dx;
        const newY = elementStartRect.current.y + dy;
        onDragStop(id, newX, newY);
    }
  }, [isDragging, isResizing, id, onDragStop, onResizeStop]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);


  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    border: isSelected ? `2px solid ${borderColor}` : `1px dashed ${borderColor}`,
    backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    boxSizing: 'border-box',
    zIndex: isSelected ? 10 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  const resizeHandleStyle: React.CSSProperties = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: isSelected ? borderColor : 'transparent',
      border: '1px solid white',
      borderRadius: '50%',
      boxShadow: '0 0 3px rgba(0,0,0,0.5)',
      zIndex: 11,
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
                <div data-resize="bottom-right" style={{...resizeHandleStyle, bottom: '-5-px', right: '-5px', cursor: 'nwse-resize'}}></div>
                <div data-resize="top" style={{...resizeHandleStyle, top: '-5px', left: 'calc(50% - 5px)', cursor: 'ns-resize'}}></div>
                <div data-resize="bottom" style={{...resizeHandleStyle, bottom: '-5px', left: 'calc(50% - 5px)', cursor: 'ns-resize'}}></div>
                <div data-resize="left" style={{...resizeHandleStyle, top: 'calc(50% - 5px)', left: '-5px', cursor: 'ew-resize'}}></div>
                <div data-resize="right" style={{...resizeHandleStyle, top: 'calc(50% - 5px)', right: '-5px', cursor: 'ew-resize'}}></div>
            </>
        )}
    </div>
  );
};
