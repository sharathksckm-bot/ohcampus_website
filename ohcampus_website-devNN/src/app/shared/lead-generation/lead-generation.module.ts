import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { FloatingCtaComponent } from './floating-cta/floating-cta.component';
import { LeadPopupComponent } from './lead-popup/lead-popup.component';
import { ScholarshipBannerComponent } from './scholarship-banner/scholarship-banner.component';
import { ManagementSeatFormComponent } from './management-seat-form/management-seat-form.component';
import { ExitIntentPopupComponent } from './exit-intent-popup/exit-intent-popup.component';
import { FullManagementSeatFormComponent } from './full-management-seat-form/full-management-seat-form.component';

@NgModule({
  declarations: [
    FloatingCtaComponent,
    LeadPopupComponent,
    ScholarshipBannerComponent,
    ManagementSeatFormComponent,
    ExitIntentPopupComponent,
    FullManagementSeatFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
  exports: [
    FloatingCtaComponent,
    LeadPopupComponent,
    ScholarshipBannerComponent,
    ManagementSeatFormComponent,
    ExitIntentPopupComponent,
    FullManagementSeatFormComponent
  ]
})
export class LeadGenerationModule { }
