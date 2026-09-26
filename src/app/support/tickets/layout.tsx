import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { UserSupportListeners } from '@/components/user/UserSupportListeners';

export default async function SupportTicketsLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  if (!user) {
    redirect('/login?callbackUrl=/support/tickets');
  }

  return (
    <SocketProvider>
      <div className="bg-background min-h-screen">
        <UserSupportListeners />
        {children}
      </div>
    </SocketProvider>
  );
}
