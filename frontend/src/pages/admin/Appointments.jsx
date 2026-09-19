import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-purple-100 text-purple-800",
  no_show: "bg-slate-200 text-slate-700",
};

const STATUSES = ["pending", "confirmed", "rescheduled", "completed", "cancelled", "no_show"];

export default function AdminAppointments() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
  const params = filter !== "all" ? { status_filter: filter } : {};
  const { data } = await api.get("/admin/appointments", { params });
  setItems(data);
}, [filter]);

useEffect(() => {
  load();
}, [load]);
  
  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      toast.success("Status updated");
      load();
    } catch (e) { toast.error("Failed"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this appointment?")) return;
    await api.delete(`/admin/appointments/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4" data-testid="admin-appointments">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Appointments</h1>
          <p className="text-muted-foreground text-sm">{items.length} record(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40" data-testid="apt-filter-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Patient</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Service</th>
                <th className="text-left p-3">Doctor</th>
                <th className="text-left p-3">Date/Time</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t border-border" data-testid={`apt-row-${a.id}`}>
                  <td className="p-3 font-mono text-xs">{a.appointment_code}</td>
                  <td className="p-3">
                    <div className="font-medium">{a.patient_name}</div>
                    <div className="text-xs text-muted-foreground">{a.age ? `${a.age}y • ` : ""}{a.gender}</div>
                  </td>
                  <td className="p-3">{a.phone}</td>
                  <td className="p-3">{a.service_name || "-"}</td>
                  <td className="p-3">{a.doctor_name || "-"}</td>
                  <td className="p-3">{a.preferred_date} {a.preferred_time}</td>
                  <td className="p-3">
                    <Badge className={STATUS_COLORS[a.status] || ""}>{a.status}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                        <SelectTrigger className="h-8 w-32" data-testid={`apt-status-${a.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => remove(a.id)} data-testid={`apt-delete-${a.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No appointments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
