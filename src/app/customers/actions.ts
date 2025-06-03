
// src/app/customers/actions.ts
"use server";

import type { Customer } from '@/lib/mockData';
import { saveCustomer as saveCustomerToDb, deleteCustomerById as deleteCustomerFromDb, type CustomerFormInput } from '@/lib/server/dataService';
import { revalidatePath } from 'next/cache';

export async function saveCustomerAction(data: CustomerFormInput, existingCustomerId?: string): Promise<Customer | null> {
  console.log(`Server Action: saveCustomerAction for ${existingCustomerId ? 'updating customer ' + existingCustomerId : 'adding new customer'}`);
  
  const result = await saveCustomerToDb(data, existingCustomerId);
  if (result) {
    revalidatePath('/customers'); // Revalidate the customers page to show updated list
    revalidatePath('/orders'); // Customer name might be displayed on orders page
    // Potentially revalidate specific order if a customer linked to it was updated: /orders/[orderId]
    // For now, broad revalidation is okay.
  }
  return result;
}

export async function deleteCustomerAction(customerId: string): Promise<boolean> {
  console.log(`Server Action: deleteCustomerAction for customer ID ${customerId}`);
  // Add any pre-deletion checks or related data cleanup logic here if needed
  // e.g., check if customer has open orders before allowing deletion.
  const success = await deleteCustomerFromDb(customerId);
  if (success) {
    revalidatePath('/customers');
    revalidatePath('/orders'); // If customer name/ID is denormalized in orders list
  }
  return success;
}
