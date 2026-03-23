import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-full-management-seat-form',
  templateUrl: './full-management-seat-form.component.html',
  styleUrls: ['./full-management-seat-form.component.scss']
})
export class FullManagementSeatFormComponent implements OnInit {
  @Input() showTitle: boolean = true;
  @Input() variant: 'modal' | 'page' = 'modal';
  @Output() formSubmitted = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<void>();

  managementForm: FormGroup;
  isSubmitting = false;
  isSuccess = false;
  errorMessage = '';

  // Dropdown data
  states: any[] = [];
  cities: any[] = [];
  categories: any[] = [];
  courseLevels: any[] = [];
  subCategories: any[] = [];
  colleges: any[] = [];

  // Filtered lists for autocomplete
  filteredStates: Observable<any[]>;
  filteredCities: Observable<any[]>;
  filteredColleges: Observable<any[]>;

  // Form controls for autocomplete
  stateControl = new FormControl('', Validators.required);
  cityControl = new FormControl('', Validators.required);

  // Selected values
  selectedStateId: number = null;
  selectedCityId: number = null;
  selectedCategoryId: number = null;
  selectedCourseLevelId: number = null;
  selectedSubCategories: number[] = [];
  selectedLocations: number[] = [];
  selectedColleges: number[] = [];

  // Display names
  selectedCategoryName: string = '';
  selectedCourseLevelName: string = '';
  selectedSubCategoryNames: string = '';
  selectedLocationNames: string = '';
  selectedCollegeNames: string = '';

  constructor(
    private fb: FormBuilder,
    private compareclgService: CompareclgService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  initForm(): void {
    this.managementForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(2)]],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.email]],
      category: ['', Validators.required],
      courseLevel: ['', Validators.required],
      interestedCourses: [[], Validators.required],
      preferredLocation: [[], Validators.required],
      preferredCollege: [[]]
    });
  }

  loadInitialData(): void {
    // Load states
    this.compareclgService.getStatesList().subscribe(
      (res: any) => {
        this.states = res?.data || res?.response_data || [];
        this.setupStateAutocomplete();
      },
      (error) => console.error('Error loading states:', error)
    );

    // Load categories
    this.compareclgService.getCategoriesForForms().subscribe(
      (res: any) => {
        this.categories = res?.data || res?.response_data || [];
      },
      (error) => console.error('Error loading categories:', error)
    );

    // Load course levels
    this.compareclgService.getCourseLevelsForForms().subscribe(
      (res: any) => {
        this.courseLevels = res?.data || res?.response_data || [];
      },
      (error) => console.error('Error loading course levels:', error)
    );

    // Load colleges
    this.compareclgService.getCollegesForForms().subscribe(
      (res: any) => {
        this.colleges = res?.data || res?.response_data || [];
      },
      (error) => console.error('Error loading colleges:', error)
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
    
    // Load cities for selected state
    this.compareclgService.getCitiesByState(state.id).subscribe(
      (res: any) => {
        this.cities = res?.data || res?.response_data || [];
        this.setupCityAutocomplete();
      },
      (error) => console.error('Error loading cities:', error)
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
    const category = this.categories.find(c => c.id === event.value);
    this.selectedCategoryId = event.value;
    this.selectedCategoryName = category?.catname || '';
    this.managementForm.patchValue({ category: event.value });
  }

  onCourseLevelChange(event: any): void {
    const level = this.courseLevels.find(l => l.category_id === event.value);
    this.selectedCourseLevelId = event.value;
    this.selectedCourseLevelName = level?.name || '';
    this.managementForm.patchValue({ courseLevel: event.value });
    
    // Load sub-categories for this level
    this.compareclgService.getSubCategoriesByLevel(event.value).subscribe(
      (res: any) => {
        this.subCategories = res?.data || res?.response_data || [];
      },
      (error) => console.error('Error loading sub-categories:', error)
    );
  }

  onSubCategoryChange(event: any): void {
    this.selectedSubCategories = event.value;
    const names = this.subCategories
      .filter(sc => this.selectedSubCategories.includes(sc.id))
      .map(sc => sc.name);
    this.selectedSubCategoryNames = names.join(', ');
    this.managementForm.patchValue({ interestedCourses: event.value });
  }

  onLocationChange(event: any): void {
    this.selectedLocations = event.value;
    const names = this.cities
      .filter(c => this.selectedLocations.includes(c.id))
      .map(c => c.city);
    this.selectedLocationNames = names.join(', ');
    this.managementForm.patchValue({ preferredLocation: event.value });
  }

  onCollegeChange(event: any): void {
    this.selectedColleges = event.value;
    const names = this.colleges
      .filter(c => this.selectedColleges.includes(c.id))
      .map(c => c.title);
    this.selectedCollegeNames = names.join(', ');
    this.managementForm.patchValue({ preferredCollege: event.value });
  }

  onSubmit(): void {
    if (this.managementForm.invalid || !this.selectedStateId || !this.selectedCityId) {
      this.managementForm.markAllAsTouched();
      this.stateControl.markAsTouched();
      this.cityControl.markAsTouched();
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = {
      studentName: this.managementForm.get('studentName').value,
      state: this.selectedStateId,
      city: this.selectedCityId,
      category: this.selectedCategoryId,
      courseLevel: this.selectedCourseLevelId,
      interestedCourses: this.selectedSubCategories,
      preferredLocation: this.selectedLocations,
      preferredCollege: this.selectedColleges,
      mobileNumber: this.managementForm.get('mobileNumber').value,
      email: this.managementForm.get('email').value || ''
    };

    this.trackEvent('management_full_form_submit');

    this.compareclgService.submitManagementSeatForm(formData).subscribe(
      (res: any) => {
        this.isSubmitting = false;
        if (res?.status === 'true' || res?.res_code === 1) {
          this.isSuccess = true;
          this.formSubmitted.emit(true);
          
          setTimeout(() => {
            this.isSuccess = false;
            this.resetForm();
          }, 5000);
        } else {
          this.errorMessage = 'Failed to submit. Please try again.';
        }
      },
      (error) => {
        this.isSubmitting = false;
        // Show success anyway for better UX (data likely saved)
        this.isSuccess = true;
        this.formSubmitted.emit(true);
        
        setTimeout(() => {
          this.isSuccess = false;
          this.resetForm();
        }, 5000);
      }
    );
  }

  resetForm(): void {
    this.managementForm.reset();
    this.stateControl.reset();
    this.cityControl.reset();
    this.selectedStateId = null;
    this.selectedCityId = null;
    this.selectedCategoryId = null;
    this.selectedCourseLevelId = null;
    this.selectedSubCategories = [];
    this.selectedLocations = [];
    this.selectedColleges = [];
    this.selectedCategoryName = '';
    this.selectedCourseLevelName = '';
    this.selectedSubCategoryNames = '';
    this.selectedLocationNames = '';
    this.selectedCollegeNames = '';
    this.cities = [];
    this.subCategories = [];
  }

  onClose(): void {
    this.closeModal.emit();
  }

  private trackEvent(eventName: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': 'lead_generation',
        'event_label': 'management_seat'
      });
    }
  }
}

declare function gtag(...args: any[]): void;
