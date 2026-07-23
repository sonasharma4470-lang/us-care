import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, HeartPulse, Award, Users, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/components/SectionTitle";
import { useSettings } from "@/context/SettingsContext";

export default function About() {
  const { settings } = useSettings();
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">About Us</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">Healing with dignity, driven by science.</h1>
          <p className="mt-5 text-lg text-muted-foreground">{settings.tagline}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <img src="https://images.pexels.com/photos/20860588/pexels-photo-20860588.jpeg" alt="Physiotherapy" className="rounded-3xl w-full h-[320px] sm:h-[400px] lg:h-[500px] object-cover shadow-lg" loading="lazy" decoding="async" />
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">Our Story</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{settings.about}</p>
            <div className="mt-6 space-y-3">
              {["Evidence-based, patient-first care", "Latest equipment and modern facilities", "18+ years of clinical excellence", "Trusted by patients across Jaipur"].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-x grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 border border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4"><HeartPulse className="w-5 h-5" /></div>
            <h3 className="font-heading text-2xl font-semibold">Our Mission</h3>
            <p className="mt-3 text-muted-foreground">{settings.mission}</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 border border-border">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent grid place-items-center mb-4"><Sparkles className="w-5 h-5" /></div>
            <h3 className="font-heading text-2xl font-semibold">Our Vision</h3>
            <p className="mt-3 text-muted-foreground">{settings.vision}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionTitle eyebrow="Our Values" title="What we stand for." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "Excellence", desc: "Highest standards in physiotherapy and care." },
              { icon: HeartPulse, title: "Empathy", desc: "Every patient is treated like family." },
              { icon: ShieldCheck, title: "Integrity", desc: "Honest advice, transparent treatment plans." },
              { icon: Users, title: "Teamwork", desc: "Multidisciplinary care under one roof." },
              { icon: Sparkles, title: "Innovation", desc: "Latest evidence and modern equipment." },
              { icon: CheckCircle2, title: "Results", desc: "Focused on measurable, lasting recovery." },
            ].map((v, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.05 }} className="p-6 rounded-2xl border border-border bg-white dark:bg-slate-900">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3"><v.icon className="w-5 h-5" /></div>
                <h4 className="font-heading text-lg font-semibold">{v.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold">Ready to start your recovery?</h2>
          <p className="mt-3 text-muted-foreground">Book an appointment with our team today.</p>
          <Link to="/appointment" className="inline-block mt-6" data-testid="about-cta-book-btn">
            <Button size="lg" className="rounded-full bg-primary">Book Appointment</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
