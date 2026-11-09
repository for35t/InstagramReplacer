import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { colors, spacing } from '@/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  return (
    <AuthForm
      title="Create account"
      submitLabel="Sign up"
      onSubmit={signUp}
      footer={<Link href="/login" style={styles.link}>Already have an account? Log in</Link>}
    />
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, textAlign: 'center', marginTop: spacing.sm },
});