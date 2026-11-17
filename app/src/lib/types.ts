export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Post = {
  id: number;
  category: Category;
  title: string;
  fact: string;
  description: string;
  image_url: string;
  image_attribution: string;
  image_license: string;
  image_source_url: string;
  source_name: string;
  source_url: string;
  text_license: string;
  created_at: string;
};

export type CursorPage<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};