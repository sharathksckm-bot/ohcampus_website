import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompareclgService } from 'app/modules/service/compareclg.service';

@Component({
  selector: 'app-management-seat-form',
  templateUrl: './management-seat-form.component.html',
  styleUrls: ['./management-seat-form.component.scss']
})
export class ManagementSeatFormComponent implements OnInit {
  @Input() collegeName: string = '';
  @Input() collegeId: string = '';
  @Input() courseName: string = '';
  @Input() variant: 'inline' | 'card' = 'card';

  quickForm: FormGroup;
  isSubmitting = false;
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private compareclgService: CompareclgService
  ) {}

  ngOnInit(): void {
    this.quickForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  onSubmit(): void {
    if (this.quickForm.invalid) {
      this.quickForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    
    const formData = {
      ...this.quickForm.value,
      college_id: this.collegeId,
      college_name: this.collegeName,
      course_name: this.courseName,
      type: 'management_seat',
      source: 'website_quick_form',
      timestamp: new Date().toISOString()
    };

    this.trackEvent('management_form_submit');

    this.compareclgService.submitManagementEnquiry(formData).subscribe(
      (res: any) => {
        this.isSubmitting = false;
        this.isSuccess = true;
        
        setTimeout(() => {
          this.isSuccess = false;
          this.quickForm.reset();
        }, 5000);
      },
      (error) => {
        this.isSubmitting = false;
        this.isSuccess = true; // Show success anyway for UX
        
        setTimeout(() => {
          this.isSuccess = false;
          this.quickForm.reset();
        }, 5000);
      }
    );
  }

  onWhatsAppClick(): void {
    const name = this.quickForm.get('name')?.value || '';
    const phone = this.quickForm.get('phone')?.value || '';
    const whatsappNumber = '919876543210';
    
    let message = `Hi, I'm ${name}. I'm interested in Management Seat assistance`;
    if (this.collegeName) {
      message += ` for ${this.collegeName}`;
    }
    if (this.courseName) {
      message += ` - ${this.courseName}`;
    }
    message += `. My number is ${phone}. Please contact me.`;
    
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    this.trackEvent('management_whatsapp_click');
  }

  private trackEvent(eventName: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': 'management_seat_form',
        'event_label': this.collegeName || 'general'
      });
    }
  }
}

declare function gtag(...args: any[]): void;
