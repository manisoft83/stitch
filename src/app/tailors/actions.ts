// src/app/tailors/actions.ts
"use server";

import type { Tailor } from '@/lib/mockData';
import type { TailorFormData } from '@/components/tailors/tailor-form-dialog';
import { saveTailor as saveTailorToDb, deleteTailorById as deleteTailorFromDb, assignTailorToOrderInDb, type AssignmentDetails } from '@/lib/server/dataService';
import { revalidatePath } from 'next/cache';

export async function saveTailorAction(data: TailorFormData, existingTailorId?: string): Promise<Tailor | null> {
  // Here you would add any additional validation or business logic before saving
  console.log(`Server Action: saveTailorAction for ${existingTailorId ? 'updating tailor ' + existingTailorId : 'adding new tailor'}`);
  const result = await saveTailorToDb(data, existingTailorId);
  if (result) {
    revalidatePath('/tailors'); // Revalidate the tailors page to show updated list
    revalidatePath('/orders'); // Also revalidate orders page if tailors list is used there
    revalidatePath('/login'); // And login page
  }
  return result;
}

export async function deleteTailorAction(tailorId: string): Promise<boolean> {
  // Add any pre-deletion checks or related data cleanup logic here
  console.log(`Server Action: deleteTailorAction for tailor ID ${tailorId}`);
  const success = await deleteTailorFromDb(tailorId);
  if (success) {
    revalidatePath('/tailors');
    revalidatePath('/orders');
    revalidatePath('/login');
  }
  return success;
}

export async function assignTailorToOrderAction(orderId: string, details: AssignmentDetails): Promise<{ success: boolean; error?: string }> {
  console.log(`Server Action: assignTailorToOrderAction for order ID ${orderId}`);
  try {
    const success = await assignTailorToOrderInDb(orderId, details);
    if (success) {
      console.log("Server Action: Tailor assigned successfully. Revalidating paths.");
      revalidatePath('/tailors');
      revalidatePath('/orders');
      revalidatePath(`/orders/${orderId}`);
      return { success: true };
    } else {
      console.error("Server Action: assignTailorToOrderInDb returned false.");
      return { success: false, error: "Failed to assign tailor in database." };
    }
  } catch (error) {
    console.error("Server Action: Unexpected error during assignTailorToOrderAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Server action error: ${errorMessage}` };
  }
}
