export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  authorImageUrl?: string;
  coverImage?: string;
  tags: string[];
  publishedAt: string;
  published: boolean;
};
