import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const empty = {
  name: "", slug: "", image: "", short_description: "", description: "",
  category: "", duration: "", price: "", featured: false, active: true, display_order: 0,
};

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/services", { params: { active: false } });
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (d) => { setEditing(d); setForm({ ...empty, ...d }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 0 };
      if (editing) await api.put(`/admin/services/${editing.id}`, payload);
      else await api.post("/admin/services", payload);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this service?")) return;
    await api.delete(`/admin/services/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4" data-testid="admin-services">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Services</h1>
          <p className="text-muted-foreground text-sm">{items.length} service(s)</p>
        </div>
        <Button onClick={startCreate} className="rounded-full bg-primary" data-testid="svc-add-btn">
          <Plus className="w-4 h-4 mr-1" /> Add Service
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Image</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-border" data-testid={`svc-row-${s.id}`}>
                  <td className="p-3"><img src={s.image} alt={s.name} className="w-14 h-10 rounded object-cover" /></td>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.category}</td>
                  <td className="p-3">
                    <span className={`pill ${s.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{s.active ? "Active" : "Inactive"}</span>
                    {s.featured && <span className="pill ml-1 bg-primary/10 text-primary">Featured</span>}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => startEdit(s)} data-testid={`svc-edit-${s.id}`}><Edit2 className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => remove(s.id)} data-testid={`svc-delete-${s.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No services yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="svc-form-name" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></div>
              <div><Label>Price</Label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></div>
            </div>
            <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} data-testid="svc-form-image" /></div>
            <div><Label>Short Description</Label><Textarea rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} data-testid="svc-form-short" /></div>
            <div><Label>Description</Label><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="svc-form-desc" /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} data-testid="svc-form-featured" /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary" data-testid="svc-form-save">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
