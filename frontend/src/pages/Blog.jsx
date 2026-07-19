import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, User, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import SafeImage from "@/components/SafeImage";

export default function Blog() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    document.title = "Blog — Upadhyay Sharma Physiotherapy";
    api.get("/blogs").then((r) => setItems(r.data));
  }, []);

  return (
    <div data-testid="blog-page">
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">Blog</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">Insights from our physiotherapists.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {items.map((b) => (
              <Link key={b.id} to={`/blog/${b.slug}`} data-testid={`blog-card-${b.slug}`} className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-border hover:shadow-xl">
                <div className="aspect-[16/10] overflow-hidden bg-secondary">
                  <SafeImage src={b.featured_image} alt={b.title} className="img-cover group-hover:scale-105" style={{ transitionProperty: "transform", transitionDuration: "500ms" }} />
                </div>
                <div className="p-6">
                  <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">{b.category}</div>
                  <h3 className="mt-2 font-heading text-xl font-semibold leading-snug group-hover:text-primary" style={{ transitionProperty: "color", transitionDuration: "200ms" }}>{b.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{b.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {b.author}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {items.length === 0 && <div className="text-center py-20 text-muted-foreground">No blog posts yet.</div>}
        </div>
      </section>
    </div>
  );
}
