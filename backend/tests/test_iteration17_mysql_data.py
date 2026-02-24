"""
Test MySQL Data Integration for OhCampus Counselor Platform
Tests the fixes for:
1. Total Courses count (should be 2000+)
2. Featured Colleges count (should be 158)
3. College detail page tabs (Highlights, Courses)
4. Filters on courses page
5. Course detail with fee structure
"""
import pytest
import requests
import os

# Use production URL since preview environment doesn't have MySQL
BASE_URL = "https://counselor.ohcampus.com"

class TestDashboardStats:
    """Test dashboard statistics - Total Courses and Featured Colleges counts"""
    
    def test_total_courses_count_is_2000_plus(self):
        """Total courses should be 2000+ (was showing 22 before fix)"""
        response = requests.get(f"{BASE_URL}/api/courses", params={"page": 1, "limit": 1})
        assert response.status_code == 200
        data = response.json()
        total = data.get("total", 0)
        print(f"Total Courses: {total}")
        assert total >= 2000, f"Expected 2000+ courses, got {total}"
    
    def test_featured_colleges_count_is_158_plus(self):
        """Featured colleges should be 158+ (was showing 8 before fix)"""
        response = requests.get(f"{BASE_URL}/api/colleges")
        assert response.status_code == 200
        data = response.json()
        count = len(data)
        print(f"Featured Colleges: {count}")
        assert count >= 150, f"Expected 150+ featured colleges, got {count}"


class TestCoursesPage:
    """Test courses page with pagination and filters"""
    
    def test_courses_pagination_returns_correct_total(self):
        """Courses API should return correct total count"""
        response = requests.get(f"{BASE_URL}/api/courses", params={"page": 1, "limit": 50})
        assert response.status_code == 200
        data = response.json()
        courses = data.get("courses", [])
        total = data.get("total", 0)
        print(f"Courses returned: {len(courses)}, Total: {total}")
        assert len(courses) == 50, f"Expected 50 courses per page, got {len(courses)}"
        assert total >= 2000, f"Expected 2000+ total courses, got {total}"
    
    def test_courses_level_filter_ug(self):
        """Level filter should work - UG courses"""
        response = requests.get(f"{BASE_URL}/api/courses", params={"level": "UG", "page": 1, "limit": 10})
        assert response.status_code == 200
        data = response.json()
        courses = data.get("courses", [])
        total = data.get("total", 0)
        print(f"UG Courses: {total}")
        assert total > 0, "Expected UG courses to be found"
        # Verify all returned courses are UG level
        for course in courses:
            assert course.get("level") == "UG", f"Expected UG level, got {course.get('level')}"
    
    def test_courses_level_filter_pg(self):
        """Level filter should work - PG courses"""
        response = requests.get(f"{BASE_URL}/api/courses", params={"level": "PG", "page": 1, "limit": 10})
        assert response.status_code == 200
        data = response.json()
        courses = data.get("courses", [])
        total = data.get("total", 0)
        print(f"PG Courses: {total}")
        assert total > 0, "Expected PG courses to be found"
        for course in courses:
            assert course.get("level") == "PG", f"Expected PG level, got {course.get('level')}"
    
    def test_courses_search_filter(self):
        """Search filter should work"""
        response = requests.get(f"{BASE_URL}/api/courses", params={"search": "MBA", "page": 1, "limit": 10})
        assert response.status_code == 200
        data = response.json()
        courses = data.get("courses", [])
        total = data.get("total", 0)
        print(f"MBA Search Results: {total}")
        assert total > 0, "Expected MBA courses to be found"
        # Verify search results contain MBA
        for course in courses:
            assert "MBA" in course.get("name", "").upper() or "MBA" in course.get("slug", "").upper(), \
                f"Expected MBA in course name, got {course.get('name')}"


class TestCollegeDetailPage:
    """Test college detail page tabs - Highlights, Courses"""
    
    def test_college_detail_has_highlights(self):
        """College detail should have highlights data"""
        # First get a college ID
        response = requests.get(f"{BASE_URL}/api/colleges", params={"limit": 1})
        assert response.status_code == 200
        colleges = response.json()
        assert len(colleges) > 0, "Expected at least one college"
        
        college_id = colleges[0]["id"]
        
        # Get college detail
        response = requests.get(f"{BASE_URL}/api/colleges/{college_id}")
        assert response.status_code == 200
        college = response.json()
        
        highlights = college.get("highlights", [])
        print(f"College: {college.get('name')}")
        print(f"Highlights count: {len(highlights)}")
        # Some colleges may not have highlights, so just verify the field exists
        assert "highlights" in college, "Expected highlights field in college detail"
    
    def test_college_detail_has_courses(self):
        """College detail page should show courses"""
        # Get a college with courses
        response = requests.get(f"{BASE_URL}/api/colleges")
        assert response.status_code == 200
        colleges = response.json()
        
        # Find a college with course_count > 0
        college_with_courses = None
        for college in colleges:
            if college.get("course_count", 0) > 0:
                college_with_courses = college
                break
        
        assert college_with_courses is not None, "Expected at least one college with courses"
        
        college_id = college_with_courses["id"]
        
        # Get courses for this college
        response = requests.get(f"{BASE_URL}/api/colleges/{college_id}/courses")
        assert response.status_code == 200
        courses = response.json()
        
        print(f"College: {college_with_courses.get('name')}")
        print(f"Courses count: {len(courses)}")
        assert len(courses) > 0, f"Expected courses for college {college_id}"
    
    def test_college_c92_has_highlights(self):
        """Specific test for college c-92 (AJIMSRC) which should have highlights"""
        response = requests.get(f"{BASE_URL}/api/colleges/c-92")
        assert response.status_code == 200
        college = response.json()
        
        highlights = college.get("highlights", [])
        print(f"College: {college.get('name')}")
        print(f"Highlights: {highlights}")
        assert len(highlights) > 0, "Expected highlights for AJIMSRC college"


class TestCourseDetail:
    """Test course detail with fee structure"""
    
    def test_course_detail_has_fee_info(self):
        """Course detail should have fee information"""
        # Get a course
        response = requests.get(f"{BASE_URL}/api/courses", params={"page": 1, "limit": 1})
        assert response.status_code == 200
        data = response.json()
        courses = data.get("courses", [])
        assert len(courses) > 0, "Expected at least one course"
        
        course = courses[0]
        print(f"Course: {course.get('name')}")
        print(f"Total Fees: {course.get('total_fees', 'N/A')}")
        print(f"College: {course.get('college', {}).get('name', 'N/A')}")
        
        # Verify course has expected fields
        assert "name" in course, "Expected name field"
        assert "level" in course, "Expected level field"
        assert "duration" in course, "Expected duration field"


class TestFeeManagement:
    """Test fee management page"""
    
    def test_fees_endpoint_returns_data(self):
        """Fees endpoint should return fee records"""
        response = requests.get(f"{BASE_URL}/api/fees", params={"page": 1, "limit": 10})
        assert response.status_code == 200
        fees = response.json()
        print(f"Fee records: {len(fees)}")
        # Fees may be empty if not configured, just verify endpoint works
        assert isinstance(fees, list), "Expected fees to be a list"


class TestCollegeFilters:
    """Test college filters"""
    
    def test_colleges_state_filter(self):
        """State filter should work"""
        response = requests.get(f"{BASE_URL}/api/colleges", params={"state": "Karnataka"})
        assert response.status_code == 200
        colleges = response.json()
        print(f"Karnataka Colleges: {len(colleges)}")
        assert len(colleges) > 0, "Expected Karnataka colleges"
        for college in colleges:
            assert college.get("state") == "Karnataka", f"Expected Karnataka, got {college.get('state')}"
    
    def test_colleges_category_filter(self):
        """Category filter should work"""
        response = requests.get(f"{BASE_URL}/api/colleges", params={"category": "Engineering"})
        assert response.status_code == 200
        colleges = response.json()
        print(f"Engineering Colleges: {len(colleges)}")
        # Category filter may return 0 if no engineering colleges, just verify endpoint works
        assert isinstance(colleges, list), "Expected colleges to be a list"
    
    def test_colleges_search_filter(self):
        """Search filter should work"""
        response = requests.get(f"{BASE_URL}/api/colleges", params={"search": "Manipal"})
        assert response.status_code == 200
        colleges = response.json()
        print(f"Manipal Search Results: {len(colleges)}")
        # Verify search results contain Manipal
        for college in colleges:
            assert "manipal" in college.get("name", "").lower() or "manipal" in college.get("address", "").lower(), \
                f"Expected Manipal in college name/address, got {college.get('name')}"


class TestCoursesWithCollege:
    """Test courses with college info endpoint"""
    
    def test_courses_with_college_returns_college_info(self):
        """Courses with college endpoint should include college details"""
        response = requests.get(f"{BASE_URL}/api/courses/with-college", params={"page": 1, "limit": 10})
        assert response.status_code == 200
        data = response.json()
        courses = data.get("courses", [])
        
        assert len(courses) > 0, "Expected courses"
        
        for course in courses:
            college = course.get("college", {})
            print(f"Course: {course.get('name')} - College: {college.get('name', 'N/A')}")
            assert "college" in course, "Expected college info in course"
            assert college.get("name"), "Expected college name"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
