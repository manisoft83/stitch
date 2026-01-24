
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { StyleRecommendationsInput, StyleRecommendationsOutput } from "@/ai/flows/generate-style-recommendations";
import { generateStyleRecommendationsAction } from "@/app/recommendations/actions"; // Server action
import { Wand2 } from "lucide-react";

const recommendationFormSchema = z.object({
  preferredColors: z.string().min(1, "Please list some preferred colors."),
  preferredStyles: z.string().min(1, "Please list some preferred styles (e.g., casual, formal)."),
});

type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;

interface RecommendationFormProps {
  onRecommendationsFetched: (data: StyleRecommendationsOutput | null, error?: string) => void;
  setIsLoading: (loading: boolean) => void;
  currentData: StyleRecommendationsOutput | null;
}

export function RecommendationForm({ onRecommendationsFetched, setIsLoading, currentData }: RecommendationFormProps) {
  const { toast } = useToast();
  
  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      preferredColors: "", // e.g. "blue, green, black"
      preferredStyles: "", // e.g. "casual, bohemian, minimalist"
    },
    mode: "onChange",
  });

  async function onSubmit(data: RecommendationFormValues) {
    setIsLoading(true);
    onRecommendationsFetched(null); // Clear previous results

    const fullData = { ...data, bustSize: 0, waistSize: 0, hipSize: 0, height: 0 };

    try {
      const result = await generateStyleRecommendationsAction(fullData as StyleRecommendationsInput);
      onRecommendationsFetched(result);
      toast({
        title: "Style Profile Ready!",
        description: "Your personalized recommendations are here.",
      });
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      const errorMessage = "Failed to generate recommendations. The feature is disabled due to removed measurement fields.";
      onRecommendationsFetched(null, errorMessage);
      toast({
        title: "Uh Oh! Something went wrong.",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Tell us about your style preferences so our AI can tailor recommendations for you.
          Measurement inputs have been disabled.
        </p>
        <FormField
          control={form.control}
          name="preferredColors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Colors</FormLabel>
              <FormControl>
                <Input placeholder="e.g., navy, emerald green, blush pink" {...field} />
              </FormControl>
              <FormDescription>
                List colors you love to wear, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferredStyles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Styles</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., classic, romantic, streetwear, professional" {...field} rows={3}/>
              </FormControl>
              <FormDescription>
                Describe your favorite clothing styles or aesthetics, separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full md:w-auto shadow-md hover:shadow-lg transition-shadow" disabled={form.formState.isSubmitting || true}>
          <Wand2 className="mr-2 h-4 w-4" />
          {currentData ? "Update Recommendations" : "Get Style Recommendations"}
        </Button>
      </form>
    </Form>
  );
}
