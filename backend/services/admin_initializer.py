from sqlalchemy.orm import Session

from models.user import User
from auth.hashing import hash_password


def create_default_admin(db: Session):

    admin = (
        db.query(User)
        .filter(User.role == "Admin")
        .first()
    )

    if admin:
        return

    admin = User(
        username="Administrator",
        email="shubhamk69@gmail.com",
        password=hash_password("Admin@123"),
        role="Admin",
        clearance="Secret",
        status="Approved",
        is_active=True,
    )

    db.add(admin)
    db.commit()

    print("====================================")
    print(" Default Administrator Created")
    print(" Email    : shubhamk69@gmail.com")
    print(" Password : Admin@123")
    print("====================================")