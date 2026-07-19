import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";
import SafeImage from "@/components/SafeImage";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    document.title = "Gallery — Upadhyay Sharma Physiotherapy";
    api.get("/gallery").then((r) => setItems(r.data));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))], [items]);
  const filtered = items.filter((i) => category === "All" || i.category === category);

  return (
    <div data-testid="gallery-page">
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">Gallery</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">A glimpse inside our clinic.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="flex gap-2 overflow-x-auto mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                data-testid={`gallery-cat-${c.replace(/\s+/g, "-").toLowerCase()}`}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                  category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="columns-2 lg:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
            {filtered.map((g, i) => (
              <button key={g.id} onClick={() => setLightbox(g)} data-testid={`gallery-item-${g.id}`} className="block w-full overflow-hidden rounded-xl sm:rounded-2xl break-inside-avoid group">
                <SafeImage src={g.image} alt={g.title} className="w-full h-auto group-hover:scale-105" style={{ transitionProperty: "transform", transitionDuration: "500ms" }} />
              </button>
            ))}
          </div>
          {filtered.length === 0 && <div className="text-center text-muted-foreground py-16">No items in this category.</div>}
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 grid place-items-center p-4" onClick={() => setLightbox(null)} data-testid="gallery-lightbox">
          <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white grid place-items-center" data-testid="gallery-lightbox-close">
            <X className="w-5 h-5" />
          </button>
          <img src={lightbox.image} alt={lightbox.title} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} loading="eager" />
        </div>
      )}
    </div>
  );
}
