
// src/app/orders/actions.ts
"use server";

import type { Order, OrderStatus } from '@/lib/mockData';
import { saveOrderToDb, updateOrderStatusInDb, getOrderByIdFromDb as fetchOrderById } from '@/lib/server/dataService';
import { revalidatePath } from 'next/cache';

export interface SaveOrderActionResult {
  success: boolean;
  order: Order | null;
  error?: string;
}

// The orderData here now expects detailedItems for multi-item orders
export async function saveOrderAction(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, existingOrderId?: string): Promise<SaveOrderActionResult> {
  console.log(`Server Action: saveOrderAction for ${existingOrderId ? 'updating order ' + existingOrderId : 'adding new order'}`);
  try {
    const result = await saveOrderToDb(orderData, existingOrderId);
    if (result) {
      console.log("Server Action: Order saved/updated successfully in DB. ID:", result.id);
      revalidatePath('/orders');
      revalidatePath(`/orders/${result.id}`);
      if(existingOrderId && existingOrderId !== result.id) revalidatePath(`/orders/${existingOrderId}`);
      revalidatePath('/tracking');
      return { success: true, order: result };
    } else {
      console.error("Server Action: saveOrderToDb returned null.");
      return { success: false, order: null, error: "Database operation failed to save order." };
    }
  } catch (error) {
    console.error("Server Action: Unexpected error during saveOrderAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, order: null, error: `Server action error: ${errorMessage}` };
  }
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<{success: boolean, error?: string}> {
  console.log(`Server Action: updateOrderStatusAction for order ID ${orderId} to status ${status}`);
  try {
    const success = await updateOrderStatusInDb(orderId, status);
    if (success) {
      console.log("Server Action: Order status updated successfully. Revalidating paths.");
      revalidatePath('/orders');
      revalidatePath(`/orders/${orderId}`);
      revalidatePath('/tracking');
      return { success: true };
    } else {
      console.error("Server Action: updateOrderStatusInDb returned false.");
      return { success: false, error: "Failed to update order status in database." };
    }
  } catch (error) {
    console.error("Server Action: Unexpected error during updateOrderStatusAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Server action error: ${errorMessage}` };
  }
}

export async function getOrderDetailsAction(orderId: string): Promise<{order: Order | null, error?: string}> {
    console.log(`Server Action: getOrderDetailsAction for order ID ${orderId}`);
    try {
        const order = await fetchOrderById(orderId);
        if (order) {
            return { order };
        } else {
            return { order: null, error: "Order not found."};
        }
    } catch (error) {
        console.error("Server Action: Unexpected error during getOrderDetailsAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { order: null, error: `Server action error: ${errorMessage}` };
    }
}
