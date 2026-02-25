import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { coursesAPI } from '../lib/api';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Search,
  BookOpen,
  Building2,
  MapPin,
  GraduationCap,
  Clock,
  Check,
  AlertTriangle,
  XCircle,
  Users,
  Briefcase,
  Target,
  FileText,
  ChevronRight,
  IndianRupee,
  X,
  GitCompare,
} from 'lucide-react';
import { toast } from 'sonner';

// Seat status configuration
const SEAT_STATUS_CONFIG = {
  'Available': { color: 'bg-green-100 text-green-700 border-green-200', icon: Check },
  'Closing': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle },
  'Under Waiting': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  'Closed': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const getSeatStatusBadge = (status) => {
  const config = SEAT_STATUS_CONFIG[status] || SEAT_STATUS_CONFIG['Available'];
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} border font-body`}>
      <Icon className="h-3 w-3 mr-1" />
      {status}
    </Badge>
  );
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedFeeRange, setSelectedFeeRange] = useState('all');
  const [selectedCourseName, setSelectedCourseName] = useState('all');
  const [courseNameSearch, setCourseNameSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageSize] = useState(50);

  // Fee range options (First Year fees only)
  const feeRangeOptions = [
    { value: 'all', label: 'All Fee Ranges' },
    { value: 'below_100000', label: '1st Year < ₹1L' },
    { value: 'below_200000', label: '1st Year < ₹2L' },
    { value: 'above_200000', label: '1st Year > ₹2L' }
  ];

  // Calculate first year fees only (1st year annual OR 1st+2nd semester)
  // Also handles MySQL courses that have total_fees instead of detailed fees array
  const getFirstYearFees = (course) => {
    const fees = course?.fees;
    
    // If fees array exists and has data, use structured fee calculation
    if (fees && fees.length > 0) {
      // Get first year annual fees
      const firstYearAnnual = fees
        .filter(f => f.fee_type === 'annual' && f.year_or_semester === 1)
        .reduce((sum, f) => sum + (f.amount || 0), 0);
      
      // Get 1st and 2nd semester fees
      const firstTwoSemesters = fees
        .filter(f => f.fee_type === 'semester' && (f.year_or_semester === 1 || f.year_or_semester === 2))
        .reduce((sum, f) => sum + (f.amount || 0), 0);
      
      // Return whichever is available (prefer annual if both exist)
      return firstYearAnnual > 0 ? firstYearAnnual : firstTwoSemesters;
    }
    
    // Fallback to total_fees for MySQL courses (represents 1st year / total fees)
    if (course?.total_fees) {
      const totalFees = parseFloat(course.total_fees);
      return isNaN(totalFees) ? 0 : totalFees;
    }
    
    return 0;
  };

  // Calculate total fees (all years/semesters combined)
  // Also handles MySQL courses that have total_fees instead of detailed fees array
  const getTotalFees = (course) => {
    const fees = course?.fees;
    
    // If fees array exists and has data, sum all amounts
    if (fees && fees.length > 0) {
      return fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    }
    
    // Fallback to total_fees for MySQL courses
    if (course?.total_fees) {
      const totalFees = parseFloat(course.total_fees);
      return isNaN(totalFees) ? 0 : totalFees;
    }
    
    return 0;
  };

  // Fetch filters separately
  const fetchFilters = useCallback(async () => {
    try {
      const [categoriesRes, levelsRes, filtersRes] = await Promise.all([
        coursesAPI.getCategories(),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/filters/course-levels`).then(r => r.json()),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/filters`).then(r => r.json()),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setLevels(levelsRes.levels || ['UG', 'PG', 'Diploma', 'Doctorial']);
      setStates(filtersRes.states || []);
      setCities(filtersRes.cities || []);
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  }, []);

  // Fetch courses with pagination
  const fetchCourses = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedLevel && selectedLevel !== 'all') params.level = selectedLevel;
      if (selectedState && selectedState !== 'all') params.state = selectedState;
      if (selectedCity && selectedCity !== 'all') params.city = selectedCity;
      if (selectedCourseName && selectedCourseName !== 'all') params.course_name = selectedCourseName;
      
      // Fee range filter - server-side
      if (selectedFeeRange && selectedFeeRange !== 'all') {
        if (selectedFeeRange === 'below_100000') {
          params.fee_min = 1;
          params.fee_max = 100000;
        } else if (selectedFeeRange === 'below_200000') {
          params.fee_min = 1;
          params.fee_max = 200000;
        } else if (selectedFeeRange === 'above_200000') {
          params.fee_min = 200001;
        }
      }
      
      const response = await coursesAPI.getAllWithCollege(params);
      const data = response.data;
      
      // Handle paginated response
      if (data.courses) {
        setCourses(data.courses);
        setTotalCourses(data.total);
        setTotalPages(data.total_pages);
        setCurrentPage(data.page);
      } else {
        // Fallback for non-paginated response
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedLevel, selectedState, selectedCity, selectedCourseName, selectedFeeRange, pageSize]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchCourses(1);
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedState, selectedCity, selectedCourseName, selectedFeeRange]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCourses(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter courses (client-side only for category which is not in MySQL)
  const filteredCourses = useMemo(() => {
    let result = courses;

    // Category filter - still client-side as it's not in MySQL schema
    if (selectedCategory !== 'all') {
      result = result.filter(c => c.category === selectedCategory);
    }

    return result;
  }, [courses, selectedCategory]);

  // Get unique course names for the Course filter dropdown
  const uniqueCourseNames = useMemo(() => {
    const names = [...new Set(courses.map(c => c.name).filter(Boolean))];
    return names.sort();
  }, [courses]);

  // Get filtered cities based on selected state
  const filteredCities = useMemo(() => {
    if (selectedState === 'all') return cities;
    return [...new Set(courses.filter(c => c.college?.state === selectedState).map(c => c.college?.city).filter(Boolean))];
  }, [courses, cities, selectedState]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSelectedState('all');
    setSelectedCity('all');
    setSelectedFeeRange('all');
    setSelectedCourseName('all');
    setCourseNameSearch('');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all' || selectedState !== 'all' || selectedCity !== 'all' || selectedFeeRange !== 'all' || selectedCourseName !== 'all';

  // Compare mode functions
  const toggleCompareSelection = (course) => {
    if (selectedForCompare.find(c => c.id === course.id)) {
      setSelectedForCompare(prev => prev.filter(c => c.id !== course.id));
    } else {
      if (selectedForCompare.length >= 4) {
        toast.error('You can compare maximum 4 courses');
        return;
      }
      setSelectedForCompare(prev => [...prev, course]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Select at least 2 courses to compare');
      return;
    }
    setCompareDialogOpen(true);
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedForCompare([]);
  };

  // Fetch course detail
  const handleViewCourse = async (course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
    setDetailLoading(true);
    
    try {
      const response = await coursesAPI.getById(course.id);
      setCourseDetail(response.data);
    } catch (error) {
      toast.error('Failed to load course details');
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0066CC] to-[#0052A3] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Explore Courses
          </h1>
          <p className="text-lg text-blue-100 font-body max-w-2xl">
            Browse all courses offered by featured colleges. Find detailed information about eligibility, scope, and career opportunities.
          </p>
        </div>
      </div>

      {/* Compare Mode Banner */}
      {compareMode && (
        <div className="bg-[#FF6B35] text-white py-3 px-4 relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <GitCompare className="h-5 w-5 flex-shrink-0" />
              <span className="font-body font-medium">
                Comparison Mode: {selectedForCompare.length}/4 courses selected
              </span>
              {selectedForCompare.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedForCompare.map(c => (
                    <Badge key={c.id} className="bg-white/20 text-white border-white/30">
                      {c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name}
                      <button onClick={() => toggleCompareSelection(c)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCompare}
                disabled={selectedForCompare.length < 2}
                className="bg-white text-[#FF6B35] hover:bg-white/90 font-body"
                data-testid="compare-courses-btn"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Compare ({selectedForCompare.length})
              </Button>
              <Button
                onClick={exitCompareMode}
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-body"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <Card className="shadow-lg border-0">
          <CardContent className="p-4 lg:p-6">
            {/* Row 1 - Search */}
            <div className="mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  placeholder="Search courses by name, college, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 font-body border-slate-300 w-full"
                  data-testid="course-search"
                />
              </div>
            </div>

            {/* Row 2 - Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Course Filter with Search */}
                <div className="relative">
                  <Select value={selectedCourseName} onValueChange={(value) => {
                    setSelectedCourseName(value);
                    setCourseNameSearch('');
                  }}>
                    <SelectTrigger className="w-[160px] h-10 text-sm" data-testid="course-name-filter">
                      <BookOpen className="h-3.5 w-3.5 mr-1.5 text-[#94A3B8]" />
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
                          <Input
                            placeholder="Search courses..."
                            value={courseNameSearch}
                            onChange={(e) => setCourseNameSearch(e.target.value)}
                            className="pl-8 h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <SelectItem value="all">All Courses</SelectItem>
                      {uniqueCourseNames
                        .filter(name => !courseNameSearch || name.toLowerCase().includes(courseNameSearch.toLowerCase()))
                        .map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      {uniqueCourseNames.filter(name => !courseNameSearch || name.toLowerCase().includes(courseNameSearch.toLowerCase())).length === 0 && courseNameSearch && (
                        <div className="p-2 text-sm text-[#94A3B8] text-center">No courses found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[140px] h-10 text-sm" data-testid="category-filter">
                    <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-[#94A3B8]" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Level Filter */}
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[110px] h-10 text-sm" data-testid="level-filter">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5 text-[#94A3B8]" />
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* State Filter */}
                <Select value={selectedState} onValueChange={(value) => {
                  setSelectedState(value);
                  setSelectedCity('all');
                }}>
                  <SelectTrigger className="w-[120px] h-10 text-sm" data-testid="state-filter">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#94A3B8]" />
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* City Filter */}
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-[110px] h-10 text-sm" data-testid="city-filter">
                    <Building2 className="h-3.5 w-3.5 mr-1.5 text-[#94A3B8]" />
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {filteredCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Fee Range Filter */}
                <Select value={selectedFeeRange} onValueChange={setSelectedFeeRange}>
                  <SelectTrigger className="w-[130px] h-10 text-sm" data-testid="fee-range-filter">
                    <IndianRupee className="h-3.5 w-3.5 mr-1.5 text-[#94A3B8]" />
                    <SelectValue placeholder="Fee Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeRangeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-10 px-4"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                )}

                {/* Compare Courses Button */}
                {!compareMode && (
                  <Button
                    onClick={() => setCompareMode(true)}
                    variant="outline"
                    className="h-10 px-4 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
                    data-testid="enable-compare-mode-btn"
                  >
                    <GitCompare className="h-4 w-4 mr-2" />
                    Compare Courses
                  </Button>
                )}
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-[#0F172A]">
              Available Courses
            </h2>
            <p className="text-[#475569] font-body mt-1">
              {loading ? 'Loading...' : `Showing ${filteredCourses.length} of ${totalCourses} courses`}
            </p>
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-[#94A3B8] mb-4" />
            <h3 className="text-xl font-heading font-semibold text-[#0F172A] mb-2">
              No Courses Found
            </h3>
            <p className="text-[#475569] font-body">
              Try adjusting your search or filter criteria.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCourses.map((course, index) => (
              <Card
                key={course.id}
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in group ${
                  selectedForCompare.find(c => c.id === course.id) ? 'ring-2 ring-[#FF6B35]' : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => compareMode ? toggleCompareSelection(course) : handleViewCourse(course)}
                data-testid={`course-card-${course.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="font-body text-xs">
                      {course.category || course.level}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getSeatStatusBadge(course.seat_status || 'Available')}
                      {compareMode && (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedForCompare.find(c => c.id === course.id) 
                            ? 'bg-[#FF6B35] border-[#FF6B35]' 
                            : 'bg-white border-slate-300'
                        }`}>
                          {selectedForCompare.find(c => c.id === course.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-heading font-semibold text-[#0F172A] mb-1.5 line-clamp-2 group-hover:text-[#0066CC] transition-colors leading-tight">
                    {course.name}
                  </h3>

                  {course.college && (
                    <div className="flex items-center gap-1.5 text-xs text-[#475569] font-body mb-1">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{course.college.name}</span>
                    </div>
                  )}

                  {course.college && (
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] font-body mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span>{course.college.city}, {course.college.state}</span>
                    </div>
                  )}

                  {/* Show First Year Fee */}
                  {(course.fees && course.fees.length > 0) || course.total_fees ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#475569] font-body mb-2">
                      <IndianRupee className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium">{formatCurrency(getFirstYearFees(course))} (1st Year)</span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-[#475569] font-body">
                      <Clock className="h-3 w-3" />
                      <span>{course.duration}</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {course.level}
                    </Badge>
                  </div>

                  {!compareMode && (
                    <div className="mt-2 flex items-center text-[#0066CC] font-body text-xs font-semibold group-hover:gap-1 transition-all">
                      View Details
                      <ChevronRight className="h-3 w-3 ml-0.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="font-body"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={`font-body min-w-[40px] ${currentPage === pageNum ? 'bg-[#0066CC]' : ''}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="font-body"
            >
              Next
            </Button>
            
            <span className="text-sm text-[#475569] font-body ml-4">
              Page {currentPage} of {totalPages} ({totalCourses} total courses)
            </span>
          </div>
        )}
      </div>

      {/* Course Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#0066CC]" />
              {selectedCourse?.name}
            </DialogTitle>
            <DialogDescription className="font-body">
              {selectedCourse?.college?.name} • {selectedCourse?.college?.city}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : courseDetail ? (
            <div className="space-y-6 py-4">
              {/* Quick Info */}
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-body text-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {courseDetail.course.duration}
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-body text-sm">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {courseDetail.course.level}
                </Badge>
                {courseDetail.course.category && (
                  <Badge variant="outline" className="font-body text-sm border-orange-300 text-orange-600">
                    {courseDetail.course.category}
                  </Badge>
                )}
                {getSeatStatusBadge(courseDetail.course.seat_status || 'Available')}
              </div>

              {/* Description */}
              {courseDetail.course.description && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    Description
                  </h4>
                  <div 
                    className="text-[#475569] font-body text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: courseDetail.course.description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    }}
                  />
                </div>
              )}

              {/* Eligibility */}
              {courseDetail.course.eligibility && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    Course Eligibility
                  </h4>
                  <div 
                    className="text-[#475569] font-body text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: courseDetail.course.eligibility.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    }}
                  />
                </div>
              )}

              {/* Scope */}
              {courseDetail.course.scope && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    Scope & Career Opportunities
                  </h4>
                  <div 
                    className="text-[#475569] font-body text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: courseDetail.course.scope.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    }}
                  />
                </div>
              )}

              {/* Job Profiles - Show either parsed array or raw HTML */}
              {(courseDetail.course.job_profiles?.length > 0 || courseDetail.course.job_profile) && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    Job Profiles
                  </h4>
                  {courseDetail.course.job_profiles?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {courseDetail.course.job_profiles.map((job, i) => (
                        <Badge key={i} className="bg-white border border-orange-200 text-orange-700 font-body hover:bg-orange-100 transition-colors">
                          {job}
                        </Badge>
                      ))}
                    </div>
                  ) : courseDetail.course.job_profile && (
                    <div 
                      className="text-[#475569] font-body text-sm leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: courseDetail.course.job_profile.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                      }}
                    />
                  )}
                </div>
              )}

              {/* Fee Structure */}
              {courseDetail.fees && courseDetail.fees.length > 0 && (
                <div>
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-[#0066CC]" />
                    Fee Structure
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-heading">Period</TableHead>
                          <TableHead className="font-heading">Tuition Fee</TableHead>
                          <TableHead className="font-heading">Hostel Fee</TableHead>
                          <TableHead className="font-heading">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courseDetail.fees.map((fee, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-body">
                              {fee.fee_type === 'annual' ? `Year ${fee.year_or_semester}` : `Semester ${fee.year_or_semester}`}
                            </TableCell>
                            <TableCell className="font-body font-semibold">
                              {formatCurrency(fee.amount)}
                            </TableCell>
                            <TableCell className="font-body text-[#475569]">
                              {formatCurrency(fee.hostel_fee)}
                            </TableCell>
                            <TableCell className="font-body text-sm text-[#475569]">
                              {fee.description || <span className="text-[#94A3B8]">—</span>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-3 bg-[#0066CC] text-white flex justify-between items-center">
                      <span className="font-body">Total Tuition Fees</span>
                      <span className="font-heading font-bold text-lg">
                        {formatCurrency(getTotalFees(courseDetail))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admission Charges */}
              {courseDetail.admission_charges && (
                <div>
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2">
                    One-time Admission Charges
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {courseDetail.admission_charges.registration_fee > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-[#94A3B8] font-body">Registration</p>
                        <p className="font-semibold font-body">{formatCurrency(courseDetail.admission_charges.registration_fee)}</p>
                      </div>
                    )}
                    {courseDetail.admission_charges.admission_fee > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-[#94A3B8] font-body">Admission</p>
                        <p className="font-semibold font-body">{formatCurrency(courseDetail.admission_charges.admission_fee)}</p>
                      </div>
                    )}
                    {courseDetail.admission_charges.caution_deposit > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-[#94A3B8] font-body">Caution Deposit</p>
                        <p className="font-semibold font-body">{formatCurrency(courseDetail.admission_charges.caution_deposit)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* College Info */}
              {courseDetail.college && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    About the College
                  </h4>
                  <p className="text-sm font-body text-[#475569] mb-2">{courseDetail.college.name}</p>
                  <p className="text-xs font-body text-[#94A3B8]">{courseDetail.college.address}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Badge variant="secondary">{courseDetail.college.category}</Badge>
                    {courseDetail.college.accreditation && (
                      <Badge variant="outline">{courseDetail.college.accreditation}</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Compare Courses Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-[#FF6B35]" />
              Compare Courses ({selectedForCompare.length})
            </DialogTitle>
            <DialogDescription className="font-body text-sm">
              Side-by-side comparison of selected courses
            </DialogDescription>
          </DialogHeader>
          
          {selectedForCompare.length > 0 && (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-heading text-xs min-w-[120px] sticky left-0 bg-slate-50 z-10">Criteria</TableHead>
                    {selectedForCompare.map(course => (
                      <TableHead key={course.id} className="font-heading text-xs min-w-[160px] max-w-[200px] text-center p-2">
                        <div className="space-y-0.5">
                          <p className="text-[#0066CC] text-xs font-semibold line-clamp-2">{course.name}</p>
                          <p className="text-[10px] text-[#94A3B8] font-normal line-clamp-1">{course.college?.name}</p>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Level */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-3 w-3 text-[#0066CC]" />
                        Level
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center p-2">
                        <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Duration */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-[#0066CC]" />
                        Duration
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs p-2">
                        {course.duration || '—'}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Category */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 text-[#0066CC]" />
                        Category
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs p-2">
                        {course.category || '—'}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Location */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-[#0066CC]" />
                        Location
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs p-2">
                        {course.college ? `${course.college.city}, ${course.college.state}` : '—'}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* First Year Fees */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="h-3 w-3 text-[#0066CC]" />
                        1st Year Fees
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs font-semibold text-green-600 p-2">
                        {(course.fees && course.fees.length > 0) || course.total_fees ? formatCurrency(getFirstYearFees(course)) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Total Fees */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="h-3 w-3 text-[#0066CC]" />
                        Total Fees
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs font-semibold p-2">
                        {(course.fees && course.fees.length > 0) || course.total_fees ? formatCurrency(getTotalFees(course)) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Seat Status */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-[#0066CC]" />
                        Seat Status
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center p-2">
                        {getSeatStatusBadge(course.seat_status || 'Available')}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Description */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2 align-top">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-[#0066CC]" />
                        Description
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs p-2 align-top">
                        {course.description ? (
                          <span className="line-clamp-3 text-left">{course.description}</span>
                        ) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Scope */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2 align-top">
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3 w-3 text-[#0066CC]" />
                        Scope
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs p-2 align-top">
                        {course.scope ? (
                          <span className="line-clamp-3 text-left">{course.scope}</span>
                        ) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Eligibility */}
                  <TableRow>
                    <TableCell className="font-body text-xs font-medium bg-slate-50 sticky left-0 z-10 p-2 align-top">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-[#0066CC]" />
                        Eligibility
                      </div>
                    </TableCell>
                    {selectedForCompare.map(course => (
                      <TableCell key={course.id} className="text-center font-body text-xs p-2 align-top">
                        {course.eligibility ? (
                          <span className="line-clamp-3 text-left">{course.eligibility}</span>
                        ) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
