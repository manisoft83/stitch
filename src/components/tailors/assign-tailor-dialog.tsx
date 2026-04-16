
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image'; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Calendar as CalendarIcon, CheckCircle, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns"; 
import { cn } from "@/lib/utils";
import type { Tailor, Order } from '@/lib/mockData'; 
import imageCompression from 'browser-image-compression';
import { useToast } from '@/hooks/use-toast';

interface AssignTailorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: Order | null;
  tailors: Tailor[];
  onAssign: (
    orderId: string, 
    tailorId: string, 
    tailorName: string, 
    dueDate: Date,
    instructions?: string,
    imageDataUrl?: string
  ) => void;
}

export function AssignTailorDialog({
  isOpen,
  onOpenChange,
  order,
  tailors,
  onAssign,
}: AssignTailorDialogProps) {
  const { toast } = useToast();
  const [selectedTailorId, setSelectedTailorId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 5)); 
  const [instructions, setInstructions] = useState<string>("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      setSelectedTailorId(undefined);
      setDueDate(addDays(new Date(), 5)); 
      setInstructions("");
      setImagePreviewUrl(null);
      setIsCompressing(false);
    }
  }, [order, isOpen]);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreviewUrl(null);
      return;
    }

    setIsCompressing(true);
    const compressionOptions = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, compressionOptions);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
      toast({
        title: "Compression Error",
        description: "Could not optimize image. Try a smaller file.",
        variant: "destructive"
      });
      setIsCompressing(false);
    }
  };

  const handleSubmit = () => {
    if (order && selectedTailorId && dueDate) {
      const selectedTailor = tailors.find(t => t.id === selectedTailorId);
      if (selectedTailor) {
        onAssign(
            order.id, 
            selectedTailorId, 
            selectedTailor.name, 
            dueDate,
            instructions,
            imagePreviewUrl || undefined
        );
        onOpenChange(false); 
      }
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Order #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            Assign "{order.items.join(', ')}" to a tailor, set due date, and add instructions/image.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tailor">Tailor</Label>
            <Select value={selectedTailorId} onValueChange={setSelectedTailorId}>
              <SelectTrigger id="tailor" className="w-full">
                <SelectValue placeholder="Select a tailor" />
              </SelectTrigger>
              <SelectContent>
                {tailors.filter(t => t.availability === "Available").map((tailor) => (
                  <SelectItem key={tailor.id} value={tailor.id}>
                    {tailor.name} ({tailor.expertise.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="due-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} 
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Assignment Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Pay special attention to the hemline, use specific thread color..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image-upload-assign">Reference Image (Optional)</Label>
            <Input 
              id="image-upload-assign" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              disabled={isCompressing}
              className="text-sm file:mr-2 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
            {isCompressing && (
              <div className="flex items-center gap-2 text-xs text-primary mt-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Optimizing image...
              </div>
            )}
            {imagePreviewUrl && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">Image Preview:</Label>
                <Image 
                    src={imagePreviewUrl} 
                    alt="Reference preview" 
                    width={100} 
                    height={100} 
                    unoptimized
                    className="mt-1 rounded-md border object-cover" 
                    data-ai-hint="design reference"
                />
              </div>
            )}
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedTailorId || !dueDate || isCompressing}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> {isCompressing ? "Processing..." : "Assign Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
