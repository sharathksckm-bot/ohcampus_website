"""
MySQL Database Integration for OhCampus
Connects to the main ohcampus_beta database to fetch real data
"""
import aiomysql
import os
from typing import List, Dict, Any, Optional

# MySQL Configuration
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'ohcampus_ohcamhk',
    'password': 'ohcampus123#',
    'db': 'ohcampus_beta',
    'charset': 'utf8mb4',
    'autocommit': True
}

_pool = None

async def get_mysql_pool():
    """Get or create MySQL connection pool"""
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(**MYSQL_CONFIG, maxsize=10)
    return _pool

async def execute_query(query: str, params: tuple = None) -> List[Dict[str, Any]]:
    """Execute a SELECT query and return results as list of dicts"""
    pool = await get_mysql_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute(query, params)
            result = await cursor.fetchall()
            return result

async def get_total_courses_count() -> int:
    """Get total count of all courses from featured colleges"""
    query = """
        SELECT COUNT(*) as cnt
        FROM college_course cc
        JOIN college c ON cc.collegeid = c.id
        WHERE cc.is_deleted = 0 AND c.status = 1
        AND (c.package_type = 'feature_listing' OR c.package_type = 'featured_listing')
    """
    results = await execute_query(query)
    return results[0]['cnt'] if results else 0

async def get_college_highlights(college_id: str) -> List[str]:
    """Get college highlights from MySQL"""
    mysql_id = college_id.replace('c-', '').replace('mysql-', '') if college_id.startswith(('c-', 'mysql-')) else college_id
    
    # First try from college_highlights table
    query = "SELECT text FROM college_highlights WHERE collegeid = %s ORDER BY id"
    results = await execute_query(query, (mysql_id,))
    
    if results:
        return [r['text'].strip() for r in results if r['text'] and r['text'].strip()]
    
    # Fallback: extract from description
    query = "SELECT description FROM college WHERE id = %s"
    results = await execute_query(query, (mysql_id,))
    
    if results and results[0].get('description'):
        desc = results[0]['description']
        import re
        if '<li>' in desc.lower():
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', desc, re.IGNORECASE | re.DOTALL)
            return [re.sub(r'<[^>]+>', '', item).strip() for item in li_items if item.strip()][:6]
    return []

async def get_college_whats_new(college_id: str) -> List[Dict[str, Any]]:
    """Get college news/updates from MySQL"""
    mysql_id = college_id.replace('c-', '').replace('mysql-', '') if college_id.startswith(('c-', 'mysql-')) else college_id
    
    # First check for college_news table
    try:
        query = """
            SELECT id, title, description, created_date
            FROM college_news
            WHERE college_id = %s AND status = 1
            ORDER BY created_date DESC
            LIMIT 10
        """
        results = await execute_query(query, (mysql_id,))
        if results:
            return [{
                "id": row['id'],
                "title": row['title'] or '',
                "description": row.get('description') or '',
                "date": str(row.get('created_date') or '')
            } for row in results]
    except Exception:
        pass
    
    # Fallback: use what_new from college table
    query = "SELECT what_new FROM college WHERE id = %s"
    results = await execute_query(query, (mysql_id,))
    
    if results and results[0].get('what_new'):
        what_new_raw = results[0]['what_new']
        import re
        if '<li>' in what_new_raw.lower():
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', what_new_raw, re.IGNORECASE | re.DOTALL)
            return [{"title": re.sub(r'<[^>]+>', '', item).strip(), "description": ""} for item in li_items if item.strip()]
    return []

async def get_college_placements(college_id: str) -> Dict[str, Any]:
    """Get college placement data from MySQL"""
    mysql_id = college_id.replace('c-', '').replace('mysql-', '') if college_id.startswith(('c-', 'mysql-')) else college_id
    
    # Try placement_statistics table first
    try:
        query = """
            SELECT year, highest_package, average_package, placement_rate, total_offers
            FROM college_placement_statistics
            WHERE college_id = %s
            ORDER BY year DESC LIMIT 5
        """
        results = await execute_query(query, (mysql_id,))
        if results:
            return {
                "stats": [{
                    "year": str(r.get('year', '')),
                    "highest_package": r.get('highest_package'),
                    "average_package": r.get('average_package'),
                    "placement_rate": r.get('placement_rate'),
                    "total_offers": r.get('total_offers')
                } for r in results]
            }
    except Exception:
        pass
    return {}



async def get_featured_colleges(
    state: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 200
) -> List[Dict[str, Any]]:
    """Fetch featured colleges from MySQL with course counts in single query"""
    # Handle multi-category filtering using FIND_IN_SET
    if category:
        query = """
            SELECT DISTINCT
                c.id,
                c.title as name,
                c.slug,
                c.address,
                c.phone,
                c.email,
                c.web as website,
                c.accreditation,
                c.estd as established_year,
                c.logo,
                c.package_type,
                c.categoryid,
                s.statename as state,
                ct.city as city,
                (SELECT COUNT(*) FROM college_course cc WHERE cc.collegeid = c.id AND cc.is_deleted = 0) as course_count
            FROM college c
            LEFT JOIN state s ON c.stateid = s.id
            LEFT JOIN city ct ON c.cityid = ct.id
            JOIN category cat ON FIND_IN_SET(cat.id, c.categoryid) > 0
            WHERE (c.package_type = 'feature_listing' OR c.package_type = 'featured_listing')
            AND c.status = 1 
            AND c.is_deleted = 0
            AND cat.catname = %s
        """
        params = [category]
    else:
        query = """
            SELECT 
                c.id,
                c.title as name,
                c.slug,
                c.address,
                c.phone,
                c.email,
                c.web as website,
                c.accreditation,
                c.estd as established_year,
                c.logo,
                c.package_type,
                c.categoryid,
                s.statename as state,
                ct.city as city,
                (SELECT COUNT(*) FROM college_course cc WHERE cc.collegeid = c.id AND cc.is_deleted = 0) as course_count
            FROM college c
            LEFT JOIN state s ON c.stateid = s.id
            LEFT JOIN city ct ON c.cityid = ct.id
            WHERE (c.package_type = 'feature_listing' OR c.package_type = 'featured_listing')
            AND c.status = 1 
            AND c.is_deleted = 0
        """
        params = []
    
    if state:
        query += " AND s.statename = %s"
        params.append(state)
    
    if city:
        query += " AND ct.city = %s"
        params.append(city)
    
    if search:
        query += " AND (c.title LIKE %s OR c.address LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query += f" ORDER BY c.title LIMIT {limit}"
    
    results = await execute_query(query, tuple(params) if params else None)
    
    # Fetch category names for each college (handle multiple categories)
    colleges = []
    for row in results:
        # Get the first category name for display
        category_name = ''
        if row.get('categoryid'):
            cat_query = "SELECT catname FROM category WHERE id = %s"
            first_cat_id = str(row['categoryid']).split(',')[0].strip()
            cat_result = await execute_query(cat_query, (first_cat_id,))
            if cat_result:
                category_name = cat_result[0]['catname']
        
        college = {
            "id": f"c-{row['id']}",
            "mysql_id": row['id'],
            "name": row['name'] or '',
            "slug": row['slug'] or '',
            "address": row['address'] or '',
            "phone": row['phone'] or '',
            "email": row['email'] or '',
            "website": row['website'] or '',
            "accreditation": row['accreditation'] or '',
            "established_year": row['established_year'] or 0,
            "logo": f"https://ohcampus.com/assets/images/colleges/{row['logo']}" if row['logo'] else None,
            "state": row['state'] or '',
            "city": row['city'] or '',
            "category": category_name,
            "is_featured": True,
            "package_type": row['package_type'],
            "course_count": row['course_count'] or 0
        }
        colleges.append(college)
    
    return colleges

async def get_college_by_id(college_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single college by ID with highlights, placements, and what's new"""
    # Handle c- prefix
    mysql_id = college_id.replace('c-', '') if college_id.startswith('c-') else college_id
    # Also handle legacy mysql- prefix for backward compatibility
    mysql_id = mysql_id.replace('mysql-', '') if mysql_id.startswith('mysql-') else mysql_id
    
    query = """
        SELECT 
            c.id,
            c.title as name,
            c.slug,
            c.description,
            c.address,
            c.phone,
            c.email,
            c.web as website,
            c.accreditation,
            c.estd as established_year,
            c.logo,
            c.banner,
            c.package_type,
            c.map_location,
            c.scholarship,
            c.terms,
            c.what_new,
            c.notification,
            c.categoryid,
            s.statename as state,
            ct.city as city
        FROM college c
        LEFT JOIN state s ON c.stateid = s.id
        LEFT JOIN city ct ON c.cityid = ct.id
        WHERE c.id = %s
    """
    
    results = await execute_query(query, (mysql_id,))
    if not results:
        return None
    
    row = results[0]
    
    # Get category name
    category_name = ''
    if row.get('categoryid'):
        cat_query = "SELECT catname FROM category WHERE id = %s"
        first_cat_id = str(row['categoryid']).split(',')[0].strip()
        cat_result = await execute_query(cat_query, (first_cat_id,))
        if cat_result:
            category_name = cat_result[0]['catname']
    
    # Fetch highlights from college_highlights table (multiple rows)
    highlights_query = """
        SELECT text FROM college_highlights WHERE collegeid = %s ORDER BY id
    """
    highlights_result = await execute_query(highlights_query, (mysql_id,))
    highlights = []
    if highlights_result:
        # Each row is a separate highlight
        for row_h in highlights_result:
            text = row_h.get('text', '')
            if text and text.strip():
                highlights.append(text.strip())
    
    # Use description as highlights if no highlights table data
    if not highlights and row.get('description'):
        # Try to extract bullet points from description
        desc = row['description']
        # If description contains list markers, extract them
        if '<li>' in desc.lower():
            import re
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', desc, re.IGNORECASE | re.DOTALL)
            highlights = [re.sub(r'<[^>]+>', '', item).strip() for item in li_items if item.strip()][:6]
        elif '•' in desc or '-' in desc:
            lines = desc.replace('•', '\n').replace('- ', '\n').split('\n')
            highlights = [line.strip() for line in lines if line.strip() and len(line.strip()) > 10][:6]
    
    # Fetch placement statistics (table may not exist in all DBs)
    placements = []
    try:
        placements_query = """
            SELECT * FROM college_placement_statistics WHERE college_id = %s ORDER BY year DESC LIMIT 5
        """
        placements_result = await execute_query(placements_query, (mysql_id,))
        for p in placements_result:
            placements.append({
                "year": p.get('year', ''),
                "highest_package": p.get('highest_package') or p.get('highest_salary'),
                "average_package": p.get('average_package') or p.get('average_salary'),
                "placement_rate": p.get('placement_rate') or p.get('placement_percentage'),
                "total_offers": p.get('total_offers') or p.get('students_placed'),
                "top_recruiters": []
            })
    except Exception as e:
        # Table may not exist - ignore
        pass
    
    # Parse what's new - can be stored in different formats
    whats_new = []
    what_new_raw = row.get('what_new', '') or ''
    if what_new_raw:
        # Check for HTML list items
        if '<li>' in what_new_raw.lower():
            import re
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', what_new_raw, re.IGNORECASE | re.DOTALL)
            whats_new = [re.sub(r'<[^>]+>', '', item).strip() for item in li_items if item.strip()]
        else:
            # Split by common delimiters
            for delim in ['\n', '|', ';']:
                if delim in what_new_raw:
                    whats_new = [w.strip() for w in what_new_raw.split(delim) if w.strip()]
                    break
            if not whats_new and what_new_raw.strip():
                whats_new = [what_new_raw.strip()]
    
    return {
        "id": f"c-{row['id']}",
        "mysql_id": row['id'],
        "name": row['name'] or '',
        "slug": row['slug'] or '',
        "description": row['description'] or '',
        "address": row['address'] or '',
        "phone": row['phone'] or '',
        "email": row['email'] or '',
        "website": row['website'] or '',
        "accreditation": row['accreditation'] or '',
        "established_year": row['established_year'] or 0,
        "established": row['established_year'] or 0,  # Alias for frontend compatibility
        "logo": f"https://ohcampus.com/assets/images/colleges/{row['logo']}" if row['logo'] else None,
        "banner": f"https://ohcampus.com/assets/images/colleges/{row['banner']}" if row['banner'] else None,
        "state": row['state'] or '',
        "city": row['city'] or '',
        "category": category_name,
        "is_featured": True,
        "package_type": row['package_type'],
        "map_location": row['map_location'] or '',
        "scholarship": row['scholarship'] or '',
        "terms": row['terms'] or '',
        "highlights": highlights,
        "whats_new": whats_new,
        "placements": placements,
        "notification": row['notification'] or ''
    }

async def get_courses_for_college(college_id: str) -> List[Dict[str, Any]]:
    """Fetch courses for a specific college"""
    # Handle c- prefix
    mysql_id = college_id.replace('c-', '') if college_id.startswith('c-') else college_id
    # Also handle legacy mysql- prefix for backward compatibility
    mysql_id = mysql_id.replace('mysql-', '') if mysql_id.startswith('mysql-') else mysql_id
    
    query = """
        SELECT 
            cc.id as college_course_id,
            cc.collegeid,
            cc.courseid,
            cc.total_fees,
            cc.total_intake,
            cc.duration,
            cc.level,
            cc.eligibility as course_eligibility,
            cc.description as course_description,
            cc.entrance_exams,
            c.name as course_name,
            c.slug,
            c.eligibility,
            c.scope,
            c.job_profile,
            c.course_description as master_description,
            ac.name as academic_level
        FROM college_course cc
        JOIN courses c ON cc.courseid = c.id
        LEFT JOIN academic_categories ac ON c.academic_category = ac.category_id
        WHERE cc.collegeid = %s
        AND cc.is_deleted = 0
        ORDER BY c.name
    """
    
    results = await execute_query(query, (mysql_id,))
    
    courses = []
    for row in results:
        course = {
            "id": f"cc-{row['college_course_id']}",
            "mysql_id": row['college_course_id'],
            "college_id": f"c-{row['collegeid']}",
            "course_id": row['courseid'],
            "name": row['course_name'] or '',
            "slug": row['slug'] or '',
            "level": row['level'] or row['academic_level'] or 'UG',
            "duration": row['duration'] or '4 Years',
            "eligibility": row['course_eligibility'] or row['eligibility'] or '',
            "description": row['course_description'] or row['master_description'] or '',
            "scope": row['scope'] or '',
            "job_profile": row['job_profile'] or '',
            "entrance_exams": row['entrance_exams'] or '',
            "total_fees": row['total_fees'] or '',
            "total_intake": row['total_intake'] or 0
        }
        courses.append(course)
    
    return courses

async def get_course_by_id(course_id: str) -> Optional[Dict[str, Any]]:
    """Fetch a single course by its college_course ID with full details"""
    # Extract the mysql ID from the course_id (format: cc-123)
    mysql_id = course_id.replace('cc-', '').replace('c-', '')
    # Also handle legacy mysql- prefix for backward compatibility
    mysql_id = mysql_id.replace('mysql-cc-', '').replace('mysql-', '')
    
    query = """
        SELECT 
            cc.id as college_course_id,
            cc.collegeid,
            cc.courseid,
            cc.total_fees,
            cc.total_intake,
            cc.duration,
            cc.level,
            cc.eligibility as course_eligibility,
            cc.description as course_description,
            cc.entrance_exams,
            c.name as course_name,
            c.slug,
            c.eligibility,
            c.scope,
            c.job_profile,
            c.course_description as master_description,
            ac.name as academic_level,
            col.title as college_name,
            col.accreditation,
            col.address as college_address,
            col.phone as college_phone,
            col.email as college_email,
            col.web as college_website,
            s.statename as state,
            ct.city as city
        FROM college_course cc
        INNER JOIN courses c ON cc.courseid = c.id
        INNER JOIN college col ON cc.collegeid = col.id
        LEFT JOIN academic_categories ac ON c.academic_category = ac.category_id
        LEFT JOIN state s ON col.stateid = s.id
        LEFT JOIN city ct ON col.cityid = ct.id
        WHERE cc.id = %s
    """
    
    results = await execute_query(query, (mysql_id,))
    if not results:
        return None
    
    row = results[0]
    
    # Parse job_profile - can be stored as comma-separated, pipe-separated, or HTML list
    job_profiles = []
    job_profile_raw = row.get('job_profile') or ''
    if job_profile_raw:
        # Check for HTML content
        if '<li>' in job_profile_raw.lower():
            import re
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', job_profile_raw, re.IGNORECASE | re.DOTALL)
            job_profiles = [re.sub(r'<[^>]+>', '', item).strip() for item in li_items if item.strip()]
        elif '<p>' in job_profile_raw.lower():
            import re
            p_items = re.findall(r'<p[^>]*>(.*?)</p>', job_profile_raw, re.IGNORECASE | re.DOTALL)
            job_profiles = [re.sub(r'<[^>]+>', '', item).strip() for item in p_items if item.strip()]
        else:
            # Try different delimiters
            for delim in [',', '|', '\n', ';']:
                if delim in job_profile_raw:
                    job_profiles = [j.strip() for j in job_profile_raw.split(delim) if j.strip()]
                    break
            if not job_profiles and job_profile_raw.strip():
                job_profiles = [job_profile_raw.strip()]
    
    # Clean up description - remove HTML tags for plain text
    description = row.get('course_description') or row.get('master_description') or ''
    scope = row.get('scope') or ''
    eligibility = row.get('course_eligibility') or row.get('eligibility') or ''
    
    return {
        "course": {
            "id": f"cc-{row['college_course_id']}",
            "mysql_id": row['college_course_id'],
            "college_id": f"c-{row['collegeid']}",
            "course_id": row['courseid'],
            "name": row['course_name'] or '',
            "slug": row['slug'] or '',
            "level": row['level'] or row['academic_level'] or 'UG',
            "duration": row['duration'] or '4 Years',
            "eligibility": eligibility,
            "description": description,
            "scope": scope,
            "job_profile": job_profile_raw,  # Keep raw for HTML rendering
            "job_profiles": job_profiles,  # Parsed array for badges
            "entrance_exams": row['entrance_exams'] or '',
            "total_fees": row['total_fees'] or '',
            "total_intake": row['total_intake'] or 0
        },
        "college": {
            "id": f"c-{row['collegeid']}",
            "name": row['college_name'] or '',
            "accreditation": row['accreditation'] or '',
            "address": row['college_address'] or '',
            "phone": row['college_phone'] or '',
            "email": row['college_email'] or '',
            "website": row['college_website'] or '',
            "state": row['state'] or '',
            "city": row['city'] or ''
        },
        "fees": [],  # MySQL fee structure can be added later
        "admission_charges": None
    }

async def get_all_courses_with_colleges(
    search: Optional[str] = None,
    level: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    fee_min: Optional[int] = None,
    fee_max: Optional[int] = None,
    state: Optional[str] = None,
    city: Optional[str] = None,
    course_name: Optional[str] = None,
    address: Optional[str] = None
) -> Dict[str, Any]:
    """Fetch courses from featured colleges with pagination and filters"""
    
    # Base query for counting
    count_query = """
        SELECT COUNT(*) as total FROM college_course cc
        INNER JOIN courses c ON cc.courseid = c.id
        INNER JOIN college col ON cc.collegeid = col.id
        LEFT JOIN academic_categories ac ON c.academic_category = ac.category_id
        LEFT JOIN state s ON col.stateid = s.id
        LEFT JOIN city ct ON col.cityid = ct.id
        WHERE (col.package_type = 'feature_listing' OR col.package_type = 'featured_listing')
        AND col.status = 1 AND col.is_deleted = 0 AND cc.is_deleted = 0
    """
    
    # Main query with all details
    query = """
        SELECT 
            cc.id as college_course_id,
            cc.collegeid,
            cc.courseid,
            cc.total_fees,
            cc.duration,
            cc.level,
            cc.eligibility as course_eligibility,
            cc.description as course_description,
            c.name as course_name,
            c.slug,
            c.eligibility,
            c.scope,
            c.job_profile,
            c.course_description as master_description,
            ac.name as academic_level,
            col.title as college_name,
            col.accreditation,
            col.address as college_address,
            s.statename as state,
            ct.city as city
        FROM college_course cc
        INNER JOIN courses c ON cc.courseid = c.id
        INNER JOIN college col ON cc.collegeid = col.id
        LEFT JOIN academic_categories ac ON c.academic_category = ac.category_id
        LEFT JOIN state s ON col.stateid = s.id
        LEFT JOIN city ct ON col.cityid = ct.id
        WHERE (col.package_type = 'feature_listing' OR col.package_type = 'featured_listing')
        AND col.status = 1 
        AND col.is_deleted = 0
        AND cc.is_deleted = 0
    """
    params = []
    count_params = []
    
    if search:
        search_condition = " AND (c.name LIKE %s OR col.title LIKE %s)"
        query += search_condition
        count_query += search_condition
        params.extend([f"%{search}%", f"%{search}%"])
        count_params.extend([f"%{search}%", f"%{search}%"])
    
    if level:
        level_condition = " AND (cc.level = %s OR ac.name = %s)"
        query += level_condition
        count_query += level_condition
        params.extend([level, level])
        count_params.extend([level, level])
    
    # Fee range filter (based on total_fees which represents 1st year fees)
    if fee_min is not None:
        fee_min_condition = " AND cc.total_fees IS NOT NULL AND cc.total_fees != '' AND CAST(cc.total_fees AS UNSIGNED) >= %s"
        query += fee_min_condition
        count_query += fee_min_condition
        params.append(fee_min)
        count_params.append(fee_min)
    
    if fee_max is not None:
        fee_max_condition = " AND cc.total_fees IS NOT NULL AND cc.total_fees != '' AND CAST(cc.total_fees AS UNSIGNED) < %s"
        query += fee_max_condition
        count_query += fee_max_condition
        params.append(fee_max)
        count_params.append(fee_max)
    
    # State filter
    if state:
        state_condition = " AND s.statename = %s"
        query += state_condition
        count_query += state_condition
        params.append(state)
        count_params.append(state)
    
    # City filter
    if city:
        city_condition = " AND ct.city = %s"
        query += city_condition
        count_query += city_condition
        params.append(city)
        count_params.append(city)
    
    # Course name filter (exact match)
    if course_name:
        course_name_condition = " AND c.name = %s"
        query += course_name_condition
        count_query += course_name_condition
        params.append(course_name)
        count_params.append(course_name)
    
    # Address filter (partial match on college address)
    if address:
        address_condition = " AND (col.address LIKE %s OR ct.city LIKE %s OR s.statename LIKE %s)"
        query += address_condition
        count_query += address_condition
        params.extend([f"%{address}%", f"%{address}%", f"%{address}%"])
        count_params.extend([f"%{address}%", f"%{address}%", f"%{address}%"])
    
    # Get total count
    count_result = await execute_query(count_query, tuple(count_params) if count_params else None)
    total = count_result[0]['total'] if count_result else 0
    
    # Add pagination
    offset = (page - 1) * limit
    query += f" ORDER BY c.name LIMIT {limit} OFFSET {offset}"
    
    results = await execute_query(query, tuple(params) if params else None)
    
    courses = []
    for row in results:
        course = {
            "id": f"cc-{row['college_course_id']}",
            "mysql_id": row['college_course_id'],
            "college_id": f"c-{row['collegeid']}",
            "course_id": row['courseid'],
            "name": row['course_name'] or '',
            "slug": row['slug'] or '',
            "level": row['level'] or row['academic_level'] or 'UG',
            "duration": row['duration'] or '4 Years',
            "eligibility": row['course_eligibility'] or row['eligibility'] or '',
            "description": row['course_description'] or row['master_description'] or '',
            "scope": row['scope'] or '',
            "job_profile": row['job_profile'] or '',
            "total_fees": row['total_fees'] or '',
            "college": {
                "id": f"c-{row['collegeid']}",
                "name": row['college_name'] or '',
                "accreditation": row['accreditation'] or '',
                "address": row.get('college_address') or '',
                "state": row['state'] or '',
                "city": row['city'] or ''
            }
        }
        courses.append(course)
    
    return {
        "courses": courses,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

async def get_course_levels() -> List[str]:
    """Get all distinct course levels from featured colleges"""
    query = """
        SELECT DISTINCT cc.level
        FROM college_course cc
        INNER JOIN college col ON cc.collegeid = col.id
        WHERE (col.package_type = 'feature_listing' OR col.package_type = 'featured_listing')
        AND col.status = 1 AND col.is_deleted = 0 AND cc.is_deleted = 0
        AND cc.level IS NOT NULL AND cc.level != ''
        ORDER BY cc.level
    """
    results = await execute_query(query)
    return [r['level'] for r in results if r['level']]

async def get_course_names() -> List[str]:
    """Get all distinct course names from featured colleges"""
    query = """
        SELECT DISTINCT c.name
        FROM college_course cc
        INNER JOIN courses c ON cc.courseid = c.id
        INNER JOIN college col ON cc.collegeid = col.id
        WHERE (col.package_type = 'feature_listing' OR col.package_type = 'featured_listing')
        AND col.status = 1 AND col.is_deleted = 0 AND cc.is_deleted = 0
        ORDER BY c.name
    """
    results = await execute_query(query)
    return [r['name'] for r in results if r['name']]

async def get_states() -> List[str]:
    """Get all states with featured colleges"""
    query = """
        SELECT DISTINCT s.statename
        FROM college c
        JOIN state s ON c.stateid = s.id
        WHERE (c.package_type = 'feature_listing' OR c.package_type = 'featured_listing')
        AND c.status = 1 AND c.is_deleted = 0
        ORDER BY s.statename
    """
    results = await execute_query(query)
    return [r['statename'] for r in results if r['statename']]

async def get_cities(state: Optional[str] = None) -> List[str]:
    """Get all cities with featured colleges"""
    query = """
        SELECT DISTINCT ct.city
        FROM college c
        JOIN city ct ON c.cityid = ct.id
        LEFT JOIN state s ON c.stateid = s.id
        WHERE (c.package_type = 'feature_listing' OR c.package_type = 'featured_listing')
        AND c.status = 1 AND c.is_deleted = 0
    """
    params = []
    
    if state:
        query += " AND s.statename = %s"
        params.append(state)
    
    query += " ORDER BY ct.city"
    
    results = await execute_query(query, tuple(params) if params else None)
    return [r['city'] for r in results if r['city']]

async def get_categories() -> List[str]:
    """Get all categories with featured colleges - handles multiple categories per college"""
    query = """
        SELECT DISTINCT cat.catname
        FROM college c
        JOIN category cat ON FIND_IN_SET(cat.id, c.categoryid) > 0
        WHERE (c.package_type = 'feature_listing' OR c.package_type = 'featured_listing')
        AND c.status = 1 AND c.is_deleted = 0
        AND cat.catname IS NOT NULL AND cat.catname != ''
        ORDER BY cat.catname
    """
    results = await execute_query(query)
    return [r['catname'] for r in results if r['catname']]

async def get_fee_structure(college_id: str, course_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get fee structure for a college/course from MySQL"""
    # Handle c- prefix
    mysql_college_id = college_id.replace('c-', '') if college_id.startswith('c-') else college_id
    # Also handle legacy mysql- prefix for backward compatibility
    mysql_college_id = mysql_college_id.replace('mysql-', '') if mysql_college_id.startswith('mysql-') else mysql_college_id
    
    query = """
        SELECT 
            fs.id,
            fs.college_id,
            fs.course_id,
            fs.details,
            fs.amount,
            c.name as course_name
        FROM fee_structure fs
        LEFT JOIN courses c ON fs.course_id = c.id
        WHERE fs.college_id = %s
    """
    params = [mysql_college_id]
    
    if course_id:
        # Handle cc- prefix
        mysql_course_id = course_id.replace('cc-', '').replace('c-', '')
        # Also handle legacy mysql- prefix for backward compatibility
        mysql_course_id = mysql_course_id.replace('mysql-cc-', '').replace('mysql-', '') if mysql_course_id.startswith('mysql') else mysql_course_id
        query += " AND fs.course_id = %s"
        params.append(mysql_course_id)
    
    results = await execute_query(query, tuple(params))
    
    fees = []
    for row in results:
        fees.append({
            "id": f"fee-{row['id']}",
            "college_id": f"c-{row['college_id']}",
            "course_id": row['course_id'],
            "course_name": row['course_name'] or '',
            "details": row['details'] or '',
            "amount": float(row['amount']) if row['amount'] else 0
        })
    
    return fees

async def close_mysql_pool():
    """Close the MySQL connection pool"""
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None
