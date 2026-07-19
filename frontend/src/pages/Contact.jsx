import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      toast.success("Thanks for reaching out! We'll get back to you shortly.");
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">Contact</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">Get in touch.</h1>
          <p className="mt-5 text-muted-foreground text-lg">We're here to help. Reach us anytime.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <ContactCard icon={MapPin} title="Address" value={settings.address} />
            <ContactCard icon={Phone} title="Phone" value={settings.phone} href={`tel:${settings.phone}`} />
            <ContactCard icon={Mail} title="Email" value={settings.email} href={`mailto:${settings.email}`} />
            <ContactCard icon={Clock} title="Emergency" value={settings.emergency} href={`tel:${settings.emergency}`} />
            {settings.google_maps_url && (
              <div className="rounded-2xl overflow-hidden border border-border h-64" data-testid="contact-map">
                <iframe title="Location" src={settings.google_maps_url} width="100%" height="100%" loading="lazy" style={{ border: 0 }} allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
          <form onSubmit={submit} className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 md:p-8 space-y-4" data-testid="contact-form">
            <h3 className="font-heading text-2xl font-semibold">Send a message</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cname">Name</Label>
                <Input id="cname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="contact-name-input" />
              </div>
              <div>
                <Label htmlFor="cphone">Phone</Label>
                <Input id="cphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="contact-phone-input" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cemail">Email</Label>
                <Input id="cemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="contact-email-input" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="csubject">Subject</Label>
                <Input id="csubject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} data-testid="contact-subject-input" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cmsg">Message</Label>
                <Textarea id="cmsg" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="contact-message-input" />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="rounded-full bg-primary" data-testid="contact-submit-btn">
              <Send className="w-4 h-4 mr-2" /> {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function ContactCard({ icon: Icon, title, value, href }) {
  if (!value) return null;
  const inner = (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-border hover:border-primary/40 flex gap-4" style={{ transitionProperty: "border-color", transitionDuration: "200ms" }}>
      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
        <div className="text-sm font-medium mt-0.5">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} data-testid={`contact-${title.toLowerCase()}-link`}>{inner}</a> : inner;
}
