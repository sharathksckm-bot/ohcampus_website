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
import { CourselistComponent } from './courselist.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Route[] = [
  {
    path     : '',
    component: CourselistComponent
  }
];

@NgModule({
  declarations: [
    CourselistComponent
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
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CourselistModule { }
