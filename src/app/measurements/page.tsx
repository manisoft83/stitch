
import { getCustomers, getGarmentStyles } from '@/lib/server/dataService';
import MeasurementsClientPage from './client';
import type { Metadata } from 'next';
import type { Customer, GarmentStyle } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'Customer Measurements - StitchStyle',
  description: 'Manage customer measurement profiles for all garment styles.',
};

export default async function MeasurementsPage() {
  const customers: Customer[] = await getCustomers();
  const styles: GarmentStyle[] = await getGarmentStyles();
  
  return <MeasurementsClientPage initialCustomers={customers} initialStyles={styles} />;
}
