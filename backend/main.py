import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db
from routes.tickets import router as tickets_router

# Load env configurations
load_dotenv()

app = FastAPI(
    title="Customer Support CRM API",
    description="FastAPI + SQLite CRM backend for support tickets",
    version="1.0.0"
)

# Startup DB initialization
@app.on_event("startup")
def startup_event():
    init_db()

# CORS configuration
origins = ["http://localhost:5173", "*"]
# FastAPI CORSMiddleware asserts that allow_credentials cannot be True if origin is wildcard (*)
# Since our simple CRM frontend does not rely on cookies or auth headers, we disable credentials
# when "*" is in allow_origins to prevent runtime errors.
allow_credentials = False if "*" in origins else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes with prefix /api
app.include_router(tickets_router, prefix="/api")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Run with uvicorn on port 5000
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
