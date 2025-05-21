// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Generates personalized style recommendations based on user measurements and preferences.
 *
 * - generateStyleRecommendations - A function that generates style recommendations.
 * - StyleRecommendationsInput - The input type for the generateStyleRecommendations function.
 * - StyleRecommendationsOutput - The return type for the generateStyleRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleRecommendationsInputSchema = z.object({
  bustSize: z.number().describe('Bust size in inches.'),
  waistSize: z.number().describe('Waist size in inches.'),
  hipSize: z.number().describe('Hip size in inches.'),
  height: z.number().describe('Height in inches.'),
  preferredColors: z.string().describe('Comma-separated list of preferred colors.'),
  preferredStyles: z.string().describe('Comma-separated list of preferred clothing styles (e.g., casual, formal, bohemian).'),
});

export type StyleRecommendationsInput = z.infer<typeof StyleRecommendationsInputSchema>;

const StyleRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('An array of style recommendations based on the input measurements and preferences.'),
  reasoning: z.string().describe('The reasoning behind the recommendations.'),
});

export type StyleRecommendationsOutput = z.infer<typeof StyleRecommendationsOutputSchema>;

export async function generateStyleRecommendations(input: StyleRecommendationsInput): Promise<StyleRecommendationsOutput> {
  return generateStyleRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleRecommendationsPrompt',
  input: {schema: StyleRecommendationsInputSchema},
  output: {schema: StyleRecommendationsOutputSchema},
  prompt: `You are a personal stylist who provides style recommendations based on body measurements and design preferences.

  Provide style recommendations tailored to the following measurements and preferences:

  Bust Size: {{bustSize}} inches
  Waist Size: {{waistSize}} inches
  Hip Size: {{hipSize}} inches
  Height: {{height}} inches
  Preferred Colors: {{preferredColors}}
  Preferred Styles: {{preferredStyles}}

  Consider body shape, proportions, and preferred styles to generate a list of clothing recommendations. Briefly explain your reasoning behind each recommendation.
  Format recommendations as a numbered list.`,
});

const generateStyleRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateStyleRecommendationsFlow',
    inputSchema: StyleRecommendationsInputSchema,
    outputSchema: StyleRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
