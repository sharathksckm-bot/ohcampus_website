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
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { LoansComponent } from './loans.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


const routes: Route[] = [
  {
    path     : '',
    component: LoansComponent
  }
];

@NgModule({
  declarations: [
    LoansComponent
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
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LoansModule { }
