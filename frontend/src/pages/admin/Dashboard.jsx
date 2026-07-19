import React, { useEffect, useState } from "react";
import { CalendarCheck, Clock, Users, Stethoscope, Sparkles, Star, MessageSquare, TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import api from "@/lib/api";

const StatCard = ({ icon: Icon, label, value, tone = "primary" }) => (
  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-5" data-testid={`stat-${label.replace(/\s+/g, "-").toLowerCase()}`}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-2 font-heading text-3xl font-semibold">{value}</div>
      </div>
      <div className={`w-11 h-11 rounded-xl grid place-items-center ${tone === "primary" ? "bg-primary/10 text-primary" : tone === "accent" ? "bg-accent/10 text-accent" : "bg-yellow-100 text-yellow-700"}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your clinic activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Total Appointments" value={stats.total_appointments} />
        <StatCard icon={Clock} label="Pending" value={stats.pending_appointments} tone="warn" />
        <StatCard icon={CalendarCheck} label="Today's Appointments" value={stats.today_appointments} tone="accent" />
        <StatCard icon={Users} label="Total Patients" value={stats.total_patients} />
        <StatCard icon={Stethoscope} label="Active Doctors" value={stats.total_doctors} tone="accent" />
        <StatCard icon={Sparkles} label="Services" value={stats.total_services} />
        <StatCard icon={Star} label="Reviews" value={`${stats.approved_reviews}/${stats.total_reviews}`} tone="warn" />
        <StatCard icon={MessageSquare} label="New Contact Requests" value={stats.contact_new} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-lg font-semibold">Appointments — Last 6 Months</h3>
              <p className="text-xs text-muted-foreground">Trend of appointment requests</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthly_appointments}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-primary to-accent text-white p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-2xl font-semibold">Welcome back, Admin</h3>
            <p className="mt-2 text-white/85 text-sm">Manage every part of your clinic from here — appointments, doctors, services, and content.</p>
          </div>
          <div className="mt-6 text-xs text-white/75">Tip: Use the sidebar to navigate quickly between sections.</div>
        </div>
      </div>
    </div>
  );
}
