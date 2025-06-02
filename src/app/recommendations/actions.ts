
"use server";

import { generateStyleRecommendations, type StyleRecommendationsInput, type StyleRecommendationsOutput } from "@/ai/flows/generate-style-recommendations";
import { z } from "zod";

const StyleRecommendationsInputSchema = z.object({
  bustSize: z.number(),
  waistSize: z.number(),
  hipSize: z.number(),
  height: z.number(),
  preferredColors: z.string(),
  preferredStyles: z.string(),
});


export async function generateStyleRecommendationsAction(
  input: StyleRecommendationsInput
): Promise<StyleRecommendationsOutput> {
  // Validate input again on the server-side for security, though client-side validation exists.
  const validatedInput = StyleRecommendationsInputSchema.safeParse(input);

  if (!validatedInput.success) {
    console.error("Invalid input for recommendations:", validatedInput.error.flatten());
    // Corrected error message construction
    const fieldErrors = validatedInput.error.flatten().fieldErrors;
    const formErrors = validatedInput.error.flatten().formErrors;
    let errorMessages = formErrors.join(', ');
    if (Object.keys(fieldErrors).length > 0) {
        errorMessages += (errorMessages ? '; ' : '') + JSON.stringify(fieldErrors);
    }
    throw new Error(`Invalid input: ${errorMessages || "Validation failed."}`);
  }

  try {
    const recommendations = await generateStyleRecommendations(validatedInput.data);
    return recommendations;
  } catch (error) {
    console.error("Error in generateStyleRecommendationsAction:", error);
    // It's good practice to not expose raw error messages to the client.
    // Log the detailed error on the server and return a generic message.
    throw new Error("An error occurred while generating style recommendations. Please try again later.");
  }
}
