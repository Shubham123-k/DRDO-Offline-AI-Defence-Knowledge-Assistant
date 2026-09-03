import os
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from models.user import User
from auth.hashing import hash_password

load_dotenv()


def create_default_admin(db: Session):

    admin = (
        db.query(User)
        .filter(User.role == "Admin")
        .first()
    )

    if admin:
        return

    admin_email = os.getenv(
        "DEFAULT_ADMIN_EMAIL"
    )

    admin_password = os.getenv(
        "DEFAULT_ADMIN_PASSWORD"
    )

    if not admin_email or not admin_password:
        raise RuntimeError(
            "DEFAULT_ADMIN_EMAIL and "
            "DEFAULT_ADMIN_PASSWORD must be "
            "configured in the .env file."
        )

    admin = User(
        username="Administrator",
        email=admin_email,
        password=hash_password(
            admin_password
        ),
        role="Admin",
        clearance="Secret",
        status="Approved",
        is_active=True,
    )

    db.add(admin)
    db.commit()

    print("====================================")
    print(" Default Administrator Created")
    print(f" Email    : {admin_email}")
    print(" Password : [HIDDEN]")
    print("====================================")