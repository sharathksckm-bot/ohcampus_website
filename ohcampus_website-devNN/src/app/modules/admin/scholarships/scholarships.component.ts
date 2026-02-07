import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-scholarships',
  templateUrl: './scholarships.component.html',
  styleUrls: ['./scholarships.component.scss']
})
export class ScholarshipsComponent implements OnInit {

  searchSchlorshipForm: FormGroup;
  scholorshipArr: any = [];
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
    this.searchSchlorshipForm = this._formBuilder.group({
      searchvalue: ['']
    })
    this.getScholarships();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.scholorshipArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getScholarships('').subscribe(res => {
              this.scholorshipArr = res.data;
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
          this.scholorshipArr = res.data;
        });
      });
  }

  getScholarships() {
    // const searchValue = this.searchSchlorshipForm.value.searchvalue;
    // // this.CompareclgService.getScholarships(this.searchSchlorshipForm.value.searchvalue).subscribe(res => {
    // //   this.scholorshipArr = res.data;
    // // })
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getScholarships(searchValue).subscribe(res => {
    //       this.scholorshipArr = res.data;
    //     });
    //   }, 1500);
    // }
    // if (!searchValue) {

    this.CompareclgService.getScholarships(this.searchSchlorshipForm.value.searchvalue).subscribe(res => {
      this.scholorshipArr = res.data;
    });


    // }
  }
}
