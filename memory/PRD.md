# OhCampus Platform - Product Requirements Document

## Original Problem Statement
Create a web-based counseling platform for OhCampus counselors with features for counselors (filtering/viewing colleges) and admins (managing fees, courses, FAQs).

## Platform Architecture
- **Frontend**: Angular 12 (ohcampus.com)
- **Admin Panel**: Angular (admin.ohcampus.com)
- **Backend API**: CodeIgniter/PHP (campusapi.ohcampus.com)
- **Database**: MySQL/MariaDB
- **Web Server**: Nginx with PHP-FPM

## Server Details
- **Host**: 103.118.17.62
- **SSH Port**: 22

## Directory Structure
```
/home/ohcampus/
├── public_html/                 # Live production frontend
│   ├── admin.ohcampus.com/      # Admin panel
│   ├── campusapi.ohcampus.com/  # Backend API
│   └── (Angular build files)
├── public_html_backup_*/        # Backups
└── logs/
```

## What's Been Implemented

### Session: Feb 23, 2026 (Latest)

#### P0 - Performance Bug Fixed ✅
- **Issue**: `allCollegeList` API taking ~25 seconds
- **Root Causes**:
  1. Missing `getRankListByClgIds()` batch method (N+1 query fix incomplete)
  2. Missing database indexes on `gallery` and `college_ranks` tables
- **Solution**:
  - Added batch method to `College_model.php`
  - Created index: `idx_gallery_postid_type ON gallery (postid, type)`
  - Created index: `idx_college_ranks_college_id ON college_ranks (college_id, category_id)`
- **Result**: Response time reduced from ~25s to ~0.8s

#### Admin Panel Fixed ✅
- **Issue**: admin.ohcampus.com returning 500 error
- **Root Cause**: Admin directory missing from production
- **Solution**: Restored from `/home/ohcampus/public_html_backup_20260223_135832/admin.ohcampus.com`

#### Angular Routing Fixed ✅
- Restored `.htaccess` file for client-side routing

### Previous Sessions
- Fixed critical production bug (site not loading data on iPhone/Incognito)
- Fixed multiple JavaScript bugs in Angular source code
- Replaced expired JWT tokens throughout Angular source
- Fixed CORS issues on backend API
- Built and deployed new Angular frontend

## Pending Issues

### P1 - "New" Study Abroad Form Missing
- Current form in Git repo is older version
- Newer form exists only in production backup compiled files
- Needs to be extracted and re-implemented

### P1 - Missing Blog Images
- Several images returning 404:
  - `/uploads/blogs/bpt_image_21.jpg`
  - `/uploads/blogs/ohcampus_after_12.jpg`
  - `/uploads/blogs/allied_health_sciences_image_1.jpg`

### P2 - Scholarship Application Module ✅ COMPLETED (Feb 23, 2026)
- **Frontend URL**: `https://ohcampus.com/check-scholarship/`
- **Admin Panel**: `https://admin.ohcampus.com/scholarship/`
- **Features**:
  - 5-step multi-page form with progress bar (0% → 100%)
  - OhCampus branded colors (#1e293b, #0f172a, #f9ab00)
  - OhCampus logo and favicon
  - MSG91 OTP integration for mobile verification
  - Mobile responsive design
  - Admin panel with search, filter, status management
- **Backend APIs**:
  - `sendOTP` - MSG91 SMS OTP
  - `verifyOTP` - OTP verification
  - `apply` - Application submission
  - `getApplications` - Admin listing
  - `updateStatus` - Status management (Pending/Contacted/Eligible/Not Eligible/Converted)

### P1 - Missing Blog Images ✅ FIXED
- Created symlinks from `public_html/uploads/` to `campusapi.ohcampus.com/uploads/`
- All blog images now accessible from main domain

### P2 - Mobile App Build Issues
- Blocked on user performing clean build

## Future Tasks (Backlog)

### P3 - Technical Debt
- Refactor hardcoded JWT token architecture
- Fix Nginx vs Apache configuration conflicts

### P3 - Features
- Email notifications for admission deadlines
- OTP verification (MSG91) for scholarship form
- Admin panel for scholarship applications

## Known Issues
- "Not secure" warning for webmail.ohcampus.com
- Incorrect HTTP status codes for PUT/DELETE endpoints in counselor app

## API Endpoints
- Main API Base: `https://campusapi.ohcampus.com/web/`
- College List: `POST /College/getCollegeList`
- College Details: `POST /College/getCollegeDetailsByID`

## Database Schema
- Database: `ohcampus_beta`
- Key Tables: `college`, `college_ranks`, `gallery`, `college_course`

## 3rd Party Integrations
- Firebase
- Sendinblue
- MSG91

## Files Modified This Session
- `/home/ohcampus/public_html/campusapi.ohcampus.com/application/models/web/College_model.php` - Added getRankListByClgIds()
- `/home/ohcampus/public_html/.htaccess` - Restored for Angular routing
- `/home/ohcampus/public_html/admin.ohcampus.com/` - Restored from backup
