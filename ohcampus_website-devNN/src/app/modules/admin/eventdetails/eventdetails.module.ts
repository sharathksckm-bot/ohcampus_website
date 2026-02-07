import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { FuseCardModule } from '@fuse/components/card';
import { MatSelectModule } from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { EventdetailsComponent } from './eventdetails.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

const routes: Route[] = [
  {
    path     : '',
    component: EventdetailsComponent
  }
];

@NgModule({
  declarations: [
    EventdetailsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    FuseCardModule,
    MatSelectModule,
    MatCarouselModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule
  ]
})
export class EventdetailsModule { }
