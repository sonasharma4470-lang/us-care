import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function PrivacyPolicy() {
  const { settings } = useSettings();
  useEffect(() => {
    document.title = "Privacy Policy — CARE WITH US Physiotherapy";
    window.scrollTo(0, 0);
  }, []);
  const clinic = settings.clinic_name || "CARE WITH US";
  const email = settings.email || "info@carewithus.in";
  const address = settings.address || "";

  const Section = ({ title, children }) => (
    <section className="mb-8">
      <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">{title}</h2>
      <div className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );

  return (
    <div data-testid="privacy-policy-page">
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x">
          <Link to="/" className="text-muted-foreground hover:text-primary text-sm inline-flex items-center gap-1 mb-4" data-testid="privacy-back-link">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="pill bg-primary/10 text-primary mb-4"><ShieldCheck className="w-3 h-3 mr-1 inline" /> Privacy Policy</div>
          <h1 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight">Your privacy matters to us.</h1>
          <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-2xl">This policy explains how {clinic} collects, uses, and safeguards your information when you visit our website or use our services.</p>
          <p className="mt-2 text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-x max-w-3xl">
          <Section title="1. Information Collection">
            <p>We collect information you provide directly to us — such as when you book an appointment, submit an enquiry, or subscribe to updates. We also collect limited technical information automatically to keep the site functioning and secure.</p>
          </Section>

          <Section title="2. Appointment Information">
            <p>When you book an appointment through our website, we collect your name, phone number, WhatsApp number (optional), email, age, gender, address (for home visits), preferred service, preferred doctor, preferred date & time, and any medical notes you share. This information is used solely to schedule, confirm, and deliver care.</p>
          </Section>

          <Section title="3. Personal Data">
            <p>We treat all personal and medical data with strict confidentiality. Access is limited to the clinic team involved in your care. We do not sell, rent, or trade your personal data.</p>
          </Section>

          <Section title="4. Cookies">
            <p>We use minimal cookies to remember your theme preference (dark/light) and to keep authenticated admin sessions active. You can clear these anytime through your browser settings.</p>
          </Section>

          <Section title="5. Analytics">
            <p>We may use privacy-respecting analytics tools to understand which pages are most useful. Analytics do not include patient medical information.</p>
          </Section>

          <Section title="6. Data Security">
            <p>Your data is stored on secure servers with encrypted connections (HTTPS). Passwords are hashed. Access requires authentication. Uploaded files are stored in a persistent object storage layer with authenticated access.</p>
          </Section>

          <Section title="7. Third-Party Services">
            <p>We may use third-party services for email delivery (SMTP), WhatsApp messaging, map embedding, and hosting. These providers are chosen for their compliance and security standards, and they only receive the data necessary to perform the requested service.</p>
          </Section>

          <Section title="8. User Rights">
            <p>You have the right to access, correct, or request deletion of your personal information. To exercise these rights, please contact us using the details below.</p>
          </Section>

          <Section title="9. Contact Information">
            <p>{clinic}</p>
            {address && <p>{address}</p>}
            <p>Email: <a href={`mailto:${email}`} className="text-primary hover:underline" data-testid="privacy-contact-email">{email}</a></p>
            {settings.phone && <p>Phone: <a href={`tel:${settings.phone}`} className="text-primary hover:underline">{settings.phone}</a></p>}
          </Section>

          <p className="text-xs text-muted-foreground border-t border-border pt-6">
            This policy may be updated periodically. Continued use of the website after updates constitutes acceptance of the revised policy.
          </p>
        </div>
      </section>
    </div>
  );
}
