# OhCampus Website - Product Requirements Document

## Original Problem Statement
Create a web-based counseling platform for OhCampus counselors with features for counselors (filtering/viewing colleges) and admins (managing fees, courses, FAQs).

**Primary Issues (ALL RESOLVED):**
1. Website failed to load data on iOS/Incognito browsers - **FIXED**
2. Menus not displaying completely - **FIXED**
3. College and Article data not loading - **FIXED**
4. Study Abroad form missing - **FIXED**

## What's Been Implemented

### February 23, 2026 - Production Bug Fix (Complete)
**Issues Fixed:**
1. **Expired JWT Tokens** - Updated tokens in `home.component.ts` and `menubar.component.ts` (valid until 2036)
2. **JWT Secret Mismatch** - Server uses `MEDICAL_SECRET_KEY` not `Iam secret`
3. **JavaScript Array Access Bugs** - Added null checks before accessing `array[0]` and `.slice()`:
   - `home.component.ts`: getBlogs(), getEvents(), getfooterNotification()
   - `menubar.component.ts`: getCategoryList(), getCityList(), getTrendingSpecilization(), getlistofCertificate()
4. **Hardcoded Menu Data** - Removed hardcoded 4-category array, now fetches all 25 categories from API

**Files Modified in Angular Source:**
- `src/app/modules/admin/home/home.component.ts`
- `src/app/layout/layouts/horizontal/modern/menubar/menubar.component.ts`

**Deployment:**
- Rebuilt with Node 16 + Angular CLI
- Deployed to `/home/ohcampus/public_html/`
- API backend at `/home/ohcampus/public_html/campusapi.ohcampus.com/`

## Architecture

```
/home/ohcampus/
├── public_html/                    # Main website (Angular)
│   ├── index.html
│   ├── main.*.js                   # Compiled Angular
│   ├── assets/
│   └── campusapi.ohcampus.com/     # CodeIgniter API Backend
│       └── application/
│           ├── controllers/web/    # API endpoints
│           ├── models/
│           └── config/
│               ├── config.php      # Contains defaultToken
│               └── jwt.php         # Contains jwt_key (MEDICAL_SECRET_KEY)
```

## Tech Stack
- **Frontend:** Angular 12.2.3 (Fuse template)
- **Backend:** CodeIgniter 3 (PHP)
- **Web Server:** Nginx + PHP-FPM 8.1
- **Database:** MySQL

## Credentials
- **Server SSH:** root@103.118.17.62 (Port 22)
- **JWT Secret:** `MEDICAL_SECRET_KEY`

## Prioritized Backlog

### P1 - Performance Issue
**Issue:** `allCollegeList` page takes ~24 seconds to load
- Root Cause: N+1 query problem in `College_model.php`
- Fix: Refactor to use JOINs or batch fetching

### P2 - Mobile App Build Failures
- Status: Blocked on user action (need clean build from latest Git)

### P2 - Scholarship Application Module
- Backend complete
- Next: Create frontend form
- Then: OTP verification (MSG91), Admin panel

### P3 - Future Tasks
- Refactor hardcoded JWT token architecture
- Email notifications for admission deadlines
- Dynamic SEO meta tags
- HTTP Status Codes fix for PUT/DELETE endpoints

## Known Issues Not Yet Fixed
- Minor JS error in navigation component (`reading 'slice'`)
- "Not secure" warning for `webmail.ohcampus.com`

## Testing Status
- ✅ Desktop browser (normal) - Working
- ✅ Desktop browser (incognito) - Working  
- ✅ iPhone Safari simulation - Working
- ✅ API endpoints return correct data with CORS headers
