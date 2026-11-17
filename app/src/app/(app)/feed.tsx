import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AdSlot } from '@/components/AdSlot';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { PostCard } from '@/components/PostCard';
import { useAuth } from '@/context/AuthContext';
import { buildFeedItems } from '@/lib/feedItems';
import { useFeed, useMyCategories } from '@/lib/queries';
import { colors, fontSizes, spacing } from '@/theme';

export default function FeedScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const myCategories = useMyCategories();
  const hasCategories = (myCategories.data?.length ?? 0) > 0;
  const feed = useFeed(hasCategories);

  if (myCategories.isPending) return <Loading />;
  if (!hasCategories) return <Redirect href="/categories" />;

  const items = buildFeedItems(feed.data?.pages.flatMap((page) => page.results) ?? []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Feed</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/categories')}>
            <Text style={styles.headerLink}>Categories</Text>
          </Pressable>
          <Pressable onPress={signOut}>
            <Text style={styles.headerLink}>Log out</Text>
          </Pressable>
        </View>
      </View>

      {feed.isPending ? (
        <Loading />
      ) : feed.isError ? (
        <View style={styles.message}>
          <Text style={styles.messageText}>Couldn't load posts.</Text>
          <Button label="Try again" variant="secondary" onPress={() => feed.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (item.type === 'post' ? <PostCard post={item.post} /> : <AdSlot />)}
          contentContainerStyle={styles.list}
          onEndReached={() => {
            if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : undefined}
          ListEmptyComponent={
            <View style={styles.message}>
              <Text style={styles.messageText}>No posts in your categories yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: { color: colors.text, fontSize: fontSizes.lg, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  headerLink: { color: colors.primary, fontSize: fontSizes.md },
  list: { padding: spacing.md },
  message: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  messageText: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: 'center' },
});