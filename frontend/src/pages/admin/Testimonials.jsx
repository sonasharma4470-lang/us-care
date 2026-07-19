import React, { useEffect, useState } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/testimonials");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    await api.put(`/admin/testimonials/${t.id}`, { ...t, approved: !t.approved });
    toast.success(t.approved ? "Rejected" : "Approved");
    load();
  };
  const remove = async (id) => {
    if (!confirm("Delete this review?")) return;
    await api.delete(`/admin/testimonials/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4" data-testid="admin-testimonials">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Reviews</h1>
        <p className="text-muted-foreground text-sm">{items.length} review(s)</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-5" data-testid={`review-card-${t.id}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.city} • {t.treatment}</div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />)}
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/85">"{t.review}"</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`pill ${t.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{t.approved ? "Approved" : "Pending"}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => toggle(t)} data-testid={`review-toggle-${t.id}`}>
                  {t.approved ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(t.id)} data-testid={`review-delete-${t.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-2 text-center py-8 text-muted-foreground">No reviews yet.</div>}
      </div>
    </div>
  );
}
