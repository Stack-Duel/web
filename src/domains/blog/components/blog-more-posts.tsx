import Link from "next/link";
import { User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { formatDate } from "@/shared/lib/date";
import { routerConfig } from "@/shared/router-config";
import type { BlogPost } from "@/domains/blog/models/blog-post";

type BlogMorePostsProps = {
  posts: BlogPost[];
};

export default function BlogMorePosts({ posts }: Readonly<BlogMorePostsProps>) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold tracking-tight">More posts</h2>
      <div className="flex flex-col divide-y divide-border border-t border-b">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={routerConfig.blogPost.execute({ slug: post.slug })}
            className="group flex items-center justify-between gap-6 py-6"
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <h3 className="font-semibold transition-colors group-hover:text-primary">
                {post.title}
              </h3>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDate(post.publishedAt)}
              </span>
            </div>
            <Avatar className="shrink-0">
              <AvatarImage src={post.authorImageUrl} alt={post.author} />
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </Link>
        ))}
      </div>
    </section>
  );
}
