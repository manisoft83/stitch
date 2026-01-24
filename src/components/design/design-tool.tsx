
"use client";

import { useState, useEffect, type ChangeEvent, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud, XCircle, Save, Ruler, Shirt } from 'lucide-react';
import type { DesignDetails, GarmentStyle } from '@/contexts/order-workflow-context';
import { allPossibleMeasurements } from '@/lib/mockData';

interface DesignToolProps {
  initialDesign?: DesignDetails | null;
  onSaveDesign: (design: DesignDetails) => void;
  submitButtonText?: string;
  availableStyles: GarmentStyle[];
}

export function DesignTool({ initialDesign, onSaveDesign, submitButtonText = "Save Design", availableStyles }: DesignToolProps) {
  const [styleId, setStyleId] = useState<string>('');
  const [customNotes, setCustomNotes] = useState('');
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<{ [key: string]: string | number | undefined }>({});

  useEffect(() => {
    if (initialDesign) {
      setStyleId(initialDesign.styleId || '');
      setCustomNotes(initialDesign.notes || '');
      setReferenceImagePreviews(initialDesign.referenceImages || []);
      setMeasurements(initialDesign.measurements || {});
    } else {
      // Reset all fields for a new design
      setStyleId('');
      setCustomNotes('');
      setReferenceImagePreviews([]);
      setMeasurements({});
    }
  }, [initialDesign]);

  const selectedStyle = useMemo(() => {
    return availableStyles.find(s => s.id === styleId);
  }, [styleId, availableStyles]);

  const handleStyleChange = (newStyleId: string) => {
    setStyleId(newStyleId);
    // Reset measurements when style changes to avoid carrying over irrelevant data
    setMeasurements({});
  };

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };
  
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: string[] = [...referenceImagePreviews];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPreviews.push(reader.result as string);
            if (newPreviews.length <= 5) {
              setReferenceImagePreviews([...newPreviews]); 
            } else {
              alert("You can upload a maximum of 5 images.");
              setReferenceImagePreviews(newPreviews.slice(0,5)); // Truncate to 5
            }
          }
        };
        reader.readAsDataURL(file);
      });
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

  const isFormValid = !!selectedStyle;
  const measurementFields = useMemo(() => {
    if (!selectedStyle) return [];
    return allPossibleMeasurements.filter(m => selectedStyle.requiredMeasurements.includes(m.id));
  }, [selectedStyle]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shirt className="h-6 w-6 text-primary" /> Select Garment Style</CardTitle>
          <CardDescription>Choose the base style for your custom piece. This will determine which measurements are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleStyleChange} value={styleId}>
            <SelectTrigger id="style-select">
              <SelectValue placeholder="Choose a style..." />
            </SelectTrigger>
            <SelectContent>
              {availableStyles.map(style => (
                <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <CardDescription>Upload up to 5 images for design reference (e.g., inspiration, specific details).</CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            id="image-upload" 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleImageChange} 
            className="text-sm file:mr-2 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
            disabled={referenceImagePreviews.length >= 5}
          />
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
              <Save className="mr-2 h-4 w-4"/> {submitButtonText}
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}
