import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { collegesAPI, coursesAPI, filtersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Search,
  Building2,
  MapPin,
  GraduationCap,
  BookOpen,
  Users,
  Star,
  Check,
  AlertCircle,
  Clock,
  XCircle,
  Loader2,
  Filter,
  X,
  ChevronRight,
  Bell,
  Plus,
  Trash2,
  Calendar,
  Info,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

// Alert type configuration
const ALERT_TYPES = [
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info },
  { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle },
  { value: 'important', label: 'Important', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
  { value: 'deadline', label: 'Deadline', color: 'bg-red-100 text-red-700 border-red-200', icon: Calendar },
];

const getAlertTypeConfig = (type) => {
  return ALERT_TYPES.find(t => t.value === type) || ALERT_TYPES[0];
};

// Seat status configuration
const SEAT_STATUSES = [
  { value: 'Available', label: 'Available', color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
  { value: 'Closing', label: 'Closing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle },
  { value: 'Under Waiting', label: 'Under Waiting', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  { value: 'Closed', label: 'Closed', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
];

const getSeatStatusConfig = (status) => {
  return SEAT_STATUSES.find(s => s.value === status) || SEAT_STATUSES[0];
};

export default function CollegeManagement() {
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ states: [], cities: [], categories: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [updatingCourse, setUpdatingCourse] = useState(null);
  const [totalCoursesCount, setTotalCoursesCount] = useState(0);
  const [selectedCollegeCourses, setSelectedCollegeCourses] = useState([]);
  const [loadingCollegeCourses, setLoadingCollegeCourses] = useState(false);
  
  // Admission Alerts state
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [alertsCollege, setAlertsCollege] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [savingAlerts, setSavingAlerts] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [collegesRes, coursesRes, filtersRes] = await Promise.all([
        collegesAPI.getAll({}),
        coursesAPI.getAllWithCollege({ limit: 100 }), // Get more courses for analytics
        filtersAPI.getAll(),
      ]);
      setColleges(collegesRes.data || []);
      // Handle paginated response
      const coursesData = coursesRes.data?.courses || [];
      const totalCourses = coursesRes.data?.total || coursesData.length;
      setCourses(coursesData);
      setTotalCoursesCount(totalCourses);
      setFilters(filtersRes.data || { states: [], cities: [], categories: [], courses: [] });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter colleges
  const filteredColleges = useMemo(() => {
    let result = colleges;

    // Search filter (name, city, state)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.state.toLowerCase().includes(query)
      );
    }

    // Address search filter
    if (addressSearchQuery) {
      const addressQuery = addressSearchQuery.toLowerCase();
      result = result.filter(c =>
        (c.address && c.address.toLowerCase().includes(addressQuery)) ||
        c.city.toLowerCase().includes(addressQuery) ||
        c.state.toLowerCase().includes(addressQuery)
      );
    }

    // State filter
    if (selectedState !== 'all') {
      result = result.filter(c => c.state === selectedState);
    }

    // City filter
    if (selectedCity !== 'all') {
      result = result.filter(c => c.city === selectedCity);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.category === selectedCategory);
    }

    // Course filter
    if (selectedCourse !== 'all') {
      const collegeIdsWithCourse = courses
        .filter(course => course.name.toLowerCase().includes(selectedCourse.toLowerCase()))
        .map(course => course.college_id);
      result = result.filter(c => collegeIdsWithCourse.includes(c.id));
    }

    return result;
  }, [colleges, courses, searchQuery, addressSearchQuery, selectedState, selectedCity, selectedCategory, selectedCourse]);

  // Group colleges by different criteria
  const collegesByState = useMemo(() => {
    const grouped = {};
    colleges.forEach(c => {
      if (!grouped[c.state]) grouped[c.state] = [];
      grouped[c.state].push(c);
    });
    return grouped;
  }, [colleges]);

  // Group colleges by city
  const collegesByCity = useMemo(() => {
    const grouped = {};
    colleges.forEach(c => {
      if (!grouped[c.city]) grouped[c.city] = [];
      grouped[c.city].push(c);
    });
    return grouped;
  }, [colleges]);

  const collegesByCategory = useMemo(() => {
    const grouped = {};
    colleges.forEach(c => {
      if (!grouped[c.category]) grouped[c.category] = [];
      grouped[c.category].push(c);
    });
    return grouped;
  }, [colleges]);

  const collegesByCourse = useMemo(() => {
    const grouped = {};
    courses.forEach(course => {
      const college = colleges.find(c => c.id === course.college_id);
      if (college) {
        const courseName = course.name.split(' - ')[0]; // Get the course type (MBA, B.Tech, etc.)
        if (!grouped[courseName]) grouped[courseName] = new Set();
        grouped[courseName].add(college);
      }
    });
    // Convert sets to arrays
    Object.keys(grouped).forEach(key => {
      grouped[key] = Array.from(grouped[key]);
    });
    return grouped;
  }, [colleges, courses]);

  // Get courses for a college
  const getCollegeCourses = (collegeId) => {
    return courses.filter(c => c.college_id === collegeId);
  };

  // Update seat status
  const handleUpdateSeatStatus = async (courseId, newStatus) => {
    setUpdatingCourse(courseId);
    try {
      await coursesAPI.updateSeatStatus(courseId, newStatus);
      // Update both local course states
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, seat_status: newStatus } : c
      ));
      setSelectedCollegeCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, seat_status: newStatus } : c
      ));
      toast.success(`Seat status updated to "${newStatus}"`);
    } catch (error) {
      console.error('Failed to update seat status:', error);
      toast.error('Failed to update seat status');
    } finally {
      setUpdatingCourse(null);
    }
  };

  // Open course management dialog
  const handleManageCourses = async (college) => {
    setSelectedCollege(college);
    setCourseDialogOpen(true);
    setLoadingCollegeCourses(true);
    setSelectedCollegeCourses([]);
    
    try {
      // Fetch courses specifically for this college from the API
      const response = await coursesAPI.getByCollege(college.id);
      setSelectedCollegeCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses for college:', error);
      toast.error('Failed to load courses');
      // Fallback to filtering from local courses
      setSelectedCollegeCourses(courses.filter(c => c.college_id === college.id));
    } finally {
      setLoadingCollegeCourses(false);
    }
  };

  // Open alerts management dialog
  const handleManageAlerts = (college) => {
    setAlertsCollege(college);
    setAlerts(college.admission_alerts || []);
    setAlertsDialogOpen(true);
  };

  // Add new alert
  const handleAddAlert = () => {
    setAlerts(prev => [...prev, {
      title: '',
      message: '',
      alert_type: 'info',
      start_date: '',
      end_date: '',
      is_active: true
    }]);
  };

  // Update alert field
  const handleUpdateAlert = (index, field, value) => {
    setAlerts(prev => prev.map((alert, i) => 
      i === index ? { ...alert, [field]: value } : alert
    ));
  };

  // Remove alert
  const handleRemoveAlert = (index) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  // Save alerts
  const handleSaveAlerts = async () => {
    if (!alertsCollege) return;
    
    // Validate alerts
    const validAlerts = alerts.filter(a => a.title.trim() && a.message.trim());
    if (validAlerts.length !== alerts.length) {
      toast.error('Please fill in all required fields (Title and Message) for each alert');
      return;
    }

    setSavingAlerts(true);
    try {
      await collegesAPI.updateAdmissionAlerts(alertsCollege.id, validAlerts);
      
      // Update local state
      setColleges(prev => prev.map(c => 
        c.id === alertsCollege.id ? { ...c, admission_alerts: validAlerts } : c
      ));
      
      toast.success('Admission alerts updated successfully');
      setAlertsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update admission alerts');
    } finally {
      setSavingAlerts(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setAddressSearchQuery('');
    setSelectedState('all');
    setSelectedCity('all');
    setSelectedCategory('all');
    setSelectedCourse('all');
  };

  const hasActiveFilters = searchQuery || addressSearchQuery || selectedState !== 'all' || selectedCity !== 'all' || selectedCategory !== 'all' || selectedCourse !== 'all';

  // Render college card
  const renderCollegeCard = (college, showCategory = true) => {
    // Use course_count from API if available, otherwise count from loaded courses
    const courseCount = college.course_count || college.courses?.length || 0;
    const collegeCourses = getCollegeCourses(college.id);
    const availableCourses = collegeCourses.filter(c => c.seat_status === 'Available').length;
    const closingCourses = collegeCourses.filter(c => c.seat_status === 'Closing').length;

    // Function to open college detail in new tab
    const openCollegeInNewTab = (e) => {
      e.preventDefault();
      window.open(`/college/${college.id}`, '_blank');
    };

    return (
      <Card key={college.id} className="hover:shadow-md transition-shadow" data-testid={`college-card-${college.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <a 
                  href={`/college/${college.id}`}
                  onClick={openCollegeInNewTab}
                  className="font-heading font-semibold text-[#0066CC] hover:text-[#0055AA] hover:underline cursor-pointer flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`college-link-${college.id}`}
                >
                  {college.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Badge className="bg-[#FF6B35] text-white text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-[#475569] font-body">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {college.city}, {college.state}
                </span>
                {showCategory && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    {college.category}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {courseCount} courses
                </span>
              </div>
              {/* Quick seat status summary */}
              <div className="flex items-center gap-2 mt-2">
                {availableCourses > 0 && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {availableCourses} Available
                  </Badge>
                )}
                {closingCourses > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                    {closingCourses} Closing
                  </Badge>
                )}
                {(college.admission_alerts?.length > 0) && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    {college.admission_alerts.filter(a => a.is_active).length} Alerts
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManageAlerts(college)}
                className="font-body"
                data-testid={`manage-alerts-${college.id}`}
              >
                <Bell className="h-4 w-4 mr-1" />
                Alerts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManageCourses(college)}
                className="font-body"
                data-testid={`manage-courses-${college.id}`}
              >
                Manage Courses
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0F172A]">
            College Management
          </h1>
          <p className="text-[#475569] font-body mt-1">
            Manage featured colleges and course seat availability
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">{colleges.length}</p>
                  <p className="text-xs text-[#475569] font-body">Total Colleges</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">{totalCoursesCount}</p>
                  <p className="text-xs text-[#475569] font-body">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">
                    {courses.filter(c => c.seat_status === 'Closing').length}
                  </p>
                  <p className="text-xs text-[#475569] font-body">Closing Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">
                    {courses.filter(c => c.seat_status === 'Closed').length}
                  </p>
                  <p className="text-xs text-[#475569] font-body">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* College Name Search */}
                <div className="relative flex-1 lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <Input
                    placeholder="Search colleges by name, city, or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 font-body w-full"
                    data-testid="college-search"
                  />
                </div>

                {/* Address Search */}
                <div className="relative flex-1 lg:max-w-sm">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                  <Input
                    placeholder="Search by address (e.g., Bangalore, BTM, Tumkur)..."
                    value={addressSearchQuery}
                    onChange={(e) => setAddressSearchQuery(e.target.value)}
                    className="pl-10 h-10 font-body w-full"
                    data-testid="address-search"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* State Filter */}
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full lg:w-40 h-10" data-testid="state-filter">
                    <MapPin className="h-4 w-4 mr-2 text-[#94A3B8]" />
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {filters.states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* City Filter */}
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full lg:w-40 h-10" data-testid="city-filter">
                    <Building2 className="h-4 w-4 mr-2 text-[#94A3B8]" />
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {filters.cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full lg:w-44 h-10" data-testid="category-filter">
                    <GraduationCap className="h-4 w-4 mr-2 text-[#94A3B8]" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {filters.categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Course Filter */}
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-full lg:w-44 h-10" data-testid="course-filter">
                    <BookOpen className="h-4 w-4 mr-2 text-[#94A3B8]" />
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {filters.courses.slice(0, 20).map(course => (
                      <SelectItem key={course} value={course}>
                        {course.length > 30 ? course.substring(0, 30) + '...' : course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="h-10">
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="font-body">
              All Colleges ({filteredColleges.length})
            </TabsTrigger>
            <TabsTrigger value="by-city" className="font-body" data-testid="tab-by-city">
              <Building2 className="h-4 w-4 mr-1" />
              By City
            </TabsTrigger>
            <TabsTrigger value="by-state" className="font-body" data-testid="tab-by-state">
              <MapPin className="h-4 w-4 mr-1" />
              By State
            </TabsTrigger>
            <TabsTrigger value="by-category" className="font-body">
              <GraduationCap className="h-4 w-4 mr-1" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="by-course" className="font-body">
              <BookOpen className="h-4 w-4 mr-1" />
              By Course
            </TabsTrigger>
          </TabsList>

          {/* All Colleges View */}
          <TabsContent value="all">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredColleges.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-[#94A3B8] mb-4" />
                <h3 className="text-lg font-heading font-semibold text-[#0F172A]">No colleges found</h3>
                <p className="text-[#475569] font-body mt-1">Try adjusting your filters</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredColleges.map(college => renderCollegeCard(college))}
              </div>
            )}
          </TabsContent>

          {/* By City View */}
          <TabsContent value="by-city">
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(collegesByCity).map(([city, cityColleges]) => (
                <AccordionItem key={city} value={city} className="border rounded-lg px-4">
                  <AccordionTrigger className="font-heading font-semibold">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#0066CC]" />
                      {city}
                      <Badge variant="secondary" className="ml-2">{cityColleges.length} colleges</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {cityColleges.map(college => renderCollegeCard(college))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* By State View */}
          <TabsContent value="by-state">
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(collegesByState).map(([state, stateColleges]) => (
                <AccordionItem key={state} value={state} className="border rounded-lg px-4">
                  <AccordionTrigger className="font-heading font-semibold">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#0066CC]" />
                      {state}
                      <Badge variant="secondary" className="ml-2">{stateColleges.length} colleges</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {stateColleges.map(college => renderCollegeCard(college))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* By Category View */}
          <TabsContent value="by-category">
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(collegesByCategory).map(([category, catColleges]) => (
                <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                  <AccordionTrigger className="font-heading font-semibold">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#0066CC]" />
                      {category}
                      <Badge variant="secondary" className="ml-2">{catColleges.length} colleges</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {catColleges.map(college => renderCollegeCard(college, false))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* By Course View */}
          <TabsContent value="by-course">
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(collegesByCourse).map(([courseType, courseColleges]) => (
                <AccordionItem key={courseType} value={courseType} className="border rounded-lg px-4">
                  <AccordionTrigger className="font-heading font-semibold">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#0066CC]" />
                      {courseType}
                      <Badge variant="secondary" className="ml-2">{courseColleges.length} colleges</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {courseColleges.map(college => renderCollegeCard(college))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>

        {/* Course Management Dialog */}
        <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#0066CC]" />
                {selectedCollege?.name}
              </DialogTitle>
              <DialogDescription className="font-body">
                Manage seat availability status for each course
              </DialogDescription>
            </DialogHeader>

            {selectedCollege && (
              <div className="space-y-4">
                {/* College Info */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4 text-sm text-[#475569] font-body">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedCollege.city}, {selectedCollege.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {selectedCollege.category}
                    </span>
                  </div>
                </div>

                {/* Courses Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-heading font-semibold">Course Name</TableHead>
                        <TableHead className="font-heading font-semibold">Duration</TableHead>
                        <TableHead className="font-heading font-semibold">Level</TableHead>
                        <TableHead className="font-heading font-semibold">Seat Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingCollegeCourses ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#0066CC]" />
                            <p className="text-sm text-[#475569] mt-2">Loading courses...</p>
                          </TableCell>
                        </TableRow>
                      ) : selectedCollegeCourses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <BookOpen className="h-8 w-8 mx-auto text-[#94A3B8] mb-2" />
                            <p className="text-sm text-[#475569]">No courses found for this college</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedCollegeCourses.map(course => {
                          const statusConfig = getSeatStatusConfig(course.seat_status);
                          const StatusIcon = statusConfig.icon;

                          return (
                            <TableRow key={course.id}>
                              <TableCell className="font-body font-medium">{course.name}</TableCell>
                              <TableCell className="font-body">{course.duration}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{course.level}</Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={course.seat_status || 'Available'}
                                  onValueChange={(value) => handleUpdateSeatStatus(course.id, value)}
                                  disabled={updatingCourse === course.id}
                                >
                                  <SelectTrigger 
                                    className={`w-40 h-9 ${statusConfig.color}`}
                                    data-testid={`seat-status-${course.id}`}
                                  >
                                    {updatingCourse === course.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <SelectValue placeholder="Select status" />
                                    )}
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SEAT_STATUSES.map(status => {
                                      const Icon = status.icon;
                                      return (
                                        <SelectItem key={status.value} value={status.value}>
                                          <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            {status.label}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <p className="text-sm text-[#475569] font-body w-full">Status Legend:</p>
                  {SEAT_STATUSES.map(status => {
                    const Icon = status.icon;
                    return (
                      <Badge key={status.value} className={`${status.color} border`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setCourseDialogOpen(false)} className="font-body">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Admission Alerts Management Dialog */}
        <Dialog open={alertsDialogOpen} onOpenChange={setAlertsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#0066CC]" />
                Manage Admission Alerts
              </DialogTitle>
              <DialogDescription className="font-body">
                {alertsCollege?.name} - Add, edit, or remove admission alerts for counselors to see
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Add Alert Button */}
              <Button
                onClick={handleAddAlert}
                variant="outline"
                className="w-full border-dashed"
                data-testid="add-alert-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Alert
              </Button>

              {/* Alert List */}
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-[#94A3B8]">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-body">No admission alerts configured</p>
                  <p className="text-sm">Click "Add New Alert" to create one</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert, index) => {
                    const typeConfig = getAlertTypeConfig(alert.alert_type);
                    return (
                      <Card key={index} className="relative" data-testid={`alert-card-${index}`}>
                        <CardContent className="p-4 space-y-4">
                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveAlert(index)}
                            data-testid={`remove-alert-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          {/* Title */}
                          <div className="pr-10">
                            <Label className="font-body text-sm">Alert Title *</Label>
                            <Input
                              value={alert.title}
                              onChange={(e) => handleUpdateAlert(index, 'title', e.target.value)}
                              placeholder="e.g., MBA Admissions Open"
                              className="mt-1"
                              data-testid={`alert-title-${index}`}
                            />
                          </div>

                          {/* Message */}
                          <div>
                            <Label className="font-body text-sm">Message *</Label>
                            <Textarea
                              value={alert.message}
                              onChange={(e) => handleUpdateAlert(index, 'message', e.target.value)}
                              placeholder="Enter the alert message..."
                              className="mt-1 min-h-[80px]"
                              data-testid={`alert-message-${index}`}
                            />
                          </div>

                          {/* Type and Active Status */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-body text-sm">Alert Type</Label>
                              <Select
                                value={alert.alert_type}
                                onValueChange={(value) => handleUpdateAlert(index, 'alert_type', value)}
                              >
                                <SelectTrigger className="mt-1" data-testid={`alert-type-${index}`}>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ALERT_TYPES.map(type => {
                                    const TypeIcon = type.icon;
                                    return (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                          <TypeIcon className="h-4 w-4" />
                                          {type.label}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="font-body text-sm">Status</Label>
                              <Select
                                value={alert.is_active ? 'active' : 'inactive'}
                                onValueChange={(value) => handleUpdateAlert(index, 'is_active', value === 'active')}
                              >
                                <SelectTrigger className="mt-1" data-testid={`alert-status-${index}`}>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">
                                    <div className="flex items-center gap-2">
                                      <Check className="h-4 w-4 text-green-600" />
                                      Active
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="inactive">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="h-4 w-4 text-gray-400" />
                                      Inactive
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-body text-sm">Start Date (Optional)</Label>
                              <Input
                                type="date"
                                value={alert.start_date || ''}
                                onChange={(e) => handleUpdateAlert(index, 'start_date', e.target.value)}
                                className="mt-1"
                                data-testid={`alert-start-date-${index}`}
                              />
                            </div>
                            <div>
                              <Label className="font-body text-sm">End Date (Optional)</Label>
                              <Input
                                type="date"
                                value={alert.end_date || ''}
                                onChange={(e) => handleUpdateAlert(index, 'end_date', e.target.value)}
                                className="mt-1"
                                data-testid={`alert-end-date-${index}`}
                              />
                            </div>
                          </div>

                          {/* Preview Badge */}
                          <div className="pt-2 border-t">
                            <Label className="font-body text-sm text-[#94A3B8]">Preview:</Label>
                            <Badge className={`${typeConfig.color} border mt-1`}>
                              {React.createElement(typeConfig.icon, { className: "h-3 w-3 mr-1" })}
                              {typeConfig.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setAlertsDialogOpen(false)} className="font-body">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAlerts} 
                disabled={savingAlerts}
                className="font-body bg-[#0066CC] hover:bg-[#0052A3]"
                data-testid="save-alerts-btn"
              >
                {savingAlerts ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Alerts
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
