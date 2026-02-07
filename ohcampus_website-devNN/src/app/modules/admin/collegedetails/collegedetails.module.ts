import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseCardModule } from '@fuse/components/card';
import { MatSelectModule } from '@angular/material/select';
import { CollegedetailsComponent } from './collegedetails.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { FaqsComponent } from './faqs/faqs.component'
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { CoursesAndFeesComponent } from './courses-and-fees/courses-and-fees.component';
import { CourseinfoComponent } from './courseinfo/courseinfo.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { AdmissionComponent } from './admission/admission.component';
import { PlacementsComponent } from './placements/placements.component';
import { CutoffsComponent } from './cutoffs/cutoffs.component';
import { QuestionAnsComponent } from './question-ans/question-ans.component';
import { NewsComponent } from './news/news.component';
import { HostelCampusComponent } from './hostel-campus/hostel-campus.component';
import { ScolarshipComponent } from './scolarship/scolarship.component';
import { CompareComponent } from './compare/compare.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// import { GoogleMapsModule } from '@angular/google-maps'
// import { NgImageSliderModule } from 'ng-image-slider';
const routes: Route[] = [
  {
    path: '',
    component: CollegedetailsComponent
  },
  // {
  //   path: 'collegeDetails/:id/courses',
  //   component: CoursesAndFeesComponent
  // },
  { path: 'collegeDetails/:id/CoursesFees', component: CoursesAndFeesComponent },
  { path: 'collegeDetails/:id/Reviews', component: ReviewsComponent },
  { path: 'collegeDetails/:id/Admissions', component: AdmissionComponent },
  { path: 'collegeDetails/:id/Placements', component: PlacementsComponent },
  { path: 'collegeDetails/:id/CutOffs', component: CutoffsComponent },
  { path: 'collegeDetails/:id/hostel-campus', component: HostelCampusComponent },
  { path: 'collegeDetails/:id/Compare', component: CompareComponent },
  { path: 'collegeDetails/:id/QA', component: QuestionAnsComponent },
  { path: 'collegeDetails/:id/Scholarships', component: ScolarshipComponent },
  { path: 'collegeDetails/:id/News', component: NewsComponent },
];

@NgModule({
  declarations: [
    CollegedetailsComponent,
    FaqsComponent,
    CoursesAndFeesComponent,
    ReviewsComponent,
    AdmissionComponent,
    PlacementsComponent,
    CutoffsComponent          ,
    QuestionAnsComponent,
    NewsComponent,
    HostelCampusComponent,
    ScolarshipComponent,
    CompareComponent,
    CourseinfoComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    FuseCardModule,
    MatSelectModule,
    MatExpansionModule,
    MatCardModule,
    RouterModule.forChild(routes),
    MatCarouselModule,
    MatProgressBarModule,
    MatMenuModule,
    ScrollingModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule,
    MatCheckboxModule,
    MatPaginatorModule,
    NgxMatSelectSearchModule,
    MatTooltipModule
    // NgImageSliderModule
    


  ]
})
export class CollegedetailsModule { }
