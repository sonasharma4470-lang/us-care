import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Award, Clock, Calendar } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/components/SectionTitle";
import SafeImage from "@/components/SafeImage";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    document.title = "Doctors — CARE WITH US Physiotherapy";
    api.get("/doctors").then((r) => setDoctors(r.data));
  }, []);

  return (
    <div data-testid="doctors-page">
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">Our Team</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">Meet our expert physiotherapists.</h1>
          <p className="mt-5 text-muted-foreground text-lg">Certified professionals with decades of combined experience.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
            {doctors.map((d, idx) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-border hover:shadow-xl"
                style={{ transitionProperty: "box-shadow", transitionDuration: "300ms" }}
                data-testid={`doctor-card-${d.id}`}
              >
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <SafeImage src={d.photo} alt={d.name} className="img-cover" />
                </div>
                <div className="p-3 sm:p-6">
                  <h3 className="font-heading text-base sm:text-xl font-semibold line-clamp-1">{d.name}</h3>
                  <div className="text-[10px] sm:text-sm text-primary uppercase tracking-wider mt-1 line-clamp-1">{d.specialization}</div>
                  <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5 text-xs sm:text-sm hidden sm:block">
                    <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="w-4 h-4 text-primary" /> {d.qualification}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Award className="w-4 h-4 text-primary" /> {d.experience}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" /> {d.working_days} • {d.working_hours}</div>
                  </div>
                  <div className="mt-3 sm:mt-5 flex gap-1.5 sm:gap-2">
                    <Link to={`/doctors/${d.id}`} className="flex-1" data-testid={`doctor-view-${d.id}`}>
                      <Button variant="outline" size="sm" className="w-full rounded-full text-xs h-8 sm:h-9">View</Button>
                    </Link>
                    <Link to="/appointment" className="flex-1" data-testid={`doctor-book-${d.id}`}>
                      <Button size="sm" className="w-full rounded-full bg-primary text-xs h-8 sm:h-9"><Calendar className="w-3.5 h-3.5 mr-1" /> Book</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
