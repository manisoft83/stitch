
import { getGarmentStyles } from '@/lib/server/dataService';
import StylesClientPage from './client';
import type { Metadata } from 'next';
import type { GarmentStyle } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'Style Management - StitchStyle',
  description: 'Manage garment styles and their required measurements.',
};

export default async function StylesPage() {
  const serverFetchedStyles: GarmentStyle[] = await getGarmentStyles();
  
  return <StylesClientPage initialStyles={serverFetchedStyles} />;
}
