import React, { useEffect, useState } from "react";
import { Mail, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminContact() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await api.get("/admin/contact");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/admin/contact/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4" data-testid="admin-contact">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Contact Requests</h1>
        <p className="text-muted-foreground text-sm">{items.length} message(s)</p>
      </div>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border divide-y divide-border">
        {items.map((c) => (
          <div key={c.id} className="p-5" data-testid={`contact-row-${c.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-semibold">{c.name}</div>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                  {c.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>}
                  {c.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>}
                  <span>{new Date(c.created_at).toLocaleString()}</span>
                </div>
                {c.subject && <div className="mt-2 text-sm font-medium">{c.subject}</div>}
                <p className="mt-1 text-sm text-foreground/85">{c.message}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => remove(c.id)} data-testid={`contact-delete-${c.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-8 text-center text-muted-foreground">No messages yet.</div>}
      </div>
    </div>
  );
}
