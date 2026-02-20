"use client";

import React, { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Upload, Loader2, X } from 'lucide-react';
import type { ImageData } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

type ImageAdjustmentControlProps = {
  value: ImageData;
  onChange: (value: ImageData) => void;
};

const PAN_STEP = 5; // pixels

export const ImageAdjustmentControl = ({ value, onChange }: ImageAdjustmentControlProps) => {
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    // Optional: Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
      return;
    }

    setIsUploading(true);
    const storageRef = ref(storage, `report-images/${Date.now()}_${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      onChange({
        ...value,
        url: downloadURL,
        scale: 1,
        x: 0,
        y: 0,
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your image.",
      });
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    onChange({
      ...value,
      url: '',
      scale: 1,
      x: 0,
      y: 0,
    });
  };

  return (
    <div className="space-y-4 rounded-md border p-4 bg-background shadow-sm">
      <div className="space-y-2">
        <Label>Photo Upload</Label>
        <div className="flex flex-col gap-2">
          {value.url ? (
            <div className="relative group">
               <img src={value.url} alt="preview" className="w-full h-32 object-cover rounded-md border" />
               <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={clearImage}
               >
                 <X size={14} />
               </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-32 flex flex-col items-center justify-center border-dashed gap-2"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs">Click to upload photo</span>
                </>
              )}
            </Button>
          )}
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Or use Image URL</Label>
        <Input
          id="imageUrl"
          placeholder="https://example.com/image.png"
          value={value.url}
          onChange={handleUrlChange}
          className="h-8 text-xs"
        />
      </div>
      
      {value.url && (
        <>
          <div className="space-y-2">
            <Label className="text-xs flex justify-between">Zoom <span>{Math.round(value.scale * 100)}%</span></Label>
            <Slider
              min={0.5}
              max={3}
              step={0.05}
              value={[value.scale]}
              onValueChange={handleScaleChange}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Pan Controls</Label>
            <div className="flex items-center justify-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePan(-PAN_STEP, 0)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePan(0, -PAN_STEP)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePan(0, PAN_STEP)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePan(PAN_STEP, 0)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
