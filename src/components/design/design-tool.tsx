
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
import { UploadCloud, XCircle, Save, Ruler, Shirt } from 'lucide-react';
import type { DesignDetails, BlouseDetails } from '@/contexts/order-workflow-context';

const styleOptions = [
  { id: 'a-line-dress', name: 'A-Line Dress' },
  { id: 'fitted-blouse', name: 'Fitted Blouse' },
  { id: 'wide-leg-trousers', name: 'Wide-Leg Trousers' },
  { id: 'pencil-skirt', name: 'Pencil Skirt' },
];

interface DesignToolProps {
  initialDesign?: DesignDetails | null;
  onSaveDesign: (design: DesignDetails) => void; // Renamed to onSaveDesign, more generic
  submitButtonText?: string;
}

export function DesignTool({ initialDesign, onSaveDesign, submitButtonText = "Save Design" }: DesignToolProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState('');
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<string[]>([]);
  const [blouseDetails, setBlouseDetails] = useState<Partial<BlouseDetails>>({});

  useEffect(() => {
    if (initialDesign) {
      setSelectedStyle(initialDesign.style || null);
      setCustomNotes(initialDesign.notes || '');
      setReferenceImagePreviews(initialDesign.referenceImages || []);
      setBlouseDetails(initialDesign.blouseDetails || {});
    } else {
      // Reset fields if initialDesign is null (e.g. new item)
      setSelectedStyle(null);
      setCustomNotes('');
      setReferenceImagePreviews([]);
      setBlouseDetails({});
    }
  }, [initialDesign]);
  
  const handleBlouseDetailChange = (
    field: keyof BlouseDetails,
    value: string
  ) => {
    const numericFields: (keyof BlouseDetails)[] = ['fl', 'sh', 'sl', 'fn', 'bn'];
    setBlouseDetails((prev) => ({
      ...prev,
      [field]: numericFields.includes(field) ? (value ? Number(value) : undefined) : value,
    }));
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
    const designDetails: DesignDetails = {
      style: selectedStyle,
      notes: customNotes,
      referenceImages: referenceImagePreviews,
      blouseDetails: selectedStyle === 'fitted-blouse' ? blouseDetails : undefined,
    };
    onSaveDesign(designDetails);
  };

  const isFormValid = !!selectedStyle;

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
        
        {selectedStyle === 'fitted-blouse' && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Ruler className="h-6 w-6 text-primary" /> Blouse Details</CardTitle>
                    <CardDescription>Provide specific details for the fitted blouse based on the order form.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="blouse-fl">FL (Full Length)</Label>
                            <Input id="blouse-fl" type="number" placeholder="e.g., 15" value={blouseDetails.fl || ''} onChange={(e) => handleBlouseDetailChange('fl', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="blouse-yoke">Yoke</Label>
                            <Input id="blouse-yoke" placeholder="Yoke details" value={blouseDetails.yoke || ''} onChange={(e) => handleBlouseDetailChange('yoke', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="blouse-sh">SH (Shoulder)</Label>
                            <Input id="blouse-sh" type="number" placeholder="e.g., 14.5" value={blouseDetails.sh || ''} onChange={(e) => handleBlouseDetailChange('sh', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="blouse-cut">Cut</Label>
                            <Input id="blouse-cut" placeholder="Cut details" value={blouseDetails.cut || ''} onChange={(e) => handleBlouseDetailChange('cut', e.target.value)} />
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="blouse-sl">SL (Sleeve Length)</Label>
                        <Input id="blouse-sl" type="number" placeholder="e.g., 10" value={blouseDetails.sl || ''} onChange={(e) => handleBlouseDetailChange('sl', e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="blouse-neck-type">Neck Type</Label>
                        <Input id="blouse-neck-type" placeholder="e.g., Round, V-Neck" value={blouseDetails.neckType || ''} onChange={(e) => handleBlouseDetailChange('neckType', e.target.value)} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="blouse-fn">FN (Front Neck)</Label>
                            <Input id="blouse-fn" type="number" placeholder="e.g., 7.5" value={blouseDetails.fn || ''} onChange={(e) => handleBlouseDetailChange('fn', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="blouse-bn">BN (Back Neck)</Label>
                            <Input id="blouse-bn" type="number" placeholder="e.g., 9" value={blouseDetails.bn || ''} onChange={(e) => handleBlouseDetailChange('bn', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="blouse-slit">Slit</Label>
                            <Input id="blouse-slit" placeholder="Slit details" value={blouseDetails.slit || ''} onChange={(e) => handleBlouseDetailChange('slit', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="blouse-extra">Extra</Label>
                            <Input id="blouse-extra" placeholder="Extra details" value={blouseDetails.extra || ''} onChange={(e) => handleBlouseDetailChange('extra', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

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
            <CardTitle className="text-xl">Current Item Design</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Style:</Label>
              <p className="font-semibold">{selectedStyle ? styleOptions.find(s=>s.id === selectedStyle)?.name : 'Not selected'}</p>
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
              disabled={!isFormValid}
            >
              <Save className="mr-2 h-4 w-4"/> {submitButtonText}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
