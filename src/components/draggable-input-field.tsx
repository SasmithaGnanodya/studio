"use client";

import { useState, useEffect } from 'react';
import type { Field } from '@/types';

type DraggableInputFieldProps = {
  field: Field;
  onUpdate: (id: string, newProps: Partial<Field>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
};

export function DraggableInputField({ field, onUpdate, onSelect, isSelected }: DraggableInputFieldProps) {
  const [interactionState, setInteractionState] = useState<{
    type: 'drag' | 'resize' | null;
    startX: number;
    startY: number;
    parentRect: DOMRect | null;
  }>({ type: null, startX: 0, startY: 0, parentRect: null });

  const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement>, type: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(field.id);
    setInteractionState({
      type,
      startX: e.clientX,
      startY: e.clientY,
      parentRect: (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect() ?? null
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactionState.type || !interactionState.parentRect) return;

      const dx = e.clientX - interactionState.startX;
      const dy = e.clientY - interactionState.startY;

      if (interactionState.type === 'drag') {
        const newX = field.x + (dx / interactionState.parentRect.width) * 100;
        const newY = field.y + (dy / interactionState.parentRect.height) * 100;
        onUpdate(field.id, { x: newX, y: newY });
      } else if (interactionState.type === 'resize') {
        const newWidth = field.width + (dx / interactionState.parentRect.width) * 100;
        const newHeight = field.height + (dy / interactionState.parentRect.height) * 100;
        onUpdate(field.id, { width: Math.max(5, newWidth), height: Math.max(3, newHeight) });
      }
      
      setInteractionState(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
    };

    const handleMouseUp = () => {
      setInteractionState(prev => ({ ...prev, type: null }));
    };

    if (interactionState.type) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactionState, field, onUpdate]);

  const style: React.CSSProperties = {
    left: `${field.x}%`,
    top: `${field.y}%`,
    width: `${field.width}%`,
    height: `${field.height}%`,
    position: 'absolute',
    cursor: interactionState.type === 'drag' ? 'grabbing' : 'grab',
  };

  return (
    <div
      className="draggable-field group"
      style={style}
      onMouseDown={(e) => handleInteractionStart(e, 'drag')}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        value={field.value}
        onChange={(e) => onUpdate(field.id, { value: e.target.value })}
        className="w-full h-full p-1 text-xs border-none resize-none focus:outline-none"
        style={{
           backgroundColor: 'rgba(135, 206, 235, 0.25)',
           border: `1.5px dashed ${isSelected ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}`,
           color: 'hsl(var(--foreground))',
           borderRadius: '2px',
        }}
        onMouseDown={(e) => e.stopPropagation()} 
      />
      {isSelected && (
          <div
            onMouseDown={(e) => handleInteractionStart(e, 'resize')}
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-background cursor-se-resize rounded-full shadow-md"
          />
      )}
    </div>
  );
}
