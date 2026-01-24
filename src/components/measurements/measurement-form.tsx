
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
import { Ruler, Ban } from "lucide-react";
import { measurementFormSchema, type MeasurementFormValues } from "@/lib/schemas";
import { useEffect } from "react";

interface MeasurementFormProps {
  initialValues?: Partial<MeasurementFormValues>;
  onSave?: (data: MeasurementFormValues) => void;
}

export function MeasurementForm({ initialValues, onSave }: MeasurementFormProps) {
  const { toast } = useToast();
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: initialValues || {},
    mode: "onChange",
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  function onSubmit(data: MeasurementFormValues) {
    if (onSave) {
      onSave(data);
    } else {
      // Default behavior if not used in workflow
      console.log("Measurement data:", data);
      toast({
        title: "Measurements Saved!",
        description: `Your measurements have been saved.`,
        variant: "default",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="text-center p-4 border rounded-md bg-muted/50">
            <Ban className="mx-auto h-10 w-10 text-muted-foreground"/>
            <p className="mt-2 text-sm text-muted-foreground">
                The measurement fields have been removed. This form is no longer active.
            </p>
        </div>
        
        <Button type="submit" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow">
          <Ruler className="mr-2 h-4 w-4" />
          {onSave ? "Save & Continue" : "Save Measurements"}
        </Button>
      </form>
    </Form>
  );
}
