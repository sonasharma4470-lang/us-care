import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/components/SectionTitle";

export default function Services() {
  const [services, setServices] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    document.title = "Services — Upadhyay Sharma Physiotherapy";
    api.get("/services").then((r) => setServices(r.data));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))], [services]);
  const filtered = services.filter(
    (s) => (category === "All" || s.category === category) && (s.name.toLowerCase().includes(q.toLowerCase()) || (s.short_description || "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div data-testid="services-page">
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">Services</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">Physiotherapy for every stage of life.</h1>
          <p className="mt-5 text-muted-foreground text-lg">From pain relief to advanced neurological rehabilitation.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10 rounded-full h-11"
                data-testid="services-search-input"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  data-testid={`services-cat-${c.replace(/\s+/g, "-").toLowerCase()}`}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                    category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70 hover:bg-secondary/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
              >
                <Link to={`/services/${s.slug}`} data-testid={`service-card-${s.slug}`} className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:-translate-y-1" style={{ transitionProperty: "transform, box-shadow", transitionDuration: "300ms" }}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={s.image} alt={s.name} className="img-cover group-hover:scale-105" style={{ transitionProperty: "transform", transitionDuration: "500ms" }} />
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">{s.category}</div>
                    <h3 className="mt-1 font-heading text-lg font-semibold">{s.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.short_description}</p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium">
                      Learn more <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground" data-testid="services-empty">No services found.</div>}
        </div>
      </section>
    </div>
  );
}
