import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const empty = { title: "", slug: "", excerpt: "", content: "", featured_image: "", author: "Admin", category: "", status: "published", featured: false };

export default function AdminBlogs() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/admin/blogs");
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (b) => { setEditing(b); setForm({ ...empty, ...b }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/blogs/${editing.id}`, form);
      else await api.post("/admin/blogs", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error("Failed"); }
  };
  const remove = async (id) => {
    if (!confirm("Delete this blog?")) return;
    await api.delete(`/admin/blogs/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4" data-testid="admin-blogs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Blogs</h1>
          <p className="text-muted-foreground text-sm">{items.length} post(s)</p>
        </div>
        <Button onClick={startCreate} className="rounded-full bg-primary" data-testid="blog-add-btn">
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border divide-y divide-border">
        {items.map((b) => (
          <div key={b.id} className="p-4 flex items-center gap-4" data-testid={`blog-row-${b.id}`}>
            <img src={b.featured_image} alt={b.title} className="w-20 h-14 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{b.title}</div>
              <div className="text-xs text-muted-foreground">{b.category} • {b.status} • {new Date(b.created_at).toLocaleDateString()}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(b)} data-testid={`blog-edit-${b.id}`}><Edit2 className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="outline" onClick={() => remove(b.id)} data-testid={`blog-delete-${b.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="p-8 text-center text-muted-foreground">No blogs yet.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Blog" : "New Blog"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="blog-form-title" /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            </div>
            <div><Label>Featured Image URL</Label><Input value={form.featured_image} onChange={(e) => setForm({ ...form, featured_image: e.target.value })} data-testid="blog-form-image" /></div>
            <div><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
            <div><Label>Content (HTML supported)</Label><Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} data-testid="blog-form-content" /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.status === "published"} onCheckedChange={(v) => setForm({ ...form, status: v ? "published" : "draft" })} /> Published</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary" data-testid="blog-form-save">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
