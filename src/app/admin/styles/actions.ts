
// src/app/admin/styles/actions.ts
"use server";

import type { GarmentStyle } from '@/lib/mockData';
import { saveGarmentStyle as saveStyleToDb, deleteGarmentStyle as deleteStyleFromDb } from '@/lib/server/dataService';
import { revalidatePath } from 'next/cache';

export async function saveStyleAction(data: { name: string; requiredMeasurements: string[] }, existingStyleId?: string): Promise<{ success: boolean; style?: GarmentStyle; error?: string }> {
  console.log(`Server Action: saveStyleAction for ${existingStyleId ? 'updating style ' + existingStyleId : 'adding new style'}`);
  try {
    const result = await saveStyleToDb(data, existingStyleId);
    if (result) {
      revalidatePath('/admin/styles');
      revalidatePath('/workflow/design-step'); // So the design step gets the new styles
      return { success: true, style: result };
    }
    return { success: false, error: 'Database operation failed.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: message };
  }
}

export async function deleteStyleAction(styleId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`Server Action: deleteStyleAction for style ID ${styleId}`);
  try {
    const success = await deleteStyleFromDb(styleId);
    if (success) {
      revalidatePath('/admin/styles');
      revalidatePath('/workflow/design-step');
      return { success: true };
    }
    return { success: false, error: 'Failed to delete style from database.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: message };
  }
}
