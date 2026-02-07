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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatCarouselModule } from '@ngmodule/material-carousel';
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
import { StudyabroadComponent } from './studyabroad.component';

// import { GoogleMapsModule } from '@angular/google-maps'
// import { NgImageSliderModule } from 'ng-image-slider';
const routes: Route[] = [
    {
        path: '',
        component: StudyabroadComponent
    },
    // {
    //   path: 'collegeDetails/:id/courses',
    //   component: CoursesAndFeesComponent
    // },

];

@NgModule({
    declarations: [
        StudyabroadComponent
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
export class StudyabroadModule { }
