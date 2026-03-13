from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import auth, admin, tasks

app = FastAPI(title="DMK Campaign Coordination Platform", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create schema + tables on startup
@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "DMK Campaign Platform API", "version": "2.0.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
