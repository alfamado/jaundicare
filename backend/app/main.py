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


from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.db.session import create_all_tables
from app.routes.screening import router as screening_router
from app.routes.profile   import router as profile_router
from app.routes.facility  import router as facility_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="JaundiCare API",
    version="1.0.0",
    description="Neonatal jaundice screening and triage API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(screening_router)
app.include_router(profile_router)
app.include_router(facility_router)


@app.get("/")
def root():
    return {"message": "JaundiCare API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}