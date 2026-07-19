import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GraduationCap, Award, Clock, Languages, IndianRupee, ArrowLeft, Calendar, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import SafeImage from "@/components/SafeImage";

export default function DoctorDetail() {
  const { id } = useParams();
  const { settings } = useSettings();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${id}`).then((r) => setDoctor(r.data));
    window.scrollTo(0, 0);
  }, [id]);

  if (!doctor) return <div className="min-h-[60vh] grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div data-testid="doctor-detail-page">
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x">
          <Link to="/doctors" className="text-muted-foreground hover:text-primary text-sm inline-flex items-center gap-1" data-testid="doctor-back-link">
            <ArrowLeft className="w-4 h-4" /> Back to doctors
          </Link>
        </div>
      </section>
      <section className="section pt-8">
        <div className="container-x grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-secondary">
              <SafeImage src={doctor.photo} alt={doctor.name} className="img-cover" eager />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="pill bg-primary/10 text-primary">{doctor.specialization}</div>
            <h1 className="font-heading text-4xl md:text-5xl font-semibold mt-3">{doctor.name}</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">{doctor.biography}</p>

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <InfoItem icon={GraduationCap} label="Qualification" value={doctor.qualification} />
              <InfoItem icon={Award} label="Experience" value={doctor.experience} />
              <InfoItem icon={Clock} label="Availability" value={`${doctor.working_days} • ${doctor.working_hours}`} />
              <InfoItem icon={IndianRupee} label="Consultation Fee" value={doctor.consultation_fee} />
              <InfoItem icon={Languages} label="Languages" value={(doctor.languages || []).join(", ")} />
              <InfoItem icon={Award} label="Registration No." value={doctor.registration_number} />
            </div>

            {doctor.awards?.length > 0 && (
              <div className="mt-8">
                <h3 className="font-heading text-xl font-semibold">Awards & Certifications</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {doctor.awards.map((a, i) => (
                    <span key={i} className="pill bg-secondary text-foreground/80">{a}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-3">
              <Link to="/appointment" data-testid="doctor-detail-book-btn">
                <Button className="rounded-full bg-primary"><Calendar className="w-4 h-4 mr-2" /> Book Appointment</Button>
              </Link>
              <a href={`https://wa.me/${(settings.whatsapp || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello, I'd like to book with ${doctor.name}`)}`} target="_blank" rel="noreferrer" data-testid="doctor-detail-whatsapp-btn">
                <Button variant="outline" className="rounded-full"><MessageCircle className="w-4 h-4 mr-2" /> WhatsApp</Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-secondary">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
