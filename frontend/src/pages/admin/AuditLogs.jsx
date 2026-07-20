import React, { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import api from "@/lib/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/audit-logs").then((r) => setLogs(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4" data-testid="admin-audit-logs">
      <div className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="font-heading text-3xl font-semibold">Activity Log</h1>
      </div>
      <p className="text-muted-foreground text-sm">Sensitive admin actions tracked here for security review.</p>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Details</th>
                <th className="text-left p-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-border" data-testid={`audit-row-${l.id}`}>
                  <td className="p-3 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-3">{l.user_email || "-"}</td>
                  <td className="p-3"><span className="pill bg-primary/10 text-primary">{l.action}</span></td>
                  <td className="p-3 text-xs text-muted-foreground max-w-md truncate" title={JSON.stringify(l.details)}>{JSON.stringify(l.details)}</td>
                  <td className="p-3 text-xs text-muted-foreground">{l.ip || "-"}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
