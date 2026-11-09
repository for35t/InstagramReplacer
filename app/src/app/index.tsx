import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { status } = useAuth();
  return <Redirect href={status === 'signedIn' ? '/feed' : '/welcome'} />;
}