import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { usersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Search,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Shield,
  UserCog,
  Check,
  X,
  Loader2,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

const DESIGNATIONS = [
  'Admission Counselor',
  'Senior Admission Counselor', 
  'Team Lead',
  'Admission Manager'
];

const getDesignationColor = (designation) => {
  switch (designation) {
    case 'Admission Manager':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Team Lead':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Senior Admission Counselor':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Password reset state
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    designation: '',
    team_lead_id: '',
    phone: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, teamLeadsRes] = await Promise.all([
        usersAPI.getAll(),
        usersAPI.getTeamLeads()
      ]);
      setUsers(usersRes.data);
      setTeamLeads(teamLeadsRes.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDesignation = filterDesignation === 'all' || user.designation === filterDesignation;
    return matchesSearch && matchesDesignation;
  });

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        designation: user.designation || '',
        team_lead_id: user.team_lead_id || '',
        phone: user.phone || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        designation: '',
        team_lead_id: '',
        phone: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.designation) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!editingUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const updateData = {
          name: formData.name,
          designation: formData.designation,
          team_lead_id: formData.team_lead_id || null,
          phone: formData.phone || null
        };
        await usersAPI.update(editingUser.id, updateData);
        toast.success('User updated successfully');
      } else {
        await usersAPI.create(formData);
        toast.success('User created successfully');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await usersAPI.delete(userId);
      toast.success('User deactivated');
      fetchData();
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await usersAPI.update(user.id, { is_active: !user.is_active });
      toast.success(user.is_active ? 'User deactivated' : 'User activated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleOpenResetPassword = (user) => {
    setResetPasswordUser(user);
    setNewPassword('');
    setResetPasswordOpen(true);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setResettingPassword(true);
    try {
      await usersAPI.setPassword(resetPasswordUser.id, newPassword);
      toast.success(`Password reset for ${resetPasswordUser.name}`);
      setResetPasswordOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#0F172A]">
              User Management
            </h1>
            <p className="text-[#475569] font-body mt-1">
              Manage counselor accounts and team assignments
            </p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-[#0066CC] hover:bg-[#0052A3] font-body"
            data-testid="add-user-btn"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Counselor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">
                    {users.length}
                  </p>
                  <p className="text-xs text-[#475569] font-body">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">
                    {users.filter(u => u.is_active !== false).length}
                  </p>
                  <p className="text-xs text-[#475569] font-body">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">
                    {users.filter(u => u.designation === 'Admission Manager').length}
                  </p>
                  <p className="text-xs text-[#475569] font-body">Managers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserCog className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-[#0F172A]">
                    {users.filter(u => u.designation === 'Team Lead').length}
                  </p>
                  <p className="text-xs text-[#475569] font-body">Team Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 font-body"
                  data-testid="user-search"
                />
              </div>
              <Select value={filterDesignation} onValueChange={setFilterDesignation}>
                <SelectTrigger className="w-full md:w-48 h-10" data-testid="designation-filter">
                  <Shield className="h-4 w-4 mr-2 text-[#94A3B8]" />
                  <SelectValue placeholder="Designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {DESIGNATIONS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Counselors ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-[#94A3B8] mb-4" />
                <p className="text-[#475569] font-body">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-heading">Name</TableHead>
                      <TableHead className="font-heading">Email</TableHead>
                      <TableHead className="font-heading">Designation</TableHead>
                      <TableHead className="font-heading">Team Lead</TableHead>
                      <TableHead className="font-heading">Status</TableHead>
                      <TableHead className="font-heading text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-[#0066CC] text-white rounded-full flex items-center justify-center font-heading font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-body font-medium">{user.name}</p>
                              {user.phone && (
                                <p className="text-xs text-[#94A3B8] flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-body">
                          <div className="flex items-center gap-1 text-[#475569]">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getDesignationColor(user.designation)} border`}>
                            {user.designation}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-body text-[#475569]">
                          {user.team_lead_name || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={user.is_active !== false 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                            }
                          >
                            {user.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(user)}
                              data-testid={`edit-user-${user.id}`}
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenResetPassword(user)}
                              data-testid={`reset-password-${user.id}`}
                              title="Reset password"
                            >
                              <Key className="h-4 w-4 text-purple-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(user)}
                              className={user.is_active !== false ? 'text-red-500' : 'text-green-500'}
                              data-testid={`toggle-user-${user.id}`}
                              title={user.is_active !== false ? 'Deactivate' : 'Activate'}
                            >
                              {user.is_active !== false ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                {editingUser ? (
                  <>
                    <Edit className="h-5 w-5 text-[#0066CC]" />
                    Edit Counselor
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 text-[#0066CC]" />
                    Add New Counselor
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="font-body">
                {editingUser 
                  ? 'Update counselor information and team assignment'
                  : 'Create a new counselor account with platform access'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="font-body">Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="mt-1"
                    data-testid="user-name-input"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label className="font-body">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="mt-1"
                    disabled={!!editingUser}
                    data-testid="user-email-input"
                  />
                </div>

                {!editingUser && (
                  <div className="col-span-2">
                    <Label className="font-body">Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      className="mt-1"
                      data-testid="user-password-input"
                    />
                  </div>
                )}

                <div>
                  <Label className="font-body">Designation *</Label>
                  <Select 
                    value={formData.designation} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
                  >
                    <SelectTrigger className="mt-1" data-testid="user-designation-select">
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESIGNATIONS.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-body">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="mt-1"
                    data-testid="user-phone-input"
                  />
                </div>

                {formData.designation && !['Team Lead', 'Admission Manager'].includes(formData.designation) && (
                  <div className="col-span-2">
                    <Label className="font-body">Assign Team Lead</Label>
                    <Select 
                      value={formData.team_lead_id || 'none'} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        team_lead_id: value === 'none' ? '' : value 
                      }))}
                    >
                      <SelectTrigger className="mt-1" data-testid="user-teamlead-select">
                        <SelectValue placeholder="Select team lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Team Lead</SelectItem>
                        {teamLeads.map(tl => (
                          <SelectItem key={tl.id} value={tl.id}>
                            {tl.name} ({tl.designation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-body">
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="font-body bg-[#0066CC] hover:bg-[#0052A3]"
                data-testid="save-user-btn"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {editingUser ? 'Update' : 'Create'} User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-500" />
                Reset Password
              </DialogTitle>
              <DialogDescription className="font-body">
                Set a new password for <strong>{resetPasswordUser?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="font-body">New Password *</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="mt-1"
                data-testid="reset-password-input"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordOpen(false)} className="font-body">
                Cancel
              </Button>
              <Button 
                onClick={handleResetPassword}
                disabled={resettingPassword}
                className="font-body bg-purple-600 hover:bg-purple-700"
                data-testid="confirm-reset-password-btn"
              >
                {resettingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
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
