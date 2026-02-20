"use client";

import React, { useState, useRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Upload, Loader2, X, ZoomIn, ZoomOut, Settings2, Move } from 'lucide-react';
import type { ImageData } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

type ImageAdjustmentControlProps = {
  value: ImageData;
  onChange: (value: ImageData) => void;
};

const PAN_STEP = 10; // pixels per click

export const ImageAdjustmentControl = ({ value, onChange }: ImageAdjustmentControlProps) => {
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(!value.url);
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
        url: downloadURL,
        scale: 1,
        x: 0,
        y: 0,
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
      setShowSettings(false);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was an error uploading your image.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    onChange({
      url: '',
      scale: 1,
      x: 0,
      y: 0,
    });
    setShowSettings(true);
  };

  if (!isOpen) {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        className="shadow-lg ring-2 ring-primary/20 hover:ring-primary/50 transition-all font-bold gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Move size={14} /> Adjust Image
      </Button>
    );
  }

  return (
    <div className="relative z-[100]">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[-1]" onClick={() => setIsOpen(false)} />
      
      <div className="flex flex-col gap-3 p-4 bg-card hover:bg-card backdrop-blur-md rounded-xl border shadow-2xl ring-2 ring-primary/30 w-64 transition-all">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {showSettings ? 'Image Settings' : 'Position Adjuster'}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSettings(!showSettings)}>
                <Settings2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                <X size={14} />
            </Button>
          </div>
        </div>

        {showSettings ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {value.url ? (
                <div className="relative group">
                   <img src={value.url} alt="preview" className="w-full h-24 object-cover rounded-md border" />
                   <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={clearImage}
                   >
                     <X size={12} />
                   </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col items-center justify-center border-dashed gap-2 hover:bg-muted"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-[10px]">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-[10px] font-semibold">Upload Photo</span>
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
            <div className="space-y-1">
              <Label htmlFor="imageUrl" className="text-[10px] uppercase text-muted-foreground font-bold">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={value.url}
                onChange={handleUrlChange}
                className="h-7 text-[10px]"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                  <ZoomOut size={14} className="text-muted-foreground" />
                  <Slider
                    min={0.5}
                    max={5}
                    step={0.1}
                    value={[value.scale]}
                    onValueChange={handleScaleChange}
                    className="flex-1"
                  />
                  <ZoomIn size={14} className="text-muted-foreground" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50" onClick={() => handlePan(0, -PAN_STEP)}>
                  <ArrowUp size={16} />
              </Button>
              <div className="flex gap-4">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50" onClick={() => handlePan(-PAN_STEP, 0)}>
                      <ArrowLeft size={16} />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50" onClick={() => handlePan(PAN_STEP, 0)}>
                      <ArrowRight size={16} />
                  </Button>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50" onClick={() => handlePan(0, PAN_STEP)}>
                  <ArrowDown size={16} />
              </Button>
            </div>
          </>
        )}
        
        <Button className="w-full mt-2" variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
            Close Adjuster
        </Button>
      </div>
    </div>
  );
};