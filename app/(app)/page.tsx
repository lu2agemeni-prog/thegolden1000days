import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getDashboardStats } from '@/lib/queries';
import { DashboardClient } from './dashboard-client';

export default async function HomePage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} />;
}