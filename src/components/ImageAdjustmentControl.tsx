"use client";

import React, { useState, useRef } from 'react';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Upload, Loader2, X, ZoomIn, ZoomOut, Settings2, Move, ImageIcon, Maximize, Minimize, Trash2 } from 'lucide-react';
import type { ImageData } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

type ImageAdjustmentControlProps = {
  value: ImageData;
  onChange: (value: ImageData) => void;
  width?: number; // width in mm
  height?: number; // height in mm
};

const PAN_STEP = 10; // pixels per click

export const ImageAdjustmentControl = ({ value, onChange, width = 180, height = 100 }: ImageAdjustmentControlProps) => {
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(!value.url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScaleChange = (newScale: number[]) => {
    onChange({ ...value, scale: newScale[0] });
  };

  const handleFitChange = (fit: string) => {
    onChange({ ...value, fit: fit as 'cover' | 'contain' });
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
        fit: 'cover'
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
      fit: 'cover'
    });
    setShowSettings(true);
  };

  if (!isOpen) {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        className="shadow-xl ring-2 ring-primary/30 hover:ring-primary/60 transition-all font-bold gap-2 pointer-events-auto bg-background/80 backdrop-blur-md"
        onClick={() => setIsOpen(true)}
      >
        <Move size={14} /> Adjust Image
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100000] pointer-events-auto p-2 sm:p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={() => setIsOpen(false)} 
      />
      
      <Card className="relative w-full max-w-lg max-h-[95vh] bg-card border shadow-2xl ring-2 ring-primary/20 animate-in zoom-in-95 duration-200 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b shrink-0">
          <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            {showSettings ? 'Image Upload' : 'Position Adjuster'}
          </CardTitle>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setShowSettings(!showSettings)}
              title={showSettings ? "Show Controls" : "Show Settings"}
            >
                <Settings2 size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" 
              onClick={() => setIsOpen(false)}
            >
                <X size={18} />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Live Frame Preview</Label>
              <div 
                className="relative w-full overflow-hidden bg-muted border-2 border-primary/20 rounded-lg shadow-inner flex items-center justify-center mx-auto"
                style={{ 
                  aspectRatio: `${width} / ${height}`,
                  maxHeight: '25vh'
                }}
              >
                {value.url ? (
                  <img 
                    src={value.url} 
                    alt="Live preview" 
                    className="w-full h-full pointer-events-none transition-transform duration-75 ease-out"
                    style={{
                      objectFit: value.fit || 'cover',
                      transform: `scale(${value.scale}) translate(${value.x}px, ${value.y}px)`
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                    <ImageIcon size={32} />
                    <span className="text-xs">No image to preview</span>
                  </div>
                )}
              </div>
            </div>

            {showSettings ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full min-h-[120px] sm:h-32 flex flex-col items-center justify-center border-dashed border-2 gap-3 hover:bg-muted/50 hover:border-primary/50 transition-all"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-xs font-medium">Uploading Photo...</span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 rounded-full bg-primary/10">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs font-semibold">{value.url ? 'Replace Vehicle Photo' : 'Upload Vehicle Photo'}</span>
                      </>
                    )}
                  </Button>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/*"
                  />

                  {value.url && !isUploading && (
                    <Button 
                      variant="outline" 
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" 
                      onClick={clearImage}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Current Photo
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Frame Fit Mode</Label>
                    <Tabs value={value.fit || 'cover'} onValueChange={handleFitChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="cover" className="text-xs gap-1 px-1">
                          <Maximize className="h-3 w-3" /> Fill
                        </TabsTrigger>
                        <TabsTrigger value="contain" className="text-xs gap-1 px-1">
                          <Minimize className="h-3 w-3" /> Fit
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase text-muted-foreground font-bold">Scale / Zoom</Label>
                      <span className="text-[10px] font-mono font-bold text-primary">{(value.scale * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md border h-9">
                        <ZoomOut size={14} className="text-muted-foreground shrink-0" />
                        <Slider
                          min={0.5}
                          max={5}
                          step={0.1}
                          value={[value.scale]}
                          onValueChange={handleScaleChange}
                          className="flex-1"
                        />
                        <ZoomIn size={14} className="text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Manual Positioning</Label>
                  <div className="flex flex-col items-center gap-2 p-3 bg-muted/20 rounded-lg border border-dashed">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-primary hover:border-primary shrink-0" onClick={() => handlePan(0, -PAN_STEP)}>
                        <ArrowUp size={16} />
                    </Button>
                    <div className="flex gap-4">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-primary hover:border-primary shrink-0" onClick={() => handlePan(-PAN_STEP, 0)}>
                            <ArrowLeft size={16} />
                        </Button>
                        <div className="h-8 w-8 flex items-center justify-center text-primary font-bold">
                          <Move size={14} />
                        </div>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-primary hover:border-primary shrink-0" onClick={() => handlePan(PAN_STEP, 0)}>
                            <ArrowRight size={16} />
                        </Button>
                    </div>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background shadow-sm hover:text-primary hover:border-primary shrink-0" onClick={() => handlePan(0, PAN_STEP)}>
                        <ArrowDown size={16} />
                    </Button>
                  </div>
                  <div className="text-center text-[9px] font-mono text-muted-foreground mt-1">
                    Pos: {value.x}px X, {value.y}px Y
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="p-3 sm:p-4 border-t shrink-0">
          <Button className="w-full shadow-lg" onClick={() => setIsOpen(false)}>
              Done Adjusting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};