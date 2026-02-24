# OhCampus Counselor Platform - Product Requirements Document

## Original Problem Statement
Create a web-based counseling platform for OhCampus counselors with features for counselors (filtering/viewing colleges) and admins (managing fees, courses, FAQs).

## Platform Architecture
- **Frontend**: React (Counselor Portal - counselor.ohcampus.com)
- **Admin Panel**: React (integrated in Counselor Portal)
- **Backend API**: FastAPI/Python
- **Database**: 
  - **MySQL (ohcampus_beta)**: Featured colleges, courses from main ohcampus.com database
  - **MongoDB (ohcampus_counselor)**: Users, fees, admission charges, FAQs, activity logs

## Current Data Status (Feb 24, 2026)
- **Featured Colleges**: 161 (from MySQL `package_type = 'feature_listing'`)
- **Total Courses**: 2,539 courses across all featured colleges
- **Fee Records**: 1,211 (in MongoDB)
- **Colleges with Fees**: 49

## What's Been Implemented

### Session: Feb 24, 2026 - Data Restoration
- Restored MySQL connection with correct credentials
- Fixed college ID format to use `c-{mysql_id}` to match fee records
- Restored original frontend design from morning backup
- Backend now correctly fetches 161 featured colleges from MySQL

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

## Pending Features
1. **Scholarship Application Module** - To be added without breaking current functionality
2. **Course counts display** - May need optimization on college detail page

## Credentials
- **Server SSH**: root@103.118.17.62 (password: ahDilYeqUPNqSxoo)
- **Admin Login**: admin@ohcampus.com / admin123
- **Counselor Login**: counselor@ohcampus.com / counselor123

## Future Tasks (Backlog)
- Add Scholarship Application feature
- Email notifications for scholarship submissions
- Extend fee structure to 6 years annual / 12 semesters
- Add scholarship form link to main ohcampus.com
