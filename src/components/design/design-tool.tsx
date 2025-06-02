
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { CheckSquare, Palette, Scissors, Shirt, UploadCloud, XCircle } from 'lucide-react';
import type { DesignDetails } from '@/contexts/order-workflow-context';

const fabricOptions = [
  { id: 'cotton', name: 'Cotton', image: 'https://placehold.co/100x100.png', dataAiHint: 'cotton fabric' },
  { id: 'silk', name: 'Silk', image: 'https://placehold.co/100x100.png', dataAiHint: 'silk fabric' },
  { id: 'linen', name: 'Linen', image: 'https://placehold.co/100x100.png', dataAiHint: 'linen fabric' },
  { id: 'wool', name: 'Wool', image: 'https://placehold.co/100x100.png', dataAiHint: 'wool fabric' },
];

const colorOptions = [
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'blue', name: 'Blue', hex: '#0000FF' },
  { id: 'green', name: 'Green', hex: '#00FF00' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
];

const styleOptions = [
  { id: 'a-line-dress', name: 'A-Line Dress' },
  { id: 'fitted-blouse', name: 'Fitted Blouse' },
  { id: 'wide-leg-trousers', name: 'Wide-Leg Trousers' },
  { id: 'pencil-skirt', name: 'Pencil Skirt' },
];

interface DesignToolProps {
  initialDesign?: DesignDetails | null;
  onSaveDesign?: (design: DesignDetails) => void;
}

export function DesignTool({ initialDesign, onSaveDesign }: DesignToolProps) {
  const [selectedFabric, setSelectedFabric] = useState<string | null>(initialDesign?.fabric || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(initialDesign?.color || null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(initialDesign?.style || null);
  const [customNotes, setCustomNotes] = useState(initialDesign?.notes || '');
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>(initialDesign?.referenceImages || []);

  useEffect(() => {
    if (initialDesign) {
      setSelectedFabric(initialDesign.fabric || null);
      setSelectedColor(initialDesign.color || null);
      setSelectedStyle(initialDesign.style || null);
      setCustomNotes(initialDesign.notes || '');
      setReferenceImagePreviews(initialDesign.referenceImages || []);
    }
  }, [initialDesign]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: string[] = [...referenceImagePreviews];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPreviews.push(reader.result as string);
            // Ensure not to exceed a reasonable limit, e.g., 5 images
            if (newPreviews.length <= 5) {
              setReferenceImagePreviews([...newPreviews]); // Create new array instance
            } else {
              alert("You can upload a maximum of 5 images.");
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
    const designDetails: DesignDetails = {
      fabric: selectedFabric,
      color: selectedColor,
      style: selectedStyle,
      notes: customNotes,
      referenceImages: referenceImagePreviews,
    };
    if (onSaveDesign) {
      onSaveDesign(designDetails);
    } else {
      console.log(designDetails);
      alert('Design submitted (mock)! Check console for details.');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shirt className="h-6 w-6 text-primary" /> Select Garment Style</CardTitle>
            <CardDescription>Choose the base style for your custom piece.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedStyle} value={selectedStyle || undefined}>
              <SelectTrigger id="style-select">
                <SelectValue placeholder="Choose a style..." />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map(style => (
                  <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Scissors className="h-6 w-6 text-primary" /> Fabric Selection</CardTitle>
            <CardDescription>Pick the perfect fabric for your design.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedFabric} value={selectedFabric || undefined}>
              <SelectTrigger id="fabric-select">
                <SelectValue placeholder="Choose a fabric..." />
              </SelectTrigger>
              <SelectContent>
                {fabricOptions.map(fabric => (
                  <SelectItem key={fabric.id} value={fabric.id}>{fabric.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFabric && (
              <div className="mt-4 p-4 border rounded-md flex items-center gap-4 bg-muted/50">
                <Image
                  src={fabricOptions.find(f => f.id === selectedFabric)?.image || 'https://placehold.co/100x100.png'}
                  alt={fabricOptions.find(f => f.id === selectedFabric)?.name || 'Fabric'}
                  width={80} height={80}
                  className="rounded-md"
                  data-ai-hint={fabricOptions.find(f => f.id === selectedFabric)?.dataAiHint || "fabric sample"}
                />
                <p>You selected: <strong>{fabricOptions.find(f => f.id === selectedFabric)?.name}</strong></p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-6 w-6 text-primary" /> Color Choice</CardTitle>
            <CardDescription>Select your desired color.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map(color => (
                <Button
                  key={color.id}
                  variant={selectedColor === color.id ? "default" : "outline"}
                  onClick={() => setSelectedColor(color.id)}
                  className="h-12 w-12 p-0 border-2"
                  style={{ backgroundColor: selectedColor === color.id ? color.hex : 'transparent' }}
                  aria-label={color.name}
                >
                  <span
                    className="h-8 w-8 rounded-sm block"
                    style={{ backgroundColor: color.hex }}
                  ></span>
                  {selectedColor === color.id && <CheckSquare className="absolute h-5 w-5 text-primary-foreground" />}
                </Button>
              ))}
            </div>
            {selectedColor && (
              <p className="mt-4">Selected color: <span className="font-semibold" style={{color: colorOptions.find(c=>c.id === selectedColor)?.hex}}>{colorOptions.find(c => c.id === selectedColor)?.name}</span></p>
            )}
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
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="sticky top-20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Your Design Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Style:</Label>
              <p className="font-semibold">{selectedStyle ? styleOptions.find(s=>s.id === selectedStyle)?.name : 'Not selected'}</p>
            </div>
            <Separator />
            <div>
              <Label>Fabric:</Label>
              <p className="font-semibold">{selectedFabric ? fabricOptions.find(f => f.id === selectedFabric)?.name : 'Not selected'}</p>
            </div>
            <Separator />
            <div>
              <Label>Color:</Label>
              <p className="font-semibold" style={{color: selectedColor ? colorOptions.find(c=>c.id === selectedColor)?.hex : 'inherit'}}>
                {selectedColor ? colorOptions.find(c => c.id === selectedColor)?.name : 'Not selected'}
              </p>
            </div>
            {referenceImagePreviews.length > 0 && (
                <>
                <Separator />
                <div>
                    <Label>Reference Images:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                    {referenceImagePreviews.map((src, index) => (
                        <Image 
                            key={index}
                            src={src} 
                            alt={`Ref ${index + 1}`} 
                            width={40} 
                            height={40} 
                            className="rounded border object-cover"
                            data-ai-hint="thumbnail reference"
                        />
                    ))}
                    </div>
                </div>
                </>
            )}
            {customNotes && (
              <>
                <Separator />
                <div>
                  <Label>Notes:</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customNotes}</p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full shadow-md hover:shadow-lg transition-shadow"
              onClick={handleSubmitDesign}
              disabled={!selectedFabric || !selectedColor || !selectedStyle}
            >
              {onSaveDesign ? "Save Design & Proceed to Summary" : "Add to Order & Proceed"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
