'use server';

import { getOrdersForCustomer as getOrdersForCustomerFromDb } from '@/lib/server/dataService';
import type { Order } from '@/lib/mockData';

export async function getPastOrdersAction(customerId: string): Promise<Order[]> {
  if (!customerId) {
    return [];
  }
  try {
    const orders = await getOrdersForCustomerFromDb(customerId);
    return orders;
  } catch (error) {
    console.error("Server Action: Error fetching past orders:", error);
    return []; // Return empty array on error
  }
}
