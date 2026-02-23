# OhCampus Website - Product Requirements Document

## Original Problem Statement
Create a web-based counseling platform for OhCampus counselors with features for counselors (filtering/viewing colleges) and admins (managing fees, courses, FAQs).

**Primary Issues (ALL RESOLVED):**
1. Website failed to load data on iOS/Incognito browsers - **FIXED**
2. Menus not displaying completely - **FIXED**
3. College and Article data not loading - **FIXED**
4. Study Abroad form missing - **FIXED**

## What's Been Implemented

### February 23, 2026 - Production Bug Fix
**Issue:** Website data not loading on iOS/Incognito browsers

**Root Causes Identified:**
1. **Expired JWT Token:** The hardcoded `defaultToken` in the Angular source code (line 108 of `home.component.ts`) was expired (March 2024)
2. **JWT Secret Mismatch:** The server had two different JWT secrets (`jwt.php`: `MEDICAL_SECRET_KEY` vs `config.php`: `Iam secret`). The correct one is `MEDICAL_SECRET_KEY`
3. **Frontend JavaScript Bugs:** The `getBlogs()` and `getEvents()` functions crashed when API returned empty arrays, accessing `array[0]` without length checks
4. **Build Environment Issues:** Previous agents attempted client-side JS injection which broke the site

**Fixes Applied:**
1. Updated `home.component.ts` with new valid JWT token (expires 2036)
2. Added null checks for `ArticleArr`, `eventsArr`, and `footernotoficationArr` before accessing array indices
3. Rebuilt the entire Angular application with Node 16
4. Deployed the new build to `/home/ohcampus/public_html/`
5. Restored the API backend (`campusapi.ohcampus.com`) with CORS headers

**Files Modified:**
- `/tmp/ohcampus_website/ohcampus_website-devNN/src/app/modules/admin/home/home.component.ts`

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
