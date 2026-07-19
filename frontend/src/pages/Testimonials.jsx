import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SectionTitle from "@/components/SectionTitle";

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", treatment: "", rating: 5, review: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Reviews — CARE WITH US Physiotherapy";
    api.get("/testimonials").then((r) => setItems(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/testimonials", form);
      toast.success("Thank you! Your review has been submitted for approval.");
      setForm({ name: "", city: "", treatment: "", rating: 5, review: "" });
    } catch (err) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="testimonials-page">
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="container-x text-center max-w-3xl mx-auto">
          <div className="pill bg-primary/10 text-primary mb-4">Patient Stories</div>
          <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight">Trusted by thousands.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((t) => (
              <div key={t.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6" data-testid={`testimonial-${t.id}`}>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, s) => <Star key={s} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">“{t.review}”</p>
                <div className="mt-5 flex items-center gap-3">
                  {t.photo && <img src={t.photo} alt={t.name} className="w-11 h-11 rounded-full object-cover" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display='none'; }} />}
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.treatment} • {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-x max-w-2xl">
          <SectionTitle eyebrow="Share Your Experience" title="Leave a review" subtitle="Your review helps others discover great care. It will appear after approval." />
          <form onSubmit={submit} className="space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-border p-6" data-testid="testimonial-form">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tname">Name</Label>
                <Input id="tname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="testimonial-name-input" />
              </div>
              <div>
                <Label htmlFor="tcity">City</Label>
                <Input id="tcity" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} data-testid="testimonial-city-input" />
              </div>
              <div>
                <Label htmlFor="ttreat">Treatment</Label>
                <Input id="ttreat" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} data-testid="testimonial-treatment-input" />
              </div>
              <div>
                <Label>Rating</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} data-testid={`testimonial-star-${n}`}>
                      <Star className={`w-6 h-6 ${n <= form.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="treview">Your Review</Label>
              <Textarea id="treview" required rows={4} value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} data-testid="testimonial-review-input" />
            </div>
            <Button type="submit" disabled={submitting} className="rounded-full bg-primary" data-testid="testimonial-submit-btn">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
