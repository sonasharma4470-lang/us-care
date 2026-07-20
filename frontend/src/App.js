import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import PublicLayout from "@/components/PublicLayout";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Doctors = lazy(() => import("@/pages/Doctors"));
const DoctorDetail = lazy(() => import("@/pages/DoctorDetail"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Contact = lazy(() => import("@/pages/Contact"));
const Appointment = lazy(() => import("@/pages/Appointment"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));

const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminAppointments = lazy(() => import("@/pages/admin/Appointments"));
const AdminDoctors = lazy(() => import("@/pages/admin/Doctors"));
const AdminServices = lazy(() => import("@/pages/admin/Services"));
const AdminTestimonials = lazy(() => import("@/pages/admin/Testimonials"));
const AdminBlogs = lazy(() => import("@/pages/admin/Blogs"));
const AdminGallery = lazy(() => import("@/pages/admin/Gallery"));
const AdminContact = lazy(() => import("@/pages/admin/Contact"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminAccount = lazy(() => import("@/pages/admin/Account"));
const AdminAuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <div className="App">
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:slug" element={<ServiceDetail />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/doctors/:id" element={<DoctorDetail />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/testimonials" element={<Testimonials />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/appointment" element={<Appointment />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  </Route>

                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="doctors" element={<AdminDoctors />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="testimonials" element={<AdminTestimonials />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="gallery" element={<AdminGallery />} />
                    <Route path="contact" element={<AdminContact />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="account" element={<AdminAccount />} />
                    <Route path="audit-logs" element={<AdminAuditLogs />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              <Toaster position="top-right" richColors />
            </BrowserRouter>
          </div>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
