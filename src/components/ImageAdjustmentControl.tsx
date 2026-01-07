
"use client";

import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import type { ImageData } from '@/lib/types';

type ImageAdjustmentControlProps = {
  value: ImageData;
  onChange: (value: ImageData) => void;
};

const PAN_STEP = 5; // pixels

export const ImageAdjustmentControl = ({ value, onChange }: ImageAdjustmentControlProps) => {

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, url: e.target.value });
  };

  const handleScaleChange = (newScale: number[]) => {
    onChange({ ...value, scale: newScale[0] });
  };

  const handlePan = (dx: number, dy: number) => {
    onChange({
      ...value,
      x: value.x + dx,
      y: value.y + dy,
    });
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          placeholder="https://example.com/image.png"
          value={value.url}
          onChange={handleUrlChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Zoom</Label>
        <Slider
          min={0.5}
          max={3}
          step={0.05}
          value={[value.scale]}
          onValueChange={handleScaleChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Pan</Label>
        <div className="flex items-center justify-center gap-1">
          <Button variant="outline" size="icon" onClick={() => handlePan(-PAN_STEP, 0)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <Button variant="outline" size="icon" onClick={() => handlePan(0, -PAN_STEP)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handlePan(0, PAN_STEP)}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={() => handlePan(PAN_STEP, 0)}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
