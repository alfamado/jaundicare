# """
# JaundiCare — Auth Middleware
# FastAPI dependency for protecting routes.
# """

# from fastapi import Depends, HTTPException, status
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from sqlalchemy.orm import Session

# from app.db.session import get_db
# from app.db.models import User
# from app.services.auth_utils import decode_token

# bearer_scheme = HTTPBearer()


# def get_current_user(
#     credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
#     db: Session = Depends(get_db),
# ) -> User:
#     """
#     FastAPI dependency — extracts and validates JWT from Authorization header.
#     Use as: current_user: User = Depends(get_current_user)
#     """
#     token = credentials.credentials
#     payload = decode_token(token)

#     if not payload or payload.get("type") != "access":
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired token.",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     user_id = payload.get("sub")
#     user    = db.query(User).filter(User.id == user_id).first()

#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="User not found.",
#         )

#     if not user.is_verified:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Phone number not verified.",
#         )

#     return user


# def get_current_chw(current_user: User = Depends(get_current_user)) -> User:
#     """Additional dependency — CHW-only routes."""
#     if current_user.role != "health_worker":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="This feature is only available to health workers.",
#         )
#     return current_user





"""
JaundiCare — Auth Middleware (High-Scale Production Ready)
Optimized with explicit binary UUID parsing, standardized 401 interceptor targets,
and unblocked exception loops for smooth mobile session rotation.
"""

from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, UserRole
from app.services.auth_utils import decode_token

# Setting auto_error=False lets us catch missing tokens manually and return 
# a clean 401 instead of a confusing 403, allowing mobile interceptors to handle refresh loops smoothly.
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — Extracts and validates the JWT from Authorization headers.
    Enforces security boundaries while minimizing latency under high-concurrency traffic.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_token(token)

    # Validate signature stability and token scope
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload: Missing subject identity.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Cast the token string to a native Python UUID object to align perfectly 
        # with our high-scale binary Postgres index (as_uuid=True).
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload: Invalid identifier format.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # High-speed primary key index lookup
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Associated user account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure phone verification state is active before allowing systemic access
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted: Phone number verification pending.",
        )

    return user


def get_current_chw(current_user: User = Depends(get_current_user)) -> User:
    """
    Additional downstream dependency — Isolates Community Health Extension Worker (CHW) operations.
    Prevents unauthorized mothers/parents from accessing restricted triage or facility assignment portals.
    """
    if current_user.role != UserRole.health_worker.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: This feature is exclusively available to health workers.",
        )
    return current_user