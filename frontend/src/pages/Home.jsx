import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Phone, MessageCircle, ArrowRight, Star, ShieldCheck, Sparkles, Award, HeartPulse, Users, Activity, Home as HomeIcon, MapPin, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SectionTitle from "@/components/SectionTitle";
import SafeImage from "@/components/SafeImage";

// ---------- Hero Slider ----------
function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const total = slides?.length || 0;
  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % total), 6500);
    return () => clearInterval(t);
  }, [total]);
  if (!total) return null;
  const slide = slides[i];

  return (
    <section className="relative h-[92vh] min-h-[600px] w-full overflow-hidden" data-testid="hero-slider">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt={slide.heading} className="img-cover" loading={i === 0 ? "eager" : "lazy"} decoding="async" fetchPriority={i === 0 ? "high" : "auto"} />
          <div className="absolute inset-0 hero-gradient-overlay" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full container-x flex items-center">
        <div className="max-w-2xl text-white">
          <motion.div
            key={`text-${i}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 pill bg-white/15 text-white backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="w-3 h-3" /> Premium Physiotherapy Care
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              {slide.heading}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/90 font-medium">{slide.subheading}</p>
            <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed max-w-xl">{slide.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={slide.cta_link || "/appointment"} data-testid={`hero-cta-${i}`}>
                <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 shadow-xl h-12 px-7">
                  <Calendar className="w-4 h-4 mr-2" /> {slide.cta_text || "Book Appointment"}
                </Button>
              </Link>
              <a href="tel:+919876543210" data-testid={`hero-call-${i}`}>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20">
                  <Phone className="w-4 h-4 mr-2" /> Call Now
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {total > 1 && (
        <>
          <button onClick={() => setI((i - 1 + total) % total)} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass grid place-items-center text-white hover:bg-white/30" data-testid="hero-prev-btn" aria-label="Previous slide">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setI((i + 1) % total)} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass grid place-items-center text-white hover:bg-white/30" data-testid="hero-next-btn" aria-label="Next slide">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                data-testid={`hero-dot-${idx}`}
                className={`h-1.5 rounded-full transition-[width,background-color] ${idx === i ? "w-10 bg-white" : "w-4 bg-white/40"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ---------- Animated Counter ----------
function Counter({ target, label, suffix = "", icon: Icon }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const step = Math.max(1, Math.floor(target / (duration / 16)));
    let current = 0;
    const t = setInterval(() => {
      current += step;
      if (current >= target) {
        setVal(target);
        clearInterval(t);
      } else setVal(current);
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return (
    <div ref={ref} className="text-center" data-testid={`counter-${label.replace(/\s+/g, "-").toLowerCase()}`}>
      {Icon && (
        <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="font-heading text-4xl md:text-5xl font-bold text-foreground">
        {val.toLocaleString()}{suffix}
      </div>
      <div className="mt-1 text-sm text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ---------- Home Page ----------
export default function Home() {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    document.title = `${settings.clinic_name || "Upadhyay Sharma Physiotherapy"} — Premium Physiotherapy Care`;
  }, [settings.clinic_name]);

  useEffect(() => {
    (async () => {
      try {
        const [s, d, t, g, f] = await Promise.all([
          api.get("/services", { params: { featured: true } }),
          api.get("/doctors", { params: { featured: true } }),
          api.get("/testimonials"),
          api.get("/gallery"),
          api.get("/faqs"),
        ]);
        setServices(s.data.slice(0, 8));
        setDoctors(d.data);
        setTestimonials(t.data.slice(0, 6));
        setGallery(g.data.slice(0, 8));
        setFaqs(f.data.slice(0, 6));
      } catch (e) {}
    })();
  }, []);

  const counters = settings.counters || {};
  const slides = settings.hero_slides || [];

  const whyChoose = [
    { icon: Award, title: "Certified Physiotherapists", desc: "IAP-registered experts with decades of experience." },
    { icon: HeartPulse, title: "Personalized Care Plans", desc: "Every plan is tailored to your body and your goals." },
    { icon: ShieldCheck, title: "Latest Equipment", desc: "Modern electrotherapy, laser, and manual therapy tools." },
    { icon: Sparkles, title: "Proven Results", desc: "96% recovery rate across 45,000+ treatments." },
    { icon: HomeIcon, title: "Home Visits Available", desc: "Expert care at your doorstep with full setup." },
    { icon: Users, title: "Friendly Staff", desc: "Warm, empathetic team that treats you like family." },
  ];

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <HeroSlider slides={slides} />

      {/* Trust bar */}
      <section className="border-y border-border bg-white dark:bg-slate-900">
        <div className="container-x py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {[
            { icon: ShieldCheck, text: "IAP Registered" },
            { icon: Award, text: "18+ Years Experience" },
            { icon: HeartPulse, text: "12,500+ Happy Patients" },
            { icon: Star, text: "4.9 / 5 Rating" },
            { icon: HomeIcon, text: "Home Visits" },
          ].map((t, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <t.icon className="w-4 h-4 text-primary" />
              <span className="font-medium">{t.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="section">
        <div className="container-x grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="relative">
            <SafeImage
              src="https://images.pexels.com/photos/16571733/pexels-photo-16571733.jpeg"
              alt="Clinic interior"
              className="rounded-3xl shadow-2xl w-full h-[320px] sm:h-[400px] lg:h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -right-6 glass rounded-2xl p-5 max-w-[220px] hidden md:block">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />)}
                </div>
                <span className="text-xs font-bold">4.9</span>
              </div>
              <p className="text-xs text-foreground/80 leading-snug">Trusted by 12,500+ patients across India.</p>
            </div>
          </div>
          <div>
            <div className="pill bg-accent/10 text-accent mb-4">About the Clinic</div>
            <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-foreground">
              Healing with dignity, backed by science.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              {settings.about}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-secondary p-5">
                <div className="text-xs uppercase tracking-widest text-primary font-semibold">Mission</div>
                <p className="mt-2 text-sm text-foreground/85 leading-relaxed">{settings.mission}</p>
              </div>
              <div className="rounded-2xl bg-secondary p-5">
                <div className="text-xs uppercase tracking-widest text-accent font-semibold">Vision</div>
                <p className="mt-2 text-sm text-foreground/85 leading-relaxed">{settings.vision}</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" data-testid="home-about-btn">
                <Button className="rounded-full bg-primary hover:bg-primary/90">
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/doctors" data-testid="home-meet-doctors-btn">
                <Button variant="outline" className="rounded-full">Meet Our Doctors</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Counters */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="container-x grid grid-cols-2 md:grid-cols-5 gap-8">
          <Counter target={counters.happy_patients || 12500} label="Happy Patients" suffix="+" icon={Users} />
          <Counter target={counters.years_experience || 18} label="Years Experience" suffix="+" icon={Award} />
          <Counter target={counters.treatments_completed || 45000} label="Treatments" suffix="+" icon={Activity} />
          <Counter target={counters.recovery_rate || 96} label="Recovery Rate" suffix="%" icon={HeartPulse} />
          <Counter target={counters.home_visits || 3200} label="Home Visits" suffix="+" icon={HomeIcon} />
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-x">
          <SectionTitle
            eyebrow="Our Services"
            title="Comprehensive physiotherapy, tailored to you."
            subtitle="From back pain to post-surgery rehab — evidence-based treatments delivered by world-class physiotherapists."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {services.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
              >
                <Link to={`/services/${s.slug}`} data-testid={`home-service-card-${s.slug}`} className="group block bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1" style={{ transitionProperty: "transform, box-shadow", transitionDuration: "300ms" }}>
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <SafeImage src={s.image} alt={s.name} className="img-cover group-hover:scale-105" style={{ transitionProperty: "transform", transitionDuration: "500ms" }} />
                  </div>
                  <div className="p-3 sm:p-5">
                    <div className="text-[10px] uppercase tracking-widest text-primary font-semibold line-clamp-1">{s.category}</div>
                    <h3 className="mt-1 font-heading text-sm sm:text-lg font-semibold line-clamp-2">{s.name}</h3>
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">{s.short_description}</p>
                    <div className="mt-3 sm:mt-4 flex items-center text-primary text-xs sm:text-sm font-medium">
                      Learn more <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1" style={{ transitionProperty: "transform", transitionDuration: "200ms" }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/services" data-testid="home-view-all-services-btn">
              <Button variant="outline" className="rounded-full">View All Services <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-x">
          <SectionTitle eyebrow="Meet Our Experts" title="Certified physiotherapists you can trust." subtitle="Our team blends deep expertise with genuine warmth." />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {doctors.map((d, idx) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg"
                data-testid={`home-doctor-card-${d.id}`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-secondary">
                  <SafeImage src={d.photo} alt={d.name} className="img-cover" />
                </div>
                <div className="p-3 sm:p-5">
                  <h3 className="font-heading text-sm sm:text-lg font-semibold line-clamp-1">{d.name}</h3>
                  <div className="text-[10px] sm:text-xs text-primary uppercase tracking-wider mt-1 line-clamp-1">{d.specialization}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1 hidden sm:block">{d.qualification} • {d.experience}</div>
                  <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2">
                    <Link to={`/doctors/${d.id}`} className="flex-1" data-testid={`home-doctor-view-${d.id}`}>
                      <Button variant="outline" size="sm" className="w-full rounded-full text-xs h-8 sm:h-9">View</Button>
                    </Link>
                    <Link to="/appointment" className="flex-1" data-testid={`home-doctor-book-${d.id}`}>
                      <Button size="sm" className="w-full rounded-full bg-primary text-xs h-8 sm:h-9">Book</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Why Choose Us" title="Care that goes beyond treatment." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((w, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-border hover:border-primary/40 hover:shadow-lg"
                style={{ transitionProperty: "border-color, box-shadow", transitionDuration: "300ms" }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                  <w.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-x">
          <SectionTitle eyebrow="Our Space" title="A glimpse inside our clinic." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {gallery.map((g, idx) => (
              <div key={g.id} className={`overflow-hidden rounded-xl sm:rounded-2xl ${idx % 5 === 0 ? "row-span-2 md:row-span-2 aspect-[3/5]" : "aspect-square"}`} data-testid={`home-gallery-${g.id}`}>
                <SafeImage src={g.image} alt={g.title} className="img-cover hover:scale-105" style={{ transitionProperty: "transform", transitionDuration: "500ms" }} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/gallery" data-testid="home-view-gallery-btn">
              <Button variant="outline" className="rounded-full">Explore Full Gallery <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Patient Stories" title="Trusted by thousands. Loved by families." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6"
                data-testid={`home-testimonial-${t.id}`}
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">“{t.review}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={t.photo} alt={t.name} className="w-11 h-11 rounded-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44'%3E%3Ccircle cx='22' cy='22' r='22' fill='%23E5EEF6'/%3E%3Ccircle cx='22' cy='18' r='7' fill='%23B7CBDD'/%3E%3Cpath d='M8 40c2-8 8-12 14-12s12 4 14 12z' fill='%23B7CBDD'/%3E%3C/svg%3E"; }} />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.treatment} • {t.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-x grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="pill bg-primary/10 text-primary mb-4">Frequently Asked</div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">Answers to what patients ask most.</h2>
            <p className="mt-4 text-muted-foreground">Still have a question? Our team is happy to help.</p>
            <Link to="/contact" className="inline-block mt-6" data-testid="home-faq-contact-btn">
              <Button variant="outline" className="rounded-full">Contact Us <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
          <div className="lg:col-span-3">
            <Accordion type="single" collapsible className="space-y-3" data-testid="home-faq-accordion">
              {faqs.map((f) => (
                <AccordionItem key={f.id} value={f.id} className="bg-white dark:bg-slate-900 rounded-xl border border-border px-5">
                  <AccordionTrigger className="text-left font-medium" data-testid={`home-faq-trigger-${f.id}`}>{f.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-x">
          <div className="rounded-3xl overflow-hidden relative bg-gradient-to-br from-primary via-primary to-accent p-10 md:p-16 text-white">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-heading text-3xl md:text-5xl font-semibold leading-tight">Ready to reclaim your movement?</h2>
                <p className="mt-4 text-white/85 max-w-lg">Book a consultation with our expert physiotherapists — clinic or home visit, we come to you.</p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/appointment" data-testid="home-cta-book-btn">
                  <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 h-12 px-7">
                    <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                  </Button>
                </Link>
                <a href={`https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" data-testid="home-cta-whatsapp-btn">
                  <Button size="lg" variant="outline" className="rounded-full h-12 px-7 bg-white/10 backdrop-blur border-white/40 text-white hover:bg-white/20">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
