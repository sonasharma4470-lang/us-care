import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import api from "@/lib/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    api.get(`/blogs/${slug}`).then((r) => setBlog(r.data));
    window.scrollTo(0, 0);
  }, [slug]);

  if (!blog) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div data-testid="blog-detail-page">
      <section className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
        <img src={blog.featured_image} alt={blog.title} className="img-cover" />
        <div className="absolute inset-0 hero-gradient-overlay" />
        <div className="relative z-10 h-full container-x flex flex-col justify-end pb-12">
          <Link to="/blog" className="text-white/85 hover:text-white text-sm inline-flex items-center gap-1" data-testid="blog-back-link">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
          <div className="pill bg-white/15 text-white mt-3 backdrop-blur-md border border-white/20 w-max">{blog.category}</div>
          <h1 className="text-white font-heading text-3xl md:text-5xl font-semibold mt-3 max-w-3xl">{blog.title}</h1>
          <div className="mt-3 flex items-center gap-4 text-white/85 text-sm">
            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {blog.author}</span>
            <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {new Date(blog.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x max-w-3xl">
          <article className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </section>
    </div>
  );
}
