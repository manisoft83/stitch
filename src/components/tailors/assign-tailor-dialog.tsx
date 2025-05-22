
"use client";

import { useState, useEffect } from 'react';
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
import { Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Order, Tailor } from '@/app/tailors/page'; // Assuming types are exported from tailors/page.tsx

interface AssignTailorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: Order | null;
  tailors: Tailor[];
  onAssign: (orderId: string, tailorId: string, tailorName: string, dueDate: Date) => void;
}

export function AssignTailorDialog({
  isOpen,
  onOpenChange,
  order,
  tailors,
  onAssign,
}: AssignTailorDialogProps) {
  const [selectedTailorId, setSelectedTailorId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date()); // Default to today

  useEffect(() => {
    if (order) {
      // Reset when a new order is selected or dialog opens
      setSelectedTailorId(undefined);
      setDueDate(new Date());
    }
  }, [order, isOpen]);

  const handleSubmit = () => {
    if (order && selectedTailorId && dueDate) {
      const selectedTailor = tailors.find(t => t.id === selectedTailorId);
      if (selectedTailor) {
        onAssign(order.id, selectedTailorId, selectedTailor.name, dueDate);
        onOpenChange(false); // Close dialog on successful assignment
      }
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Order #{order.id}</DialogTitle>
          <DialogDescription>
            Assign "{order.item}" to a tailor and set a due date.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tailor" className="text-right">
              Tailor
            </Label>
            <Select value={selectedTailorId} onValueChange={setSelectedTailorId}>
              <SelectTrigger id="tailor" className="col-span-3">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right">
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
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
                />
              </PopoverContent>
            </Popover>
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
