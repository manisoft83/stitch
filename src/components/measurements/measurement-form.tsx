
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Ruler } from "lucide-react";
import { measurementFormSchema, type MeasurementFormValues } from "@/lib/schemas";
import { useEffect } from "react";


interface MeasurementFormProps {
  initialValues?: Partial<MeasurementFormValues & { name?: string }>; // name is profileName
  onSave?: (data: MeasurementFormValues & { name?: string }) => void;
}

export function MeasurementForm({ initialValues, onSave }: MeasurementFormProps) {
  const { toast } = useToast();
  const form = useForm<MeasurementFormValues & { name?: string }>({ // Allow name (profileName)
    resolver: zodResolver(measurementFormSchema),
    defaultValues: initialValues || {},
    mode: "onChange",
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name || '', // profileName maps to name in form
        bust: initialValues.bust,
        waist: initialValues.waist,
        hips: initialValues.hips,
        height: initialValues.height,
      });
    }
  }, [initialValues, form]);

  function onSubmit(data: MeasurementFormValues & { name?: string }) {
    const submittedData = {
        ...data,
        name: data.name || undefined // Ensure 'name' is undefined if empty, not empty string
    };

    if (onSave) {
      onSave(submittedData);
    } else {
      // Default behavior if not used in workflow
      console.log("Measurement data:", submittedData);
      toast({
        title: "Measurements Saved!",
        description: `Profile ${submittedData.name ? "'" + submittedData.name + "'" : ""} measurements have been saved.`,
        variant: "default",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name" // This is the 'profileName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Casual Fit" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                Give this measurement set a name for easy recall.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bust"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bust (inches)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 36" {...field} />
                </FormControl>
                <FormDescription>
                  Measure around the fullest part of your bust, keeping the tape level.
                  <br />Tip: Wear a non-padded bra for accuracy.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="waist"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waist (inches)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 28" {...field} />
                </FormControl>
                <FormDescription>
                  Measure around the narrowest part of your natural waistline.
                  <br />Tip: This is usually an inch or two above your belly button.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="hips"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hips (inches)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 40" {...field} />
                </FormControl>
                <FormDescription>
                  Measure around the fullest part of your hips and bottom, feet together.
                  <br />Tip: Ensure the tape is parallel to the floor.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (inches)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 65" {...field} />
                </FormControl>
                <FormDescription>Your total height without shoes. Stand straight.
                <br />Tip: Stand against a wall for best results.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow">
          <Ruler className="mr-2 h-4 w-4" />
          {onSave ? "Save & Continue" : "Save Measurements"}
        </Button>
      </form>
    </Form>
  );
}
