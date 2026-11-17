import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { licenseUrl } from '@/lib/licenses';
import { Post } from '@/lib/types';
import { colors, fontSizes, spacing } from '@/theme';
import { Button } from './Button';
import { LinkText } from './LinkText';

type Props = { post: Post };

function PostCardComponent({ post }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!post.image_url || !post.image_license) return null;

  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: post.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{post.category.name}</Text>
        </View>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gradient}>
          <Text style={styles.fact}>{post.fact}</Text>
        </LinearGradient>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description} numberOfLines={expanded ? undefined : 3}>
          {post.description}
        </Text>
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text style={styles.more}>{expanded ? 'less' : 'more'}</Text>
        </Pressable>

        <Button label="Learn all about it" variant="secondary" onPress={() => WebBrowser.openBrowserAsync(post.source_url)} />

        <Text style={styles.credits}>
          Text: adapted from <LinkText label={post.source_name} url={post.source_url} /> (
          <LinkText label={post.text_license} url={licenseUrl(post.text_license)} />)
          {' · '}Image:{' '}
          {post.image_attribution ? (
            <>
              <LinkText label={post.image_attribution} url={post.image_source_url} />{' '}
            </>
          ) : null}
          (<LinkText label={post.image_license} url={licenseUrl(post.image_license)} />)
        </Text>
      </View>
    </View>
  );
}

export const PostCard = memo(PostCardComponent);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  imageWrapper: { width: '100%', aspectRatio: 4 / 5, justifyContent: 'flex-end' },
  categoryChip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  categoryText: { color: colors.text, fontSize: fontSizes.sm, fontWeight: '600' },
  gradient: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl * 2, paddingBottom: spacing.lg },
  fact: { color: '#fff', fontSize: fontSizes.lg, fontWeight: '700', lineHeight: 28 },
  body: { padding: spacing.md, gap: spacing.sm },
  title: { color: colors.text, fontSize: fontSizes.md, fontWeight: '700' },
  description: { color: colors.textMuted, fontSize: fontSizes.md, lineHeight: 22 },
  more: { color: colors.primary, fontSize: fontSizes.sm },
  credits: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm, lineHeight: 18 },
});