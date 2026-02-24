#!/usr/bin/env python3
"""
OhCampus Counselor Platform - Backend API Testing
Tests all API endpoints for authentication, colleges, filters, fees, and FAQs
"""

import requests
import sys
import json
from datetime import datetime

class OhCampusAPITester:
    def __init__(self, base_url="https://scholarship-portal-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.counselor_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })

            return success, response.json() if success and response.text else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_counselor_login(self):
        """Test counselor login"""
        success, response = self.run_test(
            "Counselor Login",
            "POST",
            "auth/login",
            200,
            data={"email": "counselor@ohcampus.com", "password": "counselor123"}
        )
        if success and 'access_token' in response:
            self.counselor_token = response['access_token']
            print(f"   Counselor token obtained: {self.counselor_token[:20]}...")
            return True
        return False

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@ohcampus.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )

    def test_seed_database(self):
        """Test database seeding"""
        success, response = self.run_test(
            "Seed Database",
            "POST",
            "seed",
            200
        )
        if success:
            print(f"   Seeded: {response.get('colleges_count', 0)} colleges, {response.get('courses_count', 0)} courses")
        return success

    def test_get_filters(self):
        """Test filters endpoint"""
        success, response = self.run_test(
            "Get Filters",
            "GET",
            "filters",
            200
        )
        if success:
            states = response.get('states', [])
            cities = response.get('cities', [])
            categories = response.get('categories', [])
            courses = response.get('courses', [])  # NEW: Test courses in filters
            print(f"   Found: {len(states)} states, {len(cities)} cities, {len(categories)} categories, {len(courses)} courses")
        return success

    def test_get_colleges(self):
        """Test colleges endpoint"""
        success, response = self.run_test(
            "Get Colleges",
            "GET",
            "colleges",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} colleges")
            if len(response) > 0:
                college = response[0]
                print(f"   Sample college: {college.get('name', 'Unknown')}")
                return college.get('id')  # Return first college ID for further tests
        return None

    def test_get_college_detail(self, college_id):
        """Test individual college detail"""
        if not college_id:
            return False
        return self.run_test(
            "Get College Detail",
            "GET",
            f"colleges/{college_id}",
            200
        )

    def test_get_courses(self, college_id):
        """Test courses for a college"""
        if not college_id:
            return False
        success, response = self.run_test(
            "Get College Courses",
            "GET",
            f"colleges/{college_id}/courses",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} courses for college")
            return response[0].get('id') if len(response) > 0 else None
        return None

    def test_get_fees(self, college_id):
        """Test fees for a college"""
        if not college_id:
            return False
        success, response = self.run_test(
            "Get College Fees",
            "GET",
            f"colleges/{college_id}/fees",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} fee records")
        return success

    def test_get_faqs(self, college_id):
        """Test FAQs for a college"""
        if not college_id:
            return False
        success, response = self.run_test(
            "Get College FAQs",
            "GET",
            "faqs",
            200,
            params={"college_id": college_id, "include_global": True}
        )
        if success and isinstance(response, list):
            global_faqs = [faq for faq in response if faq.get('is_global')]
            college_faqs = [faq for faq in response if not faq.get('is_global')]
            print(f"   Found {len(global_faqs)} global FAQs, {len(college_faqs)} college-specific FAQs")
        return success

    def test_colleges_with_course_filter(self):
        """Test colleges endpoint with course filter"""
        success, response = self.run_test(
            "Get Colleges with Course Filter",
            "GET",
            "colleges",
            200,
            params={"course": "MBA"}
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} colleges offering MBA courses")
        return success

    def test_compare_colleges(self, college_ids):
        """Test college comparison endpoint"""
        if not college_ids or len(college_ids) < 2:
            return False
        
        ids_str = ",".join(college_ids[:4])  # Max 4 colleges
        success, response = self.run_test(
            "Compare Colleges",
            "GET",
            "colleges/compare",
            200,
            params={"college_ids": ids_str}
        )
        if success and isinstance(response, list):
            print(f"   Comparing {len(response)} colleges")
            for college_data in response:
                college = college_data.get('college', {})
                courses = college_data.get('courses', [])
                fees = college_data.get('fees', [])
                print(f"   - {college.get('name', 'Unknown')}: {len(courses)} courses, {len(fees)} fees")
        return success

    def test_fee_summary(self, college_id):
        """Test fee summary endpoint"""
        if not college_id:
            return False
        success, response = self.run_test(
            "Get Fee Summary",
            "GET",
            f"colleges/{college_id}/fee-summary",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found fee summary for {len(response)} courses")
            for course_summary in response:
                course = course_summary.get('course', {})
                totals = course_summary.get('totals', {})
                print(f"   - {course.get('name', 'Unknown')}: Total ₹{totals.get('grand_total_without_hostel', 0):,}")
        return success

    def test_admission_charges(self, college_id):
        """Test admission charges endpoint"""
        if not college_id:
            return False
        success, response = self.run_test(
            "Get Admission Charges",
            "GET",
            f"colleges/{college_id}/admission-charges",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} admission charge records")
        return success

    def test_admin_create_admission_charges(self, college_id, course_id):
        """Test admin admission charges creation"""
        if not college_id or not course_id or not self.admin_token:
            return False
        
        charges_data = {
            "college_id": college_id,
            "course_id": course_id,
            "registration_fee": 5000,
            "admission_fee": 25000,
            "caution_deposit": 10000,
            "uniform_fee": 8000,
            "library_fee": 5000,
            "lab_fee": 12000,
            "other_charges": 2000,
            "other_charges_description": "ID Card & Documentation"
        }
        
        success, response = self.run_test(
            "Admin Create Admission Charges",
            "POST",
            "admission-charges",
            200,  # Returns 200 for create/update
            data=charges_data,
            token=self.admin_token
        )
        if success:
            return response.get('id')
        return None

    def test_admin_create_fee(self, college_id, course_id):
        """Test admin fee creation"""
        if not college_id or not course_id or not self.admin_token:
            return False
        
        fee_data = {
            "college_id": college_id,
            "course_id": course_id,
            "fee_type": "annual",
            "year_or_semester": 1,
            "amount": 100000,
            "hostel_fee": 50000,
            "description": "Test fee record"
        }
        
        success, response = self.run_test(
            "Admin Create Fee",
            "POST",
            "fees",
            201,
            data=fee_data,
            token=self.admin_token
        )
        if success:
            return response.get('id')
        return None

    def test_admin_create_faq(self):
        """Test admin FAQ creation"""
        if not self.admin_token:
            return False
        
        faq_data = {
            "question": "Test FAQ Question?",
            "answer": "This is a test FAQ answer created during testing.",
            "is_global": True,
            "order": 99
        }
        
        success, response = self.run_test(
            "Admin Create FAQ",
            "POST",
            "faqs",
            201,
            data=faq_data,
            token=self.admin_token
        )
        if success:
            return response.get('id')
        return None

    def test_counselor_access_protected(self):
        """Test counselor access to protected endpoints"""
        if not self.counselor_token:
            return False
        
        return self.run_test(
            "Counselor Protected Access",
            "GET",
            "auth/me",
            200,
            token=self.counselor_token
        )

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        return self.run_test(
            "Unauthorized Access",
            "POST",
            "fees",
            401,
            data={"test": "data"}
        )

def main():
    print("🚀 Starting OhCampus API Testing...")
    print("=" * 60)
    
    tester = OhCampusAPITester()
    
    # Test basic connectivity
    print("\n📡 Testing Basic Connectivity...")
    tester.test_root_endpoint()
    
    # Test authentication
    print("\n🔐 Testing Authentication...")
    counselor_login_success = tester.test_counselor_login()
    admin_login_success = tester.test_admin_login()
    tester.test_invalid_login()
    
    if not counselor_login_success or not admin_login_success:
        print("\n❌ Authentication failed - seeding database first...")
        tester.test_seed_database()
        # Retry login after seeding
        counselor_login_success = tester.test_counselor_login()
        admin_login_success = tester.test_admin_login()
    
    # Test data endpoints
    print("\n📊 Testing Data Endpoints...")
    tester.test_get_filters()
    college_id = tester.test_get_colleges()
    tester.test_colleges_with_course_filter()  # NEW: Test course filtering
    
    if college_id:
        tester.test_get_college_detail(college_id)
        course_id = tester.test_get_courses(college_id)
        tester.test_get_fees(college_id)
        tester.test_get_faqs(college_id)
        tester.test_fee_summary(college_id)  # NEW: Test fee summary
        tester.test_admission_charges(college_id)  # NEW: Test admission charges
        
        # Test comparison with multiple colleges (get more college IDs)
        success, colleges_response = tester.run_test("Get All Colleges for Comparison", "GET", "colleges", 200)
        if success and isinstance(colleges_response, list) and len(colleges_response) >= 2:
            college_ids = [c['id'] for c in colleges_response[:4]]  # Get up to 4 college IDs
            tester.test_compare_colleges(college_ids)  # NEW: Test comparison
        
        # Test admin operations
        if admin_login_success:
            print("\n👨‍💼 Testing Admin Operations...")
            fee_id = tester.test_admin_create_fee(college_id, course_id)
            faq_id = tester.test_admin_create_faq()
            charges_id = tester.test_admin_create_admission_charges(college_id, course_id)  # NEW: Test admission charges creation
    
    # Test authorization
    print("\n🛡️ Testing Authorization...")
    if counselor_login_success:
        tester.test_counselor_access_protected()
    tester.test_unauthorized_access()
    
    # Print results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"✅ Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"❌ Tests failed: {len(tester.failed_tests)}")
    
    if tester.failed_tests:
        print("\n🔍 Failed Tests Details:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['name']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                if 'response' in test:
                    print(f"   Response: {test['response']}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())