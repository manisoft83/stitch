import { getTailors, getOrdersFromDb } from '@/lib/server/dataService';
import TailorsClientPage from './client';
import type { Metadata } from 'next';
import type { Order, Tailor } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'Tailor Hub - StitchStyle',
  description: 'Manage tailors and assign orders for StitchStyle.',
};

// This is now a Server Component
export default async function TailorsPage() {
  // Fetch initial data on the server
  const serverFetchedTailors: Tailor[] = await getTailors();
  const serverFetchedOrders: Order[] = await getOrdersFromDb();
  
  // Pass the fetched data to the Client Component
  return <TailorsClientPage initialTailors={serverFetchedTailors} initialOrders={serverFetchedOrders} />;
}
