import { Post } from './types';

export const AD_INTERVAL = 5;

export type FeedItem =
  | { type: 'post'; key: string; post: Post }
  | { type: 'ad'; key: string };

export function buildFeedItems(posts: Post[]): FeedItem[] {
  const items: FeedItem[] = [];
  posts.forEach((post, index) => {
    items.push({ type: 'post', key: `post-${post.id}`, post });
    if ((index + 1) % AD_INTERVAL === 0) {
      items.push({ type: 'ad', key: `ad-${index}` });
    }
  });
  return items;
}