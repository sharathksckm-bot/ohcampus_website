import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { collegesAPI, coursesAPI, faqsAPI, placementsAPI } from '../lib/api';
import { exportFeeToPDF } from '../lib/pdfExport';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Sparkles, 
  Bell,
  IndianRupee,
  GraduationCap,
  Building2,
  HelpCircle,
  Calendar,
  Home,
  BookOpen,
  Receipt,
  Calculator,
  Download,
  AlertTriangle,
  Info,
  Clock,
  Megaphone,
  Check,
  XCircle,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Helper function to parse PHP serialized eligibility data
const parseEligibility = (eligibility) => {
  if (!eligibility) return null;
  
  // Check if it's PHP serialized data (starts with 'a:')
  if (eligibility.startsWith('a:')) {
    try {
      // Parse PHP serialized array format
      const parts = [];
      
      // Extract qualification
      const qualMatch = eligibility.match(/s:13:"qualification";a:\d+:\{([^}]*)\}/);
      if (qualMatch) {
        const quals = qualMatch[1].match(/s:\d+:"([^"]+)"/g);
        if (quals && quals.length > 0) {
          const qualValues = quals.map(q => q.match(/s:\d+:"([^"]+)"/)[1]);
          parts.push(`<strong>Qualification:</strong> ${qualValues.join(', ')}`);
        }
      }
      
      // Extract cut_off
      const cutoffMatch = eligibility.match(/s:7:"cut_off";a:\d+:\{([^}]*)\}/);
      if (cutoffMatch) {
        const cutoffs = cutoffMatch[1].match(/s:\d+:"([^"]+)"/g);
        if (cutoffs && cutoffs.length > 0) {
          const cutoffValues = cutoffs.map(c => c.match(/s:\d+:"([^"]+)"/)[1]);
          parts.push(`<strong>Cut Off:</strong> ${cutoffValues.join(', ')}`);
        }
      }
      
      // Extract other_eligibility
      const otherMatch = eligibility.match(/s:17:"other_eligibility";s:\d+:"(.*)";?\}$/);
      if (otherMatch && otherMatch[1] && otherMatch[1].trim() !== '') {
        // Decode escaped characters
        let other = otherMatch[1]
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/&nbsp;/g, ' ')
          .replace(/<br\s*\/?>/gi, '<br/>');
        if (other.trim()) {
          parts.push(`<strong>Other Requirements:</strong><br/>${other}`);
        }
      }
      
      if (parts.length > 0) {
        return parts.join('<br/><br/>');
      }
      return null;
    } catch (e) {
      console.error('Error parsing eligibility:', e);
      return null;
    }
  }
  
  // If it's regular HTML or text, return as is
  return eligibility;
};

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
    <Badge className={`${config.color} border font-body`} data-testid="seat-status-badge">
      <Icon className="h-3 w-3 mr-1" />
      {status}
    </Badge>
  );
};

export default function CollegeDetail() {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [feeSummary, setFeeSummary] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [placements, setPlacements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('highlights');
  const [exporting, setExporting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [courseDetailLoading, setCourseDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [collegeRes, coursesRes, feeSummaryRes, faqsRes, placementsRes] = await Promise.all([
        collegesAPI.getById(collegeId),
        coursesAPI.getByCollege(collegeId),
        collegesAPI.getFeeSummary(collegeId),
        faqsAPI.getAll({ college_id: collegeId, include_global: true }),
        placementsAPI.getByCollege(collegeId),
      ]);
      
      setCollege(collegeRes.data);
      setCourses(coursesRes.data);
      setFeeSummary(feeSummaryRes.data);
      setFaqs(faqsRes.data);
      setPlacements(placementsRes.data);
    } catch (error) {
      console.error('Failed to fetch college details:', error);
      toast.error('Failed to load college details');
    } finally {
      setLoading(false);
    }
  }, [collegeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // View course details
  const handleViewCourse = async (course) => {
    setSelectedCourse(course);
    setCourseDialogOpen(true);
    setCourseDetailLoading(true);
    
    try {
      const response = await coursesAPI.getById(course.id);
      setCourseDetail(response.data);
    } catch (error) {
      toast.error('Failed to load course details');
    } finally {
      setCourseDetailLoading(false);
    }
  };

  // Get total fees for a course from courseDetail
  const getTotalFees = (fees) => {
    if (!fees || fees.length === 0) return 0;
    return fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportPDF = () => {
    try {
      setExporting(true);
      exportFeeToPDF(college, feeSummary, courses);
      toast.success('Fee structure exported to PDF');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full rounded-xl mb-6" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-heading font-semibold text-[#0F172A] mb-4">
            College not found
          </h2>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="font-body text-[#475569] hover:text-[#0066CC] -ml-2"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Colleges
        </Button>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0066CC] to-[#0052A3] p-8 lg:p-12">
          <div className="relative z-10">
            <Badge className="bg-[#FF6B35] hover:bg-[#FF6B35] text-white mb-4">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured College
            </Badge>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white mb-4" data-testid="college-name">
              {college.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100 font-body">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{college.city}, {college.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Est. {college.established_year || college.established || '—'}</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {college.category}
              </Badge>
            </div>
            {college.address && (
              <div className="mt-4 flex items-start gap-2 text-blue-100 font-body text-sm">
                <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{college.address}</span>
              </div>
            )}
            {college.accreditation && (
              <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white font-body text-sm">
                <Star className="h-4 w-4 mr-2 fill-current text-yellow-300" />
                {college.accreditation}
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Admission Alerts Section - Only show if alerts exist */}
      {college.admission_alerts && college.admission_alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-3">
            {college.admission_alerts.filter(alert => alert.is_active).map((alert, index) => {
              const alertStyles = {
                info: { 
                  bg: 'bg-blue-50 border-blue-200', 
                  icon: Info, 
                  iconColor: 'text-blue-600',
                  titleColor: 'text-blue-800',
                  textColor: 'text-blue-700'
                },
                warning: { 
                  bg: 'bg-yellow-50 border-yellow-200', 
                  icon: AlertTriangle, 
                  iconColor: 'text-yellow-600',
                  titleColor: 'text-yellow-800',
                  textColor: 'text-yellow-700'
                },
                important: { 
                  bg: 'bg-red-50 border-red-200', 
                  icon: Megaphone, 
                  iconColor: 'text-red-600',
                  titleColor: 'text-red-800',
                  textColor: 'text-red-700'
                },
                deadline: { 
                  bg: 'bg-orange-50 border-orange-200', 
                  icon: Clock, 
                  iconColor: 'text-orange-600',
                  titleColor: 'text-orange-800',
                  textColor: 'text-orange-700'
                },
              };
              
              const style = alertStyles[alert.alert_type] || alertStyles.info;
              const AlertIcon = style.icon;
              
              return (
                <Alert 
                  key={index} 
                  className={`${style.bg} border animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  data-testid={`admission-alert-${index}`}
                >
                  <AlertIcon className={`h-5 w-5 ${style.iconColor}`} />
                  <AlertTitle className={`font-heading font-semibold ${style.titleColor}`}>
                    {alert.title}
                    {alert.alert_type === 'deadline' && alert.end_date && (
                      <Badge className="ml-2 bg-orange-600 text-white text-xs">
                        Deadline: {new Date(alert.end_date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </Badge>
                    )}
                  </AlertTitle>
                  <AlertDescription className={`font-body ${style.textColor} mt-1`}>
                    {alert.message}
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-8 w-full lg:w-auto inline-flex flex-wrap">
            <TabsTrigger 
              value="highlights" 
              className="rounded-lg font-body data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
              data-testid="highlights-tab"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Highlights
            </TabsTrigger>
            <TabsTrigger 
              value="courses" 
              className="rounded-lg font-body data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
              data-testid="courses-tab"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="fees" 
              className="rounded-lg font-body data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
              data-testid="fees-tab"
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              Fees
            </TabsTrigger>
            <TabsTrigger 
              value="placements" 
              className="rounded-lg font-body data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
              data-testid="placements-tab"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Placements
            </TabsTrigger>
            <TabsTrigger 
              value="whats-new" 
              className="rounded-lg font-body data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
              data-testid="whats-new-tab"
            >
              <Bell className="h-4 w-4 mr-2" />
              What's New
            </TabsTrigger>
            <TabsTrigger 
              value="faqs" 
              className="rounded-lg font-body data-[state=active]:bg-[#0066CC] data-[state=active]:text-white"
              data-testid="faqs-tab"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
          </TabsList>

          {/* Highlights Tab */}
          <TabsContent value="highlights" className="animate-fade-in">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-heading font-semibold text-[#0F172A] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#FF6B35]" />
                  College Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {college.highlights && college.highlights.length > 0 ? (
                  <ul className="space-y-4">
                    {college.highlights.map((highlight, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-semibold">{index + 1}</span>
                        </div>
                        <p className="font-body text-[#0F172A] pt-1">{highlight}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#475569] font-body text-center py-8">
                    No highlights available for this college.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Offered Tab */}
          <TabsContent value="courses" className="animate-fade-in">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-heading font-semibold text-[#0F172A] flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#0066CC]" />
                  Courses Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courses && courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((course, index) => (
                      <Card 
                        key={course.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-300 border-slate-200 group"
                        onClick={() => handleViewCourse(course)}
                        data-testid={`course-card-${course.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="secondary" className="font-body">
                              {course.level}
                            </Badge>
                            {getSeatStatusBadge(course.seat_status || 'Available')}
                          </div>
                          <h4 className="font-heading font-semibold text-[#0F172A] mb-2 group-hover:text-[#0066CC] transition-colors">
                            {course.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-[#475569] font-body">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.duration}
                            </span>
                            {course.category && (
                              <Badge variant="outline" className="text-xs">
                                {course.category}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-3 flex items-center text-[#0066CC] font-body text-sm font-medium group-hover:gap-2 transition-all">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#475569] font-body text-center py-8">
                    No courses available for this college.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placements Tab */}
          <TabsContent value="placements" className="animate-fade-in">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-heading font-semibold text-[#0F172A] flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#0066CC]" />
                  Placement Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* First try to show placements from MySQL (college.placements), then from MongoDB */}
                {((college.placements && college.placements.length > 0) || (placements && placements.stats && placements.stats.length > 0)) ? (
                  <div className="space-y-6">
                    {/* Description */}
                    {placements?.description && (
                      <p className="text-[#475569] font-body bg-slate-50 p-4 rounded-lg">
                        {placements.description}
                      </p>
                    )}
                    
                    {/* Stats Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-heading font-semibold">Year</TableHead>
                            <TableHead className="font-heading font-semibold">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Highest Package
                              </div>
                            </TableHead>
                            <TableHead className="font-heading font-semibold">Average Package</TableHead>
                            <TableHead className="font-heading font-semibold">Placement Rate</TableHead>
                            <TableHead className="font-heading font-semibold">Total Offers</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(college.placements?.length > 0 ? college.placements : placements?.stats || []).map((stat, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-body font-semibold">{stat.year || '—'}</TableCell>
                              <TableCell className="font-body text-green-600 font-semibold">
                                {formatCurrency(stat.highest_package)}
                              </TableCell>
                              <TableCell className="font-body">{formatCurrency(stat.average_package)}</TableCell>
                              <TableCell>
                                {stat.placement_rate ? (
                                  <Badge className="bg-blue-100 text-blue-700 font-body">
                                    {stat.placement_rate}%
                                  </Badge>
                                ) : '—'}
                              </TableCell>
                              <TableCell className="font-body">{stat.total_offers || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Top Recruiters */}
                    {placements?.stats?.[0]?.top_recruiters && placements.stats[0].top_recruiters.length > 0 && (
                      <div>
                        <h4 className="font-heading font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                          <Award className="h-5 w-5 text-[#FF6B35]" />
                          Top Recruiters ({placements.stats[0].year})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {placements.stats[0].top_recruiters.map((recruiter, i) => (
                            <Badge key={i} variant="secondary" className="font-body py-1.5 px-3">
                              {recruiter}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto text-[#94A3B8] mb-3" />
                    <p className="text-[#475569] font-body">
                      Placement statistics not available for this college.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* What's New Tab */}
          <TabsContent value="whats-new" className="animate-fade-in">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-heading font-semibold text-[#0F172A] flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#0066CC]" />
                  What's New
                </CardTitle>
              </CardHeader>
              <CardContent>
                {college.whats_new && college.whats_new.length > 0 ? (
                  <ul className="space-y-4">
                    {college.whats_new.map((news, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-[#0066CC] animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Bell className="h-5 w-5 text-[#0066CC] flex-shrink-0 mt-0.5" />
                        <p className="font-body text-[#0F172A]">{news}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#475569] font-body text-center py-8">
                    No recent updates available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="animate-fade-in">
            <div className="space-y-6">
              {/* Export Button */}
              {feeSummary.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-body rounded-full"
                    data-testid="export-pdf-btn"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export to PDF'}
                  </Button>
                </div>
              )}
              
              {feeSummary.length > 0 ? (
                feeSummary.map(({ course, fee_type, fees, admission_charges, totals }) => (
                  <Card key={course.id} className="border-slate-200 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-200">
                      <CardTitle className="text-lg font-heading font-semibold text-[#0F172A]">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-[#0066CC]" />
                            {course.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Seat Status Badge */}
                            {getSeatStatusBadge(course.seat_status || 'Available')}
                            <Badge variant="outline" className="font-body">
                              {course.level} • {course.duration}
                            </Badge>
                            <Badge className={fee_type === 'annual' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                              {fee_type === 'annual' ? 'Annual Fees' : 'Semester Fees'}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Fee Structure Table */}
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-heading font-semibold text-[#0F172A]">
                              {fee_type === 'annual' ? 'Year' : 'Semester'}
                            </TableHead>
                            <TableHead className="font-heading font-semibold text-[#0F172A]">
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                Tuition Fee
                              </div>
                            </TableHead>
                            <TableHead className="font-heading font-semibold text-[#0F172A]">
                              <div className="flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                Hostel Fee
                              </div>
                            </TableHead>
                            <TableHead className="font-heading font-semibold text-[#0F172A]">
                              <div className="flex items-center gap-1">
                                <Info className="h-4 w-4" />
                                Description
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fees.map((fee) => (
                            <TableRow key={fee.id} className="hover:bg-slate-50">
                              <TableCell className="font-body font-medium">
                                {fee_type === 'annual' ? `Year ${fee.year_or_semester}` : `Semester ${fee.year_or_semester}`}
                              </TableCell>
                              <TableCell className="font-body font-semibold text-[#0F172A]">
                                {formatCurrency(fee.amount)}
                              </TableCell>
                              <TableCell className="font-body">
                                {fee.hostel_fee ? (
                                  <span className="text-[#0066CC] font-semibold">
                                    {formatCurrency(fee.hostel_fee)}
                                  </span>
                                ) : (
                                  <span className="text-[#94A3B8]">—</span>
                                )}
                              </TableCell>
                              <TableCell className="font-body text-sm text-[#475569]">
                                {fee.description || <span className="text-[#94A3B8]">—</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Admission Charges Section */}
                      {admission_charges && (
                        <div className="border-t border-slate-200 p-4 bg-purple-50">
                          <h4 className="font-heading font-semibold text-[#0F172A] flex items-center gap-2 mb-3">
                            <Receipt className="h-5 w-5 text-purple-600" />
                            Admission Charges (One-time)
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {admission_charges.registration_fee > 0 && (
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-[#475569] font-body">Registration Fee</p>
                                <p className="font-semibold text-[#0F172A] font-body">
                                  {formatCurrency(admission_charges.registration_fee)}
                                </p>
                              </div>
                            )}
                            {admission_charges.admission_fee > 0 && (
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-[#475569] font-body">Admission Fee</p>
                                <p className="font-semibold text-[#0F172A] font-body">
                                  {formatCurrency(admission_charges.admission_fee)}
                                </p>
                              </div>
                            )}
                            {admission_charges.caution_deposit > 0 && (
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-[#475569] font-body">Caution Deposit</p>
                                <p className="font-semibold text-[#0F172A] font-body">
                                  {formatCurrency(admission_charges.caution_deposit)}
                                </p>
                              </div>
                            )}
                            {admission_charges.uniform_fee > 0 && (
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-[#475569] font-body">Uniform Fee</p>
                                <p className="font-semibold text-[#0F172A] font-body">
                                  {formatCurrency(admission_charges.uniform_fee)}
                                </p>
                              </div>
                            )}
                            {admission_charges.library_fee > 0 && (
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-[#475569] font-body">Library Fee</p>
                                <p className="font-semibold text-[#0F172A] font-body">
                                  {formatCurrency(admission_charges.library_fee)}
                                </p>
                              </div>
                            )}
                            {admission_charges.lab_fee > 0 && (
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-[#475569] font-body">Lab Fee</p>
                                <p className="font-semibold text-[#0F172A] font-body">
                                  {formatCurrency(admission_charges.lab_fee)}
                                </p>
                              </div>
                            )}
                            {admission_charges.other_charges > 0 && (
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-[#475569] font-body">
                                  {admission_charges.other_charges_description || 'Other Charges'}
                                </p>
                                <p className="font-semibold text-[#0F172A] font-body">
                                  {formatCurrency(admission_charges.other_charges)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Total Fees Summary */}
                      <div className="border-t border-slate-200 p-4 bg-gradient-to-r from-[#0066CC]/5 to-[#0066CC]/10">
                        <h4 className="font-heading font-semibold text-[#0F172A] flex items-center gap-2 mb-3">
                          <Calculator className="h-5 w-5 text-[#0066CC]" />
                          Total Fees Summary
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <p className="text-xs text-[#475569] font-body mb-1">Total Tuition</p>
                            <p className="text-xl font-bold text-[#0F172A] font-heading">
                              {formatCurrency(totals.tuition_total)}
                            </p>
                            <p className="text-xs text-[#94A3B8] font-body mt-1">
                              All {fee_type === 'annual' ? 'years' : 'semesters'} combined
                            </p>
                          </div>
                          <div className="p-4 bg-white rounded-lg border border-slate-200">
                            <p className="text-xs text-[#475569] font-body mb-1">Total Hostel</p>
                            <p className="text-xl font-bold text-[#0066CC] font-heading">
                              {formatCurrency(totals.hostel_total)}
                            </p>
                            <p className="text-xs text-[#94A3B8] font-body mt-1">
                              All {fee_type === 'annual' ? 'years' : 'semesters'} combined
                            </p>
                          </div>
                          {totals.admission_total > 0 && (
                            <div className="p-4 bg-white rounded-lg border border-slate-200">
                              <p className="text-xs text-[#475569] font-body mb-1">Admission Charges</p>
                              <p className="text-xl font-bold text-purple-600 font-heading">
                                {formatCurrency(totals.admission_total)}
                              </p>
                              <p className="text-xs text-[#94A3B8] font-body mt-1">
                                One-time payment
                              </p>
                            </div>
                          )}
                          <div className="p-4 bg-[#0066CC] rounded-lg text-white">
                            <p className="text-xs text-blue-100 font-body mb-1">Grand Total</p>
                            <p className="text-xl font-bold font-heading">
                              {formatCurrency(totals.grand_total_without_hostel)}
                            </p>
                            <p className="text-xs text-blue-200 font-body mt-1">
                              Excluding hostel fees
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center border-slate-200">
                  <IndianRupee className="h-16 w-16 mx-auto text-[#94A3B8] mb-4" />
                  <h3 className="text-xl font-heading font-semibold text-[#0F172A] mb-2">
                    No Fee Information Available
                  </h3>
                  <p className="text-[#475569] font-body">
                    Fee details for this college haven't been added yet.
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="animate-fade-in">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl font-heading font-semibold text-[#0F172A] flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#0066CC]" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {faqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border-slate-200">
                        <AccordionTrigger className="font-body font-medium text-[#0F172A] hover:text-[#0066CC] text-left">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-[#0066CC] font-semibold">{index + 1}.</span>
                            <span>{faq.question}</span>
                          </div>
                          {faq.is_global && (
                            <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">Global</Badge>
                          )}
                        </AccordionTrigger>
                        <AccordionContent className="font-body text-[#475569] pl-8">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-[#475569] font-body text-center py-8">
                    No FAQs available for this college.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Detail Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#0066CC]" />
              {selectedCourse?.name}
            </DialogTitle>
            <DialogDescription className="font-body">
              {selectedCourse?.level} • {selectedCourse?.duration}
            </DialogDescription>
          </DialogHeader>

          {courseDetailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : courseDetail ? (
            <div className="space-y-5 py-4">
              {/* Quick Info */}
              <div className="flex flex-wrap gap-2">
                {getSeatStatusBadge(courseDetail.course.seat_status || 'Available')}
                {courseDetail.course.category && (
                  <Badge variant="outline" className="font-body">{courseDetail.course.category}</Badge>
                )}
              </div>

              {/* Description */}
              {courseDetail.course.description && (
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-blue-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-white" />
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
              {courseDetail.course.eligibility && parseEligibility(courseDetail.course.eligibility) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    Eligibility
                  </h4>
                  <div 
                    className="text-[#475569] font-body text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: parseEligibility(courseDetail.course.eligibility).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    }}
                  />
                </div>
              )}

              {/* Scope */}
              {courseDetail.course.scope && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    Scope & Career
                  </h4>
                  <div 
                    className="text-[#475569] font-body text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: courseDetail.course.scope.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    }}
                  />
                </div>
              )}

              {/* Job Profiles */}
              {(courseDetail.course.job_profiles?.length > 0 || courseDetail.course.job_profile) && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
                      <Briefcase className="h-3 w-3 text-white" />
                    </div>
                    Job Profiles
                  </h4>
                  {courseDetail.course.job_profiles?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {courseDetail.course.job_profiles.map((job, i) => (
                        <Badge key={i} className="bg-white border border-orange-200 text-orange-700 font-body text-xs">
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
                  <h4 className="font-heading font-semibold text-[#0F172A] mb-2 text-sm flex items-center gap-1">
                    <IndianRupee className="h-4 w-4 text-[#0066CC]" />
                    Fee Structure
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-heading text-xs">Period</TableHead>
                          <TableHead className="font-heading text-xs">Tuition</TableHead>
                          <TableHead className="font-heading text-xs">Hostel</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courseDetail.fees.map((fee, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-body text-sm">
                              {fee.fee_type === 'annual' ? `Year ${fee.year_or_semester}` : `Sem ${fee.year_or_semester}`}
                            </TableCell>
                            <TableCell className="font-body text-sm font-semibold">
                              {formatCurrency(fee.amount)}
                            </TableCell>
                            <TableCell className="font-body text-sm text-[#475569]">
                              {formatCurrency(fee.hostel_fee)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-3 bg-[#0066CC] text-white flex justify-between items-center">
                      <span className="font-body text-sm">Total Tuition</span>
                      <span className="font-heading font-bold">
                        {formatCurrency(getTotalFees(courseDetail.fees))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
