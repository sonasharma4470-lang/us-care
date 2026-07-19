import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";

export default function AdminSettings() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/settings", {
        ...form,
        counters: {
          happy_patients: Number(form.counters?.happy_patients) || 0,
          years_experience: Number(form.counters?.years_experience) || 0,
          treatments_completed: Number(form.counters?.treatments_completed) || 0,
          recovery_rate: Number(form.counters?.recovery_rate) || 0,
          home_visits: Number(form.counters?.home_visits) || 0,
        },
        hero_slides: form.hero_slides || [],
      });
      toast.success("Settings saved");
      refresh();
    } catch (e) { toast.error("Failed"); }
    finally { setSaving(false); }
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateNested = (parent, k, v) => setForm((f) => ({ ...f, [parent]: { ...(f[parent] || {}), [k]: v } }));

  return (
    <form onSubmit={save} className="space-y-6" data-testid="admin-settings">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage clinic information</p>
        </div>
        <Button type="submit" disabled={saving} className="rounded-full bg-primary" data-testid="settings-save-btn">
          <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Section title="Clinic Info">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Clinic Name"><Input value={form.clinic_name || ""} onChange={(e) => update("clinic_name", e.target.value)} data-testid="settings-clinic-name" /></Field>
          <Field label="Tagline"><Input value={form.tagline || ""} onChange={(e) => update("tagline", e.target.value)} /></Field>
          <Field label="Logo URL" className="sm:col-span-2">
            <div className="flex gap-3 items-center">
              <Input value={form.logo || ""} onChange={(e) => update("logo", e.target.value)} placeholder="https://.../logo.png" data-testid="settings-logo" />
              {form.logo && <img src={form.logo} alt="Logo preview" className="w-12 h-12 rounded-lg object-cover border border-border" onError={(e) => { e.currentTarget.style.display='none'; }} />}
            </div>
          </Field>
          <Field label="Phone"><Input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} data-testid="settings-phone" /></Field>
          <Field label="WhatsApp"><Input value={form.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email || ""} onChange={(e) => update("email", e.target.value)} /></Field>
          <Field label="Emergency"><Input value={form.emergency || ""} onChange={(e) => update("emergency", e.target.value)} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={form.address || ""} onChange={(e) => update("address", e.target.value)} /></Field>
          <Field label="Google Maps Embed URL" className="sm:col-span-2"><Input value={form.google_maps_url || ""} onChange={(e) => update("google_maps_url", e.target.value)} /></Field>
          <Field label="Footer Description" className="sm:col-span-2"><Textarea rows={2} value={form.footer_text || ""} onChange={(e) => update("footer_text", e.target.value)} data-testid="settings-footer-text" /></Field>
        </div>
      </Section>

      <Section title="About">
        <Field label="Mission"><Textarea rows={2} value={form.mission || ""} onChange={(e) => update("mission", e.target.value)} /></Field>
        <Field label="Vision"><Textarea rows={2} value={form.vision || ""} onChange={(e) => update("vision", e.target.value)} /></Field>
        <Field label="About"><Textarea rows={4} value={form.about || ""} onChange={(e) => update("about", e.target.value)} /></Field>
      </Section>

      <Section title="Counters">
        <div className="grid sm:grid-cols-5 gap-3">
          {["happy_patients","years_experience","treatments_completed","recovery_rate","home_visits"].map((k) => (
            <Field key={k} label={k.replace(/_/g, " ")}>
              <Input type="number" value={form.counters?.[k] ?? 0} onChange={(e) => updateNested("counters", k, e.target.value)} data-testid={`settings-counter-${k}`} />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Social Links">
        <div className="grid sm:grid-cols-2 gap-3">
          {["facebook","instagram","youtube","linkedin"].map((k) => (
            <Field key={k} label={k}>
              <Input value={form.social?.[k] || ""} onChange={(e) => updateNested("social", k, e.target.value)} />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Business Hours">
        <div className="grid sm:grid-cols-2 gap-3">
          {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((k) => (
            <Field key={k} label={k}>
              <Input value={form.business_hours?.[k] || ""} onChange={(e) => updateNested("business_hours", k, e.target.value)} />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Hero Slides">
        <p className="text-xs text-muted-foreground -mt-1">These appear on the homepage banner. Add up to 5 slides.</p>
        <div className="space-y-3">
          {(form.hero_slides || []).map((slide, idx) => (
            <div key={idx} className="rounded-xl border border-border p-4 space-y-2 bg-secondary/30" data-testid={`settings-hero-slide-${idx}`}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Slide {idx + 1}</div>
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const next = [...(form.hero_slides || [])];
                  next.splice(idx, 1);
                  update("hero_slides", next);
                }} data-testid={`settings-hero-remove-${idx}`}>Remove</Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div><Label className="text-xs">Image URL</Label><Input value={slide.image || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], image: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div><Label className="text-xs">CTA Link</Label><Input value={slide.cta_link || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], cta_link: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div><Label className="text-xs">Heading</Label><Input value={slide.heading || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], heading: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div><Label className="text-xs">CTA Text</Label><Input value={slide.cta_text || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], cta_text: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div className="sm:col-span-2"><Label className="text-xs">Subheading</Label><Input value={slide.subheading || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], subheading: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div className="sm:col-span-2"><Label className="text-xs">Description</Label><Textarea rows={2} value={slide.description || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], description: e.target.value }; update("hero_slides", next);
                }} /></div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => {
            const next = [...(form.hero_slides || []), { image: "", heading: "", subheading: "", description: "", cta_text: "Book Appointment", cta_link: "/appointment" }];
            update("hero_slides", next);
          }} data-testid="settings-hero-add">+ Add Slide</Button>
        </div>
      </Section>
    </form>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 space-y-3">
      <h3 className="font-heading text-xl font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <Label className="capitalize">{label}</Label>
      {children}
    </div>
  );
}
