import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { getErrorMessage } from '@/lib/errors';
import { useCategories, useMyCategories, useSaveMyCategories } from '@/lib/queries';
import { colors, fontSizes, spacing } from '@/theme';

export default function CategoriesScreen() {
  const router = useRouter();
  const categories = useCategories();
  const myCategories = useMyCategories();
  const save = useSaveMyCategories();
  const [selected, setSelected] = useState<number[] | null>(null);

  if (categories.isPending || myCategories.isPending) return <Loading />;

  const current = selected ?? myCategories.data ?? [];

  function toggle(id: number) {
    setSelected(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function handleSave() {
    save.mutate(current, { onSuccess: () => router.replace('/feed') });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>What do you want to learn about?</Text>
      <Text style={styles.subtitle}>Pick at least one. You can change this anytime.</Text>

      <View style={styles.chips}>
        {categories.data?.map((category) => {
          const active = current.includes(category.id);
          return (
            <Pressable
              key={category.id}
              onPress={() => toggle(category.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={styles.chipText}>{category.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {save.isError && <Text style={styles.error}>{getErrorMessage(save.error)}</Text>}
      <Button label="Save" onPress={handleSave} loading={save.isPending} disabled={current.length === 0} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: fontSizes.xl, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: fontSizes.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: fontSizes.md },
  error: { color: colors.danger, fontSize: fontSizes.sm },
});