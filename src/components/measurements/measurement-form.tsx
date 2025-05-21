"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const measurementFormSchema = z.object({
  name: z.string().min(2, {
    message: "Profile name must be at least 2 characters.",
  }).optional(),
  bust: z.coerce.number().positive({ message: "Bust size must be a positive number." }),
  waist: z.coerce.number().positive({ message: "Waist size must be a positive number." }),
  hips: z.coerce.number().positive({ message: "Hip size must be a positive number." }),
  height: z.coerce.number().positive({ message: "Height must be a positive number." }),
  // Optional: Add more specific measurements based on tailoring needs
  // shoulderWidth: z.coerce.number().positive().optional(),
  // sleeveLength: z.coerce.number().positive().optional(),
  // inseam: z.coerce.number().positive().optional(),
});

type MeasurementFormValues = z.infer<typeof measurementFormSchema>;

// Default values for the form
const defaultValues: Partial<MeasurementFormValues> = {
  // bust: 34,
  // waist: 28,
  // hips: 38,
  // height: 65,
};

export function MeasurementForm() {
  const { toast } = useToast();
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: MeasurementFormValues) {
    // TODO: Implement actual saving logic (e.g., API call, localStorage)
    console.log("Measurement data:", data);
    toast({
      title: "Measurements Saved!",
      description: `Profile ${data.name ? "'" + data.name + "'" : ""} measurements have been saved.`,
      variant: "default",
    });
    // form.reset(); // Optionally reset form
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Casual Fit" {...field} />
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
                <FormDescription>Measure around the fullest part of your bust.</FormDescription>
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
                <FormDescription>Measure around the narrowest part of your waistline.</FormDescription>
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
                <FormDescription>Measure around the fullest part of your hips and bottom.</FormDescription>
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
                <FormDescription>Your total height without shoes.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Example for additional measurements if uncommented in schema
        <FormField
          control={form.control}
          name="shoulderWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shoulder Width (inches)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 15" {...field} />
              </FormControl>
              <FormDescription>Measure from one shoulder point to the other across your back.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        <Button type="submit" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow">
          <Ruler className="mr-2 h-4 w-4" /> Save Measurements
        </Button>
      </form>
    </Form>
  );
}
