import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collegesAPI, feesAPI, faqsAPI, coursesAPI } from '../../lib/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  LayoutDashboard,
  IndianRupee,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Building2,
  Users,
  BarChart3,
  Activity,
  FileText,
} from 'lucide-react';

const sidebarItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    name: 'Performance',
    icon: BarChart3,
    path: '/admin/performance',
  },
  {
    name: 'Scholarship Applications',
    icon: FileText,
    path: '/admin/scholarship-applications',
  },
  {
    name: 'College Management',
    icon: Building2,
    path: '/admin/colleges',
  },
  {
    name: 'User Management',
    icon: Users,
    path: '/admin/users',
  },
  {
    name: 'Fee Management',
    icon: IndianRupee,
    path: '/admin/fees',
  },
  {
    name: 'FAQ Management',
    icon: HelpCircle,
    path: '/admin/faqs',
  },
  {
    name: 'Activity Log',
    icon: Activity,
    path: '/admin/activity-log',
  },
];

export const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ colleges: 0, fees: 0, faqs: 0, courses: 0 });
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      const [collegesRes, feesRes, faqsRes, coursesRes] = await Promise.all([
        collegesAPI.getAll({}),
        feesAPI.getAll({}),
        faqsAPI.getAll({}),
        coursesAPI.getAllWithCollege({ limit: 1 }), // Just need total count
      ]);
      setStats({
        colleges: (collegesRes.data || []).length,
        fees: (feesRes.data || []).length,
        faqs: (faqsRes.data || []).length,
        courses: coursesRes.data?.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <Link to="/admin" className="flex items-center gap-2">
            <img 
              src="https://ohcampus.com/assets/images/logo/logo.png" 
              alt="OhCampus" 
              className="h-8"
              data-testid="admin-sidebar-logo"
            />
            <Badge className="bg-[#0066CC] text-white text-xs">Admin</Badge>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-all
                  ${isActive 
                    ? 'bg-[#0066CC] text-white' 
                    : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <Building2 className="h-5 w-5 mx-auto text-[#0066CC] mb-1" />
              <span className="block text-lg font-heading font-bold text-[#0F172A]">{stats.colleges}</span>
              <span className="text-xs font-body text-[#475569]">Colleges</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <GraduationCap className="h-5 w-5 mx-auto text-[#FF6B35] mb-1" />
              <span className="block text-lg font-heading font-bold text-[#0F172A]">{stats.courses}</span>
              <span className="text-xs font-body text-[#475569]">Courses</span>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0066CC] flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-medium text-[#0F172A] truncate">
                {user?.name}
              </p>
              <p className="text-xs font-body text-[#475569] truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-[#475569] hover:text-red-600"
              data-testid="admin-logout-btn"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
            data-testid="mobile-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-heading font-semibold text-[#0F172A]">
            Admin Panel
          </h1>
          <div className="ml-auto">
            <Link to="/dashboard">
              <Button variant="outline" className="font-body text-sm">
                View Counselor Portal
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
