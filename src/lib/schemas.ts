import { z } from 'zod';

export const measurementFormSchema = z.object({
  // All fields removed as per user request
});

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;


export const recommendationFormSchema = z.object({
  // Measurement fields removed as per user request
  preferredColors: z.string().min(1, "Please list some preferred colors."),
  preferredStyles: z.string().min(1, "Please list some preferred styles (e.g., casual, formal)."),
});

export type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;
