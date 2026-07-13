# from fastapi import FastAPI
# from app.routes.screening import router as screening_router

# app = FastAPI(
#     title="JaundiCare API",
#     version="1.0.0",
#     description="Neonatal jaundice screening and triage API"
# )

# app.include_router(screening_router)


# @app.get("/")
# def root():
#     return {
#         "message": "JaundiCare API is running"
#     }


# @app.get("/health")
# def health():
#     return {
#         "status": "ok"
#     }

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.routes.screening import router as screening_router

# app = FastAPI(
#     title="JaundiCare API",
#     version="1.0.0",
#     description="Neonatal jaundice screening and triage API"
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(screening_router)


# @app.get("/")
# def root():
#     return {"message": "JaundiCare API is running"}


# @app.get("/health")
# def health():
#     return {"status": "ok"}

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.routes.screening import router as screening_router
# from app.routes.profile import router as profile_router
# from app.routes.facility import router as facility_router

# app = FastAPI(
#     title="JaundiCare API",
#     version="1.0.0",
#     description="Neonatal jaundice screening and triage API"
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(screening_router)
# app.include_router(profile_router)
# app.include_router(facility_router)


# @app.get("/")
# def root():
#     return {"message": "JaundiCare API is running"}


# @app.get("/health")
# def health():
#     return {"status": "ok"}


# from contextlib import asynccontextmanager
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv

# load_dotenv()

# from app.db.session import create_all_tables
# from app.routes.screening import router as screening_router
# from app.routes.profile   import router as profile_router
# from app.routes.facility  import router as facility_router

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     create_all_tables()
#     yield

# app = FastAPI(
#     title="JaundiCare API",
#     version="2.0.0",
#     description="Neonatal jaundice screening — PostgreSQL + Cloudinary edition",
#     lifespan=lifespan,
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(screening_router)
# app.include_router(profile_router)
# app.include_router(facility_router)

# @app.get("/")
# def root():
#     return {"message": "JaundiCare API v2 is running"}

# @app.get("/health")
# def health():
#     return {"status": "ok"}


# from contextlib import asynccontextmanager
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv

# load_dotenv()

# from app.db.session import create_all_tables
# from app.routes.screening import router as screening_router
# from app.routes.profile   import router as profile_router
# from app.routes.facility  import router as facility_router

# from app.routes.helpmum import router as helpmum_router
# app.include_router(helpmum_router)


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     create_all_tables()
#     yield


# app = FastAPI(
#     title="JaundiCare API",
#     version="1.0.0",
#     description="Neonatal jaundice screening and triage API",
#     lifespan=lifespan,
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(screening_router)
# app.include_router(profile_router)
# app.include_router(facility_router)


# @app.get("/")
# def root():
#     return {"message": "JaundiCare API is running"}


# @app.get("/health")
# def health():
#     return {"status": "ok"}





# from contextlib import asynccontextmanager
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from dotenv import load_dotenv

# load_dotenv()

# from app.db.session import create_all_tables
# from app.routes.screening import router as screening_router
# from app.routes.profile   import router as profile_router
# from app.routes.facility  import router as facility_router
# from app.routes.helpmum   import router as helpmum_router
# from app.routes.auth import router as auth_router
# app.include_router(auth_router)

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Initialize database tables on server start
#     create_all_tables()
#     yield

# app = FastAPI(
#     title="JaundiCare API",
#     version="1.0.0",
#     description="Neonatal jaundice screening and triage API",
#     lifespan=lifespan,
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Route registrations (All cleanly mounted on the app instance)
# app.include_router(screening_router)
# app.include_router(profile_router)
# app.include_router(facility_router)
# app.include_router(helpmum_router)


# @app.get("/")
# def root():
#     return {"message": "JaundiCare API is running"}


# @app.get("/health")
# def health():
#     return {"status": "ok"}


from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv

load_dotenv()


def _allowed_origins() -> list[str]:
    configured = os.getenv("CORS_ALLOWED_ORIGINS", "")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    if origins:
        return origins

    if os.getenv("ENVIRONMENT", "development").lower() == "production":
        raise RuntimeError("CORS_ALLOWED_ORIGINS must be configured in production.")

    return ["http://localhost:5500", "http://127.0.0.1:5500"]

from app.routes.screening_secure import router as screening_router
from app.routes.profile   import router as profile_router
from app.routes.facility  import router as facility_router
from app.routes.helpmum   import router as helpmum_router
from app.routes.auth      import router as auth_router
from app.services.termii_service import close_termii_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        await close_termii_client()

app = FastAPI(
    title="JaundiCare API",
    version="1.0.0",
    description="Neonatal jaundice screening and triage API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

allowed_hosts = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]
app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

# Route registrations (All cleanly mounted on the app instance AFTER creation)
app.include_router(auth_router)  # Moved here
app.include_router(screening_router)
app.include_router(profile_router)
app.include_router(facility_router)
app.include_router(helpmum_router)


@app.get("/")
def root():
    return {"message": "JaundiCare API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
