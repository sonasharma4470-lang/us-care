import React from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, Stethoscope, Sparkles, Star, Image as ImageIcon, MessageSquare, FileText, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/testimonials", label: "Reviews", icon: Star },
  { to: "/admin/blogs", label: "Blogs", icon: FileText },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/admin/contact", label: "Contact", icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground flex" data-testid="admin-layout">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-border">
        <Link to="/admin" className="flex items-center gap-2 h-16 px-5 border-b border-border" data-testid="admin-sidebar-logo">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-heading font-bold">US</div>
          <div>
            <div className="font-heading text-sm font-semibold">Upadhyay Sharma</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Admin Panel</div>
          </div>
        </Link>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={`admin-nav-${it.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-secondary"
                }`
              }
            >
              <it.icon className="w-4 h-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2 truncate">{user?.email}</div>
          <Button onClick={doLogout} variant="outline" className="w-full" data-testid="admin-logout-btn">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-14 bg-white dark:bg-slate-900 border-b border-border flex items-center justify-between px-4">
          <Link to="/admin" className="font-heading font-semibold">Admin</Link>
          <Button onClick={doLogout} variant="outline" size="sm" data-testid="admin-mobile-logout-btn">
            <LogOut className="w-4 h-4" />
          </Button>
        </header>
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-border overflow-x-auto flex gap-1 p-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={`admin-mobile-nav-${it.label.toLowerCase()}`}
              className={({ isActive }) =>
                `shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 bg-secondary"
                }`
              }
            >
              <it.icon className="w-3.5 h-3.5" />
              {it.label}
            </NavLink>
          ))}
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
