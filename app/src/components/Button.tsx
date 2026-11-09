import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import { colors, fontSizes, spacing } from '@/theme';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading = false, disabled, ...rest }: Props) {
  return (
    <Pressable
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: spacing.md, borderRadius: 12, alignItems: 'center', width: '100%' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  label: { color: colors.text, fontSize: fontSizes.md, fontWeight: '600' },
});