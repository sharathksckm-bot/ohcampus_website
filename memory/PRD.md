# OhCampus Counselor Platform - Product Requirements Document

## Original Problem Statement
Create a web-based counseling platform for OhCampus counselors with features for counselors (filtering/viewing colleges) and admins (managing fees, courses, FAQs).

## Platform Architecture
- **Frontend**: React (Counselor Portal - counselor.ohcampus.com)
- **Admin Panel**: React (integrated in Counselor Portal)
- **Backend API**: FastAPI/Python
- **Database**: 
  - **MySQL (ohcampus_beta)**: Featured colleges, courses from main ohcampus.com database
  - **MongoDB (ohcampus_counselor)**: Users, fees, admission charges, FAQs, activity logs, scholarship applications

## Current Data Status (Feb 24, 2026)
- **Featured Colleges**: 158 (from MySQL `package_type = 'feature_listing'`)
- **Total Courses**: 2,379 courses across all featured colleges
- **Fee Records**: 1,211 (in MongoDB)
- **Scholarship Applications**: 8 (in MySQL)

## What's Been Implemented

### Session: Feb 24, 2026 - MySQL Data Fixes & Scholarship Application
#### Bug Fixes Completed:
1. ✅ Fixed incorrect course count (was 22, now 2,379) 
2. ✅ Fixed college count (was 8 demo, now 158 featured)
3. ✅ Fixed MySQL column references (`cr.level` → `cc.level`, `cr.description` → `cr.course_description`)
4. ✅ Fixed MySQL credentials in mysql_db.py
5. ✅ Added missing functions: `get_total_courses_count`, `get_college_highlights`, `get_college_whats_new`, `get_college_placements`
6. ✅ College detail page tabs (Highlights, Courses, Fees) now populated with MySQL data

#### Scholarship Application Feature:
- ✅ **Backend**: API endpoints for scholarship CRUD operations
- ✅ **Frontend**: ScholarshipApplications.jsx page with:
  - Total/Pending/Converted/Today stats
  - Search and filter functionality
  - Status management (Pending, Contacted, Rejected)
  - Counselor assignment
- ✅ **Admin Sidebar**: "Scholarship Applications" link added

### Key Technical Details

#### College ID Format
- MySQL colleges use `c-{id}` format (e.g., `c-12450`)
- Fees in MongoDB are linked using same `c-{id}` format
- This ensures fees display correctly for each college

#### Database Connections
- **MySQL**: `ohcampus_ohcamhk` / `ohcampus123#` @ localhost / `ohcampus_beta`
- **MongoDB**: localhost:27017 / `ohcampus_counselor`

## Files on Production Server
- `/var/www/counselor.ohcampus.com/backend/server.py` - Main FastAPI application
- `/var/www/counselor.ohcampus.com/backend/mysql_db.py` - MySQL connection module
- `/var/www/counselor.ohcampus.com/backend/.env` - Environment variables
- `/var/www/counselor.ohcampus.com/` - Frontend build files

### Backups Created
- `mysql_db.py.backup_20260224_174100`
- `server.py.backup_20260224_174100`

## Credentials
- **Server SSH**: root@103.118.17.62 (password: ahDilYeqUPNqSxoo)
- **Admin Login**: admin@ohcampus.com / admin123
- **Counselor Login**: counselor@ohcampus.com / counselor123

## P0 - Completed
- [x] MySQL data integration (colleges, courses)
- [x] College detail page tabs with data
- [x] Scholarship Applications feature
- [x] Admin sidebar link for Scholarship Applications
- [x] Fixed scholarship application detail view field mappings (Feb 24, 2026)
  - Updated ScholarshipApplications.jsx to handle both MySQL and MongoDB field names
  - Updated CounselorScholarships.jsx with same field mapping fixes
  - Now displays: mobile/phone, qualification, board_university, percentage, entrance_exam, district, preferred_location, etc.
  - Document download links work correctly (marks_card_url, entrance_scorecard_url)

## P1 - In Progress/Upcoming
- [ ] Email notifications for scholarship submissions
- [ ] Extend fee structure to 6 years annual / 12 semesters
- [ ] Add scholarship form link to main ohcampus.com navigation

## P2 - Future/Backlog
- [ ] Re-enable OTP functionality (blocked on MSG91 template)
- [ ] Seat status management for MySQL courses
- [ ] Performance optimization for large course lists
- [ ] Refactor deployment process for reliability (currently manual kill & restart)
- [ ] DRY up permissions logic across endpoints

## Known Limitations
- Seat status (Closing, Under Waiting) only exists for MongoDB demo courses, not MySQL courses
- Dashboard sidebar stats may show cached values until page refresh
- Preview environment (MongoDB) has sparse test data; live production (MySQL) has complete data
