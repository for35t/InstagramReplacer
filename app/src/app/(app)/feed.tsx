import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { colors, fontSizes, spacing } from '@/theme';

export default function FeedScreen() {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Feed comes in Step 9</Text>
      <Button label="Log out" variant="secondary" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  text: { color: colors.text, fontSize: fontSizes.lg, textAlign: 'center' },
});