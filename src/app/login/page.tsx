import { getTailors } from '@/lib/server/dataService';
import LoginClientPage from './client';
import type { Metadata } from 'next';
import type { Tailor } from '@/lib/mockData';

export const metadata: Metadata = {
  title: 'Login - StitchStyle',
  description: 'Login to StitchStyle to manage your tailoring business.',
};

// This is now a Server Component
export default async function LoginPage() {
  // Fetch initial data on the server
  const serverFetchedTailors: Tailor[] = await getTailors();
  
  // Pass the fetched data to the Client Component
  return <LoginClientPage initialTailors={serverFetchedTailors} />;
}
