import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-loans',
  templateUrl: './loans.component.html',
  styleUrls: ['./loans.component.scss']
})
export class LoansComponent implements OnInit {
  searchLoanForm: FormGroup;
  loanArr: any = [];
  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  resultSets: any[];
  searchControl: FormControl = new FormControl();
  recordsTotal: number;

  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    this.searchLoanForm = this._formBuilder.group({
      seachvalue: [''],
    })
    this.getLoans();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.loanArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getScholarships('').subscribe(res => {
              this.loanArr = res.data;
            });
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.CompareclgService.getScholarships(value).subscribe(res => {
          this.loanArr = res.data;
        });
      });
  }

  getLoans() {
    // const searchValue = this.searchLoanForm.value.seachvalue;
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getLoans(searchValue).subscribe(res => {
    //       this.loanArr = res.data;
    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    this.CompareclgService.getLoans(this.searchLoanForm.value.seachvalue).subscribe(res => {
      this.loanArr = res.data;
    })


    // }
  }
}
