import React from "react";
import { Wrench, Phone, Mail } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { resolveImageUrl } from "@/components/SafeImage";

export default function MaintenancePage() {
  const { settings } = useSettings();
  const m = settings.maintenance || {};
  return (
    <div className="min-h-screen grid place-items-center px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5" data-testid="maintenance-page">
      <div className="max-w-lg w-full text-center bg-white dark:bg-slate-900 rounded-3xl border border-border p-10 shadow-lg">
        {settings.logo ? (
          <img src={resolveImageUrl(settings.logo)} alt="Logo" className="w-16 h-16 mx-auto rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-heading font-bold text-xl">CW</div>
        )}
        <div className="mt-6 mx-auto w-14 h-14 rounded-full bg-primary/10 text-primary grid place-items-center">
          <Wrench className="w-6 h-6" />
        </div>
        <h1 className="mt-4 font-heading text-3xl font-semibold">{m.title || "We'll be right back"}</h1>
        <p className="mt-3 text-muted-foreground">{m.message || "Our website is undergoing scheduled maintenance. Please check back shortly."}</p>
        {(settings.phone || settings.email) && (
          <div className="mt-8 pt-6 border-t border-border space-y-2 text-sm">
            <p className="text-muted-foreground">Need urgent help?</p>
            {settings.phone && <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-2 text-primary hover:underline"><Phone className="w-4 h-4" /> {settings.phone}</a>}
            {settings.email && <div><a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 text-primary hover:underline"><Mail className="w-4 h-4" /> {settings.email}</a></div>}
          </div>
        )}
      </div>
    </div>
  );
}
