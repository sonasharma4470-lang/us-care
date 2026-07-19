import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, Calendar, ArrowUp } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waNumber = (settings.whatsapp || "").replace(/[^0-9]/g, "");

  return (
    <div className="fixed right-4 md:right-6 bottom-4 md:bottom-6 z-40 flex flex-col gap-3" data-testid="floating-buttons">
      <a
        href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hello, I would like to book a physiotherapy appointment.")}`}
        target="_blank"
        rel="noreferrer"
        data-testid="floating-whatsapp-btn"
        className="w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110"
        style={{ transitionProperty: "transform, background-color", transitionDuration: "200ms" }}
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
      </a>
      <a
        href={`tel:${settings.phone}`}
        data-testid="floating-call-btn"
        className="w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110"
        style={{ transitionProperty: "transform, background-color", transitionDuration: "200ms" }}
        aria-label="Call"
      >
        <Phone className="w-5 h-5" />
      </a>
      <Link
        to="/appointment"
        data-testid="floating-appointment-btn"
        className="w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-full bg-accent text-accent-foreground shadow-lg hover:scale-110"
        style={{ transitionProperty: "transform, background-color", transitionDuration: "200ms" }}
        aria-label="Book Appointment"
      >
        <Calendar className="w-5 h-5" />
      </Link>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          data-testid="floating-scroll-top-btn"
          className="w-12 h-12 md:w-14 md:h-14 grid place-items-center rounded-full bg-slate-900 text-white shadow-lg hover:scale-110"
          style={{ transitionProperty: "transform, background-color", transitionDuration: "200ms" }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
