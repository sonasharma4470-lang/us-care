import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, ArrowLeft, Calendar, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";

export default function ServiceDetail() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const [service, setService] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    api.get(`/services/${slug}`).then((r) => setService(r.data));
    api.get("/services").then((r) => setRelated(r.data.filter((s) => s.slug !== slug).slice(0, 3)));
    window.scrollTo(0, 0);
  }, [slug]);

  if (!service) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div data-testid="service-detail-page">
      <section className="relative h-[50vh] min-h-[380px] w-full overflow-hidden">
        <img src={service.image} alt={service.name} className="img-cover" />
        <div className="absolute inset-0 hero-gradient-overlay" />
        <div className="relative z-10 h-full container-x flex flex-col justify-end pb-12">
          <Link to="/services" className="text-white/85 hover:text-white text-sm inline-flex items-center gap-1" data-testid="service-back-link">
            <ArrowLeft className="w-4 h-4" /> Back to services
          </Link>
          <div className="pill bg-white/15 text-white mt-3 backdrop-blur-md border border-white/20 w-max">{service.category}</div>
          <h1 className="text-white font-heading text-4xl md:text-6xl font-semibold mt-3 max-w-3xl">{service.name}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-semibold">About this treatment</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
            {service.benefits?.length > 0 && (
              <div>
                <h3 className="font-heading text-xl font-semibold">Key Benefits</h3>
                <ul className="mt-3 grid sm:grid-cols-2 gap-3">
                  {service.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {service.suitable_for?.length > 0 && (
              <div>
                <h3 className="font-heading text-xl font-semibold">Suitable For</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.suitable_for.map((s, i) => (
                    <span key={i} className="pill bg-secondary text-foreground/80">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 h-fit sticky top-24">
            <div className="text-sm text-muted-foreground">Ready to start?</div>
            <div className="font-heading text-2xl font-semibold mt-1">Book your session</div>
            <div className="mt-4 space-y-2 text-sm">
              {service.duration && (
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {service.duration}</div>
              )}
              {service.price && (
                <div className="flex items-center gap-2"><span className="font-semibold text-primary">{service.price}</span></div>
              )}
            </div>
            <div className="mt-6 space-y-2">
              <Link to="/appointment" data-testid="service-book-btn">
                <Button className="w-full rounded-full bg-primary"><Calendar className="w-4 h-4 mr-2" /> Book Appointment</Button>
              </Link>
              <a href={`https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello, I'd like to enquire about ${service.name}`)}`} target="_blank" rel="noreferrer" data-testid="service-whatsapp-btn">
                <Button variant="outline" className="w-full rounded-full"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button>
              </a>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-slate-50 dark:bg-slate-900/50">
          <div className="container-x">
            <h2 className="font-heading text-3xl font-semibold mb-8">Related Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} to={`/services/${r.slug}`} data-testid={`service-related-${r.slug}`} className="block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-border hover:shadow-lg">
                  <img src={r.image} alt={r.name} className="w-full h-40 object-cover" />
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-semibold">{r.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.short_description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
