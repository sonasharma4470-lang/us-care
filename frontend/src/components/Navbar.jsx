import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon, Phone, Calendar, MessageCircle, Search } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/components/SafeImage";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/doctors", label: "Doctors" },
  { to: "/gallery", label: "Gallery" },
  { to: "/testimonials", label: "Reviews" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300 ${
        scrolled ? "glass shadow-[0_4px_20px_rgba(11,143,211,0.08)]" : "bg-transparent"
      }`}
      data-testid="site-navbar"
    >
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo-link">
          {settings.logo ? (
            <img src={resolveImageUrl(settings.logo)} alt={settings.clinic_name || "Logo"} className="w-10 h-10 rounded-xl object-cover shadow-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-heading text-lg font-bold shadow-lg">
              US
            </div>
          )}
          <div className="hidden sm:block leading-tight">
            <div className="font-heading font-semibold text-base text-foreground">{settings.clinic_name || "CARE WITH US"}</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">Physiotherapy Clinic</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-lg hover:text-primary ${
                  isActive ? "text-primary" : "text-foreground/80"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-secondary text-foreground"
            data-testid="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <a
            href={`tel:${settings.phone}`}
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary px-3 py-2"
            data-testid="nav-call-link"
          >
            <Phone className="w-4 h-4" /> {settings.phone}
          </a>
          <Link to="/appointment" data-testid="nav-book-appointment-btn">
            <Button className="hidden md:inline-flex rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-5 shadow-md">
              <Calendar className="w-4 h-4 mr-2" /> Book Appointment
            </Button>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-10 h-10 grid place-items-center rounded-full hover:bg-secondary text-foreground"
            data-testid="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden glass border-t border-border" data-testid="nav-mobile-menu">
          <div className="container-x py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm ${isActive ? "text-primary bg-primary/5" : "text-foreground/80"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/appointment" className="mt-2" data-testid="nav-mobile-book-btn">
              <Button className="w-full rounded-full bg-primary text-primary-foreground">
                <Calendar className="w-4 h-4 mr-2" /> Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
