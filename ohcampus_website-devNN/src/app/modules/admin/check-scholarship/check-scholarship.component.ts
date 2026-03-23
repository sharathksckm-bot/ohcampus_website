import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-check-scholarship',
  templateUrl: './check-scholarship.component.html',
  styleUrls: ['./check-scholarship.component.scss']
})
export class CheckScholarshipComponent implements OnInit {
  scholarshipForm: FormGroup;
  isSubmitting = false;
  isSuccess = false;
  errorMessage = '';

  // Dropdown data
  states: any[] = [];
  cities: any[] = [];
  categories: any[] = [];
  courseLevels: any[] = [];
  subCategories: any[] = [];

  // Filtered lists
  filteredStates: Observable<any[]>;
  filteredCities: Observable<any[]>;

  // Form controls
  stateControl = new FormControl('', Validators.required);
  cityControl = new FormControl('', Validators.required);

  // Selected values
  selectedStateId: number = null;
  selectedCityId: number = null;
  selectedCategoryId: number = null;
  selectedCourseLevelId: number = null;
  selectedSubCategories: number[] = [];
  selectedLocations: number[] = [];

  // Scholarship benefits
  scholarshipBenefits = [
    { icon: 'school', title: 'Merit Scholarships', desc: 'Based on academic performance' },
    { icon: 'account_balance_wallet', title: 'Need-based Aid', desc: 'Financial assistance for deserving students' },
    { icon: 'sports', title: 'Sports Quota', desc: 'For outstanding sportspersons' },
    { icon: 'diversity_3', title: 'Category Benefits', desc: 'Special scholarships for reserved categories' }
  ];

  // FAQ
  faqs = [
    { 
      question: 'What is the maximum scholarship amount?', 
      answer: 'Scholarships can range from ₹50,000 to ₹2,00,000 depending on the category and eligibility criteria.',
      open: false
    },
    { 
      question: 'Who is eligible for scholarships?', 
      answer: 'Students with good academic records, sports achievements, or those from economically weaker sections are eligible.',
      open: false
    },
    { 
      question: 'How long does the process take?', 
      answer: 'Our team will contact you within 24-48 hours to discuss your eligibility and guide you through the process.',
      open: false
    },
    { 
      question: 'Is there any fee for counseling?', 
      answer: 'No, our scholarship counseling and eligibility check is completely free of charge.',
      open: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private compareclgService: CompareclgService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.trackPageView();
  }

  initForm(): void {
    this.scholarshipForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(2)]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.email]],
      category: ['', Validators.required],
      courseLevel: ['', Validators.required],
      interestedCourses: [[], Validators.required],
      preferredLocation: [[], Validators.required],
      annualIncome: [''],
      percentage: ['']
    });
  }

  loadInitialData(): void {
    this.compareclgService.getStatesList().subscribe(
      (res: any) => {
        this.states = res?.data || res?.response_data || [];
        this.setupStateAutocomplete();
      }
    );

    this.compareclgService.getCategoriesForForms().subscribe(
      (res: any) => {
        this.categories = res?.data || res?.response_data || [];
      }
    );

    this.compareclgService.getCourseLevelsForForms().subscribe(
      (res: any) => {
        this.courseLevels = res?.data || res?.response_data || [];
      }
    );
  }

  setupStateAutocomplete(): void {
    this.filteredStates = this.stateControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterStates(value || ''))
    );
  }

  private _filterStates(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.states.filter(state => 
      state.statename?.toLowerCase().includes(filterValue)
    );
  }

  onStateSelected(state: any): void {
    this.selectedStateId = state.id;
    this.cityControl.setValue('');
    this.selectedCityId = null;
    
    this.compareclgService.getCitiesByState(state.id).subscribe(
      (res: any) => {
        this.cities = res?.data || res?.response_data || [];
        this.setupCityAutocomplete();
      }
    );
  }

  setupCityAutocomplete(): void {
    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCities(value || ''))
    );
  }

  private _filterCities(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => 
      city.city?.toLowerCase().includes(filterValue)
    );
  }

  onCitySelected(city: any): void {
    this.selectedCityId = city.id;
  }

  onCategoryChange(event: any): void {
    this.selectedCategoryId = event.value;
    this.scholarshipForm.patchValue({ category: event.value });
  }

  onCourseLevelChange(event: any): void {
    this.selectedCourseLevelId = event.value;
    this.scholarshipForm.patchValue({ courseLevel: event.value });
    
    this.compareclgService.getSubCategoriesByLevel(event.value).subscribe(
      (res: any) => {
        this.subCategories = res?.data || res?.response_data || [];
      }
    );
  }

  onSubCategoryChange(event: any): void {
    this.selectedSubCategories = event.value;
    this.scholarshipForm.patchValue({ interestedCourses: event.value });
  }

  onLocationChange(event: any): void {
    this.selectedLocations = event.value;
    this.scholarshipForm.patchValue({ preferredLocation: event.value });
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  onSubmit(): void {
    if (this.scholarshipForm.invalid || !this.selectedStateId || !this.selectedCityId) {
      this.scholarshipForm.markAllAsTouched();
      this.stateControl.markAsTouched();
      this.cityControl.markAsTouched();
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Use the same Management Seat API endpoint
    const formData = {
      studentName: this.scholarshipForm.get('studentName').value,
      state: this.selectedStateId,
      city: this.selectedCityId,
      category: this.selectedCategoryId,
      courseLevel: this.selectedCourseLevelId,
      interestedCourses: this.selectedSubCategories,
      preferredLocation: this.selectedLocations,
      preferredCollege: [],
      mobileNumber: this.scholarshipForm.get('mobileNumber').value,
      email: this.scholarshipForm.get('email').value || ''
    };

    this.trackEvent('scholarship_form_submit');

    this.compareclgService.submitManagementSeatForm(formData).subscribe(
      (res: any) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.trackEvent('scholarship_form_success');
      },
      (error) => {
        this.isSubmitting = false;
        this.isSuccess = true; // Show success for UX
      }
    );
  }

  private trackPageView(): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        'page_title': 'Check Scholarship',
        'page_location': window.location.href
      });
    }
  }

  private trackEvent(eventName: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': 'scholarship',
        'event_label': 'check_scholarship_page'
      });
    }
  }
}

declare function gtag(...args: any[]): void;
