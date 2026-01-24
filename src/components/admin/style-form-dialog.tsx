
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from '@/components/ui/scroll-area';
import { allPossibleMeasurements, type GarmentStyle } from '@/lib/mockData';

const styleFormSchema = z.object({
  name: z.string().min(2, "Style name must be at least 2 characters."),
  requiredMeasurements: z.array(z.string()),
});

export type StyleFormData = z.infer<typeof styleFormSchema>;

interface StyleFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  styleToEdit: GarmentStyle | null;
  onSave: (data: StyleFormData) => void;
}

export function StyleFormDialog({ isOpen, onOpenChange, styleToEdit, onSave }: StyleFormDialogProps) {
  const form = useForm<StyleFormData>({
    resolver: zodResolver(styleFormSchema),
    defaultValues: {
      name: '',
      requiredMeasurements: [],
    },
  });

  useEffect(() => {
    if (styleToEdit) {
      form.reset({
        name: styleToEdit.name,
        requiredMeasurements: styleToEdit.requiredMeasurements || [],
      });
    } else {
      form.reset({
        name: '',
        requiredMeasurements: [],
      });
    }
  }, [styleToEdit, form, isOpen]);

  const onSubmit = (data: StyleFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{styleToEdit ? 'Edit Garment Style' : 'Add New Garment Style'}</DialogTitle>
          <DialogDescription>
            Define the style name and select which measurements are required for it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Style Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Fitted Blouse, A-Line Kurta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiredMeasurements"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Required Measurements</FormLabel>
                    <p className="text-sm text-muted-foreground">Select the measurements needed for this style.</p>
                  </div>
                  <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2">
                      {allPossibleMeasurements.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="requiredMeasurements"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(field.value?.filter((value) => value !== item.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Style</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
