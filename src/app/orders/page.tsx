import { getTailors } from '@/lib/server/dataService';
import OrdersClientPage from './client';
import type { Metadata } from 'next';
import type { Tailor } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'My Orders - StitchStyle',
  description: 'View and manage your orders with StitchStyle.',
};

// This is now a Server Component
export default async function OrdersPage() {
  // Fetch initial data on the server
  const serverFetchedTailors: Tailor[] = await getTailors();
  
  // Pass the fetched data to the Client Component
  return <OrdersClientPage initialTailors={serverFetchedTailors} />;
}
