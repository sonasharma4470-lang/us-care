from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status, UploadFile, File, Form
from fastapi.responses import Response as FastAPIResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr

from storage import init_storage, put_object, get_object, build_path


# --------- Mongo Setup ---------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# --------- Constants ---------
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60 * 24  # 24 hours

# --------- App Setup ---------
app = FastAPI(title="Upadhyay Sharma Clinic API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --------- Utils ---------
def uid() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(text: str) -> str:
    import re
    s = re.sub(r'[^a-z0-9\s-]', '', (text or '').lower()).strip()
    s = re.sub(r'[\s-]+', '-', s)
    return s or uid()[:8]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def clean_doc(doc: dict) -> dict:
    """Remove Mongo _id from doc for JSON serialization."""
    if doc is None:
        return doc
    doc.pop('_id', None)
    return doc


# --------- Auth Dependencies ---------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop('_id', None)
        user.pop('password_hash', None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("super_admin", "clinic_admin", "admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# --------- Models ---------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class AppointmentIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    patient_name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: str
    whatsapp: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    message: Optional[str] = None
    delivery_preference: Optional[str] = "clinic"  # whatsapp, email, both, clinic


class AppointmentStatus(BaseModel):
    status: str  # pending, confirmed, rescheduled, completed, cancelled, no_show


class DoctorIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    photo: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[str] = None
    registration_number: Optional[str] = None
    languages: Optional[List[str]] = []
    consultation_fee: Optional[str] = None
    working_days: Optional[str] = None
    working_hours: Optional[str] = None
    biography: Optional[str] = None
    awards: Optional[List[str]] = []
    social: Optional[dict] = {}
    display_order: Optional[int] = 0
    featured: Optional[bool] = False
    active: Optional[bool] = True


class ServiceIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    slug: Optional[str] = None
    icon: Optional[str] = None
    image: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[str] = None
    benefits: Optional[List[str]] = []
    suitable_for: Optional[List[str]] = []
    category: Optional[str] = None
    featured: Optional[bool] = False
    active: Optional[bool] = True
    display_order: Optional[int] = 0


class TestimonialIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    city: Optional[str] = None
    treatment: Optional[str] = None
    rating: int = 5
    review: str
    photo: Optional[str] = None
    recovery_duration: Optional[str] = None
    approved: Optional[bool] = False
    featured: Optional[bool] = False


class BlogIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image: Optional[str] = None
    author: Optional[str] = "Admin"
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    status: Optional[str] = "published"  # draft, published
    featured: Optional[bool] = False


class GalleryIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    image: str
    category: Optional[str] = "Clinic"
    description: Optional[str] = None
    featured: Optional[bool] = False
    display_order: Optional[int] = 0


class ContactIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    subject: Optional[str] = None
    message: str


class FaqIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    question: str
    answer: str
    category: Optional[str] = "General"
    display_order: Optional[int] = 0


class SettingsIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    clinic_name: Optional[str] = None
    tagline: Optional[str] = None
    logo: Optional[str] = None
    footer_text: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    emergency: Optional[str] = None
    google_maps_url: Optional[str] = None
    business_hours: Optional[dict] = None
    social: Optional[dict] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    about: Optional[str] = None
    counters: Optional[dict] = None
    hero_slides: Optional[List[dict]] = None
    homepage_hero_title: Optional[str] = None
    homepage_hero_subtitle: Optional[str] = None


# --------- Auth Routes ---------
@api.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"], user.get("role", "admin"))
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_MIN * 60,
        path="/",
    )
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name", ""),
            "role": user.get("role", "admin"),
        },
    }


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# --------- Public: Services ---------
@api.get("/services")
async def list_services(featured: Optional[bool] = None, active: bool = True):
    q: dict = {}
    if active:
        q["active"] = True
    if featured is not None:
        q["featured"] = featured
    docs = await db.services.find(q).sort("display_order", 1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.get("/services/{slug}")
async def get_service(slug: str):
    doc = await db.services.find_one({"slug": slug})
    if not doc:
        # try by id
        doc = await db.services.find_one({"id": slug})
    if not doc:
        raise HTTPException(404, "Service not found")
    return clean_doc(doc)


@api.post("/admin/services")
async def create_service(payload: ServiceIn, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["id"] = uid()
    data["slug"] = data.get("slug") or slugify(data["name"])
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    await db.services.insert_one(data)
    return clean_doc(data)


@api.put("/admin/services/{sid}")
async def update_service(sid: str, payload: ServiceIn, _: dict = Depends(require_admin)):
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and not data.get("slug"):
        data["slug"] = slugify(data["name"])
    data["updated_at"] = now_iso()
    await db.services.update_one({"id": sid}, {"$set": data})
    doc = await db.services.find_one({"id": sid})
    return clean_doc(doc)


@api.delete("/admin/services/{sid}")
async def delete_service(sid: str, _: dict = Depends(require_admin)):
    await db.services.delete_one({"id": sid})
    return {"ok": True}


# --------- Public: Doctors ---------
@api.get("/doctors")
async def list_doctors(featured: Optional[bool] = None, active: bool = True):
    q: dict = {}
    if active:
        q["active"] = True
    if featured is not None:
        q["featured"] = featured
    docs = await db.doctors.find(q).sort("display_order", 1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.get("/doctors/{did}")
async def get_doctor(did: str):
    doc = await db.doctors.find_one({"id": did})
    if not doc:
        raise HTTPException(404, "Doctor not found")
    return clean_doc(doc)


@api.post("/admin/doctors")
async def create_doctor(payload: DoctorIn, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["id"] = uid()
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    await db.doctors.insert_one(data)
    return clean_doc(data)


@api.put("/admin/doctors/{did}")
async def update_doctor(did: str, payload: DoctorIn, _: dict = Depends(require_admin)):
    data = payload.model_dump(exclude_unset=True)
    data["updated_at"] = now_iso()
    await db.doctors.update_one({"id": did}, {"$set": data})
    doc = await db.doctors.find_one({"id": did})
    return clean_doc(doc)


@api.delete("/admin/doctors/{did}")
async def delete_doctor(did: str, _: dict = Depends(require_admin)):
    await db.doctors.delete_one({"id": did})
    return {"ok": True}


# --------- Appointments ---------
@api.post("/appointments")
async def create_appointment(payload: AppointmentIn):
    data = payload.model_dump()
    data["id"] = uid()
    data["appointment_code"] = "APT-" + uid()[:8].upper()
    data["status"] = "pending"
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    await db.appointments.insert_one(data)
    # Also create/update patient record
    if data.get("phone"):
        patient = await db.patients.find_one({"phone": data["phone"]})
        if not patient:
            await db.patients.insert_one({
                "id": uid(),
                "name": data.get("patient_name"),
                "phone": data.get("phone"),
                "email": data.get("email"),
                "age": data.get("age"),
                "gender": data.get("gender"),
                "address": data.get("address"),
                "created_at": now_iso(),
            })
    return clean_doc(data)


@api.get("/admin/appointments")
async def list_appointments(_: dict = Depends(require_admin), status_filter: Optional[str] = None):
    q: dict = {}
    if status_filter:
        q["status"] = status_filter
    docs = await db.appointments.find(q).sort("created_at", -1).to_list(1000)
    return [clean_doc(d) for d in docs]


@api.patch("/admin/appointments/{aid}")
async def update_appointment_status(aid: str, payload: AppointmentStatus, _: dict = Depends(require_admin)):
    await db.appointments.update_one(
        {"id": aid},
        {"$set": {"status": payload.status, "updated_at": now_iso()}},
    )
    doc = await db.appointments.find_one({"id": aid})
    if not doc:
        raise HTTPException(404, "Not found")
    return clean_doc(doc)


@api.delete("/admin/appointments/{aid}")
async def delete_appointment(aid: str, _: dict = Depends(require_admin)):
    await db.appointments.delete_one({"id": aid})
    return {"ok": True}


# --------- Testimonials ---------
@api.get("/testimonials")
async def list_testimonials():
    docs = await db.testimonials.find({"approved": True}).sort("created_at", -1).to_list(200)
    return [clean_doc(d) for d in docs]


@api.post("/testimonials")
async def submit_testimonial(payload: TestimonialIn):
    data = payload.model_dump()
    data["id"] = uid()
    data["approved"] = False
    data["created_at"] = now_iso()
    await db.testimonials.insert_one(data)
    return {"ok": True, "id": data["id"]}


@api.get("/admin/testimonials")
async def admin_list_testimonials(_: dict = Depends(require_admin)):
    docs = await db.testimonials.find({}).sort("created_at", -1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.post("/admin/testimonials")
async def admin_create_testimonial(payload: TestimonialIn, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["id"] = uid()
    data["created_at"] = now_iso()
    await db.testimonials.insert_one(data)
    return clean_doc(data)


@api.put("/admin/testimonials/{tid}")
async def admin_update_testimonial(tid: str, payload: TestimonialIn, _: dict = Depends(require_admin)):
    data = payload.model_dump(exclude_unset=True)
    await db.testimonials.update_one({"id": tid}, {"$set": data})
    doc = await db.testimonials.find_one({"id": tid})
    return clean_doc(doc)


@api.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, _: dict = Depends(require_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"ok": True}


# --------- Blogs ---------
@api.get("/blogs")
async def list_blogs():
    docs = await db.blogs.find({"status": "published"}).sort("created_at", -1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.get("/blogs/{slug}")
async def get_blog(slug: str):
    doc = await db.blogs.find_one({"slug": slug})
    if not doc:
        raise HTTPException(404, "Blog not found")
    return clean_doc(doc)


@api.get("/admin/blogs")
async def admin_list_blogs(_: dict = Depends(require_admin)):
    docs = await db.blogs.find({}).sort("created_at", -1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.post("/admin/blogs")
async def admin_create_blog(payload: BlogIn, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["id"] = uid()
    data["slug"] = data.get("slug") or slugify(data["title"])
    data["created_at"] = now_iso()
    data["updated_at"] = now_iso()
    await db.blogs.insert_one(data)
    return clean_doc(data)


@api.put("/admin/blogs/{bid}")
async def admin_update_blog(bid: str, payload: BlogIn, _: dict = Depends(require_admin)):
    data = payload.model_dump(exclude_unset=True)
    if data.get("title") and not data.get("slug"):
        data["slug"] = slugify(data["title"])
    data["updated_at"] = now_iso()
    await db.blogs.update_one({"id": bid}, {"$set": data})
    doc = await db.blogs.find_one({"id": bid})
    return clean_doc(doc)


@api.delete("/admin/blogs/{bid}")
async def admin_delete_blog(bid: str, _: dict = Depends(require_admin)):
    await db.blogs.delete_one({"id": bid})
    return {"ok": True}


# --------- Gallery ---------
@api.get("/gallery")
async def list_gallery(category: Optional[str] = None):
    q: dict = {}
    if category:
        q["category"] = category
    docs = await db.gallery.find(q).sort("display_order", 1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.post("/admin/gallery")
async def admin_create_gallery(payload: GalleryIn, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["id"] = uid()
    data["created_at"] = now_iso()
    await db.gallery.insert_one(data)
    return clean_doc(data)


@api.put("/admin/gallery/{gid}")
async def admin_update_gallery(gid: str, payload: GalleryIn, _: dict = Depends(require_admin)):
    data = payload.model_dump(exclude_unset=True)
    await db.gallery.update_one({"id": gid}, {"$set": data})
    doc = await db.gallery.find_one({"id": gid})
    return clean_doc(doc)


@api.delete("/admin/gallery/{gid}")
async def admin_delete_gallery(gid: str, _: dict = Depends(require_admin)):
    await db.gallery.delete_one({"id": gid})
    return {"ok": True}


# --------- Contact ---------
@api.post("/contact")
async def submit_contact(payload: ContactIn):
    data = payload.model_dump()
    data["id"] = uid()
    data["status"] = "new"
    data["created_at"] = now_iso()
    await db.contact_requests.insert_one(data)
    return {"ok": True}


@api.get("/admin/contact")
async def list_contact(_: dict = Depends(require_admin)):
    docs = await db.contact_requests.find({}).sort("created_at", -1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.delete("/admin/contact/{cid}")
async def delete_contact(cid: str, _: dict = Depends(require_admin)):
    await db.contact_requests.delete_one({"id": cid})
    return {"ok": True}


# --------- FAQs ---------
@api.get("/faqs")
async def list_faqs():
    docs = await db.faqs.find({}).sort("display_order", 1).to_list(500)
    return [clean_doc(d) for d in docs]


@api.post("/admin/faqs")
async def create_faq(payload: FaqIn, _: dict = Depends(require_admin)):
    data = payload.model_dump()
    data["id"] = uid()
    data["created_at"] = now_iso()
    await db.faqs.insert_one(data)
    return clean_doc(data)


@api.put("/admin/faqs/{fid}")
async def update_faq(fid: str, payload: FaqIn, _: dict = Depends(require_admin)):
    data = payload.model_dump(exclude_unset=True)
    await db.faqs.update_one({"id": fid}, {"$set": data})
    doc = await db.faqs.find_one({"id": fid})
    return clean_doc(doc)


@api.delete("/admin/faqs/{fid}")
async def delete_faq(fid: str, _: dict = Depends(require_admin)):
    await db.faqs.delete_one({"id": fid})
    return {"ok": True}


# --------- Settings ---------
SETTINGS_KEY = "clinic_settings"


@api.get("/settings")
async def get_settings():
    doc = await db.settings.find_one({"key": SETTINGS_KEY})
    if not doc:
        return {}
    doc.pop("_id", None)
    return doc


@api.put("/admin/settings")
async def update_settings(payload: SettingsIn, _: dict = Depends(require_admin)):
    data = payload.model_dump(exclude_unset=True)
    data["updated_at"] = now_iso()
    await db.settings.update_one({"key": SETTINGS_KEY}, {"$set": data}, upsert=True)
    doc = await db.settings.find_one({"key": SETTINGS_KEY})
    doc.pop("_id", None)
    return doc


# --------- Dashboard Stats ---------
@api.get("/admin/stats")
async def dashboard_stats(_: dict = Depends(require_admin)):
    today = datetime.now(timezone.utc).date().isoformat()
    total_appts = await db.appointments.count_documents({})
    pending = await db.appointments.count_documents({"status": "pending"})
    today_appts = await db.appointments.count_documents({"preferred_date": today})
    total_doctors = await db.doctors.count_documents({"active": True})
    total_services = await db.services.count_documents({"active": True})
    total_patients = await db.patients.count_documents({})
    total_reviews = await db.testimonials.count_documents({})
    approved_reviews = await db.testimonials.count_documents({"approved": True})
    contact_new = await db.contact_requests.count_documents({"status": "new"})
    # Monthly appointments (last 6 months buckets by created_at prefix)
    monthly = []
    for i in range(5, -1, -1):
        d = datetime.now(timezone.utc) - timedelta(days=30 * i)
        prefix = d.strftime("%Y-%m")
        count = await db.appointments.count_documents({"created_at": {"$regex": f"^{prefix}"}})
        monthly.append({"month": d.strftime("%b"), "count": count})
    return {
        "total_appointments": total_appts,
        "pending_appointments": pending,
        "today_appointments": today_appts,
        "total_doctors": total_doctors,
        "total_services": total_services,
        "total_patients": total_patients,
        "total_reviews": total_reviews,
        "approved_reviews": approved_reviews,
        "contact_new": contact_new,
        "monthly_appointments": monthly,
    }


@api.get("/")
async def root():
    return {"message": "CARE WITH US Clinic API", "version": "1.1"}


# --------- Media Upload ---------
ALLOWED_MIME = {
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml",
}
MAX_UPLOAD_MB = 15


@api.post("/admin/upload")
async def upload_media(
    file: UploadFile = File(...),
    kind: str = Form("misc"),
    user: dict = Depends(require_admin),
):
    """Upload an image and get a public URL that can be stored in doctor/service/gallery/settings."""
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME:
        raise HTTPException(400, f"Unsupported file type: {content_type}. Allowed: JPG, PNG, WEBP, GIF, SVG.")
    data = await file.read()
    size_mb = len(data) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(400, f"File too large ({size_mb:.1f} MB). Max is {MAX_UPLOAD_MB} MB.")
    if kind not in {"doctors", "services", "gallery", "blogs", "logo", "hero", "misc"}:
        kind = "misc"
    path = build_path(kind, file.filename or "upload.bin")
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(500, f"Upload failed: {e}")

    stored_path = result["path"]
    file_doc = {
        "id": uid(),
        "storage_path": stored_path,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "kind": kind,
        "uploaded_by": user.get("id"),
        "is_deleted": False,
        "created_at": now_iso(),
    }
    await db.files.insert_one(file_doc)

    # Public URL served by backend proxy
    backend_base = os.environ.get("PUBLIC_URL", "").rstrip("/")
    public_url = f"{backend_base}/api/media/{stored_path}" if backend_base else f"/api/media/{stored_path}"
    return {"url": public_url, "path": stored_path, "size": file_doc["size"]}


@api.get("/media/{path:path}")
async def get_media(path: str):
    """Public read of an uploaded image (no auth). Content-Type is preserved."""
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(404, "File not found")
    try:
        data, content_type = get_object(path)
    except Exception as e:
        raise HTTPException(500, f"Storage error: {e}")
    return FastAPIResponse(
        content=data,
        media_type=record.get("content_type", content_type),
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


# --------- Startup: Seed Data ---------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": uid(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Super Admin",
            "role": "super_admin",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Updated admin password for {admin_email}")


async def seed_content():
    # Only seed if collections are empty
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one({
            "key": SETTINGS_KEY,
            "clinic_name": "Upadhyay Sharma Physiotherapist Clinic",
            "tagline": "Restore. Renew. Recover.",
            "address": "123 Health Avenue, Wellness District, India",
            "phone": "+91 98765 43210",
            "whatsapp": "+91 98765 43210",
            "email": "care@upadhyaysharma.com",
            "emergency": "+91 98765 00000",
            "google_maps_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.0596533716183!2d77.20902!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d!2sConnaught+Place!5e0!3m2!1sen!2sin!4v1700000000000",
            "business_hours": {
                "monday": "8:00 AM - 8:00 PM",
                "tuesday": "8:00 AM - 8:00 PM",
                "wednesday": "8:00 AM - 8:00 PM",
                "thursday": "8:00 AM - 8:00 PM",
                "friday": "8:00 AM - 8:00 PM",
                "saturday": "9:00 AM - 6:00 PM",
                "sunday": "Emergency Only",
            },
            "social": {
                "facebook": "https://facebook.com",
                "instagram": "https://instagram.com",
                "youtube": "https://youtube.com",
                "linkedin": "https://linkedin.com",
            },
            "mission": "To restore mobility, relieve pain, and rebuild lives through evidence-based physiotherapy and compassionate care.",
            "vision": "To be the most trusted name in physiotherapy in India, blending science, technology and human warmth.",
            "about": "Upadhyay Sharma Physiotherapist Clinic is a premier physiotherapy destination dedicated to healing with dignity. Our team of certified physiotherapists brings decades of combined expertise across orthopedic, neurological, sports, and geriatric rehabilitation.",
            "counters": {
                "happy_patients": 12500,
                "years_experience": 18,
                "treatments_completed": 45000,
                "recovery_rate": 96,
                "home_visits": 3200,
            },
            "hero_slides": [
                {
                    "id": uid(),
                    "image": "https://images.pexels.com/photos/16571733/pexels-photo-16571733.jpeg",
                    "heading": "Physiotherapy that Restores Life",
                    "subheading": "Certified physiotherapists • Latest equipment • Personalized care",
                    "description": "From back pain to post-surgery rehabilitation, our world-class team helps you reclaim movement, strength and confidence.",
                    "cta_text": "Book Appointment",
                    "cta_link": "/appointment",
                },
                {
                    "id": uid(),
                    "image": "https://images.pexels.com/photos/20860588/pexels-photo-20860588.jpeg",
                    "heading": "Recover Faster. Live Stronger.",
                    "subheading": "Evidence-based treatments for lasting relief",
                    "description": "Sports injury, ACL rehab, stroke recovery and more — designed around your goals and your timeline.",
                    "cta_text": "Explore Services",
                    "cta_link": "/services",
                },
                {
                    "id": uid(),
                    "image": "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6",
                    "heading": "Home Visit Physiotherapy",
                    "subheading": "Expert care at your doorstep",
                    "description": "Personalized treatment plans, delivered where you feel most comfortable.",
                    "cta_text": "Request Home Visit",
                    "cta_link": "/appointment",
                },
            ],
            "updated_at": now_iso(),
        })
        logger.info("Seeded settings")

    if await db.services.count_documents({}) == 0:
        services_seed = [
            ("Back Pain Relief", "Pain Relief", "Comprehensive back pain treatment combining manual therapy, exercise and electrotherapy.", "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800"),
            ("Neck & Cervical Care", "Pain Relief", "Targeted therapy for cervical spondylosis, stiffness, and neck pain.", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"),
            ("Sciatica Treatment", "Pain Relief", "Relieve sciatic nerve pain with focused decompression and rehab.", "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800"),
            ("Frozen Shoulder", "Pain Relief", "Restore shoulder mobility with graded manual therapy and exercise.", "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800"),
            ("Knee Pain & Arthritis", "Joint Care", "Reduce knee pain and restore function with personalized protocols.", "https://images.pexels.com/photos/5473183/pexels-photo-5473183.jpeg?w=800"),
            ("Sports Injury Rehab", "Sports Injury", "Return-to-play programs for athletes at every level.", "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?w=800"),
            ("ACL Rehabilitation", "Sports Injury", "Structured post-surgical ACL recovery for a strong comeback.", "https://images.pexels.com/photos/6111608/pexels-photo-6111608.jpeg?w=800"),
            ("Stroke Rehabilitation", "Neuro Rehab", "Regain independence with intensive neurological rehab.", "https://images.pexels.com/photos/7108/notebook-computer-chill-relax.jpg?w=800"),
            ("Paralysis Rehab", "Neuro Rehab", "Comprehensive care for paralysis and neurological recovery.", "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800"),
            ("Post-Surgery Rehab", "Rehabilitation", "Accelerated recovery after orthopedic and joint surgeries.", "https://images.pexels.com/photos/20860610/pexels-photo-20860610.jpeg?w=800"),
            ("Home Visit Physiotherapy", "Home Visit", "Expert physiotherapy at your doorstep with full equipment.", "https://images.pexels.com/photos/7659877/pexels-photo-7659877.jpeg?w=800"),
            ("Women's Physiotherapy", "Women Care", "Pre & post-natal care, pelvic floor and women-specific therapy.", "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=800"),
            ("Pediatric Physiotherapy", "Pediatric Care", "Compassionate care for children with developmental needs.", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"),
            ("Senior Citizen Care", "Senior Care", "Fall prevention, mobility and geriatric-focused rehab.", "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800"),
            ("Dry Needling", "Manual Therapy", "Trigger-point dry needling for stubborn muscular pain.", "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800"),
            ("Electrotherapy", "Electrotherapy", "TENS, IFT, and modern electrotherapy for fast pain relief.", "https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?w=800"),
            ("Manual Therapy", "Manual Therapy", "Hands-on mobilization and manipulation techniques.", "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800"),
            ("Cupping Therapy", "Alternative", "Ancient cupping combined with modern physiotherapy.", "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800"),
            ("Laser Therapy", "Electrotherapy", "Low-level laser for tissue healing and inflammation.", "https://images.pexels.com/photos/5474025/pexels-photo-5474025.jpeg?w=800"),
            ("Ultrasound Therapy", "Electrotherapy", "Therapeutic ultrasound for deep tissue healing.", "https://images.pexels.com/photos/4506105/pexels-photo-4506105.jpeg?w=800"),
        ]
        for idx, (name, cat, desc, img) in enumerate(services_seed):
            await db.services.insert_one({
                "id": uid(),
                "name": name,
                "slug": slugify(name),
                "icon": "activity",
                "image": img,
                "short_description": desc,
                "description": desc + " Our approach combines assessment, hands-on therapy, therapeutic exercise and patient education so results last beyond the clinic.",
                "duration": "45 mins",
                "category": cat,
                "benefits": ["Pain relief", "Improved mobility", "Faster recovery", "Personalized plan"],
                "suitable_for": ["Adults", "Seniors", "Athletes"],
                "featured": idx < 6,
                "active": True,
                "display_order": idx,
                "created_at": now_iso(),
                "updated_at": now_iso(),
            })
        logger.info("Seeded services")

    if await db.doctors.count_documents({}) == 0:
        doctors_seed = [
            ("Dr. Rajesh Upadhyay", "MPT (Ortho), BPT", "Orthopedic & Sports Physiotherapy", "18+ Years", "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600"),
            ("Dr. Priya Sharma", "MPT (Neuro), BPT", "Neurological Rehabilitation", "12 Years", "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600"),
            ("Dr. Anil Verma", "MPT (Sports), BPT", "Sports Injury & ACL Rehab", "10 Years", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600"),
            ("Dr. Kavita Iyer", "MPT (Women's Health)", "Women's & Pediatric Physiotherapy", "9 Years", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600"),
        ]
        for idx, (name, qual, spec, exp, photo) in enumerate(doctors_seed):
            await db.doctors.insert_one({
                "id": uid(),
                "name": name,
                "photo": photo,
                "qualification": qual,
                "specialization": spec,
                "experience": exp,
                "registration_number": f"IAP-{10000 + idx}",
                "languages": ["English", "Hindi"],
                "consultation_fee": "₹800",
                "working_days": "Mon - Sat",
                "working_hours": "9:00 AM - 7:00 PM",
                "biography": f"{name} is a highly experienced physiotherapist specializing in {spec.lower()}. Committed to evidence-based, patient-first care.",
                "awards": ["Certified Manual Therapist", "IAP Registered"],
                "social": {},
                "display_order": idx,
                "featured": True,
                "active": True,
                "created_at": now_iso(),
                "updated_at": now_iso(),
            })
        logger.info("Seeded doctors")

    if await db.testimonials.count_documents({}) == 0:
        testimonials_seed = [
            ("Rohit Malhotra", "Delhi", "Back Pain", 5, "After years of chronic back pain, Dr. Upadhyay's team helped me walk pain-free within 6 weeks. Truly life-changing.", "8 weeks"),
            ("Meera Krishnan", "Mumbai", "Frozen Shoulder", 5, "Professional, warm, and effective. My shoulder mobility is fully restored. Highly recommend this clinic.", "10 weeks"),
            ("Arjun Singh", "Gurgaon", "ACL Rehab", 5, "Post-ACL surgery, their protocol got me back on the football field stronger than before. Grateful!", "16 weeks"),
            ("Sunita Reddy", "Bangalore", "Sciatica", 5, "The home visit service was a blessing. Kind therapists, clear plan, and real results.", "6 weeks"),
            ("Vikram Bhatt", "Pune", "Sports Injury", 5, "Best physiotherapy experience I've had. Modern equipment and truly caring staff.", "4 weeks"),
            ("Anjali Nair", "Chennai", "Post-Surgery", 5, "My recovery after knee replacement was smooth thanks to their meticulous rehab program.", "12 weeks"),
        ]
        for name, city, treat, rate, review, dur in testimonials_seed:
            await db.testimonials.insert_one({
                "id": uid(),
                "name": name,
                "city": city,
                "treatment": treat,
                "rating": rate,
                "review": review,
                "recovery_duration": dur,
                "photo": f"https://i.pravatar.cc/150?u={slugify(name)}",
                "approved": True,
                "featured": True,
                "created_at": now_iso(),
            })
        logger.info("Seeded testimonials")

    if await db.faqs.count_documents({}) == 0:
        faqs_seed = [
            ("Do I need a doctor's referral to book physiotherapy?", "No referral is required. You can directly book an assessment session with our physiotherapists."),
            ("How long is each physiotherapy session?", "Sessions typically last 45 minutes, though initial assessments can take up to 60 minutes."),
            ("Do you offer home visit physiotherapy?", "Yes, we provide expert home visit physiotherapy across the city with full equipment."),
            ("How many sessions will I need?", "It depends on your condition. After an initial assessment, your physiotherapist will provide a personalized plan and estimate."),
            ("Do you treat sports injuries and ACL rehab?", "Yes. We offer specialized sports injury, ACL, and return-to-play rehabilitation programs."),
            ("Is the treatment covered by insurance?", "Many insurers reimburse physiotherapy. We can provide detailed invoices for your claim."),
            ("What should I wear to my appointment?", "Comfortable, loose-fitting clothing that allows easy movement of the affected area."),
        ]
        for idx, (q, a) in enumerate(faqs_seed):
            await db.faqs.insert_one({
                "id": uid(),
                "question": q,
                "answer": a,
                "category": "General",
                "display_order": idx,
                "created_at": now_iso(),
            })
        logger.info("Seeded FAQs")

    if await db.gallery.count_documents({}) == 0:
        gallery_seed = [
            ("Modern clinic reception", "Clinic", "https://images.pexels.com/photos/16571733/pexels-photo-16571733.jpeg"),
            ("Treatment room", "Clinic", "https://images.unsplash.com/photo-1630226040750-d934f017f0e4?w=800"),
            ("Physiotherapy equipment", "Equipment", "https://images.pexels.com/photos/5619462/pexels-photo-5619462.jpeg"),
            ("Manual therapy session", "Treatment", "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800"),
            ("Rehab exercises", "Treatment", "https://images.pexels.com/photos/20860610/pexels-photo-20860610.jpeg"),
            ("Sports rehab", "Treatment", "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?w=800"),
            ("Doctor consultation", "Doctors", "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800"),
            ("Team of physiotherapists", "Doctors", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800"),
            ("Recovery area", "Clinic", "https://images.pexels.com/photos/7659877/pexels-photo-7659877.jpeg"),
        ]
        for idx, (title, cat, img) in enumerate(gallery_seed):
            await db.gallery.insert_one({
                "id": uid(),
                "title": title,
                "image": img,
                "category": cat,
                "description": title,
                "featured": False,
                "display_order": idx,
                "created_at": now_iso(),
            })
        logger.info("Seeded gallery")

    if await db.blogs.count_documents({}) == 0:
        blogs_seed = [
            ("5 Simple Stretches for Lower Back Pain", "5-simple-stretches-for-lower-back-pain", "Try these physiotherapist-approved stretches to ease lower back pain at home.", "Wellness"),
            ("How Physiotherapy Speeds Up ACL Recovery", "how-physiotherapy-speeds-up-acl-recovery", "A structured rehab plan is essential after ACL surgery. Here's why.", "Sports"),
            ("Home Visit Physiotherapy: Is It Right for You?", "home-visit-physiotherapy-is-it-right-for-you", "Understand the benefits and considerations of choosing home-based care.", "Guide"),
            ("Managing Frozen Shoulder: A Complete Guide", "managing-frozen-shoulder-complete-guide", "Everything you need to know about frozen shoulder and modern treatment.", "Guide"),
        ]
        for idx, (title, slug, excerpt, cat) in enumerate(blogs_seed):
            await db.blogs.insert_one({
                "id": uid(),
                "title": title,
                "slug": slug,
                "excerpt": excerpt,
                "content": f"<p>{excerpt}</p><p>This article covers the fundamentals, common mistakes and evidence-based recommendations from our expert physiotherapists.</p><h3>Key Takeaways</h3><ul><li>Consistency matters more than intensity</li><li>Personalized programs deliver the best results</li><li>Combining therapy modalities accelerates recovery</li></ul><p>Book a consultation with our team to design a plan tailored to you.</p>",
                "featured_image": f"https://images.unsplash.com/photo-{['1571019614242-c5c5dee9f50b','1571019613454-1cb2f99b2d8b','1518310383802-640c2de311b6','1600949067985-4d3f37c2fbb2'][idx]}?w=1200",
                "author": "Dr. Rajesh Upadhyay",
                "category": cat,
                "tags": ["physiotherapy", cat.lower()],
                "status": "published",
                "featured": idx < 2,
                "created_at": now_iso(),
                "updated_at": now_iso(),
            })
        logger.info("Seeded blogs")


async def create_indexes():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.services.create_index("id", unique=True)
    await db.services.create_index("slug", unique=True)
    await db.doctors.create_index("id", unique=True)
    await db.appointments.create_index("id", unique=True)
    await db.appointments.create_index("created_at")
    await db.blogs.create_index("id", unique=True)
    await db.blogs.create_index("slug", unique=True)
    await db.gallery.create_index("id", unique=True)
    await db.testimonials.create_index("id", unique=True)
    await db.faqs.create_index("id", unique=True)
    await db.settings.create_index("key", unique=True)


@app.on_event("startup")
async def startup():
    await create_indexes()
    await seed_admin()
    await seed_content()
    logger.info("Startup complete")


@app.on_event("shutdown")
async def shutdown():
    client.close()


# --------- Mount ---------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
