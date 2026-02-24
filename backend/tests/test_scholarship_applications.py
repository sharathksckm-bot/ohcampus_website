"""
Test suite for Scholarship Applications feature
Tests:
- POST /api/scholarship-applications - Create scholarship application (public endpoint)
- GET /api/scholarship-applications - List applications with role-based access
- GET /api/scholarship-applications/stats - Get application statistics
- PUT /api/scholarship-applications/{id} - Update application status
- GET /api/counselor/scholarship-utm-link - Generate UTM link for counselor
- Role-based filtering: Admin sees all, Team Lead sees team's, Counselor sees own referrals
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@ohcampus.com"
ADMIN_PASSWORD = "admin123"
COUNSELOR_EMAIL = "counselor@ohcampus.com"
COUNSELOR_PASSWORD = "counselor123"

# Status options
VALID_STATUSES = ["Pending", "Under Review", "Contacted", "Eligible", "Not Eligible", "Converted", "Rejected"]


class TestScholarshipApplicationsAuth:
    """Test authentication for scholarship endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def counselor_token(self):
        """Get counselor authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": COUNSELOR_EMAIL,
            "password": COUNSELOR_PASSWORD
        })
        assert response.status_code == 200, f"Counselor login failed: {response.text}"
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Admin auth headers"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {admin_token}"
        }
    
    @pytest.fixture(scope="class")
    def counselor_headers(self, counselor_token):
        """Counselor auth headers"""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {counselor_token}"
        }


class TestCreateScholarshipApplication(TestScholarshipApplicationsAuth):
    """Test POST /api/scholarship-applications - Public endpoint"""
    
    def test_create_application_success(self):
        """Test creating a new scholarship application"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Test Student",
            "email": unique_email,
            "phone": "9876543210",
            "father_name": "Test Father",
            "mother_name": "Test Mother",
            "date_of_birth": "2000-01-15",
            "gender": "Male",
            "address": "123 Test Street",
            "city": "Bangalore",
            "state": "Karnataka",
            "pincode": "560001",
            "tenth_percentage": 85.5,
            "twelfth_percentage": 82.0,
            "current_education": "12th Pass",
            "preferred_stream": "Engineering",
            "preferred_course": "B.Tech - Computer Science",
            "preferred_college": "Test College"
        }
        
        response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        
        assert response.status_code == 201, f"Create failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "application_number" in data
        assert data["application_number"].startswith("SCH-")
        assert "application" in data
        assert data["application"]["name"] == "Test Student"
        assert data["application"]["email"] == unique_email
        assert data["application"]["status"] == "Pending"
        
        # Store for cleanup
        self.__class__.created_app_id = data["application"]["id"]
        self.__class__.created_app_number = data["application_number"]
        print(f"Created application: {data['application_number']}")
    
    def test_create_application_minimal_fields(self):
        """Test creating application with only required fields"""
        unique_email = f"minimal_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Minimal Test",
            "email": unique_email,
            "phone": "9876543211"
        }
        
        response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        
        assert response.status_code == 201, f"Create failed: {response.text}"
        data = response.json()
        assert data["application"]["status"] == "Pending"
        print(f"Created minimal application: {data['application_number']}")
    
    def test_create_application_with_utm_tracking(self, counselor_headers):
        """Test creating application with UTM parameters"""
        # First get counselor's UTM link to get their ID
        utm_response = requests.get(f"{BASE_URL}/api/counselor/scholarship-utm-link", headers=counselor_headers)
        assert utm_response.status_code == 200
        counselor_id = utm_response.json()["counselor_id"]
        
        unique_email = f"utm_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "UTM Test Student",
            "email": unique_email,
            "phone": "9876543212",
            "utm_source": counselor_id,
            "utm_medium": "counselor",
            "utm_campaign": "scholarship_referral"
        }
        
        response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        
        assert response.status_code == 201, f"Create failed: {response.text}"
        data = response.json()
        
        # Verify UTM tracking was captured
        assert data["application"]["utm_source"] == counselor_id
        assert data["application"]["utm_medium"] == "counselor"
        # Counselor should be auto-assigned based on UTM source
        assert data["application"].get("counselor_id") == counselor_id
        print(f"Created UTM-tracked application: {data['application_number']}")
    
    def test_create_application_duplicate_email_blocked(self):
        """Test that duplicate applications within 24 hours are blocked"""
        unique_email = f"dup_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Duplicate Test",
            "email": unique_email,
            "phone": "9876543213"
        }
        
        # First submission should succeed
        response1 = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        assert response1.status_code == 201
        
        # Second submission with same email should fail
        response2 = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        assert response2.status_code == 400
        assert "already submitted" in response2.json()["detail"].lower()
    
    def test_create_application_missing_required_fields(self):
        """Test validation for missing required fields"""
        payload = {
            "name": "Test"
            # Missing email and phone
        }
        
        response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        assert response.status_code == 422  # Validation error


class TestGetScholarshipApplications(TestScholarshipApplicationsAuth):
    """Test GET /api/scholarship-applications - List with role-based access"""
    
    def test_admin_can_see_all_applications(self, admin_headers):
        """Test that admin can see all applications"""
        response = requests.get(f"{BASE_URL}/api/scholarship-applications", headers=admin_headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "applications" in data
        assert "total" in data
        assert "page" in data
        assert "total_pages" in data
        print(f"Admin sees {data['total']} total applications")
    
    def test_counselor_sees_own_referrals(self, counselor_headers):
        """Test that counselor only sees their own referrals"""
        response = requests.get(f"{BASE_URL}/api/scholarship-applications", headers=counselor_headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "applications" in data
        print(f"Counselor sees {data['total']} referrals")
    
    def test_filter_by_status(self, admin_headers):
        """Test filtering applications by status"""
        response = requests.get(
            f"{BASE_URL}/api/scholarship-applications?status=Pending",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned applications should have Pending status
        for app in data["applications"]:
            assert app["status"] == "Pending"
    
    def test_search_applications(self, admin_headers):
        """Test searching applications by name/email/phone"""
        response = requests.get(
            f"{BASE_URL}/api/scholarship-applications?search=test",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        print(f"Search 'test' returned {data['total']} results")
    
    def test_pagination(self, admin_headers):
        """Test pagination of applications"""
        response = requests.get(
            f"{BASE_URL}/api/scholarship-applications?page=1&limit=5",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert data["limit"] == 5
        assert len(data["applications"]) <= 5
    
    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated access is denied"""
        response = requests.get(f"{BASE_URL}/api/scholarship-applications")
        assert response.status_code in [401, 403]


class TestScholarshipApplicationStats(TestScholarshipApplicationsAuth):
    """Test GET /api/scholarship-applications/stats"""
    
    def test_admin_gets_stats(self, admin_headers):
        """Test admin can get application statistics"""
        response = requests.get(
            f"{BASE_URL}/api/scholarship-applications/stats",
            headers=admin_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "total" in data
        assert "by_status" in data
        assert "recent_30_days" in data
        assert "today" in data
        
        print(f"Stats: Total={data['total']}, By Status={data['by_status']}")
    
    def test_counselor_gets_own_stats(self, counselor_headers):
        """Test counselor gets stats for their own referrals"""
        response = requests.get(
            f"{BASE_URL}/api/scholarship-applications/stats",
            headers=counselor_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total" in data
        assert "by_status" in data


class TestUpdateScholarshipApplication(TestScholarshipApplicationsAuth):
    """Test PUT /api/scholarship-applications/{id}"""
    
    @pytest.fixture(scope="class")
    def test_application(self, admin_headers):
        """Create a test application for update tests"""
        unique_email = f"update_test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Update Test Student",
            "email": unique_email,
            "phone": "9876543299"
        }
        
        response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        assert response.status_code == 201
        return response.json()["application"]
    
    def test_admin_can_update_status(self, admin_headers, test_application):
        """Test admin can update application status"""
        app_id = test_application["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=admin_headers,
            json={"status": "Under Review"}
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data["status"] == "Under Review"
        print(f"Updated status to: {data['status']}")
    
    def test_admin_can_add_notes(self, admin_headers, test_application):
        """Test admin can add notes to application"""
        app_id = test_application["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=admin_headers,
            json={"admin_notes": "Test notes - student contacted"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["admin_notes"] == "Test notes - student contacted"
    
    def test_admin_can_assign_counselor(self, admin_headers, counselor_headers, test_application):
        """Test admin can assign counselor to application"""
        app_id = test_application["id"]
        
        # Get counselor ID
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=counselor_headers)
        counselor_id = me_response.json()["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=admin_headers,
            json={"counselor_id": counselor_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["counselor_id"] == counselor_id
        assert data["counselor_name"] is not None
        print(f"Assigned counselor: {data['counselor_name']}")
    
    def test_invalid_status_rejected(self, admin_headers, test_application):
        """Test that invalid status is rejected"""
        app_id = test_application["id"]
        
        response = requests.put(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=admin_headers,
            json={"status": "InvalidStatus"}
        )
        
        assert response.status_code == 400
        assert "Invalid status" in response.json()["detail"]
    
    def test_all_valid_statuses(self, admin_headers, test_application):
        """Test all valid status transitions"""
        app_id = test_application["id"]
        
        for status in VALID_STATUSES:
            response = requests.put(
                f"{BASE_URL}/api/scholarship-applications/{app_id}",
                headers=admin_headers,
                json={"status": status}
            )
            assert response.status_code == 200, f"Failed for status {status}: {response.text}"
            assert response.json()["status"] == status
            print(f"Status '{status}' - OK")


class TestCounselorUTMLink(TestScholarshipApplicationsAuth):
    """Test GET /api/counselor/scholarship-utm-link"""
    
    def test_counselor_gets_utm_link(self, counselor_headers):
        """Test counselor can get their UTM link"""
        response = requests.get(
            f"{BASE_URL}/api/counselor/scholarship-utm-link",
            headers=counselor_headers
        )
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert "utm_link" in data
        assert "counselor_id" in data
        assert "counselor_name" in data
        
        # Verify UTM link format
        assert "ohcampus.com/check-scholarship" in data["utm_link"]
        assert "utm_source=" in data["utm_link"]
        assert "utm_medium=counselor" in data["utm_link"]
        assert "utm_campaign=scholarship_referral" in data["utm_link"]
        
        print(f"UTM Link: {data['utm_link']}")
    
    def test_admin_gets_utm_link(self, admin_headers):
        """Test admin can also get UTM link"""
        response = requests.get(
            f"{BASE_URL}/api/counselor/scholarship-utm-link",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "utm_link" in data
    
    def test_unauthenticated_access_denied(self):
        """Test unauthenticated access is denied"""
        response = requests.get(f"{BASE_URL}/api/counselor/scholarship-utm-link")
        assert response.status_code in [401, 403]


class TestGetSingleApplication(TestScholarshipApplicationsAuth):
    """Test GET /api/scholarship-applications/{id}"""
    
    @pytest.fixture(scope="class")
    def test_application(self):
        """Create a test application"""
        unique_email = f"single_test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Single Test Student",
            "email": unique_email,
            "phone": "9876543288"
        }
        
        response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        assert response.status_code == 201
        return response.json()["application"]
    
    def test_admin_can_get_any_application(self, admin_headers, test_application):
        """Test admin can get any application"""
        app_id = test_application["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=admin_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == app_id
    
    def test_not_found_application(self, admin_headers):
        """Test 404 for non-existent application"""
        response = requests.get(
            f"{BASE_URL}/api/scholarship-applications/non-existent-id",
            headers=admin_headers
        )
        
        assert response.status_code == 404


class TestDeleteScholarshipApplication(TestScholarshipApplicationsAuth):
    """Test DELETE /api/scholarship-applications/{id}"""
    
    def test_admin_can_delete_application(self, admin_headers):
        """Test admin can delete an application"""
        # First create an application to delete
        unique_email = f"delete_test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Delete Test Student",
            "email": unique_email,
            "phone": "9876543277"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        assert create_response.status_code == 201
        app_id = create_response.json()["application"]["id"]
        
        # Delete the application
        delete_response = requests.delete(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=admin_headers
        )
        
        assert delete_response.status_code == 200
        assert "deleted" in delete_response.json()["message"].lower()
        
        # Verify it's deleted
        get_response = requests.get(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=admin_headers
        )
        assert get_response.status_code == 404
    
    def test_counselor_cannot_delete(self, counselor_headers):
        """Test counselor cannot delete applications"""
        # First create an application
        unique_email = f"nodelete_test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "No Delete Test",
            "email": unique_email,
            "phone": "9876543266"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/scholarship-applications", json=payload)
        assert create_response.status_code == 201
        app_id = create_response.json()["application"]["id"]
        
        # Try to delete as counselor
        delete_response = requests.delete(
            f"{BASE_URL}/api/scholarship-applications/{app_id}",
            headers=counselor_headers
        )
        
        assert delete_response.status_code == 403


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
