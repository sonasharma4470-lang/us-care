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
          <Field label="Phone"><Input value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} data-testid="settings-phone" /></Field>
          <Field label="WhatsApp"><Input value={form.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email || ""} onChange={(e) => update("email", e.target.value)} /></Field>
          <Field label="Emergency"><Input value={form.emergency || ""} onChange={(e) => update("emergency", e.target.value)} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={form.address || ""} onChange={(e) => update("address", e.target.value)} /></Field>
          <Field label="Google Maps Embed URL" className="sm:col-span-2"><Input value={form.google_maps_url || ""} onChange={(e) => update("google_maps_url", e.target.value)} /></Field>
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
