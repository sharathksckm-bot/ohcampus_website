import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FloatingCtaComponent } from './floating-cta/floating-cta.component';
import { LeadPopupComponent } from './lead-popup/lead-popup.component';
import { ScholarshipBannerComponent } from './scholarship-banner/scholarship-banner.component';
import { ManagementSeatFormComponent } from './management-seat-form/management-seat-form.component';
import { ExitIntentPopupComponent } from './exit-intent-popup/exit-intent-popup.component';

@NgModule({
  declarations: [
    FloatingCtaComponent,
    LeadPopupComponent,
    ScholarshipBannerComponent,
    ManagementSeatFormComponent,
    ExitIntentPopupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  exports: [
    FloatingCtaComponent,
    LeadPopupComponent,
    ScholarshipBannerComponent,
    ManagementSeatFormComponent,
    ExitIntentPopupComponent
  ]
})
export class LeadGenerationModule { }
