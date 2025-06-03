// src/app/tailors/actions.ts
"use server";

import type { Tailor } from '@/lib/mockData';
import type { TailorFormData } from '@/components/tailors/tailor-form-dialog';
import { saveTailor as saveTailorToDb, deleteTailorById as deleteTailorFromDb } from '@/lib/server/dataService';
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
