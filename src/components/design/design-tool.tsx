
"use client";

import { useState, useEffect, type ChangeEvent, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud, XCircle, Save, Ruler, Shirt, Loader2 } from 'lucide-react';
import type { DesignDetails, GarmentStyle } from '@/contexts/order-workflow-context';
import { useOrderWorkflow } from '@/contexts/order-workflow-context';
import { allPossibleMeasurements } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';


interface DesignToolProps {
  initialDesign?: DesignDetails | null;
  onSaveDesign: (design: DesignDetails) => void;
  submitButtonText?: string;
  availableStyles: GarmentStyle[];
}

export function DesignTool({ initialDesign, onSaveDesign, submitButtonText = "Save Design", availableStyles }: DesignToolProps) {
  const { currentCustomer } = useOrderWorkflow();
  const { toast } = useToast();

  const [styleId, setStyleId] = useState<string>('');
  const [customNotes, setCustomNotes] = useState('');
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<{ [key: string]: string | number | undefined }>({});
  const [autofilledStyleId, setAutofilledStyleId] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);


  useEffect(() => {
    if (initialDesign) {
      setStyleId(initialDesign.styleId || '');
      setCustomNotes(initialDesign.notes || '');
      setReferenceImagePreviews(initialDesign.referenceImages || []);
      setMeasurements(initialDesign.measurements || {});
      setAutofilledStyleId(null);
    } else {
      setStyleId('');
      setCustomNotes('');
      setReferenceImagePreviews([]);
      setMeasurements({});
      setAutofilledStyleId(null);
    }
  }, [initialDesign]);

  const selectedStyle = useMemo(() => {
    return availableStyles.find(s => s.id === styleId);
  }, [styleId, availableStyles]);

  const handleStyleChange = (newStyleId: string) => {
    setStyleId(newStyleId);
    setAutofilledStyleId(null); 
    
    const savedMeasurements = currentCustomer?.savedMeasurements?.[newStyleId];
    if (savedMeasurements) {
        setMeasurements(savedMeasurements);
        setAutofilledStyleId(newStyleId); 
        toast({
            title: "Measurements Autofilled",
            description: `Saved measurements for this style have been applied for ${currentCustomer.name}.`
        });
    } else {
        setMeasurements({});
    }
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };
  
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const newPreviews: string[] = [...referenceImagePreviews];
    
    const compressionOptions = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    try {
      for (let i = 0; i < files.length; i++) {
        if (newPreviews.length >= 5) break;
        
        const file = files[i];
        const compressedFile = await imageCompression(file, compressionOptions);
        const reader = new FileReader();
        
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            if (reader.result) {
              newPreviews.push(reader.result as string);
            }
            resolve();
          };
          reader.readAsDataURL(compressedFile);
        });
      }
      
      setReferenceImagePreviews(newPreviews.slice(0, 5));
      if (files.length + referenceImagePreviews.length > 5) {
        toast({
          title: "Limit Reached",
          description: "Maximum of 5 images allowed. Extra images were ignored.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Compression failed:", error);
      toast({
        title: "Error",
        description: "Failed to compress images. Please try smaller files.",
        variant: "destructive"
      });
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be selected again if removed
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setReferenceImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDesign = () => {
    if (!selectedStyle) return;
    const designDetails: DesignDetails = {
      styleId: selectedStyle.id,
      styleName: selectedStyle.name,
      notes: customNotes,
      referenceImages: referenceImagePreviews,
      measurements,
    };
    onSaveDesign(designDetails);
  };

  const isFormValid = !!selectedStyle && !isCompressing;
  const measurementFields = useMemo(() => {
    if (!selectedStyle) return [];
    return allPossibleMeasurements.filter(m => selectedStyle.requiredMeasurements.includes(m.id));
  }, [selectedStyle]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shirt className="h-6 w-6 text-primary" /> Select Garment Style</CardTitle>
          <CardDescription>Choose the base style for your custom piece. Styles with saved measurements for this customer are marked.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleStyleChange} value={styleId}>
            <SelectTrigger id="style-select">
              <SelectValue placeholder="Choose a style..." />
            </SelectTrigger>
            <SelectContent>
              {availableStyles.map(style => {
                const hasSavedMeasurements = !!currentCustomer?.savedMeasurements?.[style.id];
                return (
                  <SelectItem key={style.id} value={style.id}>
                    <div className="flex justify-between items-center w-full">
                        <span>{style.name}</span>
                        {hasSavedMeasurements && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 ml-4">
                                <Ruler className="h-3 w-3"/> Saved
                            </span>
                        )}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {autofilledStyleId === styleId && styleId !== '' && (
            <p className="text-sm text-green-700 dark:text-green-400 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-700/50">
                Latest saved measurements for {currentCustomer?.name} have been applied. You can update them below if needed.
            </p>
          )}
        </CardContent>
      </Card>
      
      {selectedStyle && measurementFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Ruler className="h-6 w-6 text-primary" /> {selectedStyle.name} Measurements</CardTitle>
            <CardDescription>Provide the specific measurements required for this garment style.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {measurementFields.map(field => (
              <div key={field.id}>
                <Label htmlFor={`measurement-${field.id}`}>{field.label}</Label>
                <Input
                  id={`measurement-${field.id}`}
                  placeholder={field.label}
                  value={measurements[field.id] || ''}
                  onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Custom Notes</CardTitle>
          <CardDescription>Add any specific instructions or details for your design.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., I'd like a slightly longer hem, specific button types..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UploadCloud className="h-6 w-6 text-primary" /> Reference Images</CardTitle>
          <CardDescription>Upload up to 5 images for design reference (e.g., inspiration, specific details). Images will be optimized automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input 
              id="image-upload" 
              type="file" 
              accept="image/*" 
              multiple
              onChange={handleImageChange} 
              className="text-sm file:mr-2 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
              disabled={referenceImagePreviews.length >= 5 || isCompressing}
            />
            {isCompressing && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizing images...
              </div>
            )}
          </div>

          {referenceImagePreviews.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Image Previews:</Label>
              <div className="flex flex-wrap gap-2">
                {referenceImagePreviews.map((src, index) => (
                  <div key={index} className="relative group">
                    <Image 
                        src={src} 
                        alt={`Reference ${index + 1}`} 
                        width={80} 
                        height={80} 
                        unoptimized
                        className="rounded-md border object-cover" 
                        data-ai-hint="design clothing reference"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                      aria-label="Remove image"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {referenceImagePreviews.length >= 5 && (
              <p className="text-xs text-destructive mt-2">Maximum of 5 images reached.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="sticky top-20 shadow-lg bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-xl">Current Item Design</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="font-semibold">{selectedStyle?.name || 'No style selected'}</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full shadow-md hover:shadow-lg transition-shadow"
              onClick={handleSubmitDesign}
              disabled={!isFormValid}
            >
              <Save className="mr-2 h-4 w-4"/> {isCompressing ? "Processing Images..." : submitButtonText}
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}
