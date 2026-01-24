
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image'; // For image preview
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
import { Input } from "@/components/ui/input"; // For file input styling
import { Textarea } from "@/components/ui/textarea"; // For instructions
import { Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { format, addDays } from "date-fns"; // Added addDays
import { cn } from "@/lib/utils";
import type { Tailor, Order } from '@/lib/mockData'; 

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
  const [selectedTailorId, setSelectedTailorId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 5)); 
  const [instructions, setInstructions] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (order && isOpen) {
      setSelectedTailorId(undefined);
      setDueDate(addDays(new Date(), 5)); // Default to 5 days from now
      setInstructions("");
      setSelectedImage(null);
      setImagePreviewUrl(null);
    } else if (!isOpen) {
      // Optionally clear fields when dialog is closed if not submitted
      // This part can be adjusted based on desired behavior if dialog is cancelled
      setSelectedTailorId(undefined);
      setDueDate(addDays(new Date(), 5)); 
      setInstructions("");
      setSelectedImage(null);
      setImagePreviewUrl(null);
    }
  }, [order, isOpen]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreviewUrl(null);
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
            imagePreviewUrl || undefined // Pass Data URL
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
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
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
            <Label htmlFor="image-upload-assign">Reference Image (Optional)</Label> {/* Changed ID to avoid conflict */}
            <Input 
              id="image-upload-assign" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="text-sm file:mr-2 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
            {imagePreviewUrl && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">Image Preview:</Label>
                <Image 
                    src={imagePreviewUrl} 
                    alt="Reference preview" 
                    width={100} 
                    height={100} 
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
            disabled={!selectedTailorId || !dueDate}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Assign Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
