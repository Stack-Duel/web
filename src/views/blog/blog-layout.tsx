import Layout from "@/shared/layouts/layout/layout";
import BlogPostCard from "@/domains/blog/components/blog-post-card";
import type { BlogPost } from "@/domains/blog/models/blog-post";

type BlogLayoutProps = {
  posts: BlogPost[];
};

export default function BlogLayout({ posts }: Readonly<BlogLayoutProps>) {
  return (
    <Layout>
      <section className="border-b pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Blog</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Updates, engineering notes, and announcements from the team.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No posts yet.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
