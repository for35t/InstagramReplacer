import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/theme';

type Props = { label: string; url?: string | null };

export function LinkText({ label, url }: Props) {
  if (!url) return <Text>{label}</Text>;
  return (
    <Text style={styles.link} onPress={() => WebBrowser.openBrowserAsync(url)}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, textDecorationLine: 'underline' },
});