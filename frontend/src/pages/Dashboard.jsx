import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { filtersAPI, collegesAPI, seedAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { 
  Search, 
  MapPin, 
  Building2, 
  GraduationCap, 
  Star,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
  GitCompare,
  BookOpen,
  X,
  ChevronDown,
  Check,
  IndianRupee,
  Layers,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// Multi-select filter component with search
function MultiSelectFilter({ 
  options, 
  selected, 
  onSelectionChange, 
  placeholder, 
  icon: Icon,
  testId
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(opt => 
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onSelectionChange(selected.filter(s => s !== option));
    } else {
      onSelectionChange([...selected, option]);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full lg:w-52 h-12 justify-between font-body border-slate-300 hover:bg-slate-50"
          data-testid={testId}
        >
          <div className="flex items-center gap-2 truncate">
            {Icon && <Icon className="h-4 w-4 text-[#94A3B8] flex-shrink-0" />}
            {selected.length === 0 ? (
              <span className="text-[#94A3B8]">{placeholder}</span>
            ) : selected.length === 1 ? (
              <span className="truncate">{selected[0]}</span>
            ) : (
              <span className="truncate">{selected.length} selected</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selected.length > 0 && (
              <button 
                onClick={clearSelection} 
                className="p-1 hover:bg-slate-200 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => toggleOption(option)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Checkbox 
                      checked={selected.includes(option)}
                      className="pointer-events-none"
                    />
                    <span className="truncate">{option}</span>
                  </div>
                  {selected.includes(option) && (
                    <Check className="h-4 w-4 text-[#0066CC] ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selected.length > 0 && (
          <div className="p-2 border-t border-slate-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onSelectionChange([])}
              className="w-full text-xs"
            >
              Clear all ({selected.length})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState({ states: [], cities: [], categories: [], courses: [] });
  const [selectedFilters, setSelectedFilters] = useState({ 
    states: [], 
    cities: [], 
    categories: [], 
    courses: [],
    level: '',
    feeRange: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const navigate = useNavigate();

  // Fee range and level options (First Year fees only)
  const feeRangeOptions = [
    { value: '', label: 'All Fee Ranges' },
    { value: 'below_100000', label: '1st Year < ₹1L' },
    { value: '100000_to_200000', label: '1st Year ₹1L-₹2L' },
    { value: 'above_200000', label: '1st Year > ₹2L' }
  ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'UG', label: 'Undergraduate (UG)' },
    { value: 'PG', label: 'Postgraduate (PG)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Certificate', label: 'Certificate' }
  ];

  // Fetch filters
  const fetchFilters = useCallback(async () => {
    try {
      setFiltersLoading(true);
      const response = await filtersAPI.getAll();
      setFilters(response.data);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  // Fetch colleges with multi-select filters
  const fetchColleges = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      // For multi-select, we'll filter on the frontend for now
      // Backend can be extended to support comma-separated values
      if (selectedFilters.states.length === 1) {
        params.state = selectedFilters.states[0];
      }
      if (selectedFilters.cities.length === 1) {
        params.city = selectedFilters.cities[0];
      }
      if (selectedFilters.categories.length === 1) {
        params.category = selectedFilters.categories[0];
      }
      if (selectedFilters.courses.length === 1) {
        params.course = selectedFilters.courses[0];
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      // New filters
      if (selectedFilters.level) {
        params.level = selectedFilters.level;
      }
      if (selectedFilters.feeRange) {
        params.fee_range = selectedFilters.feeRange;
      }
      
      const response = await collegesAPI.getAll(params);
      let filteredColleges = response.data;
      
      // Client-side filtering for multi-select
      if (selectedFilters.states.length > 1) {
        filteredColleges = filteredColleges.filter(c => 
          selectedFilters.states.includes(c.state)
        );
      }
      if (selectedFilters.cities.length > 1) {
        filteredColleges = filteredColleges.filter(c => 
          selectedFilters.cities.includes(c.city)
        );
      }
      if (selectedFilters.categories.length > 1) {
        filteredColleges = filteredColleges.filter(c => 
          selectedFilters.categories.includes(c.category)
        );
      }

      // Client-side filtering for address search
      if (addressSearchQuery) {
        const addressQuery = addressSearchQuery.toLowerCase();
        filteredColleges = filteredColleges.filter(c => 
          (c.address && c.address.toLowerCase().includes(addressQuery)) ||
          (c.city && c.city.toLowerCase().includes(addressQuery)) ||
          (c.state && c.state.toLowerCase().includes(addressQuery))
        );
      }
      
      setColleges(filteredColleges);
    } catch (error) {
      console.error('Failed to fetch colleges:', error);
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  }, [selectedFilters, searchQuery, addressSearchQuery]);

  // Seed database
  const handleSeed = async () => {
    try {
      setSeeding(true);
      const response = await seedAPI.seed();
      toast.success(response.data.message);
      fetchFilters();
      fetchColleges();
    } catch (error) {
      toast.error('Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Update cities when state changes
  const handleStateChange = async (states) => {
    setSelectedFilters(prev => ({ ...prev, states, cities: [] }));
    if (states.length === 1) {
      try {
        const response = await filtersAPI.getCitiesByState(states[0]);
        setFilters(prev => ({ ...prev, cities: response.data.cities }));
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    } else if (states.length === 0) {
      const response = await filtersAPI.getAll();
      setFilters(prev => ({ ...prev, cities: response.data.cities }));
    }
  };

  const clearFilters = () => {
    setSelectedFilters({ states: [], cities: [], categories: [], courses: [], level: '', feeRange: '' });
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedFilters.states.length > 0 || 
    selectedFilters.cities.length > 0 || 
    selectedFilters.categories.length > 0 || 
    selectedFilters.courses.length > 0 ||
    selectedFilters.level ||
    selectedFilters.feeRange ||
    searchQuery;

  const toggleCompareSelection = (college) => {
    if (selectedForCompare.find(c => c.id === college.id)) {
      setSelectedForCompare(prev => prev.filter(c => c.id !== college.id));
    } else {
      if (selectedForCompare.length >= 4) {
        toast.error('You can compare maximum 4 colleges');
        return;
      }
      setSelectedForCompare(prev => [...prev, college]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Select at least 2 colleges to compare');
      return;
    }
    const ids = selectedForCompare.map(c => c.id).join(',');
    navigate(`/compare?colleges=${ids}`);
  };

  const collegeImages = [
    'https://images.unsplash.com/photo-1664273891579-22f28332f3c4?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1760131556605-7f2e63d00385?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1670284768187-5cc68eada1b3?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
    'https://images.unsplash.com/photo-1759299615947-bc798076b479?crop=entropy&cs=srgb&fm=jpg&q=85&w=800',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0066CC] to-[#0052A3] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Find Featured Colleges
          </h1>
          <p className="text-lg text-blue-100 font-body max-w-2xl">
            Explore top-rated colleges across India. Filter by state, city, category, or course to find the perfect institution.
          </p>
        </div>
      </div>

      {/* Compare Mode Banner - Fixed z-index and positioning */}
      {compareMode && (
        <div className="bg-[#FF6B35] text-white py-3 px-4 relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <GitCompare className="h-5 w-5 flex-shrink-0" />
              <span className="font-body font-medium">
                Comparison Mode: {selectedForCompare.length}/4 colleges selected
              </span>
              {selectedForCompare.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedForCompare.map(c => (
                    <Badge key={c.id} variant="secondary" className="bg-white/20 text-white">
                      {c.name.split(' ')[0]}
                      <button 
                        onClick={() => toggleCompareSelection(c)}
                        className="ml-1 hover:text-red-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleCompare}
                disabled={selectedForCompare.length < 2}
                className="bg-white text-[#FF6B35] hover:bg-blue-50 font-body rounded-full"
                data-testid="compare-btn"
              >
                Compare Now
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCompareMode(false);
                  setSelectedForCompare([]);
                }}
                className="text-white hover:bg-white/20 font-body"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section - Fixed z-index */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* First Row - Search and Compare Toggle */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <Input
                    placeholder="Search colleges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 font-body border-slate-300 focus:ring-[#0066CC] focus:border-[#0066CC]"
                    data-testid="search-input"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <Input
                    placeholder="Search by address (e.g., Bangalore, BTM, Tumkur)..."
                    value={addressSearchQuery}
                    onChange={(e) => setAddressSearchQuery(e.target.value)}
                    className="pl-10 h-12 font-body border-slate-300 focus:ring-[#0066CC] focus:border-[#0066CC]"
                    data-testid="address-search-input"
                  />
                </div>
                {!compareMode && (
                  <Button
                    onClick={() => setCompareMode(true)}
                    variant="outline"
                    className="h-12 px-6 font-body border-[#0066CC] text-[#0066CC] hover:bg-blue-50"
                    data-testid="enable-compare-btn"
                  >
                    <GitCompare className="h-4 w-4 mr-2" />
                    Compare Colleges
                  </Button>
                )}
              </div>

              {/* Second Row - Multi-Select Filters */}
              <div className="flex flex-col lg:flex-row gap-4 flex-wrap">
                {/* State Filter - Multi-select with search */}
                <MultiSelectFilter
                  options={filters.states}
                  selected={selectedFilters.states}
                  onSelectionChange={handleStateChange}
                  placeholder="Select States"
                  icon={MapPin}
                  testId="state-filter"
                />

                {/* City Filter - Multi-select with search */}
                <MultiSelectFilter
                  options={filters.cities}
                  selected={selectedFilters.cities}
                  onSelectionChange={(cities) => setSelectedFilters(prev => ({ ...prev, cities }))}
                  placeholder="Select Cities"
                  icon={Building2}
                  testId="city-filter"
                />

                {/* Category Filter - Multi-select with search */}
                <MultiSelectFilter
                  options={filters.categories}
                  selected={selectedFilters.categories}
                  onSelectionChange={(categories) => setSelectedFilters(prev => ({ ...prev, categories }))}
                  placeholder="Select Categories"
                  icon={GraduationCap}
                  testId="category-filter"
                />

                {/* Course Filter - Multi-select with search */}
                <MultiSelectFilter
                  options={filters.courses}
                  selected={selectedFilters.courses}
                  onSelectionChange={(courses) => setSelectedFilters(prev => ({ ...prev, courses }))}
                  placeholder="Select Courses"
                  icon={BookOpen}
                  testId="course-filter"
                />

                {/* Course Level Filter */}
                <Select 
                  value={selectedFilters.level || "all"} 
                  onValueChange={(level) => setSelectedFilters(prev => ({ ...prev, level: level === "all" ? "" : level }))}
                >
                  <SelectTrigger className="w-full lg:w-[180px] h-12 font-body bg-white" data-testid="level-filter">
                    <Layers className="h-4 w-4 mr-2 text-[#94A3B8]" />
                    <SelectValue placeholder="Course Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map(opt => (
                      <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Fee Range Filter */}
                <Select 
                  value={selectedFilters.feeRange || "all"} 
                  onValueChange={(feeRange) => setSelectedFilters(prev => ({ ...prev, feeRange: feeRange === "all" ? "" : feeRange }))}
                >
                  <SelectTrigger className="w-full lg:w-[180px] h-12 font-body bg-white" data-testid="fee-range-filter">
                    <IndianRupee className="h-4 w-4 mr-2 text-[#94A3B8]" />
                    <SelectValue placeholder="Fee Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeRangeOptions.map(opt => (
                      <SelectItem key={opt.value || "all"} value={opt.value || "all"}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-12 px-4 font-body border-red-300 text-red-600 hover:bg-red-50"
                    data-testid="clear-filters-btn"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-sm text-[#475569] font-body">Active filters:</span>
                  {selectedFilters.states.map(s => (
                    <Badge key={s} variant="secondary" className="bg-blue-100 text-blue-700">
                      <MapPin className="h-3 w-3 mr-1" />
                      {s}
                      <button onClick={() => handleStateChange(selectedFilters.states.filter(x => x !== s))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedFilters.cities.map(c => (
                    <Badge key={c} variant="secondary" className="bg-green-100 text-green-700">
                      <Building2 className="h-3 w-3 mr-1" />
                      {c}
                      <button onClick={() => setSelectedFilters(prev => ({ ...prev, cities: prev.cities.filter(x => x !== c) }))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedFilters.categories.map(cat => (
                    <Badge key={cat} variant="secondary" className="bg-purple-100 text-purple-700">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {cat}
                      <button onClick={() => setSelectedFilters(prev => ({ ...prev, categories: prev.categories.filter(x => x !== cat) }))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedFilters.courses.map(course => (
                    <Badge key={course} variant="secondary" className="bg-orange-100 text-orange-700">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {course.length > 20 ? course.substring(0, 20) + '...' : course}
                      <button onClick={() => setSelectedFilters(prev => ({ ...prev, courses: prev.courses.filter(x => x !== course) }))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedFilters.level && (
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                      <Layers className="h-3 w-3 mr-1" />
                      {levelOptions.find(o => o.value === selectedFilters.level)?.label || selectedFilters.level}
                      <button onClick={() => setSelectedFilters(prev => ({ ...prev, level: '' }))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedFilters.feeRange && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <IndianRupee className="h-3 w-3 mr-1" />
                      {feeRangeOptions.find(o => o.value === selectedFilters.feeRange)?.label || selectedFilters.feeRange}
                      <button onClick={() => setSelectedFilters(prev => ({ ...prev, feeRange: '' }))} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      <Search className="h-3 w-3 mr-1" />
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold text-[#0F172A]">
              Featured Colleges
            </h2>
            <p className="text-[#475569] font-body mt-1">
              {loading ? 'Loading...' : `${colleges.length} colleges found`}
            </p>
          </div>
          {colleges.length === 0 && !loading && (
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-body rounded-full"
              data-testid="seed-database-btn"
            >
              {seeding ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Load Sample Data
                </>
              )}
            </Button>
          )}
        </div>

        {/* College Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <Card className="p-12 text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-[#94A3B8] mb-4" />
            <h3 className="text-xl font-heading font-semibold text-[#0F172A] mb-2">
              No Colleges Found
            </h3>
            <p className="text-[#475569] font-body mb-6">
              Try adjusting your filters or load sample data to get started.
            </p>
            <Button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-[#0066CC] hover:bg-[#0052A3] text-white font-body rounded-full"
            >
              {seeding ? 'Loading...' : 'Load Sample Data'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {colleges.map((college, index) => (
              <Card 
                key={college.id} 
                className={`overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 animate-fade-in border-l-4 border-l-[#0066CC] ${
                  selectedForCompare.find(c => c.id === college.id) ? 'ring-2 ring-[#FF6B35]' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={(e) => {
                  if (compareMode) {
                    toggleCompareSelection(college);
                  } else {
                    // Open in new tab
                    window.open(`/college/${college.id}`, '_blank');
                  }
                }}
                data-testid={`college-card-${college.id}`}
              >
                <CardContent className="p-3">
                  {/* Header with Featured Badge and Compare Selection */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Badge className="bg-[#FF6B35] hover:bg-[#FF6B35] text-white font-body text-[10px] px-1.5 py-0">
                        <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                        Featured
                      </Badge>
                      {college.admission_alerts && college.admission_alerts.length > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-500 text-white font-body text-[10px] px-1.5 py-0 animate-pulse">
                          {college.admission_alerts.length}
                        </Badge>
                      )}
                    </div>
                    {compareMode && (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedForCompare.find(c => c.id === college.id) 
                          ? 'bg-[#FF6B35] border-[#FF6B35]' 
                          : 'bg-white border-slate-300'
                      }`}>
                        {selectedForCompare.find(c => c.id === college.id) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {/* College Name with Icon */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0066CC] to-[#0052A3] flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-heading font-semibold text-[#0F172A] line-clamp-2 group-hover:text-[#0066CC] transition-colors leading-tight">
                        {college.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[#475569] font-body text-xs mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{college.city}, {college.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <div className="bg-slate-50 rounded p-1.5">
                      <p className="text-[10px] text-[#94A3B8] font-body">Category</p>
                      <p className="text-xs font-body font-medium text-[#0F172A] truncate">{college.category}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-1.5">
                      <p className="text-[10px] text-[#94A3B8] font-body">Established</p>
                      <p className="text-xs font-body font-medium text-[#0F172A]">{college.established_year || college.established || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Accreditation */}
                  {college.accreditation && (
                    <div className="flex items-center gap-1.5 mb-2 p-1.5 bg-blue-50 rounded">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0066CC]"></div>
                      <span className="text-[10px] text-[#0066CC] font-body font-medium truncate">
                        {college.accreditation}
                      </span>
                    </div>
                  )}

                  {/* View Details Link */}
                  {!compareMode && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-[#94A3B8] font-body">
                        {college.courses?.length || college.course_count || 0} Courses
                      </span>
                      <div className="flex items-center text-[#0066CC] font-body text-xs font-semibold group-hover:gap-1 transition-all">
                        View
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
