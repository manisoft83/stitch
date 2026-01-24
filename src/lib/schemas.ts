import { z } from 'zod';

export const measurementFormSchema = z.object({
  bust: z.coerce.number().positive({ message: "Bust size must be a positive number." }),
  waist: z.coerce.number().positive({ message: "Waist size must be a positive number." }),
  hips: z.coerce.number().positive({ message: "Hip size must be a positive number." }),
  height: z.coerce.number().positive({ message: "Height must be a positive number." }),
  // Optional: Add more specific measurements based on tailoring needs
  // shoulderWidth: z.coerce.number().positive().optional(),
  // sleeveLength: z.coerce.number().positive().optional(),
  // inseam: z.coerce.number().positive().optional(),
});

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;


export const recommendationFormSchema = z.object({
  bustSize: z.coerce.number().positive("Bust size must be positive (inches)."),
  waistSize: z.coerce.number().positive("Waist size must be positive (inches)."),
  hipSize: z.coerce.number().positive("Hip size must be positive (inches)."), // Changed from 'hips' to match AI schema
  height: z.coerce.number().positive("Height must be positive (inches)."),
  preferredColors: z.string().min(1, "Please list some preferred colors."),
  preferredStyles: z.string().min(1, "Please list some preferred styles (e.g., casual, formal)."),
});

export type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;
