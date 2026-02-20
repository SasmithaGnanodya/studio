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
import { cn } from '@/lib/utils';

type ImageAdjustmentControlProps = {
  value: ImageData;
  onChange: (value: ImageData) => void;
  width?: number; // width in mm
  height?: number; // height in mm
  isInline?: boolean; // If true, only shows the button
  forceOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

const PAN_STEP = 10; // pixels per click

export const ImageAdjustmentControl = ({ 
  value, 
  onChange, 
  width = 180, 
  height = 100,
  isInline = false,
  forceOpen = false,
  onOpen,
  onClose
}: ImageAdjustmentControlProps) => {
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
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

  // If not explicitly forced open (modal mode), render the trigger button
  if (!forceOpen) {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        className={cn(
          "shadow-xl ring-2 ring-primary/30 hover:ring-primary/60 transition-all font-bold gap-2 pointer-events-auto",
          !isInline && "bg-background/90 backdrop-blur-md opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.();
        }}
      >
        <Move size={14} /> Adjust Image
      </Button>
    );
  }

  // Render the Modal UI (only when forceOpen is true)
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[99999] pointer-events-auto p-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <Card className="relative w-full max-w-lg max-h-[90vh] bg-card border-2 shadow-2xl ring-4 ring-primary/10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-muted/30 shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <ImageIcon className="h-4 w-4 text-primary" />
            {showSettings ? 'Upload Photo' : 'Image Adjuster'}
          </CardTitle>
          <div className="flex gap-2">
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
              onClick={onClose}
            >
                <X size={18} />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 overflow-y-auto bg-background">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Live Frame Preview</Label>
              <div 
                className="relative w-full overflow-hidden bg-black/5 border-2 border-primary/20 rounded-lg shadow-inner flex items-center justify-center mx-auto"
                style={{ 
                  aspectRatio: `${width} / ${height}`,
                  maxHeight: '30vh'
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
                    <ImageIcon size={48} />
                    <span className="text-xs font-bold uppercase tracking-widest">No Image Selected</span>
                  </div>
                )}
              </div>
            </div>

            {showSettings ? (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-32 flex flex-col items-center justify-center border-dashed border-2 gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all bg-muted/20"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">Processing...</span>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">{value.url ? 'Change Photo' : 'Upload Vehicle Photo'}</span>
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
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold transition-all" 
                    onClick={clearImage}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Photo
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Fit Mode</Label>
                    <Tabs value={value.fit || 'cover'} onValueChange={handleFitChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cover" className="text-[10px] font-bold">FILL</TabsTrigger>
                        <TabsTrigger value="contain" className="text-[10px] font-bold">FIT</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase text-muted-foreground font-bold">Zoom</Label>
                      <span className="text-[10px] font-mono font-bold text-primary">{(value.scale * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md border h-10">
                        <ZoomOut size={16} className="text-muted-foreground shrink-0" />
                        <Slider
                          min={0.5}
                          max={5}
                          step={0.1}
                          value={[value.scale]}
                          onValueChange={handleScaleChange}
                          className="flex-1"
                        />
                        <ZoomIn size={16} className="text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Position Controls</Label>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/10 rounded-xl border border-dashed">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-md bg-background hover:text-primary hover:border-primary" onClick={() => handlePan(0, -PAN_STEP)}>
                        <ArrowUp size={20} />
                    </Button>
                    <div className="flex gap-6">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-md bg-background hover:text-primary hover:border-primary" onClick={() => handlePan(-PAN_STEP, 0)}>
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="h-10 w-10 flex items-center justify-center text-primary">
                          <Move size={24} className="opacity-20" />
                        </div>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-md bg-background hover:text-primary hover:border-primary" onClick={() => handlePan(PAN_STEP, 0)}>
                            <ArrowRight size={20} />
                        </Button>
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-md bg-background hover:text-primary hover:border-primary" onClick={() => handlePan(0, PAN_STEP)}>
                        <ArrowDown size={20} />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-muted-foreground px-2">
                    <span>X: {value.x}px</span>
                    <span>Y: {value.y}px</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="p-4 border-t bg-muted/10 shrink-0">
          <Button className="w-full h-12 text-sm font-bold uppercase tracking-widest shadow-xl" onClick={onClose}>
              Finish Adjusting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};