import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';


@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  FaqCategoryArr: any = [];
  faqArr: any = [];

  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    this.getFaqCategory();
  }

  getFaqCategory() {
    this.CompareclgService.getFaqCategory().subscribe(res => {
      this.FaqCategoryArr = res.data;
    })
  }

  onTabChange(event) {
    const faqcategoryId = this.FaqCategoryArr[event].id;
    this.CompareclgService.getFaqs('', faqcategoryId).subscribe(res => {
      this.faqArr = res.data;
    })
  }

}
