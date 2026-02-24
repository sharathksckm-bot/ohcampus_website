import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { User, LogOut, Settings, LayoutDashboard, Building2, BookOpen, UserPlus, BarChart3, GraduationCap } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Check if user can see Performance tab (Team Lead or Admission Manager)
  const canSeePerformance = user?.designation === 'Team Lead' || user?.designation === 'Admission Manager';

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin() ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            <img 
              src="https://ohcampus.com/assets/images/logo/logo.png" 
              alt="OhCampus" 
              className="h-10"
              data-testid="navbar-logo"
            />
            <span className="hidden sm:block text-sm font-body text-[#475569] border-l border-slate-300 pl-3 ml-1">
              Counselor Portal
            </span>
          </Link>

          {/* Center Navigation - Only for logged-in non-admin users */}
          {user && !isAdmin() && (
            <div className="hidden md:flex items-center gap-1">
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  className={`font-body ${isActiveLink('/dashboard') ? 'bg-blue-50 text-[#0066CC]' : 'text-[#475569] hover:text-[#0066CC]'}`}
                  data-testid="nav-colleges"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Colleges
                </Button>
              </Link>
              <Link to="/courses">
                <Button 
                  variant="ghost" 
                  className={`font-body ${isActiveLink('/courses') ? 'bg-blue-50 text-[#0066CC]' : 'text-[#475569] hover:text-[#0066CC]'}`}
                  data-testid="nav-courses"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Courses
                </Button>
              </Link>
              <Link to="/admissions">
                <Button 
                  variant="ghost" 
                  className={`font-body ${isActiveLink('/admissions') ? 'bg-blue-50 text-[#0066CC]' : 'text-[#475569] hover:text-[#0066CC]'}`}
                  data-testid="nav-admissions"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Admissions
                </Button>
              </Link>
              <Link to="/scholarships">
                <Button 
                  variant="ghost" 
                  className={`font-body ${isActiveLink('/scholarships') ? 'bg-blue-50 text-[#0066CC]' : 'text-[#475569] hover:text-[#0066CC]'}`}
                  data-testid="nav-scholarships"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Scholarships
                </Button>
              </Link>
              {canSeePerformance && (
                <Link to="/performance">
                  <Button 
                    variant="ghost" 
                    className={`font-body ${isActiveLink('/performance') ? 'bg-blue-50 text-[#0066CC]' : 'text-[#475569] hover:text-[#0066CC]'}`}
                    data-testid="nav-performance"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 font-body hover:bg-slate-100"
                    data-testid="user-menu-btn"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0066CC] flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-[#0F172A] font-medium">
                      {user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 font-body">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-[#0F172A]">{user.name}</p>
                      <p className="text-xs text-[#475569]">{user.email}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#0066CC] text-white w-fit mt-1">
                        {user.role}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigate(isAdmin() ? '/admin' : '/dashboard')}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  {!isAdmin() && (
                    <>
                      <DropdownMenuItem 
                        className="cursor-pointer md:hidden"
                        onClick={() => navigate('/courses')}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Courses
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer md:hidden"
                        onClick={() => navigate('/admissions')}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Admissions
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer md:hidden"
                        onClick={() => navigate('/scholarships')}
                      >
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Scholarships
                      </DropdownMenuItem>
                      {canSeePerformance && (
                        <DropdownMenuItem 
                          className="cursor-pointer md:hidden"
                          onClick={() => navigate('/performance')}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Performance
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigate('/profile')}
                    data-testid="profile-link"
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                    data-testid="logout-btn"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className="font-body text-[#0F172A] hover:text-[#0066CC]"
                    data-testid="login-nav-btn"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-body rounded-full px-6"
                    data-testid="register-nav-btn"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
