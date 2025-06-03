
import { getOrdersFromDb } from '@/lib/server/dataService'; // Updated to fetch from DB
import { getTailors } from '@/lib/server/dataService';
import OrdersClientPage from './client';
import type { Metadata } from 'next';
import type { Order, Tailor } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'My Orders - StitchStyle',
  description: 'View and manage your orders with StitchStyle.',
};

export default async function OrdersPage() {
  // Fetch initial data on the server
  const serverFetchedTailors: Tailor[] = await getTailors();
  const serverFetchedOrders: Order[] = await getOrdersFromDb(); // Fetch orders from Firestore
  
  return <OrdersClientPage initialTailors={serverFetchedTailors} initialOrders={serverFetchedOrders} />;
}
