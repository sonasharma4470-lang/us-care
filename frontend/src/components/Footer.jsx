import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { resolveImageUrl } from "@/components/SafeImage";

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-950 text-slate-200 pt-20 pb-8" data-testid="site-footer">
      <div className="container-x grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2">
            {settings.logo ? (
              <img src={resolveImageUrl(settings.logo)} alt={settings.clinic_name || "Logo"} className="w-10 h-10 rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-heading text-lg font-bold">
                US
              </div>
            )}
            <div className="leading-tight">
              <div className="font-heading text-base font-semibold text-white">{settings.clinic_name || "CARE WITH US"}</div>
              <div className="text-[10px] text-slate-400 tracking-widest uppercase">Physiotherapy Clinic</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            {settings.footer_text || "Premium physiotherapy care blending science, technology and human warmth. Restore. Renew. Recover."}
          </p>
          <div className="flex gap-3 mt-5">
            {settings.social?.facebook && (
              <a href={settings.social.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-full bg-white/5 hover:bg-primary" data-testid="footer-social-facebook">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings.social?.instagram && (
              <a href={settings.social.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-full bg-white/5 hover:bg-primary" data-testid="footer-social-instagram">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {settings.social?.youtube && (
              <a href={settings.social.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-full bg-white/5 hover:bg-primary" data-testid="footer-social-youtube">
                <Youtube className="w-4 h-4" />
              </a>
            )}
            {settings.social?.linkedin && (
              <a href={settings.social.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center rounded-full bg-white/5 hover:bg-primary" data-testid="footer-social-linkedin">
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-heading text-white text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary" data-testid="footer-link-about">About</Link></li>
            <li><Link to="/services" className="hover:text-primary" data-testid="footer-link-services">Services</Link></li>
            <li><Link to="/doctors" className="hover:text-primary" data-testid="footer-link-doctors">Doctors</Link></li>
            <li><Link to="/gallery" className="hover:text-primary" data-testid="footer-link-gallery">Gallery</Link></li>
            <li><Link to="/blog" className="hover:text-primary" data-testid="footer-link-blog">Blog</Link></li>
            <li><Link to="/appointment" className="hover:text-primary" data-testid="footer-link-appointment">Book Appointment</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary" data-testid="footer-link-privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-white text-lg mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="w-4 h-4 mt-0.5 text-primary" /><span>{settings.address}</span></li>
            <li className="flex gap-3"><Phone className="w-4 h-4 mt-0.5 text-primary" /><a href={`tel:${settings.phone}`} className="hover:text-primary" data-testid="footer-phone-link">{settings.phone}</a></li>
            <li className="flex gap-3"><Mail className="w-4 h-4 mt-0.5 text-primary" /><a href={`mailto:${settings.email}`} className="hover:text-primary" data-testid="footer-email-link">{settings.email}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-white text-lg mb-4">Hours</h4>
          <ul className="space-y-1.5 text-sm">
            {Object.entries(settings.business_hours || {}).map(([day, hrs]) => (
              <li key={day} className="flex justify-between gap-3 border-b border-white/5 pb-1.5">
                <span className="capitalize text-slate-400">{day}</span>
                <span>{hrs}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">© {year} {settings.clinic_name || "Upadhyay Sharma Physiotherapist Clinic"}. All rights reserved.</p>
        <div className="flex gap-4 text-xs text-slate-500">
          <Link to="/privacy-policy" className="hover:text-primary" data-testid="footer-bottom-privacy">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-primary">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
