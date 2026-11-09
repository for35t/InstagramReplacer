import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors, fontSizes, spacing } from '@/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instagram Replacer</Text>
      <Text style={styles.tagline}>Scroll with purpose. Learn something in every post.</Text>
      <Link href="/login" asChild>
        <Button label="Log in" />
      </Link>
      <Link href="/register" asChild>
        <Button label="Sign up" variant="secondary" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700', textAlign: 'center' },
  tagline: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: 'center', marginBottom: spacing.lg },
});