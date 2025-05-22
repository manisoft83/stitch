
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Tailor } from '@/app/tailors/page'; // Assuming types are exported

const tailorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits.").regex(/^\+?[0-9\s-()]*$/, "Invalid mobile number format."),
  expertise: z.string().min(1, "Please list at least one expertise (comma-separated)."),
});

export type TailorFormData = z.infer<typeof tailorFormSchema>;

interface TailorFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tailorToEdit: Tailor | null;
  onSave: (data: TailorFormData) => void;
}

export function TailorFormDialog({
  isOpen,
  onOpenChange,
  tailorToEdit,
  onSave,
}: TailorFormDialogProps) {
  const form = useForm<TailorFormData>({
    resolver: zodResolver(tailorFormSchema),
    defaultValues: {
      name: '',
      mobile: '',
      expertise: '',
    },
  });

  useEffect(() => {
    if (tailorToEdit) {
      form.reset({
        name: tailorToEdit.name,
        mobile: tailorToEdit.mobile,
        expertise: tailorToEdit.expertise.join(', '),
      });
    } else {
      form.reset({
        name: '',
        mobile: '',
        expertise: '',
      });
    }
  }, [tailorToEdit, form, isOpen]); // re-populate form when dialog opens or tailorToEdit changes

  const onSubmit = (data: TailorFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tailorToEdit ? 'Edit Tailor' : 'Add New Tailor'}</DialogTitle>
          <DialogDescription>
            {tailorToEdit ? 'Update the details for this tailor.' : 'Enter the details for the new tailor.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tailor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expertise</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Dresses, Suits, Alterations"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of skills.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    