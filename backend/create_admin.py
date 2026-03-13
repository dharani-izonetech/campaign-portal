"""
Run once to create the first admin user.

    cd backend
    python create_admin.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, init_db
from app.models.user import User
from app.models.user_progress import UserProgress
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# ── Edit these before running ─────────────────────────────────────────────────
ADMIN_NAME           = "Admin"
ADMIN_USERNAME       = "admin"
ADMIN_EMAIL          = "admin@campaignhq.com"
ADMIN_PASSWORD       = "Admin@123"
ADMIN_DISTRICT       = "HQ"
ADMIN_CONSTITUENCY   = "Central"
ADMIN_RESPONSIBILITY = "Platform Administrator"
# ─────────────────────────────────────────────────────────────────────────────

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_admin():
    # Ensure schema + tables exist
    init_db()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if existing:
            print(f"[!] User '{ADMIN_USERNAME}' already exists (role: {existing.role})")
            if existing.role != "admin":
                existing.role = "admin"
                db.commit()
                print("    → Role upgraded to admin.")
            else:
                print("    → Already an admin. Nothing changed.")
            return

        admin = User(
            name           = ADMIN_NAME,
            username       = ADMIN_USERNAME,
            email          = ADMIN_EMAIL,
            password       = pwd.hash(ADMIN_PASSWORD),
            district       = ADMIN_DISTRICT,
            constituency   = ADMIN_CONSTITUENCY,
            responsibility = ADMIN_RESPONSIBILITY,
            role           = "admin",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        db.add(UserProgress(user_id=admin.id, completed=0, remaining=0))
        db.commit()

        print("=" * 52)
        print("  ✅  Admin created successfully!")
        print("=" * 52)
        print(f"  Username       : {ADMIN_USERNAME}")
        print(f"  Email          : {ADMIN_EMAIL}")
        print(f"  Password       : {ADMIN_PASSWORD}")
        print(f"  Responsibility : {ADMIN_RESPONSIBILITY}")
        print("=" * 52)
        print("  Login at: http://localhost:3000/login")
        print("=" * 52)
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
