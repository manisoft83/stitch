
import { getOrdersFromDb, getTailors } from '@/lib/server/dataService';
import OrdersClientPage from './client';
import type { Metadata } from 'next';
import type { Order, Tailor } from '@/lib/mockData';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'My Orders - StitchStyle',
  description: 'View and manage your orders with StitchStyle.',
};

export default async function OrdersPage() {
  // Fetch initial data on the server
  const serverFetchedTailors: Tailor[] = await getTailors();
  const serverFetchedOrders: Order[] = await getOrdersFromDb();
  
  return (
    <Suspense fallback={<div className="container mx-auto py-8 text-center">Loading orders...</div>}>
      <OrdersClientPage initialTailors={serverFetchedTailors} initialOrders={serverFetchedOrders} />
    </Suspense>
  );
}
