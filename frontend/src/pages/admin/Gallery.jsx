import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageUploader from "@/components/ImageUploader";
import { resolveImageUrl } from "@/components/SafeImage";

const empty = { title: "", image: "", category: "Clinic", description: "", display_order: 0 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/gallery");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (g) => { setEditing(g); setForm({ ...empty, ...g }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, display_order: Number(form.display_order) || 0 };
    if (editing) await api.put(`/admin/gallery/${editing.id}`, payload);
    else await api.post("/admin/gallery", payload);
    toast.success("Saved");
    setOpen(false);
    load();
  };
  const remove = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/admin/gallery/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4" data-testid="admin-gallery">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold">Gallery</h1>
        <Button onClick={startCreate} className="rounded-full bg-primary" data-testid="gal-add-btn"><Plus className="w-4 h-4 mr-1" /> Add Image</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((g) => (
          <div key={g.id} className="rounded-2xl overflow-hidden border border-border bg-white dark:bg-slate-900" data-testid={`gal-card-${g.id}`}>
            <img src={resolveImageUrl(g.image)} alt={g.title} className="w-full h-40 object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.4'; }} />
            <div className="p-3">
              <div className="text-xs text-primary uppercase tracking-wider">{g.category}</div>
              <div className="text-sm font-medium truncate">{g.title}</div>
              <div className="mt-2 flex gap-1">
                <Button size="sm" variant="outline" onClick={() => startEdit(g)} data-testid={`gal-edit-${g.id}`}><Edit2 className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => remove(g.id)} data-testid={`gal-delete-${g.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Gallery Image</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="gal-form-title" /></div>
            <div><Label>Image</Label><ImageUploader value={form.image || ""} onChange={(url) => setForm({ ...form, image: url })} kind="gallery" aspect="wide" testid="gal-form-image-uploader" /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary" data-testid="gal-form-save">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
