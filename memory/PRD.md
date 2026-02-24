# OhCampus Platform - Product Requirements Document

## Original Problem Statement
Create a web-based counseling platform for OhCampus counselors with features for counselors (filtering/viewing colleges) and admins (managing fees, courses, FAQs).

## Platform Architecture
- **Frontend**: React (Counselor Portal - counselor.ohcampus.com)
- **Admin Panel**: React (integrated in Counselor Portal)
- **Backend API**: FastAPI/Python with MongoDB + MySQL support
- **Database**: MongoDB (primary), MySQL (legacy data)

## What's Been Implemented

### Session: Feb 24, 2026 (Latest)

#### Scholarship Applications Integration ✅ COMPLETED
Integrated scholarship applications into both Admin and Counselor panels.

**Admin Panel Features** (`/admin/scholarship-applications`):
- Dashboard with stats cards (Total, Pending, Converted, Today)
- Applications table with search, filter by status, pagination
- Application detail dialog with full information
- Status update dropdown (7 statuses: Pending, Under Review, Contacted, Eligible, Not Eligible, Converted, Rejected)
- Counselor assignment functionality
- Admin notes textarea
- Sidebar menu integration

**Counselor Portal Features** (`/scholarships`):
- "My Scholarship Referrals" page for counselors
- Stats cards (Total Referrals, Pending, Converted, Conversion Rate)
- "Get Referral Link" button with UTM dialog
- Copy UTM link functionality
- Applications table (read-only status)
- Application detail view

**Backend APIs**:
- `POST /api/scholarship-applications` - Public endpoint for creating applications
- `GET /api/scholarship-applications` - List with role-based filtering
- `GET /api/scholarship-applications/stats` - Statistics endpoint
- `GET /api/scholarship-applications/{id}` - Get single application
- `PUT /api/scholarship-applications/{id}` - Update status/notes/counselor
- `DELETE /api/scholarship-applications/{id}` - Admin only delete
- `GET /api/counselor/scholarship-utm-link` - Generate UTM link

**Role-Based Access Control**:
- Admin: Sees all applications
- Admission Manager: Sees all applications
- Team Lead: Sees own + team members' applications
- Counselor: Sees only own referrals (by counselor_id or utm_source)

**UTM Tracking**:
- UTM link format: `https://ohcampus.com/check-scholarship/?utm_source={counselor_id}&utm_medium=counselor&utm_campaign=scholarship_referral`
- Auto-assigns counselor when utm_source matches counselor ID or email

**Application Number Format**: SCH-YYYY-NNNN (e.g., SCH-2026-0001)

### Previous Sessions
- Counselor Portal with college/course browsing
- Admin dashboard with performance metrics
- User management with roles (Admin, Counselor, Team Lead, Admission Manager)
- Fee management
- FAQ management
- Activity logging
- College management
- Admissions tracking

## Pending Issues
None - all requested features implemented.

## Future Tasks (Backlog)

### P3 - Features
- Email notifications for new scholarship applications
- OTP verification for scholarship form (MSG91)
- Export scholarship applications to CSV/Excel
- Counselor performance reports for scholarship conversions

## Test Credentials
- Admin: `admin@ohcampus.com / admin123`
- Counselor: `counselor@ohcampus.com / counselor123`

## Key Files
- `/app/backend/server.py` - FastAPI backend with all endpoints
- `/app/frontend/src/pages/ScholarshipApplications.jsx` - Admin page
- `/app/frontend/src/pages/CounselorScholarships.jsx` - Counselor page
- `/app/frontend/src/components/layout/AdminLayout.jsx` - Admin sidebar with menu
- `/app/frontend/src/components/layout/Navbar.jsx` - Counselor navbar

## Database Schema
- **MongoDB Collections**:
  - `scholarship_applications` - Scholarship application data
  - `users` - User accounts with roles
  - `admissions` - Admission records
  - `colleges` - College information
  - `courses` - Course information

## Testing Results
- Backend: 100% (25/25 tests passed)
- Frontend: 100% (all UI tests passed)
- Test report: `/app/test_reports/iteration_16.json`
