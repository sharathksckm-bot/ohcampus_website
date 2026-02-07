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
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ListcollegesComponent } from './listcolleges.component';

const compRoutes: Route[] = [
  {
      path     : '',
      component: ListcollegesComponent
  }
];


@NgModule({
  declarations: [
    ListcollegesComponent
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
    MatCheckboxModule
  ]
})
export class ListcollegesModule { }
