"""
Test file for OhCampus Iteration 6 Features:
1. College search bar in Fee Management
2. User/Counselor Management for admins with designations
3. Admissions module for counselors
4. Performance Dashboard for Admin/Manager
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://scholarship-portal-1.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "admin@ohcampus.com"
ADMIN_PASSWORD = "admin123"
COUNSELOR_EMAIL = "counselor@ohcampus.com"
COUNSELOR_PASSWORD = "counselor123"

# Designations
DESIGNATIONS = ["Admission Counselor", "Senior Admission Counselor", "Team Lead", "Admission Manager"]


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_admin_login(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        print(f"Admin login successful: {data['user']['email']}")
    
    def test_counselor_login(self):
        """Test counselor login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": COUNSELOR_EMAIL,
            "password": COUNSELOR_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "counselor"
        print(f"Counselor login successful: {data['user']['email']}")


class TestUserManagement:
    """Test User Management endpoints (Admin only)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def counselor_token(self):
        """Get counselor auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": COUNSELOR_EMAIL,
            "password": COUNSELOR_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_designations(self, admin_token):
        """Test GET /api/admin/designations returns all designations"""
        response = requests.get(f"{BASE_URL}/api/admin/designations")
        assert response.status_code == 200
        data = response.json()
        assert "designations" in data
        assert len(data["designations"]) == 4
        for d in DESIGNATIONS:
            assert d in data["designations"]
        print(f"Designations: {data['designations']}")
    
    def test_get_all_users_admin(self, admin_token):
        """Test GET /api/admin/users returns counselor users"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} counselor users")
        for user in data:
            assert "id" in user
            assert "email" in user
            assert "name" in user
            assert "designation" in user
            print(f"  - {user['name']} ({user['designation']})")
    
    def test_get_users_requires_admin(self, counselor_token):
        """Test GET /api/admin/users requires admin role"""
        headers = {"Authorization": f"Bearer {counselor_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        assert response.status_code == 403
        print("Non-admin correctly denied access to user management")
    
    def test_get_team_leads(self, admin_token):
        """Test GET /api/admin/users/team-leads returns team leads and managers"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users/team-leads", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} team leads/managers")
        for tl in data:
            assert tl["designation"] in ["Team Lead", "Admission Manager"]
            print(f"  - {tl['name']} ({tl['designation']})")
    
    def test_create_counselor(self, admin_token):
        """Test POST /api/admin/users creates new counselor"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        test_email = f"TEST_counselor_{os.urandom(4).hex()}@test.com"
        
        response = requests.post(f"{BASE_URL}/api/admin/users", headers=headers, json={
            "email": test_email,
            "name": "TEST New Counselor",
            "password": "test123",
            "designation": "Admission Counselor",
            "phone": "9876543210"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_email
        assert data["designation"] == "Admission Counselor"
        assert data["is_active"] == True
        print(f"Created counselor: {data['name']} ({data['id']})")
        return data["id"]
    
    def test_create_counselor_invalid_designation(self, admin_token):
        """Test POST /api/admin/users rejects invalid designation"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(f"{BASE_URL}/api/admin/users", headers=headers, json={
            "email": "invalid@test.com",
            "name": "Invalid User",
            "password": "test123",
            "designation": "Invalid Designation"
        })
        assert response.status_code == 400
        assert "Invalid designation" in response.json()["detail"]
        print("Invalid designation correctly rejected")
    
    def test_update_counselor(self, admin_token):
        """Test PUT /api/admin/users/{id} updates counselor"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First get existing users
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        users = response.json()
        
        if len(users) > 0:
            user_id = users[0]["id"]
            original_name = users[0]["name"]
            
            # Update user
            response = requests.put(f"{BASE_URL}/api/admin/users/{user_id}", headers=headers, json={
                "name": f"{original_name} Updated"
            })
            assert response.status_code == 200
            data = response.json()
            assert "Updated" in data["name"]
            print(f"Updated user: {data['name']}")
            
            # Revert
            requests.put(f"{BASE_URL}/api/admin/users/{user_id}", headers=headers, json={
                "name": original_name
            })
    
    def test_toggle_user_active_status(self, admin_token):
        """Test PUT /api/admin/users/{id} can toggle is_active"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get existing users
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
        users = response.json()
        
        if len(users) > 0:
            user_id = users[0]["id"]
            original_status = users[0].get("is_active", True)
            
            # Toggle status
            response = requests.put(f"{BASE_URL}/api/admin/users/{user_id}", headers=headers, json={
                "is_active": not original_status
            })
            assert response.status_code == 200
            data = response.json()
            assert data["is_active"] == (not original_status)
            print(f"Toggled user status: {data['is_active']}")
            
            # Revert
            requests.put(f"{BASE_URL}/api/admin/users/{user_id}", headers=headers, json={
                "is_active": original_status
            })


class TestAdmissions:
    """Test Admissions endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def counselor_token(self):
        """Get counselor auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": COUNSELOR_EMAIL,
            "password": COUNSELOR_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def college_and_course(self, admin_token):
        """Get a college and course for testing"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get colleges
        response = requests.get(f"{BASE_URL}/api/colleges")
        colleges = response.json()
        assert len(colleges) > 0
        college = colleges[0]
        
        # Get courses for this college
        response = requests.get(f"{BASE_URL}/api/colleges/{college['id']}/courses")
        courses = response.json()
        assert len(courses) > 0
        course = courses[0]
        
        return {"college": college, "course": course}
    
    def test_get_admissions_counselor(self, counselor_token):
        """Test GET /api/admissions returns admissions for counselor"""
        headers = {"Authorization": f"Bearer {counselor_token}"}
        response = requests.get(f"{BASE_URL}/api/admissions", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Counselor sees {len(data)} admissions")
    
    def test_get_admissions_admin(self, admin_token):
        """Test GET /api/admissions returns all admissions for admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admissions", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Admin sees {len(data)} admissions")
    
    def test_create_admission(self, counselor_token, college_and_course):
        """Test POST /api/admissions creates new admission"""
        headers = {"Authorization": f"Bearer {counselor_token}"}
        college = college_and_course["college"]
        course = college_and_course["course"]
        
        response = requests.post(f"{BASE_URL}/api/admissions", headers=headers, json={
            "candidate_name": "TEST Candidate",
            "place": "Test City",
            "college_id": college["id"],
            "course_id": course["id"],
            "admission_date": "2025-01-15",
            "total_fees": 500000,
            "instalments": [
                {"amount": 100000, "paid_date": "2025-01-15", "description": "1st Instalment"}
            ],
            "remark": "Test admission"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["candidate_name"] == "TEST Candidate"
        assert data["college_name"] == college["name"]
        assert data["course_name"] == course["name"]
        assert data["fees_paid"] == 100000
        assert data["balance"] == 400000
        print(f"Created admission: {data['candidate_name']} - {data['id']}")
        return data["id"]
    
    def test_create_admission_with_multiple_instalments(self, counselor_token, college_and_course):
        """Test POST /api/admissions with multiple instalments"""
        headers = {"Authorization": f"Bearer {counselor_token}"}
        college = college_and_course["college"]
        course = college_and_course["course"]
        
        response = requests.post(f"{BASE_URL}/api/admissions", headers=headers, json={
            "candidate_name": "TEST Multi Instalment",
            "place": "Test City",
            "college_id": college["id"],
            "course_id": course["id"],
            "admission_date": "2025-01-15",
            "total_fees": 600000,
            "instalments": [
                {"amount": 100000, "paid_date": "2025-01-15", "description": "1st Instalment"},
                {"amount": 150000, "paid_date": "2025-02-15", "description": "2nd Instalment"},
                {"amount": 100000, "paid_date": "2025-03-15", "description": "3rd Instalment"}
            ]
        })
        assert response.status_code == 201
        data = response.json()
        assert data["fees_paid"] == 350000  # Sum of instalments
        assert data["balance"] == 250000
        assert len(data["instalments"]) == 3
        print(f"Created admission with {len(data['instalments'])} instalments, balance: {data['balance']}")
    
    def test_update_admission(self, counselor_token, college_and_course):
        """Test PUT /api/admissions/{id} updates admission"""
        headers = {"Authorization": f"Bearer {counselor_token}"}
        college = college_and_course["college"]
        course = college_and_course["course"]
        
        # Create admission first
        create_response = requests.post(f"{BASE_URL}/api/admissions", headers=headers, json={
            "candidate_name": "TEST Update Candidate",
            "place": "Original City",
            "college_id": college["id"],
            "course_id": course["id"],
            "admission_date": "2025-01-15",
            "total_fees": 400000
        })
        admission_id = create_response.json()["id"]
        
        # Update admission
        response = requests.put(f"{BASE_URL}/api/admissions/{admission_id}", headers=headers, json={
            "place": "Updated City",
            "remark": "Updated remark"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["place"] == "Updated City"
        assert data["remark"] == "Updated remark"
        print(f"Updated admission: {data['id']}")
    
    def test_delete_admission(self, counselor_token, college_and_course):
        """Test DELETE /api/admissions/{id} deletes admission"""
        headers = {"Authorization": f"Bearer {counselor_token}"}
        college = college_and_course["college"]
        course = college_and_course["course"]
        
        # Create admission first
        create_response = requests.post(f"{BASE_URL}/api/admissions", headers=headers, json={
            "candidate_name": "TEST Delete Candidate",
            "place": "Delete City",
            "college_id": college["id"],
            "course_id": course["id"],
            "admission_date": "2025-01-15",
            "total_fees": 300000
        })
        admission_id = create_response.json()["id"]
        
        # Delete admission
        response = requests.delete(f"{BASE_URL}/api/admissions/{admission_id}", headers=headers)
        assert response.status_code == 200
        print(f"Deleted admission: {admission_id}")
        
        # Verify deleted
        response = requests.get(f"{BASE_URL}/api/admissions/{admission_id}", headers=headers)
        assert response.status_code == 404


class TestPerformanceDashboard:
    """Test Performance Dashboard endpoints (Admin/Manager only)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    @pytest.fixture
    def counselor_token(self):
        """Get counselor auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": COUNSELOR_EMAIL,
            "password": COUNSELOR_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_performance_stats_admin(self, admin_token):
        """Test GET /api/admin/stats/performance returns stats for admin"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats/performance", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "total_admissions" in data
        assert "fees_stats" in data
        assert "by_counselor" in data
        assert "by_college" in data
        assert "by_course" in data
        assert "monthly_trends" in data
        
        # Check fees_stats structure
        assert "total_fees" in data["fees_stats"]
        assert "fees_collected" in data["fees_stats"]
        assert "fees_pending" in data["fees_stats"]
        
        print(f"Performance stats: {data['total_admissions']} admissions")
        print(f"  Fees collected: {data['fees_stats']['fees_collected']}")
        print(f"  Fees pending: {data['fees_stats']['fees_pending']}")
        print(f"  By counselor: {len(data['by_counselor'])} counselors")
        print(f"  By college: {len(data['by_college'])} colleges")
    
    def test_get_performance_stats_requires_admin_or_manager(self, counselor_token):
        """Test GET /api/admin/stats/performance requires admin or manager role"""
        headers = {"Authorization": f"Bearer {counselor_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats/performance", headers=headers)
        # Regular counselor should be denied
        assert response.status_code == 403
        print("Regular counselor correctly denied access to performance stats")
    
    def test_get_admissions_list_admin(self, admin_token):
        """Test GET /api/admin/stats/admissions-list returns all admissions"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/stats/admissions-list", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "total" in data
        assert "admissions" in data
        assert isinstance(data["admissions"], list)
        
        print(f"Admissions list: {data['total']} total admissions")
        for admission in data["admissions"][:3]:
            print(f"  - {admission['candidate_name']} ({admission['college_name']})")
    
    def test_get_admissions_list_with_filters(self, admin_token):
        """Test GET /api/admin/stats/admissions-list with college filter"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get a college ID first
        colleges_response = requests.get(f"{BASE_URL}/api/colleges")
        colleges = colleges_response.json()
        if len(colleges) > 0:
            college_id = colleges[0]["id"]
            
            response = requests.get(
                f"{BASE_URL}/api/admin/stats/admissions-list",
                headers=headers,
                params={"college_id": college_id}
            )
            assert response.status_code == 200
            data = response.json()
            
            # All returned admissions should be for this college
            for admission in data["admissions"]:
                assert admission["college_id"] == college_id
            
            print(f"Filtered admissions for college: {len(data['admissions'])} admissions")


class TestCollegeSearch:
    """Test college search functionality in Fee Management"""
    
    def test_colleges_searchable(self):
        """Test GET /api/colleges with search parameter"""
        # Search by name
        response = requests.get(f"{BASE_URL}/api/colleges", params={"search": "Acharya"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        for college in data:
            assert "acharya" in college["name"].lower()
        print(f"Search 'Acharya' returned {len(data)} colleges")
    
    def test_colleges_have_required_fields(self):
        """Test colleges have fields needed for search/filter"""
        response = requests.get(f"{BASE_URL}/api/colleges")
        assert response.status_code == 200
        data = response.json()
        
        for college in data[:3]:
            assert "id" in college
            assert "name" in college
            assert "city" in college
            assert "category" in college
            print(f"College: {college['name']} ({college['city']}, {college['category']})")


class TestTeamLeadAccess:
    """Test Team Lead access to team members' admissions"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_team_lead_exists(self, admin_token):
        """Verify team lead user exists in the system"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/users/team-leads", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        team_leads = [u for u in data if u["designation"] == "Team Lead"]
        print(f"Found {len(team_leads)} Team Leads")
        for tl in team_leads:
            print(f"  - {tl['name']} ({tl['id']})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
