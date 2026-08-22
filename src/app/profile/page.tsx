import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { AuroraBackground } from '@/components/backgrounds/AnimatedBackground';

export const metadata: Metadata = {
  title: 'Profile Settings | Nazexa',
  description: 'Manage your profile settings.',
};

export default async function ProfilePage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="relative isolate min-h-screen pt-24 pb-16">
      <AuroraBackground />
      <ProfileDashboard />
    </div>
  );
}
