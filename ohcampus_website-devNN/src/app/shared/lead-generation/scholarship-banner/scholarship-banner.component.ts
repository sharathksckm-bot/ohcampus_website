import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scholarship-banner',
  templateUrl: './scholarship-banner.component.html',
  styleUrls: ['./scholarship-banner.component.scss']
})
export class ScholarshipBannerComponent {
  @Output() openScholarshipForm = new EventEmitter<void>();
  @Output() openManagementSeatForm = new EventEmitter<void>();

  scholarshipHighlights = [
    { icon: 'school', title: 'Merit-Based', desc: 'Up to 100% tuition waiver' },
    { icon: 'attach_money', title: 'Need-Based', desc: 'Financial aid available' },
    { icon: 'account_balance', title: 'Govt Schemes', desc: 'State & Central' },
    { icon: 'business', title: 'Private', desc: 'Corporate sponsorships' }
  ];

  trustStats = [
    { value: '50,000+', label: 'Students Helped' },
    { value: '500+', label: 'Partner Colleges' },
    { value: '₹2L+', label: 'Max Scholarship' },
    { value: '98%', label: 'Success Rate' }
  ];

  constructor(private router: Router) {}

  onApplyScholarship(): void {
    this.trackEvent('scholarship_banner_click');
    // Redirect to check-scholarship page
    this.router.navigate(['/check-scholarship']);
  }

  onApplyManagementSeat(): void {
    this.openManagementSeatForm.emit();
    this.trackEvent('management_seat_banner_click');
  }

  private trackEvent(eventName: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': 'homepage_banner',
        'event_label': 'Lead Generation'
      });
    }
  }
}

declare function gtag(...args: any[]): void;
