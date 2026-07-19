"""
Backend API test suite for Upadhyay Sharma Physiotherapist Clinic.
Covers: root, auth, public GETs, appointments, contact, testimonials, admin CRUDs, stats.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("BACKEND_TEST_URL") or "https://physio-care-platform.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")

ADMIN_EMAIL = "admin@upadhyaysharma.com"
ADMIN_PASSWORD = "Admin@123"


# --------- Fixtures ---------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
    })
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json().get("token")


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# --------- Root ---------
class TestRoot:
    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "message" in r.json()


# --------- Auth ---------
class TestAuth:
    def test_login_success(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
        })
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] in ("super_admin", "admin", "clinic_admin")

    def test_login_wrong_password(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL, "password": "wrongpass"
        })
        assert r.status_code == 401

    def test_me_with_token(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self, api_client):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_logout(self, api_client, auth_headers):
        r = api_client.post(f"{BASE_URL}/api/auth/logout", headers=auth_headers)
        assert r.status_code == 200


# --------- Public GETs (seeded content) ---------
class TestPublicContent:
    def test_services_list(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/services")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        assert "slug" in data[0] and "name" in data[0]

    def test_service_by_slug_real(self, api_client):
        # iter-3: real content uses musculoskeletal-physiotherapy slug
        r = api_client.get(f"{BASE_URL}/api/services/musculoskeletal-physiotherapy")
        assert r.status_code == 200
        assert r.json()["slug"] == "musculoskeletal-physiotherapy"

    def test_service_by_slug_not_found(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/services/does-not-exist-xyz")
        assert r.status_code == 404

    def test_doctors_list(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/doctors")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        assert "id" in data[0]

    def test_doctor_by_id(self, api_client):
        docs = api_client.get(f"{BASE_URL}/api/doctors").json()
        did = docs[0]["id"]
        r = api_client.get(f"{BASE_URL}/api/doctors/{did}")
        assert r.status_code == 200
        assert r.json()["id"] == did

    def test_testimonials_only_approved(self, api_client):
        # iter-3: real content wipe left testimonials empty — that's acceptable.
        r = api_client.get(f"{BASE_URL}/api/testimonials")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for t in data:
            assert t.get("approved") is True

    def test_blogs_list(self, api_client):
        # iter-3: real content wipe left blogs empty — acceptable, but endpoint must respond 200 with a list
        r = api_client.get(f"{BASE_URL}/api/blogs")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_gallery_list(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/gallery")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) > 0

    def test_faqs_list(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/faqs")
        assert r.status_code == 200
        assert isinstance(r.json(), list) and len(r.json()) > 0

    def test_settings(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/settings")
        assert r.status_code == 200
        data = r.json()
        assert data.get("clinic_name")
        assert data.get("phone")


# --------- Real CARE WITH US content verification (iteration 3) ---------
class TestRealContent:
    """Verify real clinic content is served from DB (must run before mutation tests)."""

    def test_settings_real_content(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/settings")
        assert r.status_code == 200
        s = r.json()
        assert s.get("clinic_name") == "CARE WITH US", f"clinic_name={s.get('clinic_name')}"
        assert s.get("tagline") == "Movement. Recovery. Rehabilitation."
        assert "Pratap Nagar" in (s.get("address") or "")
        assert "Jaipur" in (s.get("address") or "")
        logo = s.get("logo") or ""
        assert logo, "logo must not be empty"
        assert "customer-assets" in logo, f"logo should be from customer-assets domain, got {logo}"
        assert "Move Better" in (s.get("footer_text") or "")
        # mission/vision/about are real CARE WITH US texts
        assert "physiotherapy" in (s.get("mission") or "").lower()
        assert "excellence" in (s.get("vision") or "").lower() or "trusted" in (s.get("vision") or "").lower()
        assert "CARE WITH US" in (s.get("about") or "") or "Pratap Nagar" in (s.get("about") or "")
        # hero_slides - 3 slides with real images
        slides = s.get("hero_slides") or []
        assert isinstance(slides, list) and len(slides) == 3, f"expected 3 slides, got {len(slides)}"
        assert slides[0]["heading"] == "Movement. Recovery. Rehabilitation."
        # At least one slide uses the customer-assets clinic image
        assert any("customer-assets" in (sl.get("image") or "") for sl in slides), "no slide uses customer-assets image"

    def test_services_9_real(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/services")
        assert r.status_code == 200
        services = r.json()
        assert isinstance(services, list)
        # count only non-test (real) services — filter out any TEST_ artifacts
        real = [s for s in services if not (s.get("name") or "").startswith("TEST")]
        assert len(real) == 9, f"expected 9 services, got {len(real)}: {[s.get('name') for s in real]}"
        expected_names = {
            "Musculoskeletal Physiotherapy",
            "Orthopaedic Rehabilitation",
            "Neurological Rehabilitation",
            "Sports Physiotherapy",
            "Geriatric Physiotherapy",
            "Women's Health Physiotherapy",
            "Pediatric Physiotherapy",
            "Pain Management",
            "Lifestyle & Wellness Programs",
        }
        actual_names = {s.get("name") for s in real}
        missing = expected_names - actual_names
        assert not missing, f"missing services: {missing}"
        # each has image + benefits populated
        for s in real:
            assert s.get("image"), f"{s.get('name')} missing image"
            benefits = s.get("benefits") or []
            assert isinstance(benefits, list) and len(benefits) > 0, f"{s.get('name')} missing benefits"

    def test_doctors_4_real(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/doctors")
        assert r.status_code == 200
        docs = r.json()
        real = [d for d in docs if not (d.get("name") or "").startswith("TEST")]
        assert len(real) == 4, f"expected 4 doctors, got {len(real)}: {[d.get('name') for d in real]}"
        expected = {
            "Dr. Isha Upadhyay",
            "Dr. Muskaan Singhal",
            "Dr. Aaradhya Anand",
            "Dr. Priya Rao",
        }
        actual = {d.get("name") for d in real}
        missing = expected - actual
        assert not missing, f"missing doctors: {missing}"
        # all BPT qualification, all photo loadable, all have biography
        for d in real:
            assert d.get("qualification") == "BPT", f"{d.get('name')} qualification={d.get('qualification')}"
            assert d.get("biography"), f"{d.get('name')} missing biography"
            photo = d.get("photo") or ""
            assert photo.startswith("http"), f"{d.get('name')} bad photo url"
            # verify photo loads (HEAD/GET)
            try:
                img_resp = requests.get(photo, timeout=10, stream=True)
                assert img_resp.status_code == 200, f"{d.get('name')} photo returned {img_resp.status_code}"
            except requests.RequestException as e:
                pytest.fail(f"{d.get('name')} photo not loadable: {e}")
        # verify founder role
        founder = next((d for d in real if d.get("name") == "Dr. Isha Upadhyay"), None)
        assert founder and "Founder" in (founder.get("specialization") or "")

    def test_faqs_real_content(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/faqs")
        assert r.status_code == 200
        faqs = r.json()
        assert isinstance(faqs, list)
        assert len(faqs) >= 7, f"expected >=7 FAQs, got {len(faqs)}"
        # one FAQ mentions location "Pratap Nagar, Jaipur"
        joined = " ".join((f.get("answer") or "") + " " + (f.get("question") or "") for f in faqs)
        assert "Pratap Nagar" in joined and "Jaipur" in joined, "no FAQ mentions Pratap Nagar, Jaipur"

    def test_gallery_uses_uploaded_photos(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/gallery")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) > 0
        # At least one gallery item uses the customer-assets clinic photo domain
        assert any("customer-assets" in (i.get("image") or "") for i in items), \
            "no gallery item uses customer-assets uploaded photo"


# --------- Appointments ---------
class TestAppointments:
    created_id = None

    def test_create_appointment(self, api_client, auth_headers):
        payload = {
            "patient_name": "TEST_John Doe",
            "phone": "+919999999999",
            "email": "test_john@example.com",
            "message": "Test appointment",
            "preferred_date": "2026-02-15",
        }
        r = api_client.post(f"{BASE_URL}/api/appointments", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("status") == "pending"
        assert data.get("appointment_code", "").startswith("APT-")
        assert data.get("patient_name") == payload["patient_name"]
        assert "id" in data
        TestAppointments.created_id = data["id"]

    def test_admin_list_appointments_requires_auth(self, api_client):
        r = requests.get(f"{BASE_URL}/api/admin/appointments")
        assert r.status_code in (401, 403)

    def test_admin_list_appointments(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/admin/appointments", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = [d.get("id") for d in data]
        assert TestAppointments.created_id in ids

    def test_admin_patch_appointment_status(self, api_client, auth_headers):
        aid = TestAppointments.created_id
        assert aid is not None
        r = api_client.patch(
            f"{BASE_URL}/api/admin/appointments/{aid}",
            headers=auth_headers,
            json={"status": "confirmed"},
        )
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"

    def test_admin_delete_appointment(self, api_client, auth_headers):
        aid = TestAppointments.created_id
        assert aid is not None
        r = api_client.delete(f"{BASE_URL}/api/admin/appointments/{aid}", headers=auth_headers)
        assert r.status_code == 200
        # verify removal
        listing = api_client.get(f"{BASE_URL}/api/admin/appointments", headers=auth_headers).json()
        assert aid not in [d.get("id") for d in listing]


# --------- Contact ---------
class TestContact:
    def test_submit_contact(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Contact",
            "email": "contact@example.com",
            "phone": "+911234567890",
            "subject": "Testing",
            "message": "This is a test message",
        })
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_contact_requires_admin(self, api_client):
        r = requests.get(f"{BASE_URL}/api/admin/contact")
        assert r.status_code in (401, 403)

    def test_admin_get_contact(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/admin/contact", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert any(d.get("name") == "TEST_Contact" for d in data)


# --------- Testimonials submit ---------
class TestTestimonialsSubmit:
    def test_submit_unapproved(self, api_client, auth_headers):
        r = api_client.post(f"{BASE_URL}/api/testimonials", json={
            "name": "TEST_Reviewer",
            "city": "Testville",
            "review": "This is a test review",
            "rating": 4,
        })
        assert r.status_code == 200
        # Confirm not in public list
        public = api_client.get(f"{BASE_URL}/api/testimonials").json()
        assert not any(t.get("name") == "TEST_Reviewer" for t in public)
        # Confirm in admin list
        admin = api_client.get(f"{BASE_URL}/api/admin/testimonials", headers=auth_headers).json()
        assert any(t.get("name") == "TEST_Reviewer" and t.get("approved") is False for t in admin)


# --------- Admin CRUD (services, doctors, blogs, gallery, faqs, settings) ---------
class TestAdminCRUD:
    created_service = None
    created_doctor = None
    created_blog = None
    created_gallery = None
    created_faq = None

    def test_admin_endpoints_unauthorized(self, api_client):
        r = requests.post(f"{BASE_URL}/api/admin/services", json={"name": "x"})
        assert r.status_code in (401, 403)

    def test_service_crud(self, api_client, auth_headers):
        # Create
        r = api_client.post(f"{BASE_URL}/api/admin/services", headers=auth_headers,
                            json={"name": "TEST Service", "short_description": "test"})
        assert r.status_code == 200, r.text
        svc = r.json()
        TestAdminCRUD.created_service = svc["id"]
        assert svc["slug"] == "test-service"
        # Update
        r = api_client.put(f"{BASE_URL}/api/admin/services/{svc['id']}", headers=auth_headers,
                           json={"name": "TEST_Service Updated", "short_description": "updated"})
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Service Updated"
        # Delete
        r = api_client.delete(f"{BASE_URL}/api/admin/services/{svc['id']}", headers=auth_headers)
        assert r.status_code == 200

    def test_doctor_crud(self, api_client, auth_headers):
        r = api_client.post(f"{BASE_URL}/api/admin/doctors", headers=auth_headers,
                            json={"name": "TEST_Dr", "specialization": "test"})
        assert r.status_code == 200
        did = r.json()["id"]
        r = api_client.put(f"{BASE_URL}/api/admin/doctors/{did}", headers=auth_headers,
                           json={"name": "TEST_Dr", "experience": "5 Years"})
        assert r.status_code == 200
        r = api_client.delete(f"{BASE_URL}/api/admin/doctors/{did}", headers=auth_headers)
        assert r.status_code == 200

    def test_blog_crud(self, api_client, auth_headers):
        r = api_client.post(f"{BASE_URL}/api/admin/blogs", headers=auth_headers,
                            json={"title": "TEST Blog Post", "content": "hi", "status": "published"})
        assert r.status_code == 200
        blog = r.json()
        assert blog["slug"] == "test-blog-post"
        # public GET by slug
        r2 = api_client.get(f"{BASE_URL}/api/blogs/{blog['slug']}")
        assert r2.status_code == 200
        # Delete
        r = api_client.delete(f"{BASE_URL}/api/admin/blogs/{blog['id']}", headers=auth_headers)
        assert r.status_code == 200

    def test_gallery_crud(self, api_client, auth_headers):
        r = api_client.post(f"{BASE_URL}/api/admin/gallery", headers=auth_headers,
                            json={"title": "TEST_Img", "image": "https://example.com/img.jpg"})
        assert r.status_code == 200
        gid = r.json()["id"]
        r = api_client.delete(f"{BASE_URL}/api/admin/gallery/{gid}", headers=auth_headers)
        assert r.status_code == 200

    def test_faq_crud(self, api_client, auth_headers):
        r = api_client.post(f"{BASE_URL}/api/admin/faqs", headers=auth_headers,
                            json={"question": "TEST_Q?", "answer": "A"})
        assert r.status_code == 200
        fid = r.json()["id"]
        r = api_client.delete(f"{BASE_URL}/api/admin/faqs/{fid}", headers=auth_headers)
        assert r.status_code == 200

    def test_settings_update(self, api_client, auth_headers):
        # Non-destructive: save original tagline, mutate, then restore.
        orig = api_client.get(f"{BASE_URL}/api/settings").json()
        original_tagline = orig.get("tagline")
        try:
            r = api_client.put(f"{BASE_URL}/api/admin/settings", headers=auth_headers,
                               json={"tagline": "TEST Tagline Mutation"})
            assert r.status_code == 200
            assert r.json().get("tagline") == "TEST Tagline Mutation"
        finally:
            # restore
            api_client.put(f"{BASE_URL}/api/admin/settings", headers=auth_headers,
                           json={"tagline": original_tagline or "Movement. Recovery. Rehabilitation."})


# --------- New optimization tests (iteration 2) ---------
class TestSettingsNewFields:
    """Verify new SettingsIn fields (logo, footer_text, homepage_hero_title/subtitle)."""

    def test_update_new_fields_persist(self, api_client, auth_headers):
        # Save originals for restore
        orig = api_client.get(f"{BASE_URL}/api/settings").json()
        keys = ("logo", "footer_text", "homepage_hero_title", "homepage_hero_subtitle")
        originals = {k: orig.get(k) for k in keys}
        payload = {
            "logo": "https://example.com/test-logo.png",
            "footer_text": "TEST footer description text",
            "homepage_hero_title": "TEST Hero Title",
            "homepage_hero_subtitle": "TEST Hero Subtitle",
        }
        try:
            r = api_client.put(f"{BASE_URL}/api/admin/settings", headers=auth_headers, json=payload)
            assert r.status_code == 200, r.text
            body = r.json()
            for k, v in payload.items():
                assert body.get(k) == v, f"{k} not returned in PUT response"
            # verify via public GET
            g = api_client.get(f"{BASE_URL}/api/settings")
            assert g.status_code == 200
            gb = g.json()
            for k, v in payload.items():
                assert gb.get(k) == v, f"{k} not persisted / not returned in public settings"
        finally:
            # restore
            restore = {k: (v if v is not None else "") for k, v in originals.items()}
            api_client.put(f"{BASE_URL}/api/admin/settings", headers=auth_headers, json=restore)

    def test_update_hero_slides(self, api_client, auth_headers):
        # Save original slides
        orig = api_client.get(f"{BASE_URL}/api/settings").json()
        original_slides = orig.get("hero_slides") or []
        slides = [
            {
                "image": "https://example.com/slide1.jpg",
                "heading": "TEST Slide 1",
                "subheading": "sub 1",
                "description": "desc 1",
                "cta_text": "Book",
                "cta_link": "/appointment",
            },
            {
                "image": "https://example.com/slide2.jpg",
                "heading": "TEST Slide 2",
                "subheading": "sub 2",
                "description": "desc 2",
                "cta_text": "Contact",
                "cta_link": "/contact",
            },
        ]
        try:
            r = api_client.put(
                f"{BASE_URL}/api/admin/settings",
                headers=auth_headers,
                json={"hero_slides": slides},
            )
            assert r.status_code == 200, r.text
            body = r.json()
            assert isinstance(body.get("hero_slides"), list)
            assert len(body["hero_slides"]) == 2
            assert body["hero_slides"][0]["heading"] == "TEST Slide 1"
            # public GET
            g = api_client.get(f"{BASE_URL}/api/settings").json()
            assert isinstance(g.get("hero_slides"), list)
            assert len(g["hero_slides"]) == 2
            assert g["hero_slides"][1]["cta_link"] == "/contact"
        finally:
            api_client.put(
                f"{BASE_URL}/api/admin/settings",
                headers=auth_headers,
                json={"hero_slides": original_slides},
            )


class TestSeedImageFixes:
    """Ensure previously broken image URLs no longer exist in seeded services."""

    BROKEN_PATTERNS = [
        "photo-1666214277657",
        "photo-1580281657527",
        "photo-1518310383802",
        "photo-1600949067985",
    ]

    def test_no_broken_service_images(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/services")
        assert r.status_code == 200
        services = r.json()
        assert isinstance(services, list) and len(services) > 0
        offenders = []
        for svc in services:
            img = svc.get("image") or ""
            hero = svc.get("hero_image") or ""
            gallery = svc.get("gallery") or []
            candidates = [img, hero] + (gallery if isinstance(gallery, list) else [])
            for url in candidates:
                if not isinstance(url, str):
                    continue
                for pat in self.BROKEN_PATTERNS:
                    if pat in url:
                        offenders.append({"service": svc.get("slug"), "url": url, "pattern": pat})
        assert not offenders, f"Broken image URLs still present: {offenders}"


# --------- Admin stats ---------
class TestStats:
    def test_stats(self, api_client, auth_headers):
        r = api_client.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        for key in ("total_appointments", "pending_appointments", "total_doctors",
                    "total_services", "total_reviews", "monthly_appointments"):
            assert key in data
        assert isinstance(data["monthly_appointments"], list)
        assert len(data["monthly_appointments"]) == 6
