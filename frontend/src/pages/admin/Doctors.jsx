import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const empty = {
  name: "", photo: "", qualification: "", specialization: "", experience: "",
  registration_number: "", consultation_fee: "", working_days: "", working_hours: "",
  biography: "", featured: true, active: true, display_order: 0,
};

export default function AdminDoctors() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/doctors", { params: { active: false } });
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (d) => { setEditing(d); setForm({ ...empty, ...d }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 0 };
      if (editing) await api.put(`/admin/doctors/${editing.id}`, payload);
      else await api.post("/admin/doctors", payload);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (e) { toast.error("Failed to save"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this doctor?")) return;
    await api.delete(`/admin/doctors/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4" data-testid="admin-doctors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Doctors</h1>
          <p className="text-muted-foreground text-sm">{items.length} doctor(s)</p>
        </div>
        <Button onClick={startCreate} className="rounded-full bg-primary" data-testid="doc-add-btn">
          <Plus className="w-4 h-4 mr-1" /> Add Doctor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <div key={d.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-4" data-testid={`doc-card-${d.id}`}>
            <div className="flex gap-3">
              <img src={d.photo} alt={d.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold truncate">{d.name}</h3>
                <div className="text-xs text-primary truncate">{d.specialization}</div>
                <div className="text-xs text-muted-foreground truncate">{d.qualification} • {d.experience}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(d)} className="flex-1" data-testid={`doc-edit-${d.id}`}><Edit2 className="w-3.5 h-3.5 mr-1" /> Edit</Button>
              <Button size="sm" variant="outline" onClick={() => remove(d.id)} data-testid={`doc-delete-${d.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Doctor" : "Add Doctor"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <FieldRow label="Name" required>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="doc-form-name" />
              </FieldRow>
              <FieldRow label="Photo URL">
                <Input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} data-testid="doc-form-photo" />
              </FieldRow>
              <FieldRow label="Qualification">
                <Input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} data-testid="doc-form-qual" />
              </FieldRow>
              <FieldRow label="Specialization">
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} data-testid="doc-form-spec" />
              </FieldRow>
              <FieldRow label="Experience">
                <Input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} data-testid="doc-form-exp" />
              </FieldRow>
              <FieldRow label="Registration Number">
                <Input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} />
              </FieldRow>
              <FieldRow label="Consultation Fee">
                <Input value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} />
              </FieldRow>
              <FieldRow label="Working Days">
                <Input value={form.working_days} onChange={(e) => setForm({ ...form, working_days: e.target.value })} />
              </FieldRow>
              <FieldRow label="Working Hours">
                <Input value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: e.target.value })} />
              </FieldRow>
              <FieldRow label="Display Order">
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
              </FieldRow>
            </div>
            <FieldRow label="Biography">
              <Textarea rows={4} value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} data-testid="doc-form-bio" />
            </FieldRow>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} data-testid="doc-form-featured" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} data-testid="doc-form-active" /> Active
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary" data-testid="doc-form-save">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FieldRow({ label, children, required }) {
  return (
    <div>
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}
