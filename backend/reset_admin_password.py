import os
from dotenv import load_dotenv
from database.db import SessionLocal
from models.user import User
from auth.hashing import hash_password

load_dotenv()

email = (os.getenv("DEFAULT_ADMIN_EMAIL") or "").strip().lower()
password = os.getenv("DEFAULT_ADMIN_PASSWORD") or ""

if not email or not password:
    raise SystemExit(
        "DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set in backend/.env"
    )

db = SessionLocal()
try:
    admin = db.query(User).filter(User.email.ilike(email)).first()
    if not admin:
        raise SystemExit(f"No administrator account found for {email}")
    if admin.role.lower() != "admin":
        raise SystemExit(f"The account {email} is not an administrator account")

    admin.password = hash_password(password)
    admin.status = "Approved"
    admin.is_active = True
    admin.clearance = "Secret"
    db.commit()
    print(f"Administrator password reset successfully for {email}.")
finally:
    db.close()
