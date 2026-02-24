from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import jwt
import csv
import io

# MySQL Integration
from mysql_db import (
    get_featured_colleges, get_college_by_id, get_courses_for_college,
    get_all_courses_with_colleges, get_states, get_cities, get_categories,
    get_fee_structure, close_mysql_pool, get_course_levels, get_course_names,
    get_course_by_id
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'ohcampus-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="OhCampus Counselor Platform API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# ===================== MODELS =====================

# Designation constants
DESIGNATIONS = ["Admission Counselor", "Senior Admission Counselor", "Team Lead", "Admission Manager"]

class UserBase(BaseModel):
    email: str
    name: str
    role: str = "counselor"  # counselor or admin
    designation: Optional[str] = None  # Admission Counselor, Senior Admission Counselor, Team Lead, Admission Manager
    team_lead_id: Optional[str] = None  # Reference to team lead user
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_by: Optional[str] = None  # Admin who created this user
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Admission/Candidate Models
class FeeInstalment(BaseModel):
    amount: float
    paid_date: str
    description: Optional[str] = None

class AdmissionBase(BaseModel):
    candidate_name: str
    place: str
    college_id: str
    course_id: str
    admission_date: str
    fees_paid: float = 0
    total_fees: float
    balance: float = 0
    instalments: List[FeeInstalment] = []
    remark: Optional[str] = None
    scholarship_amount: Optional[float] = None  # One-time scholarship if offered

class Admission(AdmissionBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    counselor_id: str  # Who created this admission
    counselor_name: Optional[str] = None
    college_name: Optional[str] = None
    course_name: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Admission Target Model
class TargetBase(BaseModel):
    counselor_id: str
    target_type: str  # monthly, quarterly
    period: str  # e.g., "2026-02" for monthly, "2026-Q1" for quarterly
    target_count: int  # Number of admissions target
    target_fees: Optional[float] = None  # Fees collection target

class Target(TargetBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    counselor_name: Optional[str] = None
    assigned_by: str  # User ID who assigned
    assigned_by_name: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Activity Log Model
class ActivityLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    action: str  # login, create_admission, update_admission, delete_admission, update_fee, create_user, update_user, reset_password
    entity_type: str  # user, admission, fee, target
    entity_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class AdmissionAlert(BaseModel):
    title: str
    message: str
    alert_type: str = "info"  # info, warning, important, deadline
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True

class CollegeBase(BaseModel):
    name: str
    state: str
    city: str
    category: str
    address: Optional[str] = None
    image_url: Optional[str] = None
    highlights: List[str] = []
    whats_new: List[str] = []
    is_featured: bool = True
    established: Optional[str] = None
    accreditation: Optional[str] = None
    admission_alerts: List[AdmissionAlert] = []

class College(CollegeBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CourseBase(BaseModel):
    name: str
    college_id: str
    duration: str
    level: str  # UG, PG, Doctoral
    duration_years: Optional[int] = None  # For calculating fee periods
    duration_semesters: Optional[int] = None  # For calculating fee periods
    seat_status: str = "Available"  # Available, Closing, Under Waiting, Closed
    description: Optional[str] = None
    eligibility: Optional[str] = None
    scope: Optional[str] = None
    job_profiles: List[str] = []
    category: Optional[str] = None  # Engineering, Management, Medicine, etc.

class Course(CourseBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

# Placement model
class PlacementStats(BaseModel):
    year: str
    highest_package: Optional[float] = None
    average_package: Optional[float] = None
    median_package: Optional[float] = None
    placement_rate: Optional[float] = None
    total_offers: Optional[int] = None
    top_recruiters: List[str] = []

class CollegePlacement(BaseModel):
    college_id: str
    stats: List[PlacementStats] = []
    description: Optional[str] = None

class FeeBase(BaseModel):
    college_id: str
    course_id: str
    fee_type: str  # annual, semester
    year_or_semester: int  # 1, 2, 3, etc.
    amount: float
    hostel_fee: Optional[float] = None
    admission_fee: Optional[float] = None  # One-time admission charges
    description: Optional[str] = None

class Fee(FeeBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdmissionChargesBase(BaseModel):
    college_id: str
    course_id: str
    registration_fee: Optional[float] = None
    admission_fee: Optional[float] = None
    caution_deposit: Optional[float] = None
    uniform_fee: Optional[float] = None
    library_fee: Optional[float] = None
    lab_fee: Optional[float] = None
    other_charges: Optional[float] = None
    other_charges_description: Optional[str] = None

class AdmissionCharges(AdmissionChargesBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FAQBase(BaseModel):
    question: str
    answer: str
    college_id: Optional[str] = None  # None means global FAQ
    is_global: bool = True
    order: int = 0

class FAQ(FAQBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FiltersResponse(BaseModel):
    states: List[str]
    cities: List[str]
    categories: List[str]
    courses: List[str] = []

# Scholarship Application Status constants
SCHOLARSHIP_STATUSES = ["Pending", "Under Review", "Contacted", "Eligible", "Not Eligible", "Converted", "Rejected"]

# Scholarship Application Model - for student applications from ohcampus.com/check-scholarship
class ScholarshipApplicationBase(BaseModel):
    # Personal Information
    name: str
    email: str
    phone: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    
    # Address
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    
    # Academic Information
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    graduation_percentage: Optional[float] = None
    current_education: Optional[str] = None
    
    # Preferred Course/Stream
    preferred_stream: Optional[str] = None
    preferred_course: Optional[str] = None
    preferred_college: Optional[str] = None
    
    # Documents (URLs)
    marks_card_url: Optional[str] = None
    scorecard_url: Optional[str] = None
    aadhar_url: Optional[str] = None
    photo_url: Optional[str] = None
    
    # UTM Tracking
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None
    
    # Counselor Reference
    counselor_id: Optional[str] = None
    counselor_name: Optional[str] = None
    
    # Admin fields
    status: str = "Pending"
    admin_notes: Optional[str] = None

class ScholarshipApplication(ScholarshipApplicationBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    application_number: Optional[str] = None  # Human-readable application number
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ScholarshipApplicationCreate(BaseModel):
    """Create model for external scholarship submissions"""
    name: str
    email: str
    phone: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    graduation_percentage: Optional[float] = None
    current_education: Optional[str] = None
    preferred_stream: Optional[str] = None
    preferred_course: Optional[str] = None
    preferred_college: Optional[str] = None
    marks_card_url: Optional[str] = None
    scorecard_url: Optional[str] = None
    aadhar_url: Optional[str] = None
    photo_url: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None

class ScholarshipApplicationUpdate(BaseModel):
    """Update model for admin editing"""
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    counselor_id: Optional[str] = None
    counselor_name: Optional[str] = None

# ===================== HELPERS =====================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def require_admin_or_manager(current_user: dict = Depends(get_current_user)):
    """Allow access to admin or Admission Manager"""
    if current_user.get("role") == "admin":
        return current_user
    # Check if user is Admission Manager
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if user and user.get("designation") == "Admission Manager":
        return current_user
    raise HTTPException(status_code=403, detail="Admin or Admission Manager access required")

async def require_target_assigner(current_user: dict = Depends(get_current_user)):
    """Allow access to admin, Team Lead, or Admission Manager"""
    if current_user.get("role") == "admin":
        return current_user
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if user and user.get("designation") in ["Team Lead", "Admission Manager"]:
        return current_user
    raise HTTPException(status_code=403, detail="Admin, Team Lead, or Admission Manager access required")

# Helper function to log activities
async def log_activity(user_id: str, user_name: str, user_email: str, action: str, entity_type: str, entity_id: str = None, details: str = None):
    """Log user activity"""
    log_entry = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "user_name": user_name,
        "user_email": user_email,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.activity_logs.insert_one(log_entry)

# ===================== AUTH ENDPOINTS =====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    user_dict = user.model_dump()
    user_dict["password_hash"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.email, user.role)
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role}
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is deactivated")
    
    # Log activity
    await log_activity(user["id"], user["name"], user["email"], "login", "user", user["id"], "User logged in")
    
    token = create_token(user["id"], user["email"], user["role"])
    return TokenResponse(
        access_token=token,
        user={
            "id": user["id"], 
            "email": user["email"], 
            "name": user["name"], 
            "role": user["role"],
            "designation": user.get("designation"),
            "team_lead_id": user.get("team_lead_id"),
            "phone": user.get("phone")
        }
    )

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ===================== FILTERS ENDPOINT =====================

@api_router.get("/filters", response_model=FiltersResponse)
async def get_filters():
    """Get filter options from MySQL database"""
    try:
        states = await get_states()
        cities_list = await get_cities()
        categories = await get_categories()
        courses = await get_course_names()
        return FiltersResponse(states=sorted(states), cities=sorted(cities_list), categories=sorted(categories), courses=courses)
    except Exception as e:
        logging.error(f"Error fetching filters from MySQL: {e}")
        # Fallback to MongoDB
        states = await db.colleges.distinct("state", {"is_featured": True})
        cities_list = await db.colleges.distinct("city", {"is_featured": True})
        categories = await db.colleges.distinct("category", {"is_featured": True})
        courses = await db.courses.distinct("name")
        return FiltersResponse(states=sorted(states), cities=sorted(cities_list), categories=sorted(categories), courses=sorted(courses))

@api_router.get("/filters/course-levels")
async def get_course_levels_endpoint():
    """Get all available course levels from featured colleges"""
    try:
        levels = await get_course_levels()
        return {"levels": levels}
    except Exception as e:
        logging.error(f"Error fetching course levels from MySQL: {e}")
        return {"levels": ["UG", "PG", "Diploma", "Doctorial"]}

@api_router.get("/filters/cities")
async def get_cities_by_state(state: Optional[str] = None):
    """Get cities filtered by state from MySQL"""
    try:
        cities_list = await get_cities(state)
        return {"cities": sorted(cities_list)}
    except Exception as e:
        logging.error(f"Error fetching cities from MySQL: {e}")
        query = {"is_featured": True}
        if state:
            query["state"] = state
        cities_list = await db.colleges.distinct("city", query)
        return {"cities": sorted(cities_list)}

# ===================== COLLEGES ENDPOINTS =====================

@api_router.get("/colleges")
async def get_colleges_endpoint(
    state: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    course: Optional[str] = None,
    search: Optional[str] = None,
    level: Optional[str] = None,
    fee_range: Optional[str] = None  # "below_100000", "below_200000", "above_200000"
):
    """Fetch featured colleges from MySQL database - optimized for speed"""
    try:
        # Fetch from MySQL - course counts included in query
        colleges = await get_featured_colleges(
            state=state,
            city=city,
            category=category,
            search=search
        )
        
        # Fetch admission alerts for all MySQL colleges
        college_ids = [c["id"] for c in colleges]
        alerts_docs = await db.college_admission_alerts.find(
            {"college_id": {"$in": college_ids}}, 
            {"_id": 0}
        ).to_list(500)
        alerts_map = {doc["college_id"]: doc.get("admission_alerts", []) for doc in alerts_docs}
        
        # Add admission alerts to each college
        for college in colleges:
            college["admission_alerts"] = alerts_map.get(college["id"], [])
        
        # Helper function to calculate first year fees
        def get_first_year_fees(fees):
            if not fees:
                return 0
            # Get first year annual fees
            first_year_annual = sum(
                f.get("amount", 0) for f in fees 
                if f.get("fee_type") == "annual" and f.get("year_or_semester") == 1
            )
            # Get 1st and 2nd semester fees
            first_two_semesters = sum(
                f.get("amount", 0) for f in fees 
                if f.get("fee_type") == "semester" and f.get("year_or_semester") in [1, 2]
            )
            # Return whichever is available (prefer annual if both exist)
            return first_year_annual if first_year_annual > 0 else first_two_semesters
        
        # If fee_range is specified, we need to filter by fees
        if fee_range or course or level:
            result = []
            for college in colleges:
                college_courses = await get_courses_for_college(college["id"])
                
                # Filter courses by level if specified
                if level:
                    college_courses = [c for c in college_courses if c.get("level") == level]
                
                # Filter by course name if specified
                if course:
                    college_courses = [c for c in college_courses if course.lower() in c.get("name", "").lower()]
                
                # Skip college if no matching courses after filtering
                if not college_courses:
                    continue
                
                # If fee_range is specified, check if any course has fees in range
                if fee_range:
                    # Fetch fees for all courses in this college
                    course_ids = [c["id"] for c in college_courses]
                    all_fees = await db.fees.find(
                        {"course_id": {"$in": course_ids}}, 
                        {"_id": 0}
                    ).to_list(500)
                    
                    # Group fees by course_id
                    fees_by_course = {}
                    for fee in all_fees:
                        cid = fee["course_id"]
                        if cid not in fees_by_course:
                            fees_by_course[cid] = []
                        fees_by_course[cid].append(fee)
                    
                    # Filter courses based on fee range
                    matching_courses = []
                    for c in college_courses:
                        course_fees = fees_by_course.get(c["id"], [])
                        first_year = get_first_year_fees(course_fees)
                        
                        # Include course if it matches the fee range
                        if fee_range == "below_100000" and 0 < first_year < 100000:
                            c["first_year_fee"] = first_year
                            matching_courses.append(c)
                        elif fee_range == "below_200000" and 0 < first_year < 200000:
                            c["first_year_fee"] = first_year
                            matching_courses.append(c)
                        elif fee_range == "above_200000" and first_year > 200000:
                            c["first_year_fee"] = first_year
                            matching_courses.append(c)
                    
                    # Skip college if no courses match fee range
                    if not matching_courses:
                        continue
                    
                    college["courses"] = matching_courses
                    college["course_count"] = len(matching_courses)
                else:
                    college["courses"] = college_courses
                    college["course_count"] = len(college_courses)
                
                result.append(college)
            
            return result
        
        # No course/fee filtering - return colleges directly (fast!)
        return colleges
        
    except Exception as e:
        logging.error(f"Error fetching colleges from MySQL: {e}")
        # Fallback to MongoDB
        query = {"is_featured": True}
        if state:
            query["state"] = state
        if city:
            query["city"] = city
        if category:
            query["category"] = category
        if search:
            query["name"] = {"$regex": search, "$options": "i"}
        
        colleges = await db.colleges.find(query, {"_id": 0}).to_list(None)
        for college in colleges:
            courses = await db.courses.find({"college_id": college["id"]}, {"_id": 0}).to_list(None)
            college["courses"] = courses
            college["course_count"] = len(courses)
        
        return colleges

@api_router.get("/colleges/compare")
async def compare_colleges(college_ids: str):
    """Compare multiple colleges - pass comma-separated IDs"""
    ids = [id.strip() for id in college_ids.split(",")]
    if len(ids) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 college IDs to compare")
    if len(ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 colleges can be compared at once")
    
    result = []
    for college_id in ids:
        # Try MySQL first for c- prefixed IDs (also handle legacy mysql- prefix)
        if college_id.startswith("c-") or college_id.startswith("mysql-"):
            try:
                college = await get_college_by_id(college_id)
                if college:
                    courses = await get_courses_for_college(college_id)
                    result.append({
                        "college": college,
                        "courses": courses,
                        "fees": [],
                        "fees_by_course": {},
                        "admission_charges": []
                    })
                continue
            except Exception as e:
                logging.error(f"Error fetching college from MySQL: {e}")
        
        # Fallback to MongoDB
        college = await db.colleges.find_one({"id": college_id}, {"_id": 0})
        if college:
            courses = await db.courses.find({"college_id": college_id}, {"_id": 0}).to_list(None)
            fees = await db.fees.find({"college_id": college_id}, {"_id": 0}).to_list(None)
            admission_charges = await db.admission_charges.find({"college_id": college_id}, {"_id": 0}).to_list(None)
            
            fees_by_course = {}
            for fee in fees:
                course_id = fee["course_id"]
                if course_id not in fees_by_course:
                    fees_by_course[course_id] = {
                        "total_tuition": 0,
                        "total_hostel": 0,
                        "fees": []
                    }
                fees_by_course[course_id]["total_tuition"] += fee.get("amount", 0)
                fees_by_course[course_id]["total_hostel"] += fee.get("hostel_fee", 0) or 0
                fees_by_course[course_id]["fees"].append(fee)
            
            result.append({
                "college": college,
                "courses": courses,
                "fees": fees,
                "fees_by_course": fees_by_course,
                "admission_charges": admission_charges
            })
    
    return result

@api_router.get("/colleges/{college_id}")
async def get_college(college_id: str):
    """Get single college by ID - supports both MySQL and MongoDB"""
    # Try MySQL first for c- prefixed IDs (also handle legacy mysql- prefix)
    if college_id.startswith("c-") or college_id.startswith("mysql-"):
        try:
            college = await get_college_by_id(college_id)
            if college:
                # Fetch admission alerts from separate collection for MySQL colleges
                alerts_doc = await db.college_admission_alerts.find_one({"college_id": college_id}, {"_id": 0})
                if alerts_doc:
                    college["admission_alerts"] = alerts_doc.get("admission_alerts", [])
                else:
                    college["admission_alerts"] = []
                return college
        except Exception as e:
            logging.error(f"Error fetching college from MySQL: {e}")
    
    # Fallback to MongoDB
    college = await db.colleges.find_one({"id": college_id}, {"_id": 0})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return college

@api_router.post("/colleges", response_model=College, status_code=status.HTTP_201_CREATED)
async def create_college(college_data: CollegeBase, current_user: dict = Depends(require_admin)):
    college = College(**college_data.model_dump())
    await db.colleges.insert_one(college.model_dump())
    return college

@api_router.put("/colleges/{college_id}", response_model=College)
async def update_college(college_id: str, college_data: CollegeBase, current_user: dict = Depends(require_admin)):
    existing = await db.colleges.find_one({"id": college_id})
    if not existing:
        raise HTTPException(status_code=404, detail="College not found")
    
    update_data = college_data.model_dump()
    await db.colleges.update_one({"id": college_id}, {"$set": update_data})
    
    updated = await db.colleges.find_one({"id": college_id}, {"_id": 0})
    return updated

# Admission Alerts Management
class AdmissionAlertInput(BaseModel):
    title: str
    message: str
    alert_type: str = "info"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True

@api_router.put("/colleges/{college_id}/admission-alerts")
async def update_admission_alerts(college_id: str, alerts: List[AdmissionAlertInput], current_user: dict = Depends(require_admin)):
    """Update admission alerts for a college"""
    # For MySQL colleges (c- prefix), store alerts in a separate collection
    if college_id.startswith("c-") or college_id.startswith("mysql-"):
        alerts_data = [alert.model_dump() for alert in alerts]
        # Use upsert to create or update the alerts document
        await db.college_admission_alerts.update_one(
            {"college_id": college_id},
            {"$set": {"college_id": college_id, "admission_alerts": alerts_data, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        return {"message": "Admission alerts updated", "admission_alerts": alerts_data}
    
    # For MongoDB colleges
    existing = await db.colleges.find_one({"id": college_id})
    if not existing:
        raise HTTPException(status_code=404, detail="College not found")
    
    alerts_data = [alert.model_dump() for alert in alerts]
    await db.colleges.update_one({"id": college_id}, {"$set": {"admission_alerts": alerts_data}})
    
    updated = await db.colleges.find_one({"id": college_id}, {"_id": 0})
    return {"message": "Admission alerts updated", "admission_alerts": updated.get("admission_alerts", [])}

# ===================== COURSES ENDPOINTS =====================

@api_router.get("/colleges/{college_id}/courses", response_model=List[Course])
async def get_courses(college_id: str):
    """Get courses for a specific college - supports both MySQL and MongoDB"""
    # Try MySQL first for c- prefixed IDs (also handle legacy mysql- prefix)
    if college_id.startswith("c-") or college_id.startswith("mysql-"):
        try:
            courses = await get_courses_for_college(college_id)
            if courses:
                # Fetch seat statuses from MongoDB and merge
                course_ids = [c["id"] for c in courses]
                seat_statuses = await db.course_seat_status.find(
                    {"course_id": {"$in": course_ids}}, 
                    {"_id": 0}
                ).to_list(500)
                
                # Create a lookup map
                status_map = {s["course_id"]: s["seat_status"] for s in seat_statuses}
                
                # Merge seat status into courses
                for course in courses:
                    course["seat_status"] = status_map.get(course["id"], "Available")
                
                return courses
        except Exception as e:
            logging.error(f"Error fetching courses from MySQL: {e}")
    
    # Fallback to MongoDB
    courses = await db.courses.find({"college_id": college_id}, {"_id": 0}).to_list(None)
    return courses

@api_router.post("/courses", response_model=Course, status_code=status.HTTP_201_CREATED)
async def create_course(course_data: CourseBase, current_user: dict = Depends(require_admin)):
    course = Course(**course_data.model_dump())
    await db.courses.insert_one(course.model_dump())
    return course

@api_router.get("/courses")
async def get_all_courses(category: Optional[str] = None, search: Optional[str] = None, level: Optional[str] = None):
    """Get all courses from featured colleges - MySQL"""
    try:
        courses = await get_all_courses_with_colleges(
            search=search,
            level=level,
            category=category
        )
        return courses
    except Exception as e:
        logging.error(f"Error fetching courses from MySQL: {e}")
        # Fallback to MongoDB
        query = {}
        if category:
            query["category"] = category
        if search:
            query["name"] = {"$regex": search, "$options": "i"}
        courses = await db.courses.find(query, {"_id": 0}).to_list(500)
        return courses

@api_router.get("/courses/with-college")
async def get_courses_with_college(
    category: Optional[str] = None, 
    search: Optional[str] = None, 
    level: Optional[str] = None,
    course_name: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    fee_min: Optional[int] = None,
    fee_max: Optional[int] = None,
    state: Optional[str] = None,
    city: Optional[str] = None
):
    """Get all courses with their college information - MySQL with pagination and filters"""
    try:
        # Combine search and course_name filter
        combined_search = search
        
        result = await get_all_courses_with_colleges(
            search=combined_search,
            level=level,
            category=category,
            page=page,
            limit=limit,
            fee_min=fee_min,
            fee_max=fee_max,
            state=state,
            city=city,
            course_name=course_name
        )
        
        # Enrich courses with MongoDB fee data for fee range filtering
        if result.get("courses"):
            course_ids = [c["id"] for c in result["courses"]]
            
            # Batch fetch fees from MongoDB for all courses
            all_fees = await db.fees.find(
                {"course_id": {"$in": course_ids}}, 
                {"_id": 0}
            ).to_list(5000)
            
            # Create a fees lookup map by course_id
            fees_map = {}
            for fee in all_fees:
                course_id = fee["course_id"]
                if course_id not in fees_map:
                    fees_map[course_id] = []
                fees_map[course_id].append(fee)
            
            # Add fees to each course
            for course in result["courses"]:
                course["fees"] = fees_map.get(course["id"], [])
        
        return result
    except Exception as e:
        logging.error(f"Error fetching courses from MySQL: {e}")
        # Fallback to MongoDB
        query = {}
        if category:
            query["category"] = category
        if search or course_name:
            query["name"] = {"$regex": search or course_name, "$options": "i"}
        
        courses = await db.courses.find(query, {"_id": 0}).to_list(500)
        
        # Enrich with college info and fees
        result = []
        for course in courses:
            college = await db.colleges.find_one({"id": course["college_id"]}, {"_id": 0})
            if college:
                course["college"] = {
                    "id": college["id"],
                    "name": college["name"],
                    "city": college["city"],
                    "state": college["state"],
                    "category": college["category"]
                }
                # Fetch fees from MongoDB
                course["fees"] = await db.fees.find({"course_id": course["id"]}, {"_id": 0}).to_list(None)
                result.append(course)
        
        return {"courses": result, "total": len(result), "page": 1, "limit": 500, "total_pages": 1}

@api_router.get("/courses/{course_id}")
async def get_course_detail(course_id: str):
    """Get course details with college and fee information"""
    # Try MySQL first for cc- or c- prefixed IDs (also handle legacy mysql- prefix)
    if course_id.startswith("cc-") or course_id.startswith("c-") or course_id.startswith("mysql-"):
        try:
            result = await get_course_by_id(course_id)
            if result:
                # Also fetch fees from MongoDB for MySQL courses
                fees = await db.fees.find({"course_id": course_id}, {"_id": 0}).to_list(None)
                admission_charges = await db.admission_charges.find_one({"course_id": course_id}, {"_id": 0})
                result["fees"] = fees
                result["admission_charges"] = admission_charges
                return result
        except Exception as e:
            logging.error(f"Error fetching course from MySQL: {e}")
    
    # Fallback to MongoDB
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get college info
    college = await db.colleges.find_one({"id": course["college_id"]}, {"_id": 0})
    
    # Get fees for this course
    fees = await db.fees.find({"course_id": course_id}, {"_id": 0}).to_list(None)
    
    # Get admission charges
    admission_charges = await db.admission_charges.find_one({"course_id": course_id}, {"_id": 0})
    
    return {
        "course": course,
        "college": college,
        "fees": fees,
        "admission_charges": admission_charges
    }

@api_router.get("/courses/categories/list")
async def get_course_categories():
    """Get list of unique course categories"""
    categories = await db.courses.distinct("category")
    return {"categories": [c for c in categories if c]}

# Placement Endpoints
@api_router.get("/colleges/{college_id}/placements")
async def get_college_placements(college_id: str):
    """Get placement data for a college"""
    placement = await db.placements.find_one({"college_id": college_id}, {"_id": 0})
    if not placement:
        return {"college_id": college_id, "stats": [], "description": None}
    return placement

@api_router.put("/colleges/{college_id}/placements")
async def update_college_placements(college_id: str, placement_data: CollegePlacement, current_user: dict = Depends(require_admin)):
    """Update placement data for a college"""
    college = await db.colleges.find_one({"id": college_id})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    await db.placements.update_one(
        {"college_id": college_id},
        {"$set": placement_data.model_dump()},
        upsert=True
    )
    
    return {"message": "Placements updated successfully"}

# Seat Status Update
class SeatStatusUpdate(BaseModel):
    seat_status: str  # Available, Closing, Under Waiting, Closed

VALID_SEAT_STATUSES = ["Available", "Closing", "Under Waiting", "Closed"]

@api_router.put("/courses/{course_id}/seat-status")
async def update_seat_status(course_id: str, status_data: SeatStatusUpdate, current_user: dict = Depends(require_admin)):
    """Update seat availability status for a course"""
    if status_data.seat_status not in VALID_SEAT_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid seat status. Must be one of: {', '.join(VALID_SEAT_STATUSES)}")
    
    # Handle MySQL courses (cc- prefix) - store status in a separate collection
    if course_id.startswith("cc-") or course_id.startswith("mysql-"):
        # Store/update seat status in course_seat_status collection
        await db.course_seat_status.update_one(
            {"course_id": course_id},
            {"$set": {"course_id": course_id, "seat_status": status_data.seat_status, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
        return {"id": course_id, "seat_status": status_data.seat_status}
    
    # Handle MongoDB courses
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    await db.courses.update_one({"id": course_id}, {"$set": {"seat_status": status_data.seat_status}})
    
    updated = await db.courses.find_one({"id": course_id}, {"_id": 0})
    return updated

@api_router.put("/courses/{course_id}")
async def update_course(course_id: str, course_data: CourseBase, current_user: dict = Depends(require_admin)):
    """Update course details"""
    existing = await db.courses.find_one({"id": course_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_data.model_dump()
    await db.courses.update_one({"id": course_id}, {"$set": update_data})
    
    updated = await db.courses.find_one({"id": course_id}, {"_id": 0})
    return updated

# ===================== FEES ENDPOINTS =====================

@api_router.get("/fees", response_model=List[Fee])
async def get_all_fees(college_id: Optional[str] = None, course_id: Optional[str] = None):
    query = {}
    if college_id:
        query["college_id"] = college_id
    if course_id:
        query["course_id"] = course_id
    fees = await db.fees.find(query, {"_id": 0}).to_list(None)
    return fees

@api_router.get("/colleges/{college_id}/fees", response_model=List[Fee])
async def get_college_fees(college_id: str):
    fees = await db.fees.find({"college_id": college_id}, {"_id": 0}).to_list(None)
    return fees

@api_router.post("/fees", response_model=Fee, status_code=status.HTTP_201_CREATED)
async def create_fee(fee_data: FeeBase, current_user: dict = Depends(require_admin)):
    fee = Fee(**fee_data.model_dump())
    await db.fees.insert_one(fee.model_dump())
    return fee

# Bulk fee creation model
class BulkFeeItem(BaseModel):
    year_or_semester: int
    amount: float
    hostel_fee: Optional[float] = None
    description: Optional[str] = None

class BulkFeeCreate(BaseModel):
    college_id: str
    course_id: str
    fee_type: str  # annual or semester
    fees: List[BulkFeeItem]

@api_router.post("/fees/bulk", status_code=status.HTTP_201_CREATED)
async def create_bulk_fees(bulk_data: BulkFeeCreate, current_user: dict = Depends(require_admin)):
    """Create multiple fees at once for a course (all years or all semesters)"""
    # Skip validation for MySQL IDs (c- and cc- prefixes) - they exist in external MySQL database
    if not bulk_data.college_id.startswith("c-") and not bulk_data.college_id.startswith("mysql-"):
        # Validate college exists in MongoDB
        college = await db.colleges.find_one({"id": bulk_data.college_id})
        if not college:
            raise HTTPException(status_code=404, detail="College not found")
    
    if not bulk_data.course_id.startswith("cc-") and not bulk_data.course_id.startswith("mysql-"):
        # Validate course exists in MongoDB
        course = await db.courses.find_one({"id": bulk_data.course_id})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete existing fees for this college-course-fee_type combination
    await db.fees.delete_many({
        "college_id": bulk_data.college_id,
        "course_id": bulk_data.course_id,
        "fee_type": bulk_data.fee_type
    })
    
    # Create new fee records
    created_fees = []
    for fee_item in bulk_data.fees:
        fee_data = {
            "id": str(uuid.uuid4()),
            "college_id": bulk_data.college_id,
            "course_id": bulk_data.course_id,
            "fee_type": bulk_data.fee_type,
            "year_or_semester": fee_item.year_or_semester,
            "amount": fee_item.amount,
            "hostel_fee": fee_item.hostel_fee,
            "admission_fee": None,
            "description": fee_item.description,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.fees.insert_one(fee_data)
        created_fees.append(fee_data)
    
    return {
        "message": f"Successfully created {len(created_fees)} fee records",
        "fees_count": len(created_fees),
        "fees": [{k: v for k, v in f.items() if k != '_id'} for f in created_fees]
    }

@api_router.put("/fees/{fee_id}", response_model=Fee)
async def update_fee(fee_id: str, fee_data: FeeBase, current_user: dict = Depends(require_admin)):
    existing = await db.fees.find_one({"id": fee_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Fee not found")
    
    update_data = fee_data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.fees.update_one({"id": fee_id}, {"$set": update_data})
    
    updated = await db.fees.find_one({"id": fee_id}, {"_id": 0})
    return updated

@api_router.delete("/fees/{fee_id}")
async def delete_fee(fee_id: str, current_user: dict = Depends(require_admin)):
    result = await db.fees.delete_one({"id": fee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fee not found")
    return {"message": "Fee deleted successfully"}

# ===================== BULK CSV IMPORT ENDPOINT =====================

@api_router.post("/fees/import-csv", status_code=status.HTTP_201_CREATED)
async def import_fees_csv(file: UploadFile = File(...), current_user: dict = Depends(require_admin)):
    """
    Import fees from CSV file.
    Expected CSV columns: college_id, course_id, fee_type, year_or_semester, amount, hostel_fee, description
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        content = await file.read()
        decoded = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))
        
        imported = 0
        errors = []
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # Validate required fields
                if not row.get('college_id') or not row.get('course_id') or not row.get('amount'):
                    errors.append(f"Row {row_num}: Missing required fields (college_id, course_id, amount)")
                    continue
                
                # Check if college exists
                college = await db.colleges.find_one({"id": row['college_id']})
                if not college:
                    errors.append(f"Row {row_num}: College '{row['college_id']}' not found")
                    continue
                
                # Check if course exists
                course = await db.courses.find_one({"id": row['course_id']})
                if not course:
                    errors.append(f"Row {row_num}: Course '{row['course_id']}' not found")
                    continue
                
                fee_data = {
                    "id": str(uuid.uuid4()),
                    "college_id": row['college_id'],
                    "course_id": row['course_id'],
                    "fee_type": row.get('fee_type', 'annual'),
                    "year_or_semester": int(row.get('year_or_semester', 1)),
                    "amount": float(row['amount']),
                    "hostel_fee": float(row['hostel_fee']) if row.get('hostel_fee') else None,
                    "admission_fee": float(row['admission_fee']) if row.get('admission_fee') else None,
                    "description": row.get('description', ''),
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.fees.insert_one(fee_data)
                imported += 1
                
            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid number format - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        return {
            "message": f"Import completed. {imported} fees imported successfully.",
            "imported_count": imported,
            "errors": errors[:10] if errors else [],  # Return first 10 errors
            "total_errors": len(errors)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

@api_router.get("/fees/csv-template")
async def get_csv_template():
    """Get CSV template for fee import"""
    return {
        "columns": ["college_id", "course_id", "fee_type", "year_or_semester", "amount", "hostel_fee", "admission_fee", "description"],
        "example_row": {
            "college_id": "col-1",
            "course_id": "course-1",
            "fee_type": "annual",
            "year_or_semester": "1",
            "amount": "450000",
            "hostel_fee": "120000",
            "admission_fee": "25000",
            "description": "First Year Annual Fee"
        },
        "notes": [
            "fee_type can be 'annual' or 'semester'",
            "year_or_semester should be 1, 2, 3, etc.",
            "hostel_fee and admission_fee are optional",
            "Use college and course IDs from the database"
        ]
    }

# ===================== ADMISSION CHARGES ENDPOINTS =====================

@api_router.get("/admission-charges")
async def get_all_admission_charges(college_id: Optional[str] = None, course_id: Optional[str] = None):
    query = {}
    if college_id:
        query["college_id"] = college_id
    if course_id:
        query["course_id"] = course_id
    charges = await db.admission_charges.find(query, {"_id": 0}).to_list(None)
    return charges

@api_router.get("/colleges/{college_id}/admission-charges")
async def get_college_admission_charges(college_id: str):
    charges = await db.admission_charges.find({"college_id": college_id}, {"_id": 0}).to_list(None)
    return charges

@api_router.post("/admission-charges", response_model=AdmissionCharges, status_code=status.HTTP_201_CREATED)
async def create_admission_charges(data: AdmissionChargesBase, current_user: dict = Depends(require_admin)):
    # Check if already exists for this college-course combo
    existing = await db.admission_charges.find_one({
        "college_id": data.college_id,
        "course_id": data.course_id
    })
    if existing:
        # Update existing
        update_data = data.model_dump()
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.admission_charges.update_one(
            {"college_id": data.college_id, "course_id": data.course_id},
            {"$set": update_data}
        )
        updated = await db.admission_charges.find_one(
            {"college_id": data.college_id, "course_id": data.course_id},
            {"_id": 0}
        )
        return updated
    
    charges = AdmissionCharges(**data.model_dump())
    await db.admission_charges.insert_one(charges.model_dump())
    return charges

@api_router.put("/admission-charges/{charge_id}", response_model=AdmissionCharges)
async def update_admission_charges(charge_id: str, data: AdmissionChargesBase, current_user: dict = Depends(require_admin)):
    existing = await db.admission_charges.find_one({"id": charge_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Admission charges not found")
    
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.admission_charges.update_one({"id": charge_id}, {"$set": update_data})
    
    updated = await db.admission_charges.find_one({"id": charge_id}, {"_id": 0})
    return updated

@api_router.delete("/admission-charges/{charge_id}")
async def delete_admission_charges(charge_id: str, current_user: dict = Depends(require_admin)):
    result = await db.admission_charges.delete_one({"id": charge_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admission charges not found")
    return {"message": "Admission charges deleted successfully"}

# ===================== FEE SUMMARY ENDPOINT =====================

@api_router.get("/colleges/{college_id}/fee-summary")
async def get_fee_summary(college_id: str):
    """Get complete fee summary with totals for a college"""
    # Fetch courses - handle MySQL IDs
    if college_id.startswith("c-") or college_id.startswith("mysql-"):
        try:
            courses = await get_courses_for_college(college_id)
        except Exception as e:
            logging.error(f"Error fetching courses from MySQL: {e}")
            courses = []
    else:
        courses = await db.courses.find({"college_id": college_id}, {"_id": 0}).to_list(None)
    
    fees = await db.fees.find({"college_id": college_id}, {"_id": 0}).to_list(None)
    admission_charges = await db.admission_charges.find({"college_id": college_id}, {"_id": 0}).to_list(None)
    
    # Build summary by course
    summary = []
    for course in courses:
        course_id = course.get("id")
        course_fees = [f for f in fees if f["course_id"] == course_id]
        course_admission = next((a for a in admission_charges if a["course_id"] == course_id), None)
        
        # Skip courses without any fee records
        if not course_fees and not course_admission:
            continue
        
        # Calculate totals
        total_tuition = sum(f.get("amount", 0) for f in course_fees)
        total_hostel = sum(f.get("hostel_fee", 0) or 0 for f in course_fees)
        
        # Get admission charges total
        admission_total = 0
        if course_admission:
            admission_total = sum([
                course_admission.get("registration_fee", 0) or 0,
                course_admission.get("admission_fee", 0) or 0,
                course_admission.get("caution_deposit", 0) or 0,
                course_admission.get("uniform_fee", 0) or 0,
                course_admission.get("library_fee", 0) or 0,
                course_admission.get("lab_fee", 0) or 0,
                course_admission.get("other_charges", 0) or 0
            ])
        
        # Determine fee type and sort fees
        fee_type = course_fees[0]["fee_type"] if course_fees else "annual"
        sorted_fees = sorted(course_fees, key=lambda x: x["year_or_semester"])
        
        summary.append({
            "course": course,
            "fee_type": fee_type,
            "fees": sorted_fees,
            "admission_charges": course_admission,
            "totals": {
                "tuition_total": total_tuition,
                "hostel_total": total_hostel,
                "admission_total": admission_total,
                "grand_total_without_hostel": total_tuition + admission_total,
                "grand_total_with_hostel": total_tuition + total_hostel + admission_total
            }
        })
    
    return summary

# ===================== FAQ ENDPOINTS =====================

@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs(college_id: Optional[str] = None, include_global: bool = True):
    if college_id:
        if include_global:
            query = {"$or": [{"college_id": college_id}, {"is_global": True}]}
        else:
            query = {"college_id": college_id}
    else:
        query = {}
    
    faqs = await db.faqs.find(query, {"_id": 0}).sort("order", 1).to_list(None)
    return faqs

@api_router.post("/faqs", response_model=FAQ, status_code=status.HTTP_201_CREATED)
async def create_faq(faq_data: FAQBase, current_user: dict = Depends(require_admin)):
    faq = FAQ(**faq_data.model_dump())
    if faq.college_id:
        faq.is_global = False
    await db.faqs.insert_one(faq.model_dump())
    return faq

@api_router.put("/faqs/{faq_id}", response_model=FAQ)
async def update_faq(faq_id: str, faq_data: FAQBase, current_user: dict = Depends(require_admin)):
    existing = await db.faqs.find_one({"id": faq_id})
    if not existing:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    update_data = faq_data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    if update_data.get("college_id"):
        update_data["is_global"] = False
    await db.faqs.update_one({"id": faq_id}, {"$set": update_data})
    
    updated = await db.faqs.find_one({"id": faq_id}, {"_id": 0})
    return updated

@api_router.delete("/faqs/{faq_id}")
async def delete_faq(faq_id: str, current_user: dict = Depends(require_admin)):
    result = await db.faqs.delete_one({"id": faq_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return {"message": "FAQ deleted successfully"}

# ===================== USER MANAGEMENT ENDPOINTS (Admin Only) =====================

class CounselorCreate(BaseModel):
    email: str
    name: str
    password: str
    designation: str  # Admission Counselor, Senior Admission Counselor, Team Lead, Admission Manager
    team_lead_id: Optional[str] = None
    phone: Optional[str] = None

class CounselorUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    team_lead_id: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    """Get all counselor users (admin only)"""
    users = await db.users.find({"role": "counselor"}, {"_id": 0, "password_hash": 0}).to_list(None)
    
    # Enrich with team lead names
    for user in users:
        if user.get("team_lead_id"):
            team_lead = await db.users.find_one({"id": user["team_lead_id"]}, {"_id": 0, "name": 1})
            user["team_lead_name"] = team_lead.get("name") if team_lead else None
    
    return users

@api_router.get("/admin/users/team-leads")
async def get_team_leads(current_user: dict = Depends(require_admin)):
    """Get users who can be team leads (Team Lead or Admission Manager)"""
    team_leads = await db.users.find(
        {"role": "counselor", "designation": {"$in": ["Team Lead", "Admission Manager"]}, "is_active": {"$ne": False}},
        {"_id": 0, "id": 1, "name": 1, "designation": 1}
    ).to_list(None)
    return team_leads

@api_router.get("/admin/users/{user_id}")
async def get_user(user_id: str, current_user: dict = Depends(require_admin)):
    """Get a specific user by ID"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.post("/admin/users", status_code=201)
async def create_counselor(user_data: CounselorCreate, current_user: dict = Depends(require_admin)):
    """Create a new counselor user (admin only)"""
    # Validate designation
    if user_data.designation not in DESIGNATIONS:
        raise HTTPException(status_code=400, detail=f"Invalid designation. Must be one of: {', '.join(DESIGNATIONS)}")
    
    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate team lead if provided
    if user_data.team_lead_id:
        team_lead = await db.users.find_one({"id": user_data.team_lead_id})
        if not team_lead:
            raise HTTPException(status_code=400, detail="Team lead not found")
        if team_lead.get("designation") not in ["Team Lead", "Admission Manager"]:
            raise HTTPException(status_code=400, detail="Selected user is not a Team Lead or Admission Manager")
    
    user = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "name": user_data.name,
        "role": "counselor",
        "designation": user_data.designation,
        "team_lead_id": user_data.team_lead_id,
        "phone": user_data.phone,
        "password_hash": hash_password(user_data.password),
        "created_by": current_user["user_id"],
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    
    # Return user without password_hash
    user.pop("password_hash", None)
    user.pop("_id", None)
    return user

@api_router.put("/admin/users/{user_id}")
async def update_counselor(user_id: str, user_data: CounselorUpdate, current_user: dict = Depends(require_admin)):
    """Update a counselor user (admin only)"""
    existing = await db.users.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    if user_data.name is not None:
        update_data["name"] = user_data.name
    if user_data.designation is not None:
        if user_data.designation not in DESIGNATIONS:
            raise HTTPException(status_code=400, detail=f"Invalid designation. Must be one of: {', '.join(DESIGNATIONS)}")
        update_data["designation"] = user_data.designation
    if user_data.team_lead_id is not None:
        if user_data.team_lead_id:
            team_lead = await db.users.find_one({"id": user_data.team_lead_id})
            if not team_lead or team_lead.get("designation") not in ["Team Lead", "Admission Manager"]:
                raise HTTPException(status_code=400, detail="Invalid team lead")
        update_data["team_lead_id"] = user_data.team_lead_id if user_data.team_lead_id else None
    if user_data.phone is not None:
        update_data["phone"] = user_data.phone
    if user_data.is_active is not None:
        update_data["is_active"] = user_data.is_active
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return updated

@api_router.delete("/admin/users/{user_id}")
async def delete_counselor(user_id: str, current_user: dict = Depends(require_admin)):
    """Delete a counselor user (admin only)"""
    existing = await db.users.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    if existing.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    
    # Soft delete - just mark as inactive
    await db.users.update_one({"id": user_id}, {"$set": {"is_active": False}})
    
    # Log activity
    admin = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    await log_activity(current_user["user_id"], admin.get("name", ""), current_user["email"], "deactivate_user", "user", user_id, f"Deactivated user: {existing.get('name')}")
    
    return {"message": "User deactivated successfully"}

@api_router.put("/admin/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, current_user: dict = Depends(require_admin)):
    """Reset a user's password (admin only) - generates a new password"""
    existing = await db.users.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate a simple reset password
    new_password = f"Reset{user_id[:4]}!"
    
    await db.users.update_one({"id": user_id}, {"$set": {"password_hash": hash_password(new_password)}})
    
    # Log activity
    admin = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    await log_activity(current_user["user_id"], admin.get("name", ""), current_user["email"], "reset_password", "user", user_id, f"Reset password for: {existing.get('name')}")
    
    return {"message": "Password reset successfully", "new_password": new_password}

class PasswordResetRequest(BaseModel):
    user_id: str
    new_password: str

@api_router.put("/admin/users/{user_id}/set-password")
async def set_user_password(user_id: str, data: PasswordResetRequest, current_user: dict = Depends(require_admin)):
    """Set a specific password for a user (admin only)"""
    existing = await db.users.find_one({"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    await db.users.update_one({"id": user_id}, {"$set": {"password_hash": hash_password(data.new_password)}})
    
    # Log activity
    admin = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    await log_activity(current_user["user_id"], admin.get("name", ""), current_user["email"], "set_password", "user", user_id, f"Set password for: {existing.get('name')}")
    
    return {"message": "Password set successfully"}

@api_router.get("/admin/designations")
async def get_designations():
    """Get list of available designations"""
    return {"designations": DESIGNATIONS}

# ===================== USER PROFILE ENDPOINTS =====================

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.put("/profile")
async def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user's profile"""
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name
    if data.phone is not None:
        update_data["phone"] = data.phone
    
    if update_data:
        await db.users.update_one({"id": current_user["user_id"]}, {"$set": update_data})
    
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password_hash": 0})
    
    # Log activity
    await log_activity(current_user["user_id"], user.get("name", ""), current_user["email"], "update_profile", "user", current_user["user_id"], "Updated profile")
    
    return user

@api_router.put("/profile/password")
async def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    """Change current user's password"""
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify current password
    if not verify_password(data.current_password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    
    await db.users.update_one({"id": current_user["user_id"]}, {"$set": {"password_hash": hash_password(data.new_password)}})
    
    # Log activity
    await log_activity(current_user["user_id"], user.get("name", ""), current_user["email"], "change_password", "user", current_user["user_id"], "Changed own password")
    
    return {"message": "Password changed successfully"}

# ===================== ACTIVITY LOG ENDPOINTS =====================

@api_router.get("/admin/activity-logs")
async def get_activity_logs(
    current_user: dict = Depends(require_admin),
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get activity logs (admin only)"""
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if entity_type:
        query["entity_type"] = entity_type
    
    total = await db.activity_logs.count_documents(query)
    logs = await db.activity_logs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": logs
    }

@api_router.get("/admin/activity-logs/actions")
async def get_activity_actions():
    """Get list of available activity actions"""
    return {
        "actions": [
            "login", "create_admission", "update_admission", "delete_admission",
            "update_fee", "create_user", "update_user", "deactivate_user",
            "reset_password", "set_password", "update_profile", "change_password",
            "create_target", "update_target", "delete_target"
        ]
    }

# ===================== TARGET ALERTS ENDPOINTS =====================

@api_router.get("/targets/alerts")
async def get_target_alerts(current_user: dict = Depends(get_current_user)):
    """Get target alerts for the current user (shows if behind on targets)"""
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    current_day = datetime.now(timezone.utc).day
    days_in_month = 30  # Simplified
    month_progress = (current_day / days_in_month) * 100
    
    alerts = []
    
    # Get targets for this user
    if current_user.get("role") == "admin" or user.get("designation") in ["Team Lead", "Admission Manager"]:
        # Get team targets
        query = {"period": current_month}
        if user.get("designation") == "Team Lead":
            team_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
            team_ids.append(current_user["user_id"])
            query["counselor_id"] = {"$in": team_ids}
        
        targets = await db.targets.find(query, {"_id": 0}).to_list(None)
    else:
        # Regular counselor - get their own target
        targets = await db.targets.find({"counselor_id": current_user["user_id"], "period": current_month}, {"_id": 0}).to_list(None)
    
    for target in targets:
        # Calculate actual progress
        start_date = f"{current_month}-01"
        next_month = int(current_month.split("-")[1]) + 1
        year = current_month.split("-")[0]
        if next_month > 12:
            end_date = f"{int(year)+1}-01-01"
        else:
            end_date = f"{year}-{next_month:02d}-01"
        
        admission_count = await db.admissions.count_documents({
            "counselor_id": target["counselor_id"],
            "admission_date": {"$gte": start_date, "$lt": end_date}
        })
        
        target_progress = (admission_count / target["target_count"] * 100) if target["target_count"] > 0 else 0
        
        # Check if behind (at 50% of month but less than 50% progress)
        if month_progress >= 50 and target_progress < 50:
            counselor = await db.users.find_one({"id": target["counselor_id"]}, {"_id": 0, "name": 1})
            alerts.append({
                "type": "behind_target",
                "severity": "warning",
                "counselor_id": target["counselor_id"],
                "counselor_name": counselor.get("name") if counselor else target.get("counselor_name"),
                "target_count": target["target_count"],
                "actual_count": admission_count,
                "target_progress": round(target_progress, 1),
                "month_progress": round(month_progress, 1),
                "message": f"Only {admission_count}/{target['target_count']} admissions ({round(target_progress, 1)}%) with {round(month_progress, 1)}% of month passed"
            })
    
    return {
        "alerts": alerts,
        "month_progress": round(month_progress, 1),
        "current_month": current_month
    }

# ===================== ADMISSIONS ENDPOINTS =====================

class AdmissionCreate(BaseModel):
    candidate_name: str
    place: str
    college_id: str
    course_id: str
    admission_date: str
    fees_paid: float = 0
    total_fees: float
    instalments: List[FeeInstalment] = []
    remark: Optional[str] = None
    scholarship_amount: Optional[float] = None

class AdmissionUpdate(BaseModel):
    candidate_name: Optional[str] = None
    place: Optional[str] = None
    college_id: Optional[str] = None
    course_id: Optional[str] = None
    admission_date: Optional[str] = None
    fees_paid: Optional[float] = None
    total_fees: Optional[float] = None
    instalments: Optional[List[FeeInstalment]] = None
    remark: Optional[str] = None
    scholarship_amount: Optional[float] = None

@api_router.post("/admissions", status_code=201)
async def create_admission(admission_data: AdmissionCreate, current_user: dict = Depends(get_current_user)):
    """Create a new admission record"""
    college_name = None
    course_name = None
    
    # Validate college - handle MySQL IDs
    if admission_data.college_id.startswith("c-") or admission_data.college_id.startswith("mysql-"):
        try:
            college = await get_college_by_id(admission_data.college_id)
            if college:
                college_name = college.get("name")
            else:
                raise HTTPException(status_code=400, detail="College not found")
        except Exception as e:
            logging.error(f"Error fetching college from MySQL: {e}")
            raise HTTPException(status_code=400, detail="College not found")
    else:
        college = await db.colleges.find_one({"id": admission_data.college_id}, {"_id": 0})
        if not college:
            raise HTTPException(status_code=400, detail="College not found")
        college_name = college.get("name")
    
    # Validate course - handle MySQL IDs
    if admission_data.course_id.startswith("cc-") or admission_data.course_id.startswith("mysql-"):
        try:
            course_data = await get_course_by_id(admission_data.course_id)
            if course_data:
                # get_course_by_id returns nested structure {course: {...}, college: {...}}
                course = course_data.get("course", course_data)
                course_name = course.get("name")
            else:
                raise HTTPException(status_code=400, detail="Course not found")
        except Exception as e:
            logging.error(f"Error fetching course from MySQL: {e}")
            raise HTTPException(status_code=400, detail="Course not found")
    else:
        course = await db.courses.find_one({"id": admission_data.course_id}, {"_id": 0})
        if not course:
            raise HTTPException(status_code=400, detail="Course not found")
        course_name = course.get("name")
    
    # Get counselor info
    counselor = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    # Calculate balance
    total_paid = admission_data.fees_paid + sum(inst.amount for inst in admission_data.instalments)
    balance = admission_data.total_fees - total_paid
    
    admission_id = str(uuid.uuid4())
    admission = {
        "id": admission_id,
        "candidate_name": admission_data.candidate_name,
        "place": admission_data.place,
        "college_id": admission_data.college_id,
        "college_name": college_name,
        "course_id": admission_data.course_id,
        "course_name": course_name,
        "admission_date": admission_data.admission_date,
        "fees_paid": total_paid,
        "total_fees": admission_data.total_fees,
        "balance": balance,
        "instalments": [inst.model_dump() for inst in admission_data.instalments],
        "remark": admission_data.remark,
        "scholarship_amount": admission_data.scholarship_amount,
        "counselor_id": current_user["user_id"],
        "counselor_name": counselor.get("name") if counselor else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.admissions.insert_one(admission)
    admission.pop("_id", None)
    
    # Log activity
    await log_activity(current_user["user_id"], counselor.get("name", ""), current_user["email"], "create_admission", "admission", admission_id, f"Created admission for {admission_data.candidate_name}")
    
    return admission

@api_router.get("/admissions")
async def get_admissions(current_user: dict = Depends(get_current_user)):
    """Get admissions based on user role and designation"""
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    query = {}
    
    if current_user.get("role") == "admin":
        # Admin sees all
        pass
    elif user and user.get("designation") == "Admission Manager":
        # Admission Manager sees all
        pass
    elif user and user.get("designation") == "Team Lead":
        # Team Lead sees their own + team members' admissions
        team_member_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
        team_member_ids.append(current_user["user_id"])
        query["counselor_id"] = {"$in": team_member_ids}
    else:
        # Regular counselor sees only their own
        query["counselor_id"] = current_user["user_id"]
    
    admissions = await db.admissions.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    return admissions

@api_router.get("/admissions/{admission_id}")
async def get_admission(admission_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific admission by ID"""
    admission = await db.admissions.find_one({"id": admission_id}, {"_id": 0})
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    
    # Check access
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    if current_user.get("role") != "admin" and user.get("designation") != "Admission Manager":
        if user.get("designation") == "Team Lead":
            team_member_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
            team_member_ids.append(current_user["user_id"])
            if admission["counselor_id"] not in team_member_ids:
                raise HTTPException(status_code=403, detail="Access denied")
        elif admission["counselor_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return admission

@api_router.put("/admissions/{admission_id}")
async def update_admission(admission_id: str, admission_data: AdmissionUpdate, current_user: dict = Depends(get_current_user)):
    """Update an admission record"""
    existing = await db.admissions.find_one({"id": admission_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Admission not found")
    
    # Check access (only creator, team lead, admin, or manager can edit)
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    can_edit = False
    if current_user.get("role") == "admin":
        can_edit = True
    elif user.get("designation") == "Admission Manager":
        can_edit = True
    elif user.get("designation") == "Team Lead":
        team_member_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
        team_member_ids.append(current_user["user_id"])
        if existing["counselor_id"] in team_member_ids:
            can_edit = True
    elif existing["counselor_id"] == current_user["user_id"]:
        can_edit = True
    
    if not can_edit:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if admission_data.candidate_name is not None:
        update_data["candidate_name"] = admission_data.candidate_name
    if admission_data.place is not None:
        update_data["place"] = admission_data.place
    if admission_data.college_id is not None:
        # Handle MySQL IDs
        if admission_data.college_id.startswith("c-") or admission_data.college_id.startswith("mysql-"):
            try:
                college = await get_college_by_id(admission_data.college_id)
                if not college:
                    raise HTTPException(status_code=400, detail="College not found")
                update_data["college_id"] = admission_data.college_id
                update_data["college_name"] = college.get("name")
            except Exception as e:
                logging.error(f"Error fetching college from MySQL: {e}")
                raise HTTPException(status_code=400, detail="College not found")
        else:
            college = await db.colleges.find_one({"id": admission_data.college_id}, {"_id": 0})
            if not college:
                raise HTTPException(status_code=400, detail="College not found")
            update_data["college_id"] = admission_data.college_id
            update_data["college_name"] = college.get("name")
    if admission_data.course_id is not None:
        # Handle MySQL IDs
        if admission_data.course_id.startswith("cc-") or admission_data.course_id.startswith("mysql-"):
            try:
                course_data = await get_course_by_id(admission_data.course_id)
                if not course_data:
                    raise HTTPException(status_code=400, detail="Course not found")
                # get_course_by_id returns nested structure {course: {...}, college: {...}}
                course = course_data.get("course", course_data)
                update_data["course_id"] = admission_data.course_id
                update_data["course_name"] = course.get("name")
            except Exception as e:
                logging.error(f"Error fetching course from MySQL: {e}")
                raise HTTPException(status_code=400, detail="Course not found")
        else:
            course = await db.courses.find_one({"id": admission_data.course_id}, {"_id": 0})
            if not course:
                raise HTTPException(status_code=400, detail="Course not found")
            update_data["course_id"] = admission_data.course_id
            update_data["course_name"] = course.get("name")
    if admission_data.admission_date is not None:
        update_data["admission_date"] = admission_data.admission_date
    if admission_data.total_fees is not None:
        update_data["total_fees"] = admission_data.total_fees
    if admission_data.instalments is not None:
        update_data["instalments"] = [inst.model_dump() for inst in admission_data.instalments]
    if admission_data.remark is not None:
        update_data["remark"] = admission_data.remark
    if admission_data.scholarship_amount is not None:
        update_data["scholarship_amount"] = admission_data.scholarship_amount
    
    # Recalculate fees_paid and balance
    if admission_data.instalments is not None or admission_data.fees_paid is not None or admission_data.total_fees is not None:
        current_instalments = update_data.get("instalments", existing.get("instalments", []))
        instalment_total = sum(inst.get("amount", 0) for inst in current_instalments)
        base_paid = admission_data.fees_paid if admission_data.fees_paid is not None else 0
        total_paid = base_paid + instalment_total
        total_fees = update_data.get("total_fees", existing.get("total_fees", 0))
        update_data["fees_paid"] = total_paid
        update_data["balance"] = total_fees - total_paid
    
    await db.admissions.update_one({"id": admission_id}, {"$set": update_data})
    
    updated = await db.admissions.find_one({"id": admission_id}, {"_id": 0})
    return updated

@api_router.delete("/admissions/{admission_id}")
async def delete_admission(admission_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an admission record"""
    existing = await db.admissions.find_one({"id": admission_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Admission not found")
    
    # Only admin or the creator can delete
    if current_user.get("role") != "admin" and existing["counselor_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.admissions.delete_one({"id": admission_id})
    return {"message": "Admission deleted successfully"}

# ===================== PERFORMANCE STATS ENDPOINTS =====================

# Helper function to check if user is Team Lead, Admission Manager, or Admin
async def require_performance_access(current_user: dict = Depends(get_current_user)):
    """Allow access to admin, Team Lead, or Admission Manager"""
    if current_user.get("role") == "admin":
        return current_user
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    if user and user.get("designation") in ["Team Lead", "Admission Manager"]:
        return current_user
    raise HTTPException(status_code=403, detail="Performance access requires Admin, Team Lead, or Admission Manager role")

@api_router.get("/admin/stats/performance")
async def get_performance_stats(current_user: dict = Depends(require_admin_or_manager)):
    """Get performance statistics (admin and admission manager only)"""
    # Total admissions
    total_admissions = await db.admissions.count_documents({})
    
    # Fees collected vs pending
    pipeline_fees = [
        {
            "$group": {
                "_id": None,
                "total_fees": {"$sum": "$total_fees"},
                "fees_paid": {"$sum": "$fees_paid"},
                "balance": {"$sum": "$balance"}
            }
        }
    ]
    fees_result = await db.admissions.aggregate(pipeline_fees).to_list(1)
    fees_stats = fees_result[0] if fees_result else {"total_fees": 0, "fees_paid": 0, "balance": 0}
    
    # Admissions by counselor
    pipeline_by_counselor = [
        {
            "$group": {
                "_id": "$counselor_id",
                "counselor_name": {"$first": "$counselor_name"},
                "count": {"$sum": 1},
                "total_fees_collected": {"$sum": "$fees_paid"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    by_counselor = await db.admissions.aggregate(pipeline_by_counselor).to_list(100)
    
    # Admissions by college
    pipeline_by_college = [
        {
            "$group": {
                "_id": "$college_id",
                "college_name": {"$first": "$college_name"},
                "count": {"$sum": 1},
                "total_fees_collected": {"$sum": "$fees_paid"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    by_college = await db.admissions.aggregate(pipeline_by_college).to_list(100)
    
    # Admissions by course
    pipeline_by_course = [
        {
            "$group": {
                "_id": "$course_id",
                "course_name": {"$first": "$course_name"},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    by_course = await db.admissions.aggregate(pipeline_by_course).to_list(10)
    
    # Monthly trends (last 6 months)
    six_months_ago = (datetime.now(timezone.utc) - timedelta(days=180)).isoformat()
    pipeline_monthly = [
        {
            "$match": {"created_at": {"$gte": six_months_ago}}
        },
        {
            "$group": {
                "_id": {"$substr": ["$created_at", 0, 7]},  # YYYY-MM
                "count": {"$sum": 1},
                "fees_collected": {"$sum": "$fees_paid"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    monthly_trends = await db.admissions.aggregate(pipeline_monthly).to_list(12)
    
    # Weekly trends (last 4 weeks)
    four_weeks_ago = (datetime.now(timezone.utc) - timedelta(days=28)).isoformat()
    pipeline_weekly = [
        {
            "$match": {"created_at": {"$gte": four_weeks_ago}}
        },
        {
            "$group": {
                "_id": {"$substr": ["$created_at", 0, 10]},  # YYYY-MM-DD
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    daily_data = await db.admissions.aggregate(pipeline_weekly).to_list(30)
    
    return {
        "total_admissions": total_admissions,
        "fees_stats": {
            "total_fees": fees_stats.get("total_fees", 0),
            "fees_collected": fees_stats.get("fees_paid", 0),
            "fees_pending": fees_stats.get("balance", 0)
        },
        "by_counselor": by_counselor,
        "by_college": by_college,
        "by_course": by_course,
        "monthly_trends": monthly_trends,
        "daily_trends": daily_data
    }

@api_router.get("/performance/stats")
async def get_role_based_performance_stats(
    current_user: dict = Depends(require_performance_access),
    counselor_id: Optional[str] = None,
    college_id: Optional[str] = None,
    month: Optional[str] = None  # Format: YYYY-MM
):
    """Get performance statistics based on user role with filters"""
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    # Determine counselor IDs to include based on role
    counselor_ids = None
    if current_user.get("role") != "admin":
        if user.get("designation") == "Team Lead":
            # Team Lead sees only their team + themselves
            team_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
            team_ids.append(current_user["user_id"])
            counselor_ids = team_ids
        elif user.get("designation") == "Admission Manager":
            # Admission Manager sees everyone
            counselor_ids = None
    
    # Build base query
    base_query = {}
    if counselor_ids is not None:
        base_query["counselor_id"] = {"$in": counselor_ids}
    
    # Apply filters
    if counselor_id and counselor_id != 'all':
        base_query["counselor_id"] = counselor_id
    if college_id and college_id != 'all':
        base_query["college_id"] = college_id
    if month and month != 'all':
        base_query["admission_date"] = {"$regex": f"^{month}"}
    
    # Total admissions
    total_admissions = await db.admissions.count_documents(base_query)
    
    # Fees stats
    pipeline_fees = [
        {"$match": base_query},
        {
            "$group": {
                "_id": None,
                "total_fees": {"$sum": "$total_fees"},
                "fees_paid": {"$sum": "$fees_paid"},
                "balance": {"$sum": "$balance"}
            }
        }
    ]
    fees_result = await db.admissions.aggregate(pipeline_fees).to_list(1)
    fees_stats = fees_result[0] if fees_result else {"total_fees": 0, "fees_paid": 0, "balance": 0}
    
    # By counselor (only show team members for Team Lead)
    counselor_match = base_query.copy()
    if counselor_id and counselor_id != 'all':
        del counselor_match["counselor_id"]  # Remove filter to show all team members
        if counselor_ids is not None:
            counselor_match["counselor_id"] = {"$in": counselor_ids}
    
    pipeline_by_counselor = [
        {"$match": counselor_match},
        {
            "$group": {
                "_id": "$counselor_id",
                "counselor_name": {"$first": "$counselor_name"},
                "count": {"$sum": 1},
                "total_fees_collected": {"$sum": "$fees_paid"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    by_counselor = await db.admissions.aggregate(pipeline_by_counselor).to_list(100)
    
    # By college
    pipeline_by_college = [
        {"$match": base_query},
        {
            "$group": {
                "_id": "$college_id",
                "college_name": {"$first": "$college_name"},
                "count": {"$sum": 1},
                "total_fees_collected": {"$sum": "$fees_paid"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    by_college = await db.admissions.aggregate(pipeline_by_college).to_list(100)
    
    # By course
    pipeline_by_course = [
        {"$match": base_query},
        {
            "$group": {
                "_id": "$course_id",
                "course_name": {"$first": "$course_name"},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    by_course = await db.admissions.aggregate(pipeline_by_course).to_list(10)
    
    # Monthly trends
    monthly_query = base_query.copy()
    if "admission_date" in monthly_query:
        del monthly_query["admission_date"]  # Remove month filter for trends
    
    six_months_ago = (datetime.now(timezone.utc) - timedelta(days=180)).isoformat()
    pipeline_monthly = [
        {"$match": {**monthly_query, "created_at": {"$gte": six_months_ago}}},
        {
            "$group": {
                "_id": {"$substr": ["$admission_date", 0, 7]},
                "count": {"$sum": 1},
                "fees_collected": {"$sum": "$fees_paid"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    monthly_trends = await db.admissions.aggregate(pipeline_monthly).to_list(12)
    
    # Get available team members for filter dropdown
    team_members = []
    if current_user.get("role") == "admin" or user.get("designation") == "Admission Manager":
        team_members = await db.users.find(
            {"role": "counselor", "is_active": {"$ne": False}},
            {"_id": 0, "id": 1, "name": 1, "designation": 1}
        ).to_list(100)
    elif user.get("designation") == "Team Lead":
        team_members = await db.users.find(
            {"$or": [{"team_lead_id": current_user["user_id"]}, {"id": current_user["user_id"]}], "is_active": {"$ne": False}},
            {"_id": 0, "id": 1, "name": 1, "designation": 1}
        ).to_list(100)
    
    return {
        "total_admissions": total_admissions,
        "fees_stats": {
            "total_fees": fees_stats.get("total_fees", 0),
            "fees_collected": fees_stats.get("fees_paid", 0),
            "fees_pending": fees_stats.get("balance", 0)
        },
        "by_counselor": by_counselor,
        "by_college": by_college,
        "by_course": by_course,
        "monthly_trends": monthly_trends,
        "team_members": team_members,
        "user_role": current_user.get("role"),
        "user_designation": user.get("designation") if user else None
    }

@api_router.get("/performance/admissions")
async def get_role_based_admissions_list(
    current_user: dict = Depends(require_performance_access),
    skip: int = 0,
    limit: int = 100,
    counselor_id: Optional[str] = None,
    college_id: Optional[str] = None,
    month: Optional[str] = None
):
    """Get admissions list based on user role with filters"""
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    query = {}
    
    # Role-based filtering
    if current_user.get("role") != "admin":
        if user.get("designation") == "Team Lead":
            team_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
            team_ids.append(current_user["user_id"])
            query["counselor_id"] = {"$in": team_ids}
        # Admission Manager sees all
    
    # Apply filters
    if counselor_id and counselor_id != 'all':
        query["counselor_id"] = counselor_id
    if college_id and college_id != 'all':
        query["college_id"] = college_id
    if month and month != 'all':
        query["admission_date"] = {"$regex": f"^{month}"}
    
    total = await db.admissions.count_documents(query)
    admissions = await db.admissions.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "admissions": admissions
    }

@api_router.get("/admin/stats/admissions-list")
async def get_all_admissions_list(
    current_user: dict = Depends(require_admin_or_manager),
    skip: int = 0,
    limit: int = 100,
    college_id: Optional[str] = None,
    counselor_id: Optional[str] = None
):
    """Get complete list of admitted students (admin and admission manager only)"""
    query = {}
    if college_id:
        query["college_id"] = college_id
    if counselor_id:
        query["counselor_id"] = counselor_id
    
    total = await db.admissions.count_documents(query)
    admissions = await db.admissions.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "admissions": admissions
    }

# ===================== SCHOLARSHIP SUMMARY REPORT =====================

@api_router.get("/admin/scholarship-summary")
async def get_scholarship_summary(
    current_user: dict = Depends(require_admin_or_manager),
    view_by: str = "month"  # "month" or "college"
):
    """Get scholarship summary report - by month or by college"""
    
    # Overall scholarship stats
    pipeline_total = [
        {"$match": {"scholarship_amount": {"$exists": True, "$ne": None, "$gt": 0}}},
        {
            "$group": {
                "_id": None,
                "total_scholarships": {"$sum": 1},
                "total_amount": {"$sum": "$scholarship_amount"},
                "avg_amount": {"$avg": "$scholarship_amount"},
                "max_amount": {"$max": "$scholarship_amount"},
                "min_amount": {"$min": "$scholarship_amount"}
            }
        }
    ]
    total_result = await db.admissions.aggregate(pipeline_total).to_list(1)
    total_stats = total_result[0] if total_result else {
        "total_scholarships": 0, "total_amount": 0, "avg_amount": 0, "max_amount": 0, "min_amount": 0
    }
    
    # Total admissions for percentage calculation
    total_admissions = await db.admissions.count_documents({})
    
    breakdown = []
    
    if view_by == "month":
        # Scholarship by month
        pipeline_by_month = [
            {"$match": {"scholarship_amount": {"$exists": True, "$ne": None, "$gt": 0}}},
            {
                "$group": {
                    "_id": {"$substr": ["$admission_date", 0, 7]},  # YYYY-MM
                    "count": {"$sum": 1},
                    "total_amount": {"$sum": "$scholarship_amount"},
                    "avg_amount": {"$avg": "$scholarship_amount"}
                }
            },
            {"$sort": {"_id": -1}},
            {"$limit": 12}
        ]
        by_month = await db.admissions.aggregate(pipeline_by_month).to_list(12)
        breakdown = [
            {
                "period": item["_id"],
                "label": item["_id"],
                "count": item["count"],
                "total_amount": item["total_amount"],
                "avg_amount": item["avg_amount"]
            }
            for item in by_month
        ]
    else:
        # Scholarship by college
        pipeline_by_college = [
            {"$match": {"scholarship_amount": {"$exists": True, "$ne": None, "$gt": 0}}},
            {
                "$group": {
                    "_id": "$college_id",
                    "college_name": {"$first": "$college_name"},
                    "count": {"$sum": 1},
                    "total_amount": {"$sum": "$scholarship_amount"},
                    "avg_amount": {"$avg": "$scholarship_amount"}
                }
            },
            {"$sort": {"total_amount": -1}},
            {"$limit": 20}
        ]
        by_college = await db.admissions.aggregate(pipeline_by_college).to_list(20)
        breakdown = [
            {
                "college_id": item["_id"],
                "label": item["college_name"],
                "count": item["count"],
                "total_amount": item["total_amount"],
                "avg_amount": item["avg_amount"]
            }
            for item in by_college
        ]
    
    # Recent scholarship recipients
    recent_scholarships = await db.admissions.find(
        {"scholarship_amount": {"$exists": True, "$ne": None, "$gt": 0}},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "summary": {
            "total_scholarships": total_stats.get("total_scholarships", 0),
            "total_amount": total_stats.get("total_amount", 0),
            "avg_amount": round(total_stats.get("avg_amount", 0), 2),
            "max_amount": total_stats.get("max_amount", 0),
            "min_amount": total_stats.get("min_amount", 0),
            "percentage_with_scholarship": round((total_stats.get("total_scholarships", 0) / max(total_admissions, 1)) * 100, 1)
        },
        "view_by": view_by,
        "breakdown": breakdown,
        "recent_scholarships": recent_scholarships
    }

# ===================== TARGET ALERTS =====================

@api_router.get("/admin/target-alerts")
async def get_admin_target_alerts(current_user: dict = Depends(require_admin_or_manager)):
    """Get counselors who are falling behind on their targets (below 50% progress at mid-month or later)"""
    
    now = datetime.now(timezone.utc)
    current_month = now.strftime("%Y-%m")
    day_of_month = now.day
    days_in_month = 30  # Approximate
    
    alerts = []
    
    # Get all targets for current month
    targets = await db.targets.find({"period": current_month}, {"_id": 0}).to_list(100)
    
    for target in targets:
        # Get counselor info
        counselor = await db.users.find_one({"id": target["counselor_id"]}, {"_id": 0, "id": 1, "name": 1, "email": 1, "designation": 1})
        if not counselor:
            continue
        
        # Count admissions for this counselor this month
        admission_count = await db.admissions.count_documents({
            "counselor_id": target["counselor_id"],
            "admission_date": {"$regex": f"^{current_month}"}
        })
        
        # Calculate fees collected this month
        pipeline_fees = [
            {
                "$match": {
                    "counselor_id": target["counselor_id"],
                    "admission_date": {"$regex": f"^{current_month}"}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_fees_collected": {"$sum": "$fees_paid"}
                }
            }
        ]
        fees_result = await db.admissions.aggregate(pipeline_fees).to_list(1)
        fees_collected = fees_result[0]["total_fees_collected"] if fees_result else 0
        
        # Calculate progress
        target_count = target.get("target_count", 0)
        target_fees = target.get("target_fees", 0)
        
        admission_progress = (admission_count / max(target_count, 1)) * 100 if target_count else 0
        fees_progress = (fees_collected / max(target_fees, 1)) * 100 if target_fees else 0
        
        # Expected progress at this point in month (linear)
        expected_progress = (day_of_month / days_in_month) * 100
        
        # Check if behind - at least 5 days into month and below 50% of expected
        is_behind = day_of_month >= 5 and (
            (target_count > 0 and admission_progress < expected_progress * 0.5) or
            (target_fees > 0 and fees_progress < expected_progress * 0.5)
        )
        
        if is_behind:
            alerts.append({
                "counselor_id": counselor["id"],
                "counselor_name": counselor["name"],
                "counselor_email": counselor.get("email"),
                "designation": counselor.get("designation"),
                "target_count": target_count,
                "target_fees": target_fees,
                "current_admissions": admission_count,
                "current_fees_collected": fees_collected,
                "admission_progress": round(admission_progress, 1),
                "fees_progress": round(fees_progress, 1),
                "expected_progress": round(expected_progress, 1),
                "days_remaining": days_in_month - day_of_month,
                "alert_severity": "critical" if admission_progress < expected_progress * 0.25 else "warning"
            })
    
    # Sort by severity (critical first) then by progress (lowest first)
    alerts.sort(key=lambda x: (0 if x["alert_severity"] == "critical" else 1, x["admission_progress"]))
    
    return {
        "current_month": current_month,
        "day_of_month": day_of_month,
        "total_alerts": len(alerts),
        "critical_count": len([a for a in alerts if a["alert_severity"] == "critical"]),
        "warning_count": len([a for a in alerts if a["alert_severity"] == "warning"]),
        "alerts": alerts
    }

# ===================== TARGET TRACKING ENDPOINTS =====================

class TargetCreate(BaseModel):
    counselor_id: str
    target_type: str  # monthly, quarterly
    period: str  # e.g., "2026-02" for monthly, "2026-Q1" for quarterly
    target_count: int
    target_fees: Optional[float] = None

class TargetUpdate(BaseModel):
    target_count: Optional[int] = None
    target_fees: Optional[float] = None

@api_router.get("/targets")
async def get_targets(
    current_user: dict = Depends(require_target_assigner),
    counselor_id: Optional[str] = None,
    period: Optional[str] = None
):
    """Get targets (Admin sees all, Team Lead sees team, Manager sees all)"""
    query = {}
    
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    # Filter based on role
    if current_user.get("role") != "admin" and user.get("designation") != "Admission Manager":
        # Team Lead sees only their team
        if user.get("designation") == "Team Lead":
            team_member_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
            team_member_ids.append(current_user["user_id"])
            query["counselor_id"] = {"$in": team_member_ids}
    
    if counselor_id:
        query["counselor_id"] = counselor_id
    if period:
        query["period"] = period
    
    targets = await db.targets.find(query, {"_id": 0}).sort("period", -1).to_list(100)
    return targets

@api_router.get("/targets/counselors")
async def get_assignable_counselors(current_user: dict = Depends(require_target_assigner)):
    """Get counselors that the current user can assign targets to"""
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    if current_user.get("role") == "admin" or user.get("designation") == "Admission Manager":
        # Admin and Manager see all counselors
        counselors = await db.users.find(
            {"role": "counselor", "is_active": {"$ne": False}},
            {"_id": 0, "id": 1, "name": 1, "designation": 1}
        ).to_list(100)
    elif user.get("designation") == "Team Lead":
        # Team Lead sees only their team + themselves
        counselors = await db.users.find(
            {"$or": [{"team_lead_id": current_user["user_id"]}, {"id": current_user["user_id"]}], "is_active": {"$ne": False}},
            {"_id": 0, "id": 1, "name": 1, "designation": 1}
        ).to_list(100)
    else:
        counselors = []
    
    return counselors

@api_router.post("/targets", status_code=201)
async def create_target(target_data: TargetCreate, current_user: dict = Depends(require_target_assigner)):
    """Create a new target assignment"""
    # Validate counselor exists
    counselor = await db.users.find_one({"id": target_data.counselor_id}, {"_id": 0})
    if not counselor:
        raise HTTPException(status_code=400, detail="Counselor not found")
    
    # Check if user can assign to this counselor
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    if current_user.get("role") != "admin" and user.get("designation") != "Admission Manager":
        if user.get("designation") == "Team Lead":
            # Team Lead can only assign to their team
            team_member_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
            team_member_ids.append(current_user["user_id"])
            if target_data.counselor_id not in team_member_ids:
                raise HTTPException(status_code=403, detail="Cannot assign target to this counselor")
    
    # Check if target for this period already exists
    existing = await db.targets.find_one({
        "counselor_id": target_data.counselor_id,
        "period": target_data.period
    })
    if existing:
        raise HTTPException(status_code=400, detail="Target for this period already exists")
    
    assigner = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    target = {
        "id": str(uuid.uuid4()),
        "counselor_id": target_data.counselor_id,
        "counselor_name": counselor.get("name"),
        "target_type": target_data.target_type,
        "period": target_data.period,
        "target_count": target_data.target_count,
        "target_fees": target_data.target_fees,
        "assigned_by": current_user["user_id"],
        "assigned_by_name": assigner.get("name") if assigner else None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.targets.insert_one(target)
    target.pop("_id", None)
    return target

@api_router.put("/targets/{target_id}")
async def update_target(target_id: str, target_data: TargetUpdate, current_user: dict = Depends(require_target_assigner)):
    """Update an existing target"""
    existing = await db.targets.find_one({"id": target_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Target not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if target_data.target_count is not None:
        update_data["target_count"] = target_data.target_count
    if target_data.target_fees is not None:
        update_data["target_fees"] = target_data.target_fees
    
    await db.targets.update_one({"id": target_id}, {"$set": update_data})
    
    updated = await db.targets.find_one({"id": target_id}, {"_id": 0})
    return updated

@api_router.delete("/targets/{target_id}")
async def delete_target(target_id: str, current_user: dict = Depends(require_target_assigner)):
    """Delete a target"""
    existing = await db.targets.find_one({"id": target_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Target not found")
    
    await db.targets.delete_one({"id": target_id})
    return {"message": "Target deleted successfully"}

@api_router.get("/targets/progress")
async def get_targets_with_progress(
    current_user: dict = Depends(require_target_assigner),
    period: Optional[str] = None
):
    """Get targets with actual progress calculated"""
    # Get current period if not specified
    if not period:
        period = datetime.now(timezone.utc).strftime("%Y-%m")
    
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    query = {"period": period}
    
    # Filter based on role
    if current_user.get("role") != "admin" and user.get("designation") != "Admission Manager":
        if user.get("designation") == "Team Lead":
            team_member_ids = await db.users.distinct("id", {"team_lead_id": current_user["user_id"]})
            team_member_ids.append(current_user["user_id"])
            query["counselor_id"] = {"$in": team_member_ids}
    
    targets = await db.targets.find(query, {"_id": 0}).to_list(100)
    
    # Calculate progress for each target
    results = []
    for target in targets:
        # Get admissions count and fees for this period
        # Parse period to get date range
        if target["target_type"] == "monthly":
            # Period format: "2026-02"
            year, month = target["period"].split("-")
            start_date = f"{year}-{month}-01"
            if int(month) == 12:
                end_date = f"{int(year)+1}-01-01"
            else:
                end_date = f"{year}-{int(month)+1:02d}-01"
        else:
            # Quarterly: "2026-Q1"
            year, quarter = target["period"].split("-Q")
            quarter = int(quarter)
            start_month = (quarter - 1) * 3 + 1
            end_month = quarter * 3 + 1
            start_date = f"{year}-{start_month:02d}-01"
            if end_month > 12:
                end_date = f"{int(year)+1}-01-01"
            else:
                end_date = f"{year}-{end_month:02d}-01"
        
        # Count admissions
        admission_query = {
            "counselor_id": target["counselor_id"],
            "admission_date": {"$gte": start_date, "$lt": end_date}
        }
        
        admission_count = await db.admissions.count_documents(admission_query)
        
        # Sum fees collected
        pipeline = [
            {"$match": admission_query},
            {"$group": {"_id": None, "total_fees_collected": {"$sum": "$fees_paid"}}}
        ]
        fees_result = await db.admissions.aggregate(pipeline).to_list(1)
        fees_collected = fees_result[0]["total_fees_collected"] if fees_result else 0
        
        # Calculate progress percentages
        count_progress = (admission_count / target["target_count"] * 100) if target["target_count"] > 0 else 0
        fees_progress = (fees_collected / target["target_fees"] * 100) if target.get("target_fees") and target["target_fees"] > 0 else 0
        
        results.append({
            **target,
            "actual_count": admission_count,
            "actual_fees": fees_collected,
            "count_progress": round(count_progress, 1),
            "fees_progress": round(fees_progress, 1)
        })
    
    return results

# ===================== SEED DATA ENDPOINT =====================

@api_router.post("/seed")
async def seed_database():
    """Seed the database with sample data for demonstration"""
    
    # Check if already seeded
    existing_colleges = await db.colleges.count_documents({})
    if existing_colleges > 0:
        return {"message": "Database already seeded", "colleges_count": existing_colleges}
    
    # Sample colleges data
    colleges_data = [
        {
            "id": "col-1",
            "name": "Acharya Institute of Management Studies (AIMS)",
            "state": "Karnataka",
            "city": "Bangalore",
            "category": "Management",
            "address": "Soldevanahalli, Hesaraghatta Main Road, Bangalore - 560107, Karnataka",
            "image_url": "https://images.unsplash.com/photo-1664273891579-22f28332f3c4?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "NAAC 'A' Grade Accreditation",
                "Industry-aligned curriculum with 100+ corporate partnerships",
                "State-of-the-art campus with modern amenities",
                "Dedicated placement cell with 95% placement record"
            ],
            "whats_new": [
                "New AI & Data Analytics specialization launched for 2024-25",
                "Partnership with Microsoft for student certifications",
                "International exchange program with 5 universities"
            ],
            "is_featured": True,
            "established": "1994",
            "accreditation": "NAAC 'A' Grade",
            "admission_alerts": [
                {
                    "title": "MBA Admissions Open",
                    "message": "Apply now for MBA 2025-26 batch. Early bird discount of 10% available till March 31st.",
                    "alert_type": "important",
                    "start_date": "2025-01-01",
                    "end_date": "2025-03-31",
                    "is_active": True
                },
                {
                    "title": "Scholarship Applications",
                    "message": "Merit scholarships available for students with 80%+ in graduation. Apply before Feb 28th.",
                    "alert_type": "info",
                    "start_date": "2025-01-15",
                    "end_date": "2025-02-28",
                    "is_active": True
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "col-2",
            "name": "PES University (PESU)",
            "state": "Karnataka",
            "city": "Bangalore",
            "category": "Engineering",
            "address": "100 Feet Ring Road, BSK III Stage, Bangalore - 560085, Karnataka",
            "image_url": "https://images.unsplash.com/photo-1760131556605-7f2e63d00385?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "NAAC 'A+' Grade Accreditation",
                "Top 50 Engineering Colleges in India",
                "Research-focused curriculum with 200+ publications annually",
                "Strong alumni network in Fortune 500 companies"
            ],
            "whats_new": [
                "New Robotics Lab inaugurated with ₹10 Cr investment",
                "MOU signed with IIT Madras for joint research",
                "Startup incubation center launched"
            ],
            "is_featured": True,
            "established": "1973",
            "accreditation": "NAAC 'A+' Grade",
            "admission_alerts": [
                {
                    "title": "PESSAT 2025 Registration",
                    "message": "Online registration for PES Scholastic Aptitude Test (PESSAT) is now open. Register before April 15th.",
                    "alert_type": "deadline",
                    "start_date": "2025-02-01",
                    "end_date": "2025-04-15",
                    "is_active": True
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "col-3",
            "name": "Alliance University (AU)",
            "state": "Karnataka",
            "city": "Bangalore",
            "category": "Management",
            "address": "Chandapura - Anekal Main Road, Anekal, Bangalore - 562106, Karnataka",
            "image_url": "https://images.unsplash.com/photo-1670284768187-5cc68eada1b3?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "NAAC 'A+' Grade Accreditation",
                "Global MBA programs with dual degree options",
                "150-acre smart campus with world-class infrastructure",
                "International faculty with diverse expertise"
            ],
            "whats_new": [
                "New 5-year Integrated MBA program launched",
                "Collaboration with Harvard Business School for case studies",
                "Virtual reality learning lab established"
            ],
            "is_featured": True,
            "established": "2010",
            "accreditation": "NAAC 'A+' Grade",
            "admission_alerts": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "col-4",
            "name": "SRM Institute of Science and Technology",
            "state": "Tamil Nadu",
            "city": "Chennai",
            "category": "Engineering",
            "address": "SRM Nagar, Kattankulathur - 603203, Chengalpattu District, Tamil Nadu",
            "image_url": "https://images.unsplash.com/photo-1759299615947-bc798076b479?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "NAAC 'A++' Grade Accreditation",
                "250+ acre campus with 52,000+ students",
                "2500+ faculty members from top institutions",
                "Ranked among top 10 private universities in India"
            ],
            "whats_new": [
                "SRM Medical College expansion completed",
                "New School of Artificial Intelligence established",
                "International research grants worth ₹50 Cr received"
            ],
            "is_featured": True,
            "established": "1985",
            "accreditation": "NAAC 'A++' Grade",
            "admission_alerts": [
                {
                    "title": "SRMJEEE 2025 Applications",
                    "message": "SRM Joint Engineering Entrance Exam applications are open. Last date: April 30th, 2025.",
                    "alert_type": "deadline",
                    "start_date": "2025-01-01",
                    "end_date": "2025-04-30",
                    "is_active": True
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "col-5",
            "name": "Manipal Academy of Higher Education",
            "state": "Karnataka",
            "city": "Mangalore",
            "category": "Medicine & Health Sciences",
            "address": "Manipal - 576104, Udupi District, Karnataka",
            "image_url": "https://images.unsplash.com/photo-1664273891579-22f28332f3c4?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "Institution of Eminence status by Government of India",
                "1200+ bed teaching hospital",
                "Research collaboration with Mayo Clinic and Johns Hopkins",
                "100% placement for medical graduates"
            ],
            "whats_new": [
                "New Cancer Research Center inaugurated",
                "Telemedicine program expanded to 50 villages",
                "AI-based diagnostic tools introduced in curriculum"
            ],
            "is_featured": True,
            "established": "1953",
            "accreditation": "NAAC 'A++' Grade",
            "admission_alerts": [
                {
                    "title": "MBBS Counseling Schedule",
                    "message": "NEET counseling for MBBS admissions starts from June 1st. Prepare your documents.",
                    "alert_type": "warning",
                    "start_date": "2025-05-01",
                    "end_date": "2025-06-30",
                    "is_active": True
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "col-6",
            "name": "REVA University",
            "state": "Karnataka",
            "city": "Bangalore",
            "category": "Engineering",
            "address": "Rukmini Knowledge Park, Kattigenahalli, Yelahanka, Bangalore - 560064, Karnataka",
            "image_url": "https://images.unsplash.com/photo-1760131556605-7f2e63d00385?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "NAAC 'A' Grade Accreditation",
                "45-acre green campus with modern infrastructure",
                "Strong industry connect with 300+ companies",
                "Focus on innovation and entrepreneurship"
            ],
            "whats_new": [
                "New School of Computing launched",
                "₹5 Cr research grant for renewable energy project",
                "Student startup fund of ₹1 Cr announced"
            ],
            "is_featured": True,
            "established": "2012",
            "accreditation": "NAAC 'A' Grade",
            "admission_alerts": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "col-7",
            "name": "Christ University",
            "state": "Karnataka",
            "city": "Bangalore",
            "category": "Management",
            "address": "Hosur Road, Bangalore - 560029, Karnataka",
            "image_url": "https://images.unsplash.com/photo-1670284768187-5cc68eada1b3?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "NAAC 'A++' Grade Accreditation",
                "Ranked #1 in Karnataka for Arts and Commerce",
                "Vibrant campus life with 100+ student clubs",
                "International collaborations with 50+ universities"
            ],
            "whats_new": [
                "New campus in Delhi NCR announced",
                "Online MBA program launched with global access",
                "New sports complex with Olympic-standard facilities"
            ],
            "is_featured": True,
            "established": "1969",
            "accreditation": "NAAC 'A++' Grade",
            "admission_alerts": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "col-8",
            "name": "VIT University",
            "state": "Tamil Nadu",
            "city": "Chennai",
            "category": "Engineering",
            "address": "Vandalur-Kelambakkam Road, Chennai - 600127, Tamil Nadu",
            "image_url": "https://images.unsplash.com/photo-1759299615947-bc798076b479?crop=entropy&cs=srgb&fm=jpg&q=85",
            "highlights": [
                "NAAC 'A++' Grade Accreditation",
                "Institution of Eminence status",
                "Highest number of patents among private universities",
                "Global rankings in QS World University Rankings"
            ],
            "whats_new": [
                "New campus in Andhra Pradesh operational",
                "Space technology program launched with ISRO",
                "₹100 Cr corpus for student scholarships"
            ],
            "is_featured": True,
            "established": "1984",
            "accreditation": "NAAC 'A++' Grade",
            "admission_alerts": [
                {
                    "title": "VITEEE 2025 Registration",
                    "message": "VIT Engineering Entrance Exam registration is open. Apply online before March 31st.",
                    "alert_type": "important",
                    "start_date": "2025-01-15",
                    "end_date": "2025-03-31",
                    "is_active": True
                }
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Sample courses data with detailed information
    courses_data = [
        # AIMS Courses
        {
            "id": "course-1", 
            "name": "MBA - Master of Business Administration", 
            "college_id": "col-1", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Available",
            "category": "Management",
            "description": "A comprehensive 2-year postgraduate program designed to develop future business leaders with strong analytical, strategic thinking, and leadership skills. The curriculum covers core business functions including Marketing, Finance, Operations, HR, and Strategy.",
            "eligibility": "Bachelor's degree in any discipline with minimum 50% marks. Valid CAT/MAT/XAT/GMAT score. Work experience preferred but not mandatory.",
            "scope": "MBA graduates are in high demand across industries including Consulting, Banking, FMCG, IT, Healthcare, and Startups. The program opens doors to leadership roles in corporate management, entrepreneurship, and consulting.",
            "job_profiles": ["Business Analyst", "Marketing Manager", "Financial Analyst", "Operations Manager", "HR Manager", "Management Consultant", "Product Manager", "Business Development Manager"]
        },
        {
            "id": "course-2", 
            "name": "BBA - Bachelor of Business Administration", 
            "college_id": "col-1", 
            "duration": "3 Years", 
            "level": "UG", 
            "duration_years": 3, 
            "duration_semesters": 6, 
            "seat_status": "Closing",
            "category": "Management",
            "description": "A 3-year undergraduate program that provides a strong foundation in business principles and management practices. Students learn core business concepts while developing communication and analytical skills.",
            "eligibility": "10+2 or equivalent from a recognized board with minimum 50% marks. Entrance exam scores from college-specific tests may be required.",
            "scope": "BBA graduates can pursue entry-level positions in corporate sector or advance to MBA programs. Growing demand in Banking, Retail, E-commerce, and Service industries.",
            "job_profiles": ["Management Trainee", "Sales Executive", "Marketing Coordinator", "HR Executive", "Business Development Executive", "Operations Trainee"]
        },
        {
            "id": "course-3", 
            "name": "PGDM - Post Graduate Diploma in Management", 
            "college_id": "col-1", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Available",
            "category": "Management",
            "description": "A 2-year industry-oriented diploma program with focus on practical business skills and real-world application. Includes mandatory internships and live projects with corporate partners.",
            "eligibility": "Bachelor's degree with minimum 50% marks. Valid entrance exam score (CAT/MAT/XAT). Minimum 2 years work experience preferred.",
            "scope": "PGDM is highly valued by industry due to its practical curriculum. Graduates find opportunities in Corporate Leadership, Consulting, and Entrepreneurship.",
            "job_profiles": ["Business Consultant", "Strategy Analyst", "Brand Manager", "Investment Banker", "Supply Chain Manager", "Entrepreneur"]
        },
        
        # PESU Courses
        {
            "id": "course-4", 
            "name": "B.Tech - Computer Science Engineering", 
            "college_id": "col-2", 
            "duration": "4 Years", 
            "level": "UG", 
            "duration_years": 4, 
            "duration_semesters": 8, 
            "seat_status": "Closing",
            "category": "Engineering",
            "description": "A 4-year undergraduate program covering core computer science concepts including Data Structures, Algorithms, Operating Systems, Database Management, and Software Engineering. Includes specializations in AI/ML, Cybersecurity, and Cloud Computing.",
            "eligibility": "10+2 with Physics, Chemistry, and Mathematics with minimum 60% marks. Valid JEE/CET/PESSAT score required.",
            "scope": "Computer Science graduates are in extremely high demand in IT industry, Product companies, Startups, and Research organizations. India's IT sector offers excellent career growth.",
            "job_profiles": ["Software Developer", "Full Stack Engineer", "Data Scientist", "Machine Learning Engineer", "DevOps Engineer", "Cloud Architect", "Cybersecurity Analyst", "Product Engineer"]
        },
        {
            "id": "course-5", 
            "name": "B.Tech - Electronics & Communication", 
            "college_id": "col-2", 
            "duration": "4 Years", 
            "level": "UG", 
            "duration_years": 4, 
            "duration_semesters": 8, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A 4-year program covering Electronic Circuits, Communication Systems, Signal Processing, VLSI Design, and Embedded Systems. Prepares students for careers in Electronics, Telecommunications, and Semiconductor industries.",
            "eligibility": "10+2 with Physics, Chemistry, and Mathematics with minimum 55% marks. Valid entrance exam score required.",
            "scope": "ECE graduates find opportunities in Semiconductor industry, Telecom companies, Consumer Electronics, Aerospace, and Defense sectors. Growing demand in IoT and 5G technologies.",
            "job_profiles": ["Electronics Engineer", "VLSI Design Engineer", "Embedded Systems Engineer", "Network Engineer", "RF Engineer", "IoT Developer", "Hardware Engineer"]
        },
        {
            "id": "course-6", 
            "name": "M.Tech - Computer Science", 
            "college_id": "col-2", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Under Waiting",
            "category": "Engineering",
            "description": "A 2-year postgraduate program for advanced study in Computer Science with research focus. Specializations available in AI, Machine Learning, Data Science, and Computer Networks.",
            "eligibility": "B.Tech/BE in Computer Science or related field with minimum 60% marks. Valid GATE score preferred.",
            "scope": "M.Tech graduates are preferred for R&D roles, Senior Technical positions, and Academic careers. Higher starting packages compared to UG graduates.",
            "job_profiles": ["Senior Software Engineer", "Research Scientist", "AI/ML Specialist", "Technical Lead", "Data Architect", "Professor/Lecturer"]
        },
        {
            "id": "course-7", 
            "name": "MCA - Master of Computer Applications", 
            "college_id": "col-2", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A 2-year program designed to develop IT professionals with strong programming and software development skills. Covers Application Development, Database Management, and Project Management.",
            "eligibility": "Bachelor's degree with Mathematics/Computer Science at 10+2 or graduation level. Minimum 50% marks required.",
            "scope": "MCA graduates are well-suited for Software Development, IT Consulting, and System Administration roles. Strong demand in IT services and product companies.",
            "job_profiles": ["Application Developer", "System Analyst", "Database Administrator", "IT Consultant", "Web Developer", "Quality Assurance Engineer"]
        },
        
        # Alliance University Courses
        {
            "id": "course-8", 
            "name": "MBA - Global Business", 
            "college_id": "col-3", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Available",
            "category": "Management",
            "description": "A globally-focused MBA program with international exchange opportunities and dual degree options with partner universities. Emphasis on Cross-cultural Management, International Trade, and Global Strategy.",
            "eligibility": "Bachelor's degree with minimum 50% marks. Valid CAT/MAT/GMAT score. English proficiency certification may be required.",
            "scope": "Graduates are prepared for leadership roles in MNCs, International Business, Export-Import, and Global Consulting firms.",
            "job_profiles": ["International Business Manager", "Global Strategy Consultant", "Export Manager", "Country Head", "Global Marketing Manager", "Cross-border M&A Analyst"]
        },
        {
            "id": "course-9", 
            "name": "BBA - Finance & Marketing", 
            "college_id": "col-3", 
            "duration": "3 Years", 
            "level": "UG", 
            "duration_years": 3, 
            "duration_semesters": 6, 
            "seat_status": "Available",
            "category": "Management",
            "description": "A specialized BBA program with dual focus on Finance and Marketing. Provides strong foundation in Financial Analysis, Investment Management, Brand Management, and Digital Marketing.",
            "eligibility": "10+2 with minimum 50% marks from recognized board. Entrance test and personal interview required.",
            "scope": "Graduates can pursue careers in Banking, Financial Services, Marketing Agencies, and Corporate Marketing departments.",
            "job_profiles": ["Financial Analyst", "Marketing Executive", "Investment Associate", "Brand Coordinator", "Digital Marketing Specialist", "Sales Manager"]
        },
        {
            "id": "course-10", 
            "name": "MBA - Healthcare Management", 
            "college_id": "col-3", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Closed",
            "category": "Management",
            "description": "A specialized MBA program focusing on Healthcare Administration, Hospital Management, Health Policy, and Medical Tourism. Includes internships with leading hospitals and healthcare organizations.",
            "eligibility": "Bachelor's degree in any discipline. Medical/Healthcare background preferred but not mandatory. Minimum 50% marks.",
            "scope": "Growing healthcare industry in India offers excellent opportunities in Hospital Administration, Health Insurance, Pharmaceutical Companies, and Health Tech startups.",
            "job_profiles": ["Hospital Administrator", "Healthcare Consultant", "Health Insurance Manager", "Clinical Operations Manager", "Pharma Business Manager", "Health IT Manager"]
        },
        
        # SRM Courses
        {
            "id": "course-11", 
            "name": "B.Tech - Artificial Intelligence", 
            "college_id": "col-4", 
            "duration": "4 Years", 
            "level": "UG", 
            "duration_years": 4, 
            "duration_semesters": 8, 
            "seat_status": "Closing",
            "category": "Engineering",
            "description": "A cutting-edge 4-year program focused on AI, Machine Learning, Deep Learning, Natural Language Processing, and Computer Vision. Includes hands-on projects with industry partners.",
            "eligibility": "10+2 with PCM and minimum 60% marks. Strong mathematical aptitude. Valid SRMJEEE/JEE score required.",
            "scope": "AI specialists are in extremely high demand globally. Opportunities in Tech Giants, AI Startups, Research Labs, and across all industries adopting AI.",
            "job_profiles": ["AI Engineer", "Machine Learning Engineer", "Data Scientist", "NLP Engineer", "Computer Vision Engineer", "AI Research Scientist", "Robotics Engineer"]
        },
        {
            "id": "course-12", 
            "name": "B.Tech - Mechanical Engineering", 
            "college_id": "col-4", 
            "duration": "4 Years", 
            "level": "UG", 
            "duration_years": 4, 
            "duration_semesters": 8, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A comprehensive 4-year program covering Thermodynamics, Manufacturing, Robotics, CAD/CAM, and Automotive Engineering. Strong focus on practical skills through workshops and industry visits.",
            "eligibility": "10+2 with Physics, Chemistry, and Mathematics with minimum 55% marks. Entrance exam score required.",
            "scope": "Mechanical engineers find opportunities in Manufacturing, Automobile, Aerospace, Energy, and Construction sectors. Growing demand in Electric Vehicles and Renewable Energy.",
            "job_profiles": ["Design Engineer", "Manufacturing Engineer", "Automotive Engineer", "Project Engineer", "Quality Control Engineer", "R&D Engineer", "CAD Designer"]
        },
        {
            "id": "course-13", 
            "name": "M.Tech - Data Science", 
            "college_id": "col-4", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A specialized 2-year program in Data Science covering Statistics, Machine Learning, Big Data Technologies, and Business Analytics. Includes capstone projects with industry data.",
            "eligibility": "B.Tech/BE/MCA/MSc with Mathematics/Statistics background. Minimum 55% marks. Programming skills required.",
            "scope": "Data Science is among the fastest-growing fields globally. Opportunities in Tech, Finance, Healthcare, E-commerce, and virtually every industry.",
            "job_profiles": ["Data Scientist", "Data Analyst", "Business Intelligence Analyst", "Big Data Engineer", "Analytics Manager", "Quantitative Analyst"]
        },
        
        # Manipal Courses
        {
            "id": "course-14", 
            "name": "MBBS - Bachelor of Medicine", 
            "college_id": "col-5", 
            "duration": "5.5 Years", 
            "level": "UG", 
            "duration_years": 5, 
            "duration_semesters": 10, 
            "seat_status": "Closed",
            "category": "Medicine",
            "description": "A 5.5-year (4.5 years + 1 year internship) medical degree program that trains students to become qualified doctors. Covers Anatomy, Physiology, Pathology, Pharmacology, and Clinical Medicine.",
            "eligibility": "10+2 with Physics, Chemistry, and Biology with minimum 50% marks. Valid NEET-UG score mandatory. Age 17-25 years.",
            "scope": "MBBS opens doors to medical practice, specialization through MD/MS, medical research, and healthcare administration. Doctors are always in demand.",
            "job_profiles": ["General Physician", "Medical Officer", "Resident Doctor", "Healthcare Administrator", "Medical Researcher", "Public Health Specialist"]
        },
        {
            "id": "course-15", 
            "name": "BDS - Bachelor of Dental Surgery", 
            "college_id": "col-5", 
            "duration": "5 Years", 
            "level": "UG", 
            "duration_years": 5, 
            "duration_semesters": 10, 
            "seat_status": "Under Waiting",
            "category": "Medicine",
            "description": "A 5-year dental degree program including 1-year internship. Covers Oral Anatomy, Dental Materials, Prosthodontics, Orthodontics, and Oral Surgery.",
            "eligibility": "10+2 with PCB and minimum 50% marks. Valid NEET-UG score required. Age 17-25 years.",
            "scope": "Dental surgeons can practice independently, join hospitals, or specialize further through MDS programs. Growing demand for cosmetic dentistry.",
            "job_profiles": ["Dental Surgeon", "Orthodontist", "Prosthodontist", "Oral Surgeon", "Dental Consultant", "Cosmetic Dentist"]
        },
        {
            "id": "course-16", 
            "name": "MD - General Medicine", 
            "college_id": "col-5", 
            "duration": "3 Years", 
            "level": "PG", 
            "duration_years": 3, 
            "duration_semesters": 6, 
            "seat_status": "Available",
            "category": "Medicine",
            "description": "A 3-year postgraduate medical specialization in General Medicine. Advanced training in diagnosis and management of complex medical conditions.",
            "eligibility": "MBBS degree from MCI recognized college. Valid NEET-PG score. Completed internship mandatory.",
            "scope": "MD General Medicine opens doors to super-specialty programs, senior medical positions in hospitals, and private practice.",
            "job_profiles": ["Physician", "Internal Medicine Specialist", "Consultant", "Medical Director", "Clinical Researcher", "Medical Educator"]
        },
        
        # REVA Courses
        {
            "id": "course-17", 
            "name": "B.Tech - Information Technology", 
            "college_id": "col-6", 
            "duration": "4 Years", 
            "level": "UG", 
            "duration_years": 4, 
            "duration_semesters": 8, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A 4-year program covering Software Development, Networking, Database Systems, and emerging technologies like Cloud Computing and Blockchain.",
            "eligibility": "10+2 with PCM and minimum 50% marks. Entrance exam score from college-specific test or state CET.",
            "scope": "IT professionals are essential across industries. Strong placement opportunities in IT services, product companies, and startups.",
            "job_profiles": ["IT Engineer", "Software Developer", "Network Administrator", "System Analyst", "Cloud Engineer", "IT Support Specialist"]
        },
        {
            "id": "course-18", 
            "name": "BCA - Bachelor of Computer Applications", 
            "college_id": "col-6", 
            "duration": "3 Years", 
            "level": "UG", 
            "duration_years": 3, 
            "duration_semesters": 6, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A 3-year undergraduate program focusing on Programming, Web Development, Database Management, and Software Applications. Ideal entry point for IT careers.",
            "eligibility": "10+2 with Mathematics (preferred) and minimum 50% marks. Some colleges accept students without Math background.",
            "scope": "BCA graduates can join IT industry directly or pursue MCA for advanced positions. Growing demand in Web Development and Mobile App development.",
            "job_profiles": ["Junior Developer", "Web Developer", "Technical Support", "Database Assistant", "QA Tester", "IT Coordinator"]
        },
        
        # Christ University Courses
        {
            "id": "course-19", 
            "name": "MBA - Marketing", 
            "college_id": "col-7", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Closing",
            "category": "Management",
            "description": "A specialized MBA program in Marketing covering Brand Management, Digital Marketing, Consumer Behavior, Market Research, and Sales Management.",
            "eligibility": "Bachelor's degree with minimum 50% marks. Valid CAT/MAT/CHRIST entrance score. Personal interview required.",
            "scope": "Marketing professionals are essential for business growth. Opportunities in FMCG, E-commerce, Digital Agencies, and Corporate Marketing.",
            "job_profiles": ["Marketing Manager", "Brand Manager", "Digital Marketing Manager", "Product Marketing Manager", "Market Research Analyst", "Sales Director"]
        },
        {
            "id": "course-20", 
            "name": "B.Com - Honours", 
            "college_id": "col-7", 
            "duration": "3 Years", 
            "level": "UG", 
            "duration_years": 3, 
            "duration_semesters": 6, 
            "seat_status": "Available",
            "category": "Commerce",
            "description": "A 3-year commerce program with in-depth study of Accounting, Finance, Economics, Taxation, and Business Law. Honours program includes research component.",
            "eligibility": "10+2 with Commerce stream and minimum 50% marks. Some colleges accept Science stream students.",
            "scope": "Commerce graduates can pursue CA, CMA, MBA, or join corporate sector in finance and accounting roles.",
            "job_profiles": ["Accountant", "Tax Consultant", "Audit Associate", "Financial Analyst", "Banking Officer", "Insurance Advisor"]
        },
        
        # VIT Courses
        {
            "id": "course-21", 
            "name": "B.Tech - Biotechnology", 
            "college_id": "col-8", 
            "duration": "4 Years", 
            "level": "UG", 
            "duration_years": 4, 
            "duration_semesters": 8, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A 4-year interdisciplinary program combining Biology and Engineering. Covers Genetic Engineering, Bioprocess Technology, Bioinformatics, and Pharmaceutical Biotechnology.",
            "eligibility": "10+2 with PCB or PCM with minimum 55% marks. VITEEE score required for admission.",
            "scope": "Biotechnology offers opportunities in Pharma, Healthcare, Agriculture, Environment, and Research sectors. Growing demand in vaccine and drug development.",
            "job_profiles": ["Biotech Engineer", "Research Scientist", "Quality Control Analyst", "Bioprocess Engineer", "Clinical Research Associate", "Bioinformatics Analyst"]
        },
        {
            "id": "course-22", 
            "name": "M.Tech - VLSI Design", 
            "college_id": "col-8", 
            "duration": "2 Years", 
            "level": "PG", 
            "duration_years": 2, 
            "duration_semesters": 4, 
            "seat_status": "Available",
            "category": "Engineering",
            "description": "A specialized 2-year program in VLSI Design covering Digital Design, Analog Design, ASIC Design, FPGA, and Chip Verification. Includes projects with industry tools.",
            "eligibility": "B.Tech/BE in ECE/EEE/CSE with minimum 60% marks. Valid GATE score preferred for scholarship.",
            "scope": "VLSI engineers are in high demand in Semiconductor industry. Opportunities in chip design companies, product companies, and research labs.",
            "job_profiles": ["VLSI Design Engineer", "Physical Design Engineer", "Verification Engineer", "ASIC Designer", "RTL Designer", "Layout Engineer"]
        },
    ]
    
    # Sample placements data
    placements_data = [
        {
            "college_id": "col-1",
            "description": "AIMS has a dedicated placement cell with strong industry connections. Average placement rate has been consistently above 90%.",
            "stats": [
                {"year": "2024", "highest_package": 2500000, "average_package": 850000, "median_package": 750000, "placement_rate": 92, "total_offers": 280, "top_recruiters": ["Deloitte", "KPMG", "EY", "Amazon", "Infosys"]},
                {"year": "2023", "highest_package": 2200000, "average_package": 800000, "median_package": 700000, "placement_rate": 90, "total_offers": 265, "top_recruiters": ["PwC", "Accenture", "TCS", "Wipro", "HDFC Bank"]},
            ]
        },
        {
            "college_id": "col-2",
            "description": "PES University has exceptional placement records with top tech companies recruiting from campus. Strong alumni network in Silicon Valley.",
            "stats": [
                {"year": "2024", "highest_package": 6500000, "average_package": 1800000, "median_package": 1500000, "placement_rate": 98, "total_offers": 950, "top_recruiters": ["Google", "Microsoft", "Amazon", "Goldman Sachs", "Uber"]},
                {"year": "2023", "highest_package": 5800000, "average_package": 1650000, "median_package": 1400000, "placement_rate": 96, "total_offers": 920, "top_recruiters": ["Meta", "Apple", "Adobe", "Flipkart", "Oracle"]},
            ]
        },
        {
            "college_id": "col-3",
            "description": "Alliance University focuses on global placements with students placed in multinational companies across India and abroad.",
            "stats": [
                {"year": "2024", "highest_package": 3200000, "average_package": 1100000, "median_package": 950000, "placement_rate": 88, "total_offers": 310, "top_recruiters": ["McKinsey", "BCG", "Bain", "HSBC", "Standard Chartered"]},
                {"year": "2023", "highest_package": 2800000, "average_package": 1000000, "median_package": 900000, "placement_rate": 86, "total_offers": 290, "top_recruiters": ["JP Morgan", "Citi", "American Express", "Aditya Birla Group", "Mahindra"]},
            ]
        },
        {
            "college_id": "col-4",
            "description": "SRM Institute has tie-ups with 600+ companies. Focus on industry-ready graduates with pre-placement training.",
            "stats": [
                {"year": "2024", "highest_package": 4200000, "average_package": 1200000, "median_package": 1000000, "placement_rate": 94, "total_offers": 1800, "top_recruiters": ["TCS", "Cognizant", "Infosys", "Wipro", "Tech Mahindra"]},
                {"year": "2023", "highest_package": 3800000, "average_package": 1100000, "median_package": 950000, "placement_rate": 92, "total_offers": 1650, "top_recruiters": ["HCL", "L&T", "Siemens", "Bosch", "Samsung"]},
            ]
        },
        {
            "college_id": "col-5",
            "description": "Manipal's medical graduates are highly sought after. Hospital placements include Manipal Hospitals, Apollo, and international healthcare institutions.",
            "stats": [
                {"year": "2024", "highest_package": 2000000, "average_package": 900000, "median_package": 800000, "placement_rate": 100, "total_offers": 450, "top_recruiters": ["Manipal Hospitals", "Apollo", "Fortis", "Max Healthcare", "Narayana Health"]},
                {"year": "2023", "highest_package": 1800000, "average_package": 850000, "median_package": 750000, "placement_rate": 100, "total_offers": 440, "top_recruiters": ["AIIMS", "NIMHANS", "CMC Vellore", "Tata Memorial", "Medanta"]},
            ]
        },
        {
            "college_id": "col-6",
            "description": "REVA has developed strong placement partnerships with IT companies in Bangalore. Campus recruitment drives held throughout the year.",
            "stats": [
                {"year": "2024", "highest_package": 1800000, "average_package": 650000, "median_package": 550000, "placement_rate": 82, "total_offers": 380, "top_recruiters": ["Infosys", "Wipro", "TCS", "Mindtree", "Mphasis"]},
                {"year": "2023", "highest_package": 1500000, "average_package": 600000, "median_package": 500000, "placement_rate": 80, "total_offers": 350, "top_recruiters": ["Capgemini", "CGI", "Virtusa", "IBM", "Accenture"]},
            ]
        },
        {
            "college_id": "col-7",
            "description": "Christ University known for excellent placements in Banking, FMCG, and Marketing sectors. Strong emphasis on soft skills training.",
            "stats": [
                {"year": "2024", "highest_package": 2800000, "average_package": 950000, "median_package": 800000, "placement_rate": 90, "total_offers": 520, "top_recruiters": ["Goldman Sachs", "KPMG", "EY", "P&G", "Unilever"]},
                {"year": "2023", "highest_package": 2500000, "average_package": 900000, "median_package": 750000, "placement_rate": 88, "total_offers": 480, "top_recruiters": ["Deloitte", "Nestle", "ITC", "Asian Paints", "ICICI Bank"]},
            ]
        },
        {
            "college_id": "col-8",
            "description": "VIT has one of the largest placement programs in India with 500+ companies visiting campus annually.",
            "stats": [
                {"year": "2024", "highest_package": 5500000, "average_package": 1400000, "median_package": 1200000, "placement_rate": 95, "total_offers": 2100, "top_recruiters": ["Microsoft", "Google", "Amazon", "Samsung", "Intel"]},
                {"year": "2023", "highest_package": 5000000, "average_package": 1300000, "median_package": 1100000, "placement_rate": 94, "total_offers": 2000, "top_recruiters": ["Cisco", "VMware", "PayPal", "Qualcomm", "Texas Instruments"]},
            ]
        }
    ]
    
    # Sample fees data - comprehensive year/semester wise
    fees_data = [
        # AIMS MBA Fees (Annual - 2 years)
        {"id": "fee-1", "college_id": "col-1", "course_id": "course-1", "fee_type": "annual", "year_or_semester": 1, "amount": 450000, "hostel_fee": 120000, "admission_fee": 25000, "description": "First Year Annual Fee"},
        {"id": "fee-2", "college_id": "col-1", "course_id": "course-1", "fee_type": "annual", "year_or_semester": 2, "amount": 450000, "hostel_fee": 120000, "admission_fee": 0, "description": "Second Year Annual Fee"},
        
        # AIMS BBA Fees (Annual - 3 years)
        {"id": "fee-3", "college_id": "col-1", "course_id": "course-2", "fee_type": "annual", "year_or_semester": 1, "amount": 180000, "hostel_fee": 100000, "admission_fee": 15000, "description": "First Year Annual Fee"},
        {"id": "fee-3b", "college_id": "col-1", "course_id": "course-2", "fee_type": "annual", "year_or_semester": 2, "amount": 180000, "hostel_fee": 100000, "admission_fee": 0, "description": "Second Year Annual Fee"},
        {"id": "fee-3c", "college_id": "col-1", "course_id": "course-2", "fee_type": "annual", "year_or_semester": 3, "amount": 180000, "hostel_fee": 100000, "admission_fee": 0, "description": "Third Year Annual Fee"},
        
        # PESU B.Tech CSE Fees (Semester - 8 semesters)
        {"id": "fee-4", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 1, "amount": 175000, "hostel_fee": 60000, "admission_fee": 20000, "description": "Semester 1 Fee"},
        {"id": "fee-5", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 2, "amount": 175000, "hostel_fee": 60000, "admission_fee": 0, "description": "Semester 2 Fee"},
        {"id": "fee-6", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 3, "amount": 185000, "hostel_fee": 65000, "admission_fee": 0, "description": "Semester 3 Fee"},
        {"id": "fee-7", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 4, "amount": 185000, "hostel_fee": 65000, "admission_fee": 0, "description": "Semester 4 Fee"},
        {"id": "fee-7a", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 5, "amount": 195000, "hostel_fee": 70000, "admission_fee": 0, "description": "Semester 5 Fee"},
        {"id": "fee-7b", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 6, "amount": 195000, "hostel_fee": 70000, "admission_fee": 0, "description": "Semester 6 Fee"},
        {"id": "fee-7c", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 7, "amount": 200000, "hostel_fee": 75000, "admission_fee": 0, "description": "Semester 7 Fee"},
        {"id": "fee-7d", "college_id": "col-2", "course_id": "course-4", "fee_type": "semester", "year_or_semester": 8, "amount": 200000, "hostel_fee": 75000, "admission_fee": 0, "description": "Semester 8 Fee"},
        
        # Alliance MBA Fees (Annual - 2 years)
        {"id": "fee-8", "college_id": "col-3", "course_id": "course-8", "fee_type": "annual", "year_or_semester": 1, "amount": 650000, "hostel_fee": 150000, "admission_fee": 50000, "description": "First Year Annual Fee"},
        {"id": "fee-9", "college_id": "col-3", "course_id": "course-8", "fee_type": "annual", "year_or_semester": 2, "amount": 650000, "hostel_fee": 150000, "admission_fee": 0, "description": "Second Year Annual Fee"},
        
        # SRM B.Tech AI Fees (Annual - 4 years)
        {"id": "fee-10", "college_id": "col-4", "course_id": "course-11", "fee_type": "annual", "year_or_semester": 1, "amount": 350000, "hostel_fee": 110000, "admission_fee": 30000, "description": "First Year Annual Fee"},
        {"id": "fee-11", "college_id": "col-4", "course_id": "course-11", "fee_type": "annual", "year_or_semester": 2, "amount": 350000, "hostel_fee": 110000, "admission_fee": 0, "description": "Second Year Annual Fee"},
        {"id": "fee-11a", "college_id": "col-4", "course_id": "course-11", "fee_type": "annual", "year_or_semester": 3, "amount": 375000, "hostel_fee": 115000, "admission_fee": 0, "description": "Third Year Annual Fee"},
        {"id": "fee-11b", "college_id": "col-4", "course_id": "course-11", "fee_type": "annual", "year_or_semester": 4, "amount": 375000, "hostel_fee": 115000, "admission_fee": 0, "description": "Fourth Year Annual Fee"},
        
        # Manipal MBBS Fees (Annual - 5 years)
        {"id": "fee-12", "college_id": "col-5", "course_id": "course-14", "fee_type": "annual", "year_or_semester": 1, "amount": 2500000, "hostel_fee": 200000, "admission_fee": 100000, "description": "First Year Annual Fee"},
        {"id": "fee-13", "college_id": "col-5", "course_id": "course-14", "fee_type": "annual", "year_or_semester": 2, "amount": 2500000, "hostel_fee": 200000, "admission_fee": 0, "description": "Second Year Annual Fee"},
        {"id": "fee-13a", "college_id": "col-5", "course_id": "course-14", "fee_type": "annual", "year_or_semester": 3, "amount": 2600000, "hostel_fee": 210000, "admission_fee": 0, "description": "Third Year Annual Fee"},
        {"id": "fee-13b", "college_id": "col-5", "course_id": "course-14", "fee_type": "annual", "year_or_semester": 4, "amount": 2600000, "hostel_fee": 210000, "admission_fee": 0, "description": "Fourth Year Annual Fee"},
        {"id": "fee-13c", "college_id": "col-5", "course_id": "course-14", "fee_type": "annual", "year_or_semester": 5, "amount": 2700000, "hostel_fee": 220000, "admission_fee": 0, "description": "Fifth Year Annual Fee"},
    ]
    
    # Admission charges data
    admission_charges_data = [
        {
            "id": "ac-1",
            "college_id": "col-1",
            "course_id": "course-1",
            "registration_fee": 5000,
            "admission_fee": 25000,
            "caution_deposit": 10000,
            "uniform_fee": 8000,
            "library_fee": 5000,
            "lab_fee": 0,
            "other_charges": 2000,
            "other_charges_description": "ID Card & Documentation",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "ac-2",
            "college_id": "col-2",
            "course_id": "course-4",
            "registration_fee": 3000,
            "admission_fee": 20000,
            "caution_deposit": 15000,
            "uniform_fee": 5000,
            "library_fee": 8000,
            "lab_fee": 12000,
            "other_charges": 5000,
            "other_charges_description": "Workshop & Equipment",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "ac-3",
            "college_id": "col-3",
            "course_id": "course-8",
            "registration_fee": 10000,
            "admission_fee": 50000,
            "caution_deposit": 25000,
            "uniform_fee": 15000,
            "library_fee": 10000,
            "lab_fee": 0,
            "other_charges": 10000,
            "other_charges_description": "International Immersion Program",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "ac-4",
            "college_id": "col-5",
            "course_id": "course-14",
            "registration_fee": 25000,
            "admission_fee": 100000,
            "caution_deposit": 50000,
            "uniform_fee": 20000,
            "library_fee": 15000,
            "lab_fee": 30000,
            "other_charges": 10000,
            "other_charges_description": "Clinical Training Equipment",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Sample FAQs
    faqs_data = [
        # Global FAQs
        {"id": "faq-1", "question": "What is the admission process?", "answer": "The admission process involves submitting an online application, followed by entrance test scores (if applicable), document verification, and counseling for seat allotment. Each college may have specific requirements.", "college_id": None, "is_global": True, "order": 1, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "faq-2", "question": "Are scholarships available?", "answer": "Yes, most featured colleges offer merit-based and need-based scholarships. Eligibility criteria vary by institution. Contact the admissions office for specific scholarship programs.", "college_id": None, "is_global": True, "order": 2, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "faq-3", "question": "What are the hostel facilities like?", "answer": "Featured colleges provide well-equipped hostels with amenities including Wi-Fi, mess facilities, gym, recreational areas, and 24/7 security. Room options include single, double, and triple occupancy.", "college_id": None, "is_global": True, "order": 3, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "faq-4", "question": "What is the fee payment schedule?", "answer": "Fee payment is typically required at the beginning of each academic year or semester. Most colleges offer EMI options through banking partners. Late payment may incur additional charges.", "college_id": None, "is_global": True, "order": 4, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        
        # College-specific FAQs
        {"id": "faq-5", "question": "What specializations are available in MBA at AIMS?", "answer": "AIMS offers specializations in Finance, Marketing, HR, Operations, Business Analytics, and International Business. Dual specialization options are also available.", "college_id": "col-1", "is_global": False, "order": 1, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "faq-6", "question": "Does PESU accept COMEDK scores?", "answer": "Yes, PES University accepts both PESSAT and COMEDK scores for B.Tech admissions. Management quota seats are also available through direct admission.", "college_id": "col-2", "is_global": False, "order": 1, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
        {"id": "faq-7", "question": "What is the placement record at Alliance University?", "answer": "Alliance University has a 98% placement rate with average package of 8.5 LPA. Top recruiters include Deloitte, KPMG, Amazon, and McKinsey.", "college_id": "col-3", "is_global": False, "order": 1, "created_at": datetime.now(timezone.utc).isoformat(), "updated_at": datetime.now(timezone.utc).isoformat()},
    ]
    
    # Create default admin user
    admin_user = {
        "id": "admin-1",
        "email": "admin@ohcampus.com",
        "name": "Admin User",
        "role": "admin",
        "password_hash": hash_password("admin123"),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Create default counselor user
    counselor_user = {
        "id": "counselor-1",
        "email": "counselor@ohcampus.com",
        "name": "Demo Counselor",
        "role": "counselor",
        "designation": "Admission Counselor",
        "team_lead_id": None,
        "phone": None,
        "password_hash": hash_password("counselor123"),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Insert data
    await db.colleges.insert_many(colleges_data)
    await db.courses.insert_many(courses_data)
    await db.fees.insert_many(fees_data)
    await db.admission_charges.insert_many(admission_charges_data)
    await db.faqs.insert_many(faqs_data)
    await db.placements.insert_many(placements_data)
    await db.users.insert_many([admin_user, counselor_user])
    
    return {
        "message": "Database seeded successfully",
        "colleges_count": len(colleges_data),
        "courses_count": len(courses_data),
        "fees_count": len(fees_data),
        "admission_charges_count": len(admission_charges_data),
        "faqs_count": len(faqs_data),
        "placements_count": len(placements_data),
        "users_created": ["admin@ohcampus.com (password: admin123)", "counselor@ohcampus.com (password: counselor123)"]
    }

# ===================== ROOT ENDPOINT =====================

@api_router.get("/")
async def root():
    return {"message": "OhCampus Counselor Platform API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
