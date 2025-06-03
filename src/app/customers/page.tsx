
import { getCustomers } from '@/lib/server/dataService';
import CustomersClientPage from './client';
import type { Metadata } from 'next';
import type { Customer } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'Customer Management - StitchStyle',
  description: 'Manage your customer records for StitchStyle.',
};

// This is now a Server Component
export default async function CustomersPage() {
  // Fetch initial data on the server
  const serverFetchedCustomers: Customer[] = await getCustomers();
  
  // Pass the fetched data to the Client Component
  return <CustomersClientPage initialCustomers={serverFetchedCustomers} />;
}
