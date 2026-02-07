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
import {MatCardModule} from '@angular/material/card';
import { ComparecollegesComponent } from './comparecolleges.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const compRoutes: Route[] = [
  {
      path     : '',
      component: ComparecollegesComponent
  }
];

@NgModule({
  declarations: [
    ComparecollegesComponent
  ],
  imports: [
    RouterModule.forChild(compRoutes),
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    FuseCardModule,
    MatSelectModule,
    CommonModule,
    MatExpansionModule,
    MatCarouselModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
  ]
})
export class ComparecollegesModule { }
