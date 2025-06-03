
// src/app/customers/actions.ts
"use server";

import type { Customer } from '@/lib/mockData';
import { saveCustomer as saveCustomerToDb, deleteCustomerById as deleteCustomerFromDb, type CustomerFormInput } from '@/lib/server/dataService';
import { revalidatePath } from 'next/cache';

export async function saveCustomerAction(data: CustomerFormInput, existingCustomerId?: string): Promise<Customer | null> {
  console.log(`Server Action: saveCustomerAction for ${existingCustomerId ? 'updating customer ' + existingCustomerId : 'adding new customer'} with data:`, JSON.stringify(data));
  try {
    const result = await saveCustomerToDb(data, existingCustomerId);
    if (result) {
      console.log("Server Action: Customer saved/updated successfully in DB. ID:", result.id);
      revalidatePath('/customers');
      revalidatePath('/orders'); // Customer name might be displayed on orders page
      // Potentially revalidate specific order if a customer linked to it was updated: /orders/[orderId]
    } else {
      // This case means saveCustomerToDb itself returned null, implying an error was caught there.
      // The detailed error would have been logged by saveCustomerToDb in dataService.ts.
      console.error("Server Action: saveCustomerToDb returned null. This usually indicates an issue caught within the dataService (e.g., Firestore error). Check server logs from dataService.");
    }
    return result;
  } catch (error) {
    // This catch block is for errors occurring *within* the server action itself,
    // outside the call to saveCustomerToDb, or if saveCustomerToDb throws instead of returning null.
    console.error("Server Action: Unexpected error during saveCustomerAction execution:", error);
    return null; 
  }
}

export async function deleteCustomerAction(customerId: string): Promise<boolean> {
  console.log(`Server Action: deleteCustomerAction for customer ID ${customerId}`);
  try {
    const success = await deleteCustomerFromDb(customerId);
    if (success) {
      console.log("Server Action: Customer deleted successfully from DB, revalidating paths.");
      revalidatePath('/customers');
      revalidatePath('/orders'); // If customer name/ID is denormalized in orders list
    } else {
      console.error("Server Action: deleteCustomerFromDb returned false. Deletion failed in dataService. Check server logs from dataService.");
    }
    return success;
  } catch (error) {
    console.error("Server Action: Unexpected error during deleteCustomerAction execution:", error);
    return false;
  }
}
