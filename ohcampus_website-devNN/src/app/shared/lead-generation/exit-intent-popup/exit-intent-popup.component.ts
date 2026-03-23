import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompareclgService } from 'app/modules/service/compareclg.service';

@Component({
  selector: 'app-exit-intent-popup',
  templateUrl: './exit-intent-popup.component.html',
  styleUrls: ['./exit-intent-popup.component.scss']
})
export class ExitIntentPopupComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  isVisible = false;
  hasShown = false;
  quickForm: FormGroup;
  isSubmitting = false;
  isSuccess = false;

  private delayTimer: any;
  private readonly DELAY_MS = 30000; // Show after 30 seconds
  private readonly STORAGE_KEY = 'ohcampus_exit_popup_shown';

  constructor(
    private fb: FormBuilder,
    private compareclgService: CompareclgService
  ) {}

  ngOnInit(): void {
    this.quickForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });

    // Check if popup was already shown in this session
    const hasShownBefore = sessionStorage.getItem(this.STORAGE_KEY);
    if (!hasShownBefore) {
      this.setupTriggers();
    }
  }

  ngOnDestroy(): void {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
    }
  }

  private setupTriggers(): void {
    // Delay-based trigger
    this.delayTimer = setTimeout(() => {
      if (!this.hasShown) {
        this.showPopup();
      }
    }, this.DELAY_MS);
  }

  // Exit intent detection for desktop
  @HostListener('document:mouseout', ['$event'])
  onMouseOut(event: MouseEvent): void {
    if (!this.hasShown && event.clientY <= 0) {
      this.showPopup();
    }
  }

  private showPopup(): void {
    this.isVisible = true;
    this.hasShown = true;
    sessionStorage.setItem(this.STORAGE_KEY, 'true');
    this.trackEvent('exit_popup_shown');
  }

  closePopup(): void {
    this.isVisible = false;
    this.close.emit();
  }

  onSubmit(): void {
    if (this.quickForm.invalid) {
      this.quickForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = {
      phone: this.quickForm.value.phone,
      type: 'scholarship_interest',
      source: 'exit_popup',
      timestamp: new Date().toISOString()
    };

    this.trackEvent('exit_popup_submit');

    this.compareclgService.submitEnquiry(formData).subscribe(
      () => {
        this.isSubmitting = false;
        this.isSuccess = true;
        setTimeout(() => this.closePopup(), 3000);
      },
      () => {
        this.isSubmitting = false;
        this.isSuccess = true;
        setTimeout(() => this.closePopup(), 3000);
      }
    );
  }

  onWhatsAppClick(): void {
    const phone = this.quickForm.get('phone')?.value || '';
    const whatsappNumber = '919876543210';
    const message = encodeURIComponent(
      `Hi, I'm interested in scholarship opportunities. My number is ${phone}. Please contact me.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    this.trackEvent('exit_popup_whatsapp');
    this.closePopup();
  }

  private trackEvent(eventName: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': 'exit_intent',
        'event_label': 'Lead Generation'
      });
    }
  }
}

declare function gtag(...args: any[]): void;
