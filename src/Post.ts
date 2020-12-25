export type Post = {
  folder: string;
  title: string;
  slug: string;
  pubDate: string;
  target: string;
  content?: string;
  tags: string[];
  items: string[];
  images: string[];
};