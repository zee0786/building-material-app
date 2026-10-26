import { AuthProvider, useAuth } from '@/lib/auth';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

function Guard() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const first = segments[0] as string | undefined;
    const onAuthScreen = first === 'login' || first === 'signup';
    if (!session && !onAuthScreen) router.replace('/login');
    else if (session && onAuthScreen) router.replace('/');
  }, [session, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Guard />
    </AuthProvider>
  );
}