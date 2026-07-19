import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@upadhyaysharma.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background" data-testid="admin-login-page">
      <div className="hidden lg:block relative overflow-hidden">
        <img src="https://images.pexels.com/photos/16571733/pexels-photo-16571733.jpeg" alt="Clinic" className="img-cover" />
        <div className="absolute inset-0 hero-gradient-overlay" />
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur grid place-items-center font-heading font-bold text-lg">US</div>
          <h2 className="mt-6 font-heading text-4xl font-semibold">Upadhyay Sharma Clinic Admin</h2>
          <p className="mt-3 text-white/85">Manage appointments, doctors, services and content in one place.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-5" data-testid="admin-login-form">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-muted-foreground text-sm">Sign in to the admin panel.</p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email-input" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-password-input" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-testid="admin-password-toggle">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary h-11" data-testid="admin-login-submit">
            <LogIn className="w-4 h-4 mr-2" /> {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Default: admin@upadhyaysharma.com / Admin@123</p>
        </form>
      </div>
    </div>
  );
}
