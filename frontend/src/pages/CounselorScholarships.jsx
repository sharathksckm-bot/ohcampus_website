import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  CheckCircle,
  Share2,
  Copy,
  Link as LinkIcon,
  Users,
  TrendingUp,
  FileText,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const STATUSES = [
  { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Under Review', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'Contacted', label: 'Contacted', color: 'bg-purple-100 text-purple-800' },
  { value: 'Eligible', label: 'Eligible', color: 'bg-green-100 text-green-800' },
  { value: 'Not Eligible', label: 'Not Eligible', color: 'bg-gray-100 text-gray-800' },
  { value: 'Converted', label: 'Converted', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'Rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

const getStatusColor = (status) => {
  const statusObj = STATUSES.find((s) => s.value === status);
  return statusObj?.color || 'bg-gray-100 text-gray-800';
};

export default function CounselorScholarships() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, by_status: {}, recent_30_days: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [utmLink, setUtmLink] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(
        `${API_URL}/api/scholarship-applications?${params}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to fetch referrals');
        return;
      }

      const data = await response.json();
      setApplications(data.applications || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      toast.error('Failed to fetch referrals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/scholarship-applications/stats`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return;
      const data = await response.json();
      setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchUtmLink = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/counselor/scholarship-utm-link`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return;
      const data = await response.json();
      setUtmLink(data.utm_link);
    } catch (error) {
      console.error('Failed to fetch UTM link:', error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
    fetchUtmLink();
  }, [fetchApplications, fetchStats, fetchUtmLink]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(utmLink);
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const conversionRate = stats.total > 0 
    ? ((stats.by_status?.Converted || 0) / stats.total * 100).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="counselor-scholarships-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#0F172A]">
              My Scholarship Referrals
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Track scholarship applications from your referral link
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowShareDialog(true)}
              className="bg-[#0066CC] hover:bg-[#0055AA] gap-2"
              data-testid="share-link-btn"
            >
              <Share2 className="h-4 w-4" />
              Get Referral Link
            </Button>
            <Button
              onClick={() => {
                fetchApplications();
                fetchStats();
              }}
              variant="outline"
              className="gap-2"
              data-testid="refresh-btn"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">{stats.total}</p>
                  <p className="text-xs text-[#475569]">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {stats.by_status?.Pending || 0}
                  </p>
                  <p className="text-xs text-[#475569]">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {stats.by_status?.Converted || 0}
                  </p>
                  <p className="text-xs text-[#475569]">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">{conversionRate}%</p>
                  <p className="text-xs text-[#475569]">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value === 'all' ? '' : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]" data-testid="status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-[#0066CC]" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto text-[#CBD5E1] mb-4" />
                <p className="text-[#475569] mb-4">No referrals yet</p>
                <Button
                  onClick={() => setShowShareDialog(true)}
                  className="bg-[#0066CC] hover:bg-[#0055AA]"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Get Your Referral Link
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="applications-table">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-[#475569] text-sm">
                        Application
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#475569] text-sm">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#475569] text-sm">
                        Course
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#475569] text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-[#475569] text-sm">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-[#475569] text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b hover:bg-slate-50 transition-colors"
                        data-testid={`application-row-${app.id}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-[#0066CC]">
                            {app.application_number || app.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-[#0F172A]">{app.name}</p>
                            <p className="text-xs text-[#475569]">{app.email}</p>
                            <p className="text-xs text-[#475569]">{app.phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-[#0F172A]">
                              {app.preferred_course || 'Not specified'}
                            </p>
                            <p className="text-xs text-[#475569]">
                              {app.preferred_stream || ''}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(app.status)}>
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-[#475569]">
                            {formatDate(app.created_at)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setShowDetailDialog(true);
                            }}
                            data-testid={`view-btn-${app.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-[#475569]">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#0066CC]" />
                Application Details
                <Badge className={getStatusColor(selectedApp?.status)}>
                  {selectedApp?.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            {selectedApp && (
              <div className="space-y-4">
                {/* Application Number */}
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-[#475569]">Application Number</p>
                  <p className="font-mono text-lg font-bold text-[#0066CC]">
                    {selectedApp.application_number || selectedApp.id}
                  </p>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-2 text-sm">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#475569]">Name</p>
                      <p className="text-sm font-medium">{selectedApp.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Phone</p>
                      <p className="text-sm">{selectedApp.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-[#475569]">Email</p>
                      <p className="text-sm">{selectedApp.email}</p>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-2 text-sm">
                    Course Preference
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#475569]">Stream</p>
                      <p className="text-sm">{selectedApp.preferred_stream || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Course</p>
                      <p className="text-sm">{selectedApp.preferred_course || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                {(selectedApp.tenth_percentage || selectedApp.twelfth_percentage) && (
                  <div>
                    <h3 className="font-medium text-[#0F172A] mb-2 text-sm">
                      Academic Performance
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedApp.tenth_percentage && (
                        <div>
                          <p className="text-xs text-[#475569]">10th</p>
                          <p className="text-sm font-medium">{selectedApp.tenth_percentage}%</p>
                        </div>
                      )}
                      {selectedApp.twelfth_percentage && (
                        <div>
                          <p className="text-xs text-[#475569]">12th</p>
                          <p className="text-sm font-medium">{selectedApp.twelfth_percentage}%</p>
                        </div>
                      )}
                      {selectedApp.graduation_percentage && (
                        <div>
                          <p className="text-xs text-[#475569]">Graduation</p>
                          <p className="text-sm font-medium">{selectedApp.graduation_percentage}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-[#475569] pt-2 border-t">
                  <p>Applied: {formatDate(selectedApp.created_at)}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Link Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-[#0066CC]" />
                Your Referral Link
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-[#475569]">
                Share this link with students. When they apply for scholarships using your link, 
                their applications will be automatically tracked under your account.
              </p>

              <div className="flex gap-2">
                <Input
                  value={utmLink}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="utm-link-input"
                />
                <Button onClick={copyToClipboard} className="gap-2" data-testid="copy-link-btn">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Tips for better conversions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Share the link on your social media</li>
                  <li>• Send to students looking for scholarships</li>
                  <li>• Include in your email signatures</li>
                  <li>• Track your referrals on this page</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
