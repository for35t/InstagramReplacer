import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      onSubmit={signIn}
      footer={<Link href="/register" style={styles.link}>No account? Sign up</Link>}
    />
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.sm },
});