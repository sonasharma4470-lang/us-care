"""One-time migration to replace demo content with real CARE WITH US clinic data.
Run with:  cd /app/backend && python3 migrate_real_content.py
"""
import asyncio, os, uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv()

def uid(): return str(uuid.uuid4())
def now(): return datetime.now(timezone.utc).isoformat()
def slugify(s):
    import re
    s = re.sub(r'[^a-z0-9\s-]', '', s.lower()).strip()
    return re.sub(r'[\s-]+', '-', s) or uid()[:8]

LOGO = "https://customer-assets-wrfwihn1.emergentagent.net/job_physio-care-platform/artifacts/i9jxiigf_WhatsApp%20Image%202026-07-19%20at%209.06.13%20PM.jpeg"
CLINIC_WIDE = "https://customer-assets-wrfwihn1.emergentagent.net/job_physio-care-platform/artifacts/e926dqrl_WhatsApp%20Image%202026-07-19%20at%209.06.11%20PM.jpeg"
TREATMENT_ROOM = "https://customer-assets-wrfwihn1.emergentagent.net/job_physio-care-platform/artifacts/9apliqvl_WhatsApp%20Image%202026-07-19%20at%209.06.12%20PM%20%281%29.jpeg"

SERVICES = [
    {
        "name": "Musculoskeletal Physiotherapy",
        "category": "Pain Relief",
        "short_description": "Expert care for neck & back pain, spondylosis, frozen shoulder, arthritis, sports injuries, and post-fracture rehab.",
        "description": "Comprehensive musculoskeletal physiotherapy targeting the most common causes of pain and stiffness. We assess the root cause and design a program combining manual therapy, therapeutic exercise, and modern modalities to restore comfort and function.",
        "benefits": ["Neck & back pain", "Cervical & lumbar spondylosis", "Frozen shoulder", "Tennis / Golfer's elbow", "Arthritis management", "Sports injuries", "Post-fracture rehabilitation", "Ligament & tendon injuries"],
        "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200",
    },
    {
        "name": "Orthopaedic Rehabilitation",
        "category": "Rehabilitation",
        "short_description": "Structured post-surgical recovery for knee, hip, shoulder, spine, ACL/PCL and more.",
        "description": "Guided recovery after joint replacement or reconstructive surgery. Our protocols follow surgeon guidelines and evidence-based milestones to safely rebuild strength, mobility, and confidence.",
        "benefits": ["Knee replacement rehabilitation", "Hip replacement rehabilitation", "ACL / PCL reconstruction rehab", "Shoulder surgery rehabilitation", "Spine surgery rehabilitation"],
        "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200",
    },
    {
        "name": "Neurological Rehabilitation",
        "category": "Neuro Rehab",
        "short_description": "Advanced rehab for stroke, facial palsy, Parkinson's, multiple sclerosis, spinal cord & peripheral nerve injuries.",
        "description": "Neurological physiotherapy focused on regaining independence in daily activities. We combine task-specific training, balance work, and neuroplasticity-based techniques for meaningful recovery.",
        "benefits": ["Stroke rehabilitation", "Facial palsy rehabilitation", "Parkinson's disease", "Multiple sclerosis", "Spinal cord injury", "Peripheral nerve injuries"],
        "image": "https://images.pexels.com/photos/7659877/pexels-photo-7659877.jpeg?w=1200",
    },
    {
        "name": "Sports Physiotherapy",
        "category": "Sports",
        "short_description": "Injury prevention, athletic rehabilitation, return-to-sport programs and performance enhancement.",
        "description": "Whether you're a weekend runner or competitive athlete, our sports physiotherapy blends assessment, hands-on therapy, and progressive training to get you back — and better.",
        "benefits": ["Injury prevention", "Athletic rehabilitation", "Return-to-sport programs", "Performance enhancement"],
        "image": "https://images.unsplash.com/photo-1649751361457-01d3a696c7e6?w=1200",
    },
    {
        "name": "Geriatric Physiotherapy",
        "category": "Senior Care",
        "short_description": "Fall prevention, balance training, osteoporosis management and age-related mobility support.",
        "description": "Compassionate physiotherapy designed for older adults — restoring balance, strength, and confidence to stay active and independent at every age.",
        "benefits": ["Balance training", "Fall prevention", "Osteoporosis management", "Age-related mobility improvement"],
        "image": "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=1200",
    },
    {
        "name": "Women's Health Physiotherapy",
        "category": "Women Care",
        "short_description": "Pregnancy exercises, antenatal & postnatal rehab, pelvic floor rehabilitation, postural correction.",
        "description": "Dedicated care for women through every life stage — safe pregnancy exercise, postpartum recovery, pelvic health, and posture work led by trained female physiotherapists.",
        "benefits": ["Pregnancy exercises", "Antenatal & postnatal rehabilitation", "Pelvic floor rehabilitation", "Postural correction"],
        "image": "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=1200",
    },
    {
        "name": "Pediatric Physiotherapy",
        "category": "Pediatric Care",
        "short_description": "Developmental delay, cerebral palsy, neuromuscular conditions and postural correction for children.",
        "description": "Play-based, evidence-informed physiotherapy for children — supporting motor milestones, muscle tone, coordination, and functional development.",
        "benefits": ["Developmental delay", "Cerebral palsy", "Neuromuscular conditions", "Postural correction"],
        "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
    },
    {
        "name": "Pain Management",
        "category": "Pain Relief",
        "short_description": "Manual therapy, therapeutic exercise, electrotherapy, dry needling, kinesiology taping and more.",
        "description": "A multi-modal approach to chronic and acute pain — targeting the source, not just the symptom. Every plan is personalized and progresses with your recovery.",
        "benefits": ["Manual therapy", "Therapeutic exercise", "Electrotherapy", "Soft tissue mobilization", "Myofascial release", "Dry needling (where indicated)", "Kinesiology taping"],
        "image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200",
    },
    {
        "name": "Lifestyle & Wellness Programs",
        "category": "Wellness",
        "short_description": "Ergonomic assessment, workplace rehab, posture programs, fitness & weight management guidance.",
        "description": "Beyond recovery — proactive programs that help you move better in daily life, at work, and during exercise. Practical, sustainable, and grounded in evidence.",
        "benefits": ["Ergonomic assessment", "Weight management guidance", "Workplace rehabilitation", "Fitness consultation", "Posture correction programs"],
        "image": "https://images.pexels.com/photos/5473183/pexels-photo-5473183.jpeg?w=1200",
    },
]

DOCTORS = [
    {
        "name": "Dr. Isha Upadhyay",
        "qualification": "BPT",
        "specialization": "Founder & Chief Physiotherapist",
        "experience": "Founder",
        "biography": "Dr. Isha Upadhyay is committed to delivering evidence-based physiotherapy with a patient-first approach. She focuses on accurate assessment, individualized rehabilitation, pain management, and functional recovery to help patients return to their daily activities safely and confidently.",
        "photo": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
    },
    {
        "name": "Dr. Muskaan Singhal",
        "qualification": "BPT",
        "specialization": "Consultant Physiotherapist",
        "experience": "Consultant",
        "biography": "Dr. Muskaan Singhal specializes in patient assessment, therapeutic exercise prescription, musculoskeletal rehabilitation, and movement restoration. She believes in combining clinical expertise with compassionate care for optimal recovery.",
        "photo": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800",
    },
    {
        "name": "Dr. Aaradhya Anand",
        "qualification": "BPT",
        "specialization": "Consultant Physiotherapist",
        "experience": "Consultant",
        "biography": "Dr. Aaradhya Anand provides personalized rehabilitation programs for orthopedic and neurological conditions. She is dedicated to improving mobility, strength, and independence through evidence-based physiotherapy.",
        "photo": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=800",
    },
    {
        "name": "Dr. Priya Rao",
        "qualification": "BPT",
        "specialization": "Consultant Physiotherapist",
        "experience": "Consultant",
        "biography": "Dr. Priya Rao focuses on functional rehabilitation, pain management, posture correction, and preventive physiotherapy. She strives to empower patients with education and long-term wellness strategies.",
        "photo": "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800",
    },
]

FAQS = [
    ("Where is CARE WITH US located?", "We are located on the 3rd Floor, Aastha Hospital, Pratap Nagar, Jaipur, Rajasthan."),
    ("Do I need a doctor's referral for physiotherapy?", "No referral is required. You can directly book an assessment session with our physiotherapists."),
    ("What conditions do you treat?", "We treat musculoskeletal pain, sports injuries, post-surgical rehab, neurological conditions (stroke, Parkinson's, facial palsy), women's & pediatric health, and offer wellness programs."),
    ("How long is each physiotherapy session?", "Sessions typically last 45 minutes; initial assessments may take up to 60 minutes."),
    ("Do you provide home visit physiotherapy?", "Yes, we offer home visit physiotherapy on request. Please call the clinic to schedule."),
    ("How many sessions will I need?", "It depends on your condition. After an initial assessment, your physiotherapist will provide a personalized plan and estimate."),
    ("What should I wear to my appointment?", "Comfortable, loose-fitting clothing that allows easy movement of the affected area."),
]

GALLERY = [
    ("CARE WITH US – Reception & Clinic View", "Clinic", CLINIC_WIDE),
    ("Treatment Room – Advanced Modalities", "Treatment", TREATMENT_ROOM),
    ("Exercise Therapy Zone", "Equipment", "https://images.pexels.com/photos/5619462/pexels-photo-5619462.jpeg"),
    ("Electrotherapy Setup", "Equipment", "https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg"),
    ("Manual Therapy Session", "Treatment", "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200"),
    ("Rehab Exercises", "Treatment", "https://images.pexels.com/photos/20860610/pexels-photo-20860610.jpeg"),
]

async def main():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]

    # Wipe existing seeded content (KEEP users, appointments, contact_requests, patients)
    for coll in ['services', 'doctors', 'testimonials', 'blogs', 'gallery', 'faqs']:
        r = await db[coll].delete_many({})
        print(f"Cleared {coll}: {r.deleted_count}")

    # Insert real services
    for idx, s in enumerate(SERVICES):
        doc = {
            "id": uid(),
            "name": s["name"],
            "slug": slugify(s["name"]),
            "icon": "activity",
            "image": s["image"],
            "short_description": s["short_description"],
            "description": s["description"],
            "duration": "45 mins",
            "category": s["category"],
            "benefits": s["benefits"],
            "suitable_for": ["Adults", "Seniors", "Athletes", "Children"],
            "featured": idx < 8,
            "active": True,
            "display_order": idx,
            "created_at": now(),
            "updated_at": now(),
        }
        await db.services.insert_one(doc)
    print(f"Inserted {len(SERVICES)} services")

    # Insert real doctors
    for idx, d in enumerate(DOCTORS):
        doc = {
            "id": uid(),
            "name": d["name"],
            "photo": d["photo"],
            "qualification": d["qualification"],
            "specialization": d["specialization"],
            "experience": d["experience"],
            "registration_number": "",
            "languages": ["English", "Hindi"],
            "consultation_fee": "",
            "working_days": "Mon - Sat",
            "working_hours": "9:00 AM - 8:00 PM",
            "biography": d["biography"],
            "awards": [],
            "social": {},
            "display_order": idx,
            "featured": True,
            "active": True,
            "created_at": now(),
            "updated_at": now(),
        }
        await db.doctors.insert_one(doc)
    print(f"Inserted {len(DOCTORS)} doctors")

    # Insert FAQs
    for idx, (q, a) in enumerate(FAQS):
        await db.faqs.insert_one({
            "id": uid(), "question": q, "answer": a, "category": "General",
            "display_order": idx, "created_at": now(),
        })
    print(f"Inserted {len(FAQS)} FAQs")

    # Insert gallery
    for idx, (title, cat, img) in enumerate(GALLERY):
        await db.gallery.insert_one({
            "id": uid(), "title": title, "image": img, "category": cat,
            "description": title, "featured": False, "display_order": idx,
            "created_at": now(),
        })
    print(f"Inserted {len(GALLERY)} gallery items")

    # Update settings
    settings_doc = {
        "key": "clinic_settings",
        "clinic_name": "CARE WITH US",
        "tagline": "Movement. Recovery. Rehabilitation.",
        "logo": LOGO,
        "footer_text": "CARE WITH US – Advanced Physiotherapy & Rehabilitation Centre. Helping You Move Better • Recover Faster.",
        "address": "3rd Floor, Aastha Hospital, Pratap Nagar, Jaipur, Rajasthan",
        "phone": "+91 00000 00000",
        "whatsapp": "+91 00000 00000",
        "email": "info@carewithus.in",
        "emergency": "+91 00000 00000",
        "google_maps_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.7896775920404!2d75.79432!3d26.83115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db5a68e7dfec1%3A0xa66a3d9c8f5bbd9!2sPratap%20Nagar%2C%20Jaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000",
        "business_hours": {
            "monday": "9:00 AM - 8:00 PM",
            "tuesday": "9:00 AM - 8:00 PM",
            "wednesday": "9:00 AM - 8:00 PM",
            "thursday": "9:00 AM - 8:00 PM",
            "friday": "9:00 AM - 8:00 PM",
            "saturday": "9:00 AM - 6:00 PM",
            "sunday": "By Appointment",
        },
        "social": {
            "facebook": "",
            "instagram": "",
            "youtube": "",
            "linkedin": "",
        },
        "mission": "Deliver high-quality physiotherapy services, promote faster recovery through personalized rehabilitation, educate patients about prevention, and enhance functional independence and quality of life.",
        "vision": "To become a trusted center of excellence in physiotherapy and rehabilitation by delivering ethical, innovative, and evidence-based healthcare.",
        "about": "CARE WITH US is a comprehensive physiotherapy and rehabilitation clinic located on the 3rd Floor, Aastha Hospital, Pratap Nagar, Jaipur. We believe that every patient deserves personalized treatment based on scientific assessment and modern rehabilitation techniques. Whether you are recovering from an injury, surgery, neurological condition, or chronic pain, our team is dedicated to helping you achieve your rehabilitation goals.",
        "counters": {
            "happy_patients": 500,
            "years_experience": 5,
            "treatments_completed": 2500,
            "recovery_rate": 95,
            "home_visits": 200,
        },
        "hero_slides": [
            {
                "id": uid(),
                "image": CLINIC_WIDE,
                "heading": "Movement. Recovery. Rehabilitation.",
                "subheading": "Advanced physiotherapy & rehabilitation in Pratap Nagar, Jaipur",
                "description": "Evidence-based, patient-centered, and compassionate care to help you regain movement, reduce pain, and improve your quality of life.",
                "cta_text": "Book Appointment",
                "cta_link": "/appointment",
            },
            {
                "id": uid(),
                "image": TREATMENT_ROOM,
                "heading": "Personalized Rehabilitation Plans",
                "subheading": "For every patient. Every condition. Every stage.",
                "description": "From orthopedic and sports rehab to neurological, women's & pediatric care — our team designs a plan around you.",
                "cta_text": "Explore Services",
                "cta_link": "/services",
            },
            {
                "id": uid(),
                "image": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1600",
                "heading": "Helping You Move Better • Recover Faster",
                "subheading": "Modern equipment • Experienced team • Ethical care",
                "description": "Take the first step toward a pain-free and active life at CARE WITH US.",
                "cta_text": "Contact Us",
                "cta_link": "/contact",
            },
        ],
        "updated_at": now(),
    }
    await db.settings.update_one({"key": "clinic_settings"}, {"$set": settings_doc}, upsert=True)
    print("Updated settings")

    # Cleanup any old test artifacts
    for coll in ['testimonials', 'contact_requests']:
        r = await db[coll].delete_many({"name": {"$regex": "^TEST_", "$options": "i"}})
        if r.deleted_count:
            print(f"Cleaned {r.deleted_count} test artifacts from {coll}")

    client.close()
    print("\n✅ Migration complete — real clinic content is now live.")

if __name__ == "__main__":
    asyncio.run(main())
