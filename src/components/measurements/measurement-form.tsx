
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Ruler, Save } from "lucide-react";
import type { GarmentStyle } from "@/lib/mockData";
import { allPossibleMeasurements } from "@/lib/mockData";

interface MeasurementFormProps {
  style: GarmentStyle;
  initialValues?: { [key: string]: string | number | undefined };
  onSave: (data: { [key: string]: string | number | undefined }) => void;
}

export function MeasurementForm({ style, initialValues, onSave }: MeasurementFormProps) {
  const form = useForm({
    defaultValues: initialValues || {},
  });

  const { formState: { isDirty, isSubmitting }, reset } = form;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  function onSubmit(data: { [key: string]: string | number | undefined }) {
    onSave(data);
  }

  const measurementFieldsForStyle = useMemo(() => {
    return allPossibleMeasurements.filter(m => style.requiredMeasurements.includes(m.id));
  }, [style]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {measurementFieldsForStyle.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {measurementFieldsForStyle.map(field => (
              <FormField
                key={field.id}
                control={form.control}
                name={field.id}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={field.label} {...formField} value={formField.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        ) : (
            <p className="text-sm text-muted-foreground">This style has no specific measurements configured.</p>
        )}
        
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={!isDirty || isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
