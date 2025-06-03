
// src/app/customers/actions.ts
"use server";

import type { Customer } from '@/lib/mockData';
import { saveCustomer as saveCustomerToDb, type CustomerFormInput } from '@/lib/server/dataService';
import { revalidatePath } from 'next/cache';

export interface SaveCustomerActionResult {
  success: boolean;
  customer: Customer | null;
  error?: string;
}

export async function saveCustomerAction(data: CustomerFormInput, existingCustomerId?: string): Promise<SaveCustomerActionResult> {
  console.log(`Server Action: saveCustomerAction for ${existingCustomerId ? 'updating customer ' + existingCustomerId : 'adding new customer'} with data:`, JSON.stringify(data));
  try {
    const result = await saveCustomerToDb(data, existingCustomerId);
    if (result) {
      console.log("Server Action: Customer saved/updated successfully in DB. ID:", result.id);
      revalidatePath('/customers');
      revalidatePath('/orders'); // Customer name might be displayed on orders page
      revalidatePath('/workflow/customer-step'); // To refresh customer list if needed
      return { success: true, customer: result };
    } else {
      console.error("Server Action: saveCustomerToDb returned null. This usually indicates an issue caught within the dataService (e.g., Firestore error). Check server logs from dataService.");
      return { success: false, customer: null, error: "Database operation failed. Check server logs for details." };
    }
  } catch (error) {
    console.error("Server Action: Unexpected error during saveCustomerAction execution:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, customer: null, error: `Server action error: ${errorMessage}` };
  }
}

export async function deleteCustomerAction(customerId: string): Promise<boolean> {
  console.log(`Server Action: deleteCustomerAction for customer ID ${customerId}`);
  try {
    const success = await deleteCustomerFromDb(customerId);
    if (success) {
      console.log("Server Action: Customer deleted successfully from DB, revalidating paths.");
      revalidatePath('/customers');
      revalidatePath('/orders'); 
      revalidatePath('/workflow/customer-step');
    } else {
      console.error("Server Action: deleteCustomerFromDb returned false. Deletion failed in dataService. Check server logs from dataService.");
    }
    return success;
  } catch (error) {
    console.error("Server Action: Unexpected error during deleteCustomerAction execution:", error);
    return false;
  }
}
