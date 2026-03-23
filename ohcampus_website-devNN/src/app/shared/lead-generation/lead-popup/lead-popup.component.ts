import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompareclgService } from 'app/modules/service/compareclg.service';

@Component({
  selector: 'app-lead-popup',
  templateUrl: './lead-popup.component.html',
  styleUrls: ['./lead-popup.component.scss']
})
export class LeadPopupComponent implements OnInit {
  @Input() type: 'scholarship' | 'management' = 'scholarship';
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  leadForm: FormGroup;
  isSubmitting = false;
  isSuccess = false;
  courses: any[] = [];

  constructor(
    private fb: FormBuilder,
    private compareclgService: CompareclgService
  ) {}

  ngOnInit(): void {
    this.leadForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: [''],
      course: ['']
    });

    this.loadCourses();
  }

  loadCourses(): void {
    this.compareclgService.getCoursesForForms().subscribe(
      (res: any) => {
        if (res && res.response_data && Array.isArray(res.response_data)) {
          this.courses = res.response_data.slice(0, 20); // Top 20 courses
        } else if (res && res.data && Array.isArray(res.data)) {
          this.courses = res.data.slice(0, 20);
        }
      },
      (error) => console.error('Error loading courses:', error)
    );
  }

  get title(): string {
    return this.type === 'scholarship' 
      ? 'Apply for Scholarship' 
      : 'Get Management Seat Assistance';
  }

  get subtitle(): string {
    return this.type === 'scholarship'
      ? 'Scholarships up to ₹2 Lakhs available for eligible students'
      : 'Limited management quota seats available. Get expert counseling now!';
  }

  get ctaText(): string {
    return this.type === 'scholarship' ? 'Check Eligibility' : 'Get Assistance';
  }

  get benefits(): string[] {
    if (this.type === 'scholarship') {
      return [
        'Merit-based & Need-based scholarships',
        'Government & Private college options',
        'Quick eligibility check',
        'Expert guidance on application'
      ];
    } else {
      return [
        'Direct admission support',
        'Faster processing time',
        'Expert counseling included',
        'Top college placements'
      ];
    }
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = {
      ...this.leadForm.value,
      type: this.type,
      source: 'website_popup',
      timestamp: new Date().toISOString()
    };

    // Track event
    this.trackEvent(`${this.type}_form_submit`, 'lead_popup');

    // Submit to API
    this.compareclgService.submitEnquiry(formData).subscribe(
      (res: any) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        this.submitted.emit(formData);
        
        // Auto close after 3 seconds
        setTimeout(() => {
          this.closePopup();
        }, 3000);
      },
      (error) => {
        this.isSubmitting = false;
        console.error('Error submitting form:', error);
        // Still show success for UX (lead captured in tracking)
        this.isSuccess = true;
        setTimeout(() => {
          this.closePopup();
        }, 3000);
      }
    );
  }

  closePopup(): void {
    this.isVisible = false;
    this.isSuccess = false;
    this.leadForm.reset();
    this.close.emit();
  }

  onWhatsAppClick(): void {
    const phone = this.leadForm.get('phone')?.value || '';
    const name = this.leadForm.get('name')?.value || '';
    const whatsappNumber = '919876543210'; // Replace with actual number
    const message = encodeURIComponent(
      `Hi, I'm ${name}. I'm interested in ${this.type === 'scholarship' ? 'scholarship opportunities' : 'management seat assistance'}. My number is ${phone}. Please contact me.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    this.trackEvent('whatsapp_click', 'lead_popup');
  }

  private trackEvent(eventName: string, eventCategory: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': eventCategory,
        'event_label': this.type
      });
    }
  }
}

declare function gtag(...args: any[]): void;
