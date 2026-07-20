import React, { useEffect, useState } from "react";
import { Save, KeyRound, User } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploader from "@/components/ImageUploader";
import { resolveImageUrl } from "@/components/SafeImage";

export default function AdminAccount() {
  const [profile, setProfile] = useState({ name: "", display_name: "", email: "", avatar: "", recovery_email: "" });
  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.get("/admin/account/me").then((r) => setProfile({
      name: r.data.name || "",
      display_name: r.data.display_name || r.data.name || "",
      email: r.data.email || "",
      avatar: r.data.avatar || "",
      recovery_email: r.data.recovery_email || "",
    })).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/admin/account/me", profile);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.new_password !== pw.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPw(true);
    try {
      await api.post("/admin/account/change-password", {
        current_password: pw.current_password,
        new_password: pw.new_password,
      });
      toast.success("Password changed. Please use it next time you log in.");
      setPw({ current_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Change failed");
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-account-page">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Account</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, credentials, and security.</p>
      </div>

      <form onSubmit={saveProfile} className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 space-y-4" data-testid="account-profile-form">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Profile</h2>
        </div>
        <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
          <div>
            <Label>Profile Photo</Label>
            <ImageUploader value={profile.avatar} onChange={(url) => setProfile({ ...profile, avatar: url })} kind="misc" aspect="square" testid="account-avatar-uploader" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Full Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} data-testid="account-name-input" /></div>
            <div><Label>Display Name</Label><Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} data-testid="account-display-name-input" /></div>
            <div><Label>Email (Login)</Label><Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} data-testid="account-email-input" /></div>
            <div><Label>Recovery Email</Label><Input type="email" value={profile.recovery_email} onChange={(e) => setProfile({ ...profile, recovery_email: e.target.value })} data-testid="account-recovery-input" /></div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={savingProfile} className="rounded-full bg-primary" data-testid="account-save-btn">
            <Save className="w-4 h-4 mr-1" /> {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>

      <form onSubmit={changePassword} className="rounded-2xl bg-white dark:bg-slate-900 border border-border p-6 space-y-4" data-testid="account-password-form">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Change Password</h2>
        </div>
        <p className="text-xs text-muted-foreground">Password must be ≥ 8 characters, contain an uppercase letter and a digit.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div><Label>Current Password</Label><Input type="password" required value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} data-testid="account-pw-current" /></div>
          <div><Label>New Password</Label><Input type="password" required value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} data-testid="account-pw-new" /></div>
          <div><Label>Confirm New Password</Label><Input type="password" required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} data-testid="account-pw-confirm" /></div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={savingPw} className="rounded-full bg-primary" data-testid="account-change-pw-btn">
            {savingPw ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
