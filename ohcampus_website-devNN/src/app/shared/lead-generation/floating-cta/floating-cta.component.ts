import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-floating-cta',
  templateUrl: './floating-cta.component.html',
  styleUrls: ['./floating-cta.component.scss'],
  animations: [
    trigger('slideIn', [
      state('hidden', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('hidden => visible', animate('300ms ease-out')),
      transition('visible => hidden', animate('300ms ease-in'))
    ]),
    trigger('pulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulsed', style({ transform: 'scale(1.05)' })),
      transition('normal <=> pulsed', animate('500ms ease-in-out'))
    ])
  ]
})
export class FloatingCtaComponent implements OnInit {
  @Output() openScholarshipForm = new EventEmitter<void>();
  @Output() openManagementSeatForm = new EventEmitter<void>();
  @Output() openWhatsApp = new EventEmitter<void>();

  isExpanded = false;
  isVisible = true;
  pulseState = 'normal';
  currentCTA: 'scholarship' | 'management' = 'scholarship';

  private ctaInterval: any;
  private pulseInterval: any;

  ngOnInit(): void {
    // Rotate CTAs every 5 seconds
    this.ctaInterval = setInterval(() => {
      this.currentCTA = this.currentCTA === 'scholarship' ? 'management' : 'scholarship';
    }, 5000);

    // Pulse animation every 3 seconds
    this.pulseInterval = setInterval(() => {
      this.pulseState = 'pulsed';
      setTimeout(() => {
        this.pulseState = 'normal';
      }, 500);
    }, 3000);

    // Show floating CTA after 2 seconds
    setTimeout(() => {
      this.isVisible = true;
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.ctaInterval) clearInterval(this.ctaInterval);
    if (this.pulseInterval) clearInterval(this.pulseInterval);
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  onScholarshipClick(): void {
    this.openScholarshipForm.emit();
    this.trackEvent('scholarship_cta_click', 'floating_cta');
  }

  onManagementSeatClick(): void {
    this.openManagementSeatForm.emit();
    this.trackEvent('management_seat_cta_click', 'floating_cta');
  }

  onWhatsAppClick(): void {
    const phoneNumber = '919876543210'; // Replace with actual WhatsApp number
    const message = encodeURIComponent('Hi, I am interested in admission counseling. Please help me with scholarship and management seat options.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    this.trackEvent('whatsapp_click', 'floating_cta');
  }

  onCallClick(): void {
    window.open('tel:+919876543210', '_self'); // Replace with actual phone number
    this.trackEvent('call_click', 'floating_cta');
  }

  private trackEvent(eventName: string, eventCategory: string): void {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': eventCategory,
        'event_label': 'Lead Generation'
      });
    }
  }
}

declare function gtag(...args: any[]): void;
