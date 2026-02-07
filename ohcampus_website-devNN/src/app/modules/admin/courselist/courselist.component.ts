import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-courselist',
  templateUrl: './courselist.component.html',
  styleUrls: ['./courselist.component.scss']
})
export class CourselistComponent implements OnInit {
  searchControl: FormControl = new FormControl();
  searchCourseForm: FormGroup;
  courseListArr: any = [];
  page: number = 1; pageSize: number = 10; startNum: number = 0; sortValue: string = "desc";
  order: any = [
    {
      "column": 0,
      "dir": "desc"
    }
  ];
  start: number = 0;
  recordsTotal: any;
  searchedcourse: any;
  categoryid: any;
  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  resultSets: any[];

  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder

  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    // console.log(routeParams)
    this.searchedcourse = routeParams.searchedcourse;
    console.log(routeParams);
    this.categoryid = routeParams.categoryid;
    this._activatedRoute.params.subscribe(param => {
      this.searchedcourse = param.searchedcourse;
      this.getAllCourseListsearch();
    })
    this.searchCourseForm = this._formBuilder.group({
      course: ['']
    })

    // if(this.categoryid != undefined){
    //   this.getCourseListById(this.categoryid);
    // }

    if (this.searchedcourse == undefined && this.categoryid == undefined) {
      this.getAllCourseList();
    }
    else {
      this.getAllCourseListsearch();
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.courseListArr = [];
            this.recordsTotal = 0;
            this.searchCourseList('');
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.searchCourseList(value);
      });

  }

  getAllColleges(courseid) {
    localStorage.setItem('CourseId', courseid);
    this.route.navigate(['allCollegeList/course/bycat', courseid]);
  }

  getAllCourseList() {
    let searchData = {
      value: this.searchCourseForm.value.course,
      cat: this.categoryid
    }
    // const searchValue = this.searchCourseForm.value.course;
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getAllCourseList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
    //       this.courseListArr = res.data;
    //       this.recordsTotal = res.recordsFiltered;
    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    this.CompareclgService.getAllCourseList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.courseListArr = res.data;
      this.recordsTotal = res.recordsFiltered;
    })
    // }

  }

  searchCourseList(event) {
    let searchData = {
      value: event,
      cat: this.categoryid
    }
    this.CompareclgService.getAllCourseList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.courseListArr = res.data;
      this.recordsTotal = res.recordsFiltered;
    })
  }

  getAllCourseListsearch() {
    let searchData = {
      value: this.searchedcourse,
      cat: this.categoryid
    }
    this.CompareclgService.getAllCourseList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.courseListArr = res.data;
      this.recordsTotal = res.recordsFiltered;
    })
  }

  getCourseListById(id){
    this.CompareclgService.getCourseListById(this.page,this.pageSize,this.start,this.order,id).subscribe(res=>{
      this.courseListArr = res.data;
    })
  }


  onPageChange(event) {
    // alert(this.searchControl.value)
    this.page = event.pageIndex + 1;
    this.startNum = (this.pageSize * (event.pageIndex));
    if (this.searchedcourse == undefined && this.categoryid == undefined) {
      let searchData = {
        value: this.searchControl.value,
        cat: ''
      }
      this.CompareclgService.getAllCourseList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        this.recordsTotal = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.courseListArr = res.data;
        }

      })
    }
    if (this.categoryid != undefined) {
      let searchData = {
        value: this.searchControl.value,
        cat: this.categoryid
      }
      this.CompareclgService.getAllCourseList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        this.recordsTotal = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.courseListArr = res.data;
        }

      })
    }
    if (this.searchedcourse != undefined) {
      let searchData = {
        value: this.searchedcourse,
        cat: this.categoryid
      }
      this.CompareclgService.getAllCourseList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        this.recordsTotal = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.courseListArr = res.data;
        }

      })
    }

  }
}
