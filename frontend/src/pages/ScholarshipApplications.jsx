import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
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
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  ExternalLink,
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

export default function ScholarshipApplications() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, by_status: {}, recent_30_days: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [counselors, setCounselors] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ohcampus_token');
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
        toast.error(errorData.detail || 'Failed to fetch applications');
        return;
      }

      const data = await response.json();
      setApplications(data.applications || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      toast.error('Failed to fetch applications');
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
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchCounselors = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return;
      const data = await response.json();
      setCounselors(data || []);
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
    fetchCounselors();
  }, [fetchApplications, fetchStats, fetchCounselors]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/scholarship-applications/${appId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchApplications();
        fetchStats();
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp({ ...selectedApp, status: newStatus });
        }
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleNotesUpdate = async (appId, notes) => {
    try {
      const response = await fetch(`${API_URL}/api/scholarship-applications/${appId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ admin_notes: notes }),
      });

      if (response.ok) {
        toast.success('Notes updated');
        fetchApplications();
      } else {
        toast.error('Failed to update notes');
      }
    } catch (error) {
      toast.error('Failed to update notes');
    }
  };

  const handleAssignCounselor = async (appId, counselorId) => {
    try {
      const response = await fetch(`${API_URL}/api/scholarship-applications/${appId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ counselor_id: counselorId }),
      });

      if (response.ok) {
        toast.success('Counselor assigned');
        fetchApplications();
      } else {
        toast.error('Failed to assign counselor');
      }
    } catch (error) {
      toast.error('Failed to assign counselor');
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="scholarship-applications-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#0F172A]">
              Scholarship Applications
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Manage and track scholarship applications from students
            </p>
          </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">{stats.total}</p>
                  <p className="text-xs text-[#475569]">Total Applications</p>
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
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">{stats.today}</p>
                  <p className="text-xs text-[#475569]">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#475569]" />
                <Input
                  placeholder="Search by name, email, phone, or application number..."
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
                <p className="text-[#475569]">No applications found</p>
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
                        Counselor
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
                          {app.counselor_name ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#475569]" />
                              <span className="text-sm">{app.counselor_name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#94A3B8]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={app.status}
                            onValueChange={(value) => handleStatusUpdate(app.id, value)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <Badge className={getStatusColor(app.status)}>
                                {app.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  <Badge className={status.color}>{status.label}</Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <div className="space-y-6">
                {/* Application Number */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-[#475569]">Application Number</p>
                  <p className="font-mono text-lg font-bold text-[#0066CC]">
                    {selectedApp.application_number || selectedApp.id}
                  </p>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-3">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#475569]">Full Name</p>
                      <p className="font-medium">{selectedApp.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Email</p>
                      <p>{selectedApp.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Phone</p>
                      <p>{selectedApp.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Gender</p>
                      <p>{selectedApp.gender || 'Not specified'}</p>
                    </div>
                    {selectedApp.father_name && (
                      <div>
                        <p className="text-xs text-[#475569]">Father's Name</p>
                        <p>{selectedApp.father_name}</p>
                      </div>
                    )}
                    {selectedApp.mother_name && (
                      <div>
                        <p className="text-xs text-[#475569]">Mother's Name</p>
                        <p>{selectedApp.mother_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                {(selectedApp.address || selectedApp.city) && (
                  <div>
                    <h3 className="font-medium text-[#0F172A] mb-3">Address</h3>
                    <p className="text-sm">
                      {[
                        selectedApp.address,
                        selectedApp.city,
                        selectedApp.state,
                        selectedApp.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}

                {/* Academic Information */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-3">
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedApp.tenth_percentage && (
                      <div>
                        <p className="text-xs text-[#475569]">10th Percentage</p>
                        <p>{selectedApp.tenth_percentage}%</p>
                      </div>
                    )}
                    {selectedApp.twelfth_percentage && (
                      <div>
                        <p className="text-xs text-[#475569]">12th Percentage</p>
                        <p>{selectedApp.twelfth_percentage}%</p>
                      </div>
                    )}
                    {selectedApp.graduation_percentage && (
                      <div>
                        <p className="text-xs text-[#475569]">
                          Graduation Percentage
                        </p>
                        <p>{selectedApp.graduation_percentage}%</p>
                      </div>
                    )}
                    {selectedApp.current_education && (
                      <div>
                        <p className="text-xs text-[#475569]">Current Education</p>
                        <p>{selectedApp.current_education}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-3">Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#475569]">Preferred Stream</p>
                      <p>{selectedApp.preferred_stream || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#475569]">Preferred Course</p>
                      <p>{selectedApp.preferred_course || 'Not specified'}</p>
                    </div>
                    {selectedApp.preferred_college && (
                      <div className="col-span-2">
                        <p className="text-xs text-[#475569]">Preferred College</p>
                        <p>{selectedApp.preferred_college}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                {(selectedApp.marks_card_url ||
                  selectedApp.scorecard_url ||
                  selectedApp.aadhar_url) && (
                  <div>
                    <h3 className="font-medium text-[#0F172A] mb-3">Documents</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.marks_card_url && (
                        <a
                          href={selectedApp.marks_card_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
                        >
                          <Download className="h-4 w-4" />
                          Marks Card
                        </a>
                      )}
                      {selectedApp.scorecard_url && (
                        <a
                          href={selectedApp.scorecard_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
                        >
                          <Download className="h-4 w-4" />
                          Scorecard
                        </a>
                      )}
                      {selectedApp.aadhar_url && (
                        <a
                          href={selectedApp.aadhar_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100"
                        >
                          <Download className="h-4 w-4" />
                          Aadhar
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* UTM Tracking */}
                {(selectedApp.utm_source || selectedApp.utm_campaign) && (
                  <div>
                    <h3 className="font-medium text-[#0F172A] mb-3">
                      UTM Tracking
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedApp.utm_source && (
                        <div>
                          <p className="text-xs text-[#475569]">Source</p>
                          <p>{selectedApp.utm_source}</p>
                        </div>
                      )}
                      {selectedApp.utm_medium && (
                        <div>
                          <p className="text-xs text-[#475569]">Medium</p>
                          <p>{selectedApp.utm_medium}</p>
                        </div>
                      )}
                      {selectedApp.utm_campaign && (
                        <div>
                          <p className="text-xs text-[#475569]">Campaign</p>
                          <p>{selectedApp.utm_campaign}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assign Counselor */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-3">
                    Assign Counselor
                  </h3>
                  <Select
                    value={selectedApp.counselor_id || 'unassigned'}
                    onValueChange={(value) => {
                      const actualValue = value === 'unassigned' ? '' : value;
                      handleAssignCounselor(selectedApp.id, actualValue);
                      const counselor = counselors.find((c) => c.id === actualValue);
                      setSelectedApp({
                        ...selectedApp,
                        counselor_id: actualValue || null,
                        counselor_name: counselor?.name || null,
                      });
                    }}
                  >
                    <SelectTrigger data-testid="assign-counselor-select">
                      <SelectValue placeholder="Select counselor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {counselors.map((counselor) => (
                        <SelectItem key={counselor.id} value={counselor.id}>
                          {counselor.name} ({counselor.designation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-3">Update Status</h3>
                  <Select
                    value={selectedApp.status}
                    onValueChange={(value) => {
                      handleStatusUpdate(selectedApp.id, value);
                      setSelectedApp({ ...selectedApp, status: value });
                    }}
                  >
                    <SelectTrigger data-testid="update-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <Badge className={status.color}>{status.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="font-medium text-[#0F172A] mb-3">Admin Notes</h3>
                  <Textarea
                    placeholder="Add notes about this application..."
                    defaultValue={selectedApp.admin_notes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== selectedApp.admin_notes) {
                        handleNotesUpdate(selectedApp.id, e.target.value);
                      }
                    }}
                    rows={3}
                    data-testid="admin-notes-textarea"
                  />
                </div>

                {/* Timestamps */}
                <div className="text-xs text-[#475569] pt-4 border-t">
                  <p>Created: {formatDate(selectedApp.created_at)}</p>
                  <p>Updated: {formatDate(selectedApp.updated_at)}</p>
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
      </div>
    </AdminLayout>
  );
}
