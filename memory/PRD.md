# Upadhyay Sharma Physiotherapist Clinic — Product Requirements Document

## Original Problem Statement (summary)
Build a Premium, Modern, Luxury, Professional Medical website for **Upadhyay Sharma Physiotherapist Clinic** with a comprehensive Admin Panel. Stack: React + FastAPI + MongoDB. Deployable independently on Vercel/Render/MongoDB Atlas. Design must inspire confidence and rival Apollo/Fortis/Manipal level premium sites. Primary color #0B8FD3, secondary white, accent teal. Full CMS for doctors/services/appointments/gallery/blogs/testimonials/settings. Auth with JWT + roles. Persistent data.

## User Personas
1. **Prospective Patient** — visits site, browses services, books appointment, submits contact/review.
2. **Existing Patient** — checks doctor profiles, gallery, blog for post-treatment guidance.
3. **Super Admin (Clinic Owner)** — manages every website section from Admin Panel.
4. **Clinic Staff** — manages appointments and contact requests.

## Architecture
- **Frontend**: React (CRA) + Tailwind + shadcn/ui + framer-motion + react-router + axios + recharts. Deployed via Emergent (Vercel-ready).
- **Backend**: FastAPI on port 8001, all routes prefixed `/api`. JWT auth (24h access token) + httpOnly cookie + Bearer header dual support.
- **Database**: MongoDB (`upadhyay_clinic`). UUID-based `id` field on every document (no ObjectId leakage).
- **Auth**: Custom JWT with bcrypt password hashing. Admin auto-seeded on startup with credentials from `.env`.

## Implemented (Feb 2026 — Iteration 1)
### Public Website
- Home page: full-width hero slider with auto-advance + manual controls + dots, trust bar, About section with mission/vision, animated counters (5), services grid (featured), doctors grid, why-choose-us cards, gallery preview (masonry), testimonials grid, FAQ accordion, gradient CTA.
- About page with mission/vision/values.
- Services list (search + category filter) + Service detail page (benefits, related services, sidebar booking).
- Doctors list + Doctor detail page (with qualification, availability, biography, awards).
- Gallery with category filter + lightbox.
- Testimonials list + submit-review form (pending approval).
- Blog list + Blog detail (HTML-rendered content).
- Contact page with contact info cards + Google Maps embed + message form.
- Appointment page: comprehensive booking form with success confirmation showing unique APT-XXXXXX code.
- Sticky Navbar with dark-mode toggle, mobile menu, call/book CTAs.
- Floating action buttons: WhatsApp, Call, Book Appointment, Back-to-top.
- Footer with quick links, contact info, hours, social links.

### Admin Panel (`/admin`)
- Login (`/admin/login`) with default `admin@upadhyaysharma.com` / `Admin@123`.
- Dashboard: 8 stat cards + 6-month appointments trend chart.
- Appointments manager with status filter + status dropdown + delete.
- Doctors CRUD (dialog form).
- Services CRUD (dialog form + table view).
- Testimonials approve/reject/delete.
- Blogs CRUD (HTML content).
- Gallery CRUD.
- Contact requests view + delete.
- Settings: clinic info, mission/vision/about, counters, social links, business hours, Google Maps URL.

### Backend APIs (all under `/api`)
- Auth: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- Public reads: services, doctors, testimonials, blogs, gallery, faqs, settings.
- Public writes: `POST /appointments`, `POST /contact`, `POST /testimonials`.
- Admin (JWT-protected): full CRUD on services/doctors/blogs/gallery/faqs/testimonials, PATCH/DELETE on appointments, DELETE on contact, PUT `/admin/settings`, GET `/admin/stats`.
- Startup seeds: 1 admin user + 20 services + 4 doctors + 6 testimonials + 7 FAQs + 9 gallery items + 4 blog posts + full settings.

## Test Results — Iteration 1
- Backend: 33/33 tests pass (100%).
- Frontend: All flows verified end-to-end (home, navigation, appointment submit, contact submit, admin login/dashboard/CRUD, dark mode, floating buttons).

## Prioritized Backlog (Deferred)
### P0 (Next iteration if requested)
- Email/WhatsApp appointment delivery (SMTP + wa.me templates configurable in admin).
- File upload for reports (persistent object storage integration).
- Multi-language (Hindi/English) toggle.

### P1
- Rich text editor for blog content (TipTap/Quill).
- Additional roles (clinic_admin, reception, doctor) + role-based views.
- Before/After gallery module.
- Video gallery.
- Home Visit vs Clinic Visit toggle on appointment form + address fields.
- Full SEO manager (dynamic meta tags per page, sitemap.xml, robots.txt endpoint).
- Booking availability by doctor (calendar view for admin).
- Activity log & login history.
- Automated reminders (24h/2h before appointment).

### P2
- Analytics dashboard with visitor tracking.
- PWA install prompt.
- Backup/restore center.
- Patient portal (patient login).
- Doctor portal.
- Payment gateway integration (Razorpay/Stripe).

## Environment
- `/app/backend/.env`: `MONGO_URL`, `DB_NAME=upadhyay_clinic`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS`, `FRONTEND_URL`.
- `/app/frontend/.env`: `REACT_APP_BACKEND_URL`.

## Next Tasks
1. Provide real content (doctor names, clinic address, phone, images) — admin can now enter all of this via Settings page + CRUD tabs.
2. Optionally integrate SMTP/WhatsApp for appointment delivery.
3. File upload storage layer for appointment reports and admin media uploads.

## Iteration 2 — Optimization (Feb 2026)
- Added SafeImage component (`/app/frontend/src/components/SafeImage.jsx`) with SVG fallback + lazy loading + async decoding — used across Home/Services/Doctors/Gallery/ServiceDetail/DoctorDetail/Blog.
- Mobile grids: services & doctors 2-col on mobile (was 1), gallery masonry 2-col on mobile (was 1); reduced mobile spacing/padding; prevented horizontal scroll (`overflow-x: hidden` on html/body).
- Fixed 4 broken Unsplash image URLs (both in seed + live DB).
- Added editable fields to Settings: `logo`, `footer_text`, `homepage_hero_title`, `homepage_hero_subtitle`, plus full Hero Slides editor UI in Admin.
- Navbar/Footer now use `settings.logo` when set.
- Tests: 36/36 backend pass; all mobile/desktop responsiveness verified.

## Iteration 3 — Content Replacement (Feb 2026)
- Wiped demo data, replaced with real CARE WITH US clinic content via `/app/backend/migrate_real_content.py`.
- **Clinic**: CARE WITH US – Advanced Physiotherapy & Rehabilitation Centre, Pratap Nagar, Jaipur.
- **Doctors**: 4 BPT female physiotherapists (Dr. Isha Upadhyay founder, Dr. Muskaan Singhal, Dr. Aaradhya Anand, Dr. Priya Rao).
- **Services**: 9 real categories (Musculoskeletal, Orthopaedic Rehab, Neurological Rehab, Sports, Geriatric, Women's Health, Pediatric, Pain Management, Lifestyle & Wellness).
- Real mission, vision, about, FAQs, business hours, hero slides using uploaded clinic photos.
- Updated `index.html` title + meta + og:image + favicon.
- Tests: 41/41 backend pass.

## Iteration 4 — Logo Bug Fix + Branding Cleanup (Feb 2026)
- Fixed wrong logo URL — swapped from clinic collage photo (`i9jxiigf`) to actual wooden CARE WITH US logo (`7g69kpcj`).
- Fixed all hardcoded "Upadhyay Sharma" strings across 7 public page titles, AdminLayout sidebar, admin Login page, and SettingsContext default fallback — now everything reads from `settings.clinic_name` / `settings.logo` with 'CARE WITH US' fallback.
- Tests: 43/43 backend pass; all frontend branding verified.

## Notes for Fresh Deploy
- If deploying to Render/Vercel with empty MongoDB Atlas, run `cd /app/backend && python3 migrate_real_content.py` once after first startup to load the real content.
- `server.py` seed_content still contains demo Upadhyay Sharma data as a fallback (only runs on empty DB) — safe to leave as-is; the migrate script overrides it.
