import React, { useEffect, useState } from "react";
import { CheckCircle2, Calendar as CalIcon, User, Phone as PhoneIcon, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const initial = {
  patient_name: "",
  age: "",
  gender: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  service_name: "",
  doctor_name: "",
  preferred_date: "",
  preferred_time: "",
  message: "",
  delivery_preference: "clinic",
};

export default function Appointment() {
  const [form, setForm] = useState(initial);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    document.title = "Book Appointment — Upadhyay Sharma Physiotherapy";
    api.get("/services").then((r) => setServices(r.data));
    api.get("/doctors").then((r) => setDoctors(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!agree) return toast.error("Please agree to the privacy policy.");
    setSubmitting(true);
    try {
      const payload = { ...form, age: form.age ? Number(form.age) : null };
      const { data } = await api.post("/appointments", payload);
      setSuccess(data);
      setForm(initial);
      setAgree(false);
      toast.success("Appointment request received!");
    } catch (err) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] grid place-items-center px-4" data-testid="appointment-success">
        <div className="max-w-lg text-center bg-white dark:bg-slate-900 rounded-3xl border border-border p-10 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 grid place-items-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-3xl font-semibold mt-4">Appointment Received!</h2>
          <p className="mt-3 text-muted-foreground">Thank you, {success.patient_name}. Our team will contact you shortly to confirm your appointment.</p>
          <div className="mt-5 inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">Appointment ID: {success.appointment_code}</div>
          <div className="mt-8">
            <Button onClick={() => setSuccess(null)} className="rounded-full bg-primary" data-testid="appointment-new-btn">Book Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="appointment-page">
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">Book Appointment</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">Start your recovery journey.</h1>
          <p className="mt-5 text-muted-foreground text-lg">Fill in your details and we'll confirm your slot.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x max-w-4xl">
          <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-3xl border border-border p-6 md:p-10 space-y-6 shadow-sm" data-testid="appointment-form">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Patient Name" required icon={User}>
                <Input required value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} data-testid="apt-name-input" />
              </Field>
              <Field label="Phone" required icon={PhoneIcon}>
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="apt-phone-input" />
              </Field>
              <Field label="Age">
                <Input type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} data-testid="apt-age-input" />
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger data-testid="apt-gender-select"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="WhatsApp Number">
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} data-testid="apt-whatsapp-input" />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="apt-email-input" />
              </Field>
              <Field label="Treatment Required" icon={CalIcon}>
                <Select value={form.service_name} onValueChange={(v) => setForm({ ...form, service_name: v })}>
                  <SelectTrigger data-testid="apt-service-select"><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Preferred Doctor">
                <Select value={form.doctor_name} onValueChange={(v) => setForm({ ...form, doctor_name: v })}>
                  <SelectTrigger data-testid="apt-doctor-select"><SelectValue placeholder="Any available" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any Available">Any Available</SelectItem>
                    {doctors.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Preferred Date">
                <Input type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} data-testid="apt-date-input" />
              </Field>
              <Field label="Preferred Time">
                <Input type="time" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} data-testid="apt-time-input" />
              </Field>
              <Field label="Address" icon={MapPin} className="md:col-span-2">
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="For home visits" data-testid="apt-address-input" />
              </Field>
              <Field label="Additional Notes" icon={MessageSquare} className="md:col-span-2">
                <Textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} data-testid="apt-message-input" />
              </Field>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="agree" checked={agree} onCheckedChange={setAgree} data-testid="apt-agree-check" />
              <Label htmlFor="agree" className="text-sm text-muted-foreground leading-relaxed">
                I agree to be contacted regarding this appointment and consent to the privacy policy.
              </Label>
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="rounded-full bg-primary hover:bg-primary/90 h-12 px-8" data-testid="apt-submit-btn">
              {submitting ? "Submitting..." : "Request Appointment"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({ label, icon: Icon, children, required, className = "" }) {
  return (
    <div className={className}>
      <Label className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
