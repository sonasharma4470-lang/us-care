import React, { useEffect, useState } from "react";
import { Save, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/SettingsContext";
import ImageUploader from "@/components/ImageUploader";

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

  const testNotification = async (channel) => {
    try {
      const { data } = await api.post("/admin/notifications/test", { channel });
      toast[data.ok ? "success" : "error"](`${channel}: ${data.detail || (data.ok ? "sent" : "failed")}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Test failed");
    }
  };

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
          <Field label="Logo" className="sm:col-span-2">
            <ImageUploader value={form.logo || ""} onChange={(url) => update("logo", url)} kind="logo" aspect="square" testid="settings-logo-uploader" />
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
                <div className="sm:col-span-2">
                  <Label className="text-xs">Image</Label>
                  <ImageUploader value={slide.image || ""} onChange={(url) => {
                    const next = [...form.hero_slides]; next[idx] = { ...next[idx], image: url }; update("hero_slides", next);
                  }} kind="hero" aspect="wide" testid={`settings-hero-image-${idx}`} />
                </div>
                <div><Label className="text-xs">CTA Link</Label><Input value={slide.cta_link || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], cta_link: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div><Label className="text-xs">CTA Text</Label><Input value={slide.cta_text || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], cta_text: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div><Label className="text-xs">Heading</Label><Input value={slide.heading || ""} onChange={(e) => {
                  const next = [...form.hero_slides]; next[idx] = { ...next[idx], heading: e.target.value }; update("hero_slides", next);
                }} /></div>
                <div><Label className="text-xs">Subheading</Label><Input value={slide.subheading || ""} onChange={(e) => {
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

      <Section title="Email Notifications (SMTP)">
        <p className="text-xs text-muted-foreground -mt-1">When enabled, every new appointment and contact enquiry sends an email to the admin address below.</p>
        <div className="flex items-center gap-2">
          <Switch checked={!!form.notifications?.email_enabled} onCheckedChange={(v) => updateNested("notifications", "email_enabled", v)} data-testid="settings-email-enabled" />
          <span className="text-sm">Enable email notifications</span>
          <Button type="button" variant="outline" size="sm" onClick={() => testNotification("email")} className="ml-auto" data-testid="settings-test-email"><Mail className="w-3.5 h-3.5 mr-1" /> Send Test</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Admin Email (recipient)"><Input value={form.notifications?.admin_email || ""} onChange={(e) => updateNested("notifications", "admin_email", e.target.value)} placeholder="admin@yourdomain.com" data-testid="settings-admin-email" /></Field>
          <Field label="From Address"><Input value={form.notifications?.smtp_from || ""} onChange={(e) => updateNested("notifications", "smtp_from", e.target.value)} placeholder="noreply@yourdomain.com" /></Field>
          <Field label="SMTP Host"><Input value={form.notifications?.smtp_host || ""} onChange={(e) => updateNested("notifications", "smtp_host", e.target.value)} placeholder="smtp.gmail.com" data-testid="settings-smtp-host" /></Field>
          <Field label="SMTP Port"><Input type="number" value={form.notifications?.smtp_port || 587} onChange={(e) => updateNested("notifications", "smtp_port", Number(e.target.value))} /></Field>
          <Field label="SMTP Username"><Input value={form.notifications?.smtp_username || ""} onChange={(e) => updateNested("notifications", "smtp_username", e.target.value)} data-testid="settings-smtp-username" /></Field>
          <Field label="SMTP Password"><Input type="password" value={form.notifications?.smtp_password || ""} onChange={(e) => updateNested("notifications", "smtp_password", e.target.value)} placeholder="App password / API key" data-testid="settings-smtp-password" /></Field>
        </div>
      </Section>

      <Section title="WhatsApp API Notifications">
        <p className="text-xs text-muted-foreground -mt-1">Configure Meta WhatsApp Cloud API (or another provider) to auto-send WhatsApp alerts to your team when patients book or enquire.</p>
        <div className="flex items-center gap-2">
          <Switch checked={!!form.notifications?.whatsapp_enabled} onCheckedChange={(v) => updateNested("notifications", "whatsapp_enabled", v)} data-testid="settings-whatsapp-enabled" />
          <span className="text-sm">Enable WhatsApp notifications</span>
          <Button type="button" variant="outline" size="sm" onClick={() => testNotification("whatsapp")} className="ml-auto" data-testid="settings-test-whatsapp"><MessageCircle className="w-3.5 h-3.5 mr-1" /> Send Test</Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Provider"><Input value={form.notifications?.whatsapp_provider || "meta"} onChange={(e) => updateNested("notifications", "whatsapp_provider", e.target.value)} placeholder="meta" /></Field>
          <Field label="Admin WhatsApp Number"><Input value={form.notifications?.whatsapp_admin_number || ""} onChange={(e) => updateNested("notifications", "whatsapp_admin_number", e.target.value)} placeholder="+91XXXXXXXXXX" data-testid="settings-whatsapp-admin" /></Field>
          <Field label="Access Token" className="sm:col-span-2"><Input type="password" value={form.notifications?.whatsapp_access_token || ""} onChange={(e) => updateNested("notifications", "whatsapp_access_token", e.target.value)} placeholder="EAAG..." data-testid="settings-whatsapp-token" /></Field>
          <Field label="Phone Number ID"><Input value={form.notifications?.whatsapp_phone_id || ""} onChange={(e) => updateNested("notifications", "whatsapp_phone_id", e.target.value)} data-testid="settings-whatsapp-phone-id" /></Field>
          <Field label="Business Account ID"><Input value={form.notifications?.whatsapp_business_id || ""} onChange={(e) => updateNested("notifications", "whatsapp_business_id", e.target.value)} /></Field>
          <Field label="Webhook URL" className="sm:col-span-2"><Input value={form.notifications?.whatsapp_webhook_url || ""} onChange={(e) => updateNested("notifications", "whatsapp_webhook_url", e.target.value)} placeholder="https://yourdomain.com/api/whatsapp/webhook" /></Field>
          <Field label="Appointment Template" className="sm:col-span-2">
            <Textarea rows={5} value={form.notifications?.whatsapp_appointment_template || ""} onChange={(e) => updateNested("notifications", "whatsapp_appointment_template", e.target.value)} placeholder={"🩺 New Appointment at {{clinic}}\nPatient: {{name}}\nPhone: {{phone}}\nService: {{service}}\nPreferred: {{date}} {{time}}\nID: {{code}}"} data-testid="settings-whatsapp-template-apt" />
          </Field>
          <Field label="Contact Enquiry Template" className="sm:col-span-2">
            <Textarea rows={4} value={form.notifications?.whatsapp_contact_template || ""} onChange={(e) => updateNested("notifications", "whatsapp_contact_template", e.target.value)} placeholder={"📩 New enquiry at {{clinic}}\nFrom: {{name}}\nPhone: {{phone}}\nMessage: {{message}}"} />
          </Field>
        </div>
      </Section>

      <Section title="Privacy Policy Content">
        <p className="text-xs text-muted-foreground -mt-1">Optional — override the default privacy policy page content with your own text. Leave empty to use the default template.</p>
        <Textarea rows={6} value={form.privacy_policy || ""} onChange={(e) => update("privacy_policy", e.target.value)} placeholder="Your custom privacy policy text (optional)..." />
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
