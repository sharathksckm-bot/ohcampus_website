import { Component, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import { param } from 'jquery';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime, filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-allcolleges',
  templateUrl: './allcolleges.component.html',
  styleUrls: ['./allcolleges.component.scss']
})
export class AllcollegesComponent implements OnInit {
  public examFilterCtrl: FormControl = new FormControl();
  public examTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  private _onDestroy = new Subject<void>();
  searchLocControl: FormControl = new FormControl();
  searchCourseControl: FormControl = new FormControl();
  searchOwnershipControl: FormControl = new FormControl();
  searchCollegeControl: FormControl = new FormControl();
  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('callAPIDialogpredictAdm') callAPIDialogpredictAdm: TemplateRef<any>;
  @ViewChild('callsignInForm') callsignInForm: TemplateRef<any>;



  //DECLARE FORMGROUPS
  AllCollegesForm: FormGroup;
  predictAdmForm: FormGroup;

  //DECLARE ARRAYS
  LocationArr: any = []; rankCatArr: any = []; courseDataArr: any = []; OwnershipArr: any = []; paginatedCollegeData: any = []; collegeArr: any = []; CourseCategoryArr: any = []; CoursesByCatArr: any = []
  examListArr: any = []; RatingArr: any = [{ "rate": "2-3", "count": 1 }, { "rate": "3-4", "count": 42 }, { "rate": "4-5", "count": 39 }];
  selectedFilters: string[] = [];
  selectedFilterscourse: string[] = [];
  selectedFiltersOwnership: string[] = [];
  selectedFiltersRating: string[] = [];
  selectedFiltersArr: any = [];
  selectedFiltersCourseArr: any = [];
  selectedFiltersOwnershipArr: any = [];
  selectedFiltersRatingArr: any = [];
  //DECLARE VARIABLES
  searchdata: any; searchcoursedata: any; searchownership: any; selectedcity: any; panelOpenState = false; coursSelected: any; ownerShipselected: any; searchValue: any;
  res_Status: any; start: number = 0; totalColleges: any; page: number = 1; pageSize: number = 5; startNum: number = 0; sortValue: string = "desc";
  locationSelected: any; ownershipSelected: any; collageID: any; LocId: any; tab: number;
  application_link: any; token: string;
  collegename: any; collegename1: any; collegeid: any; courseid: any; catid: any; selectedcategory: string; selectedcityid: string;
  LocalCourseId: string;

  //Loaders
  locLoader: boolean = false; courseLoader: boolean = false; ownershipLoader: boolean = false; collegeLoader: boolean = false; isChecked: boolean = false;

  order: any = [
    {
      "column": 0,
      "dir": "desc"
    }
  ];
  ShowAllClgs: any;
  selectedFiltersLocation: any;
  selectedFiltersCourse: any;
  selectedCourse: any;
  selectedOwnership: any;
  selectedRanking: any;
  isExpanded = false;
  resultSets: any[];
  recordsTotal: number;
  searchCollege: string;
  searchTypeArray: any = [];

  constructor(
    public CompareclgService: CompareclgService,
    private _formBuilder: FormBuilder,
    private route: Router,
    private _activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      if (result.matches) {
        this.isExpanded = false; // Collapse panel on mobile view
      } else {
        this.isExpanded = true; // Expand panel on desktop view
      }
    });
  }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
   
    console.log(routeParams);
    this.catid = routeParams.id;
    this.LocId = routeParams.catid;
    this.courseid = routeParams.courseid;
    console.log(this.courseid)
    console.log(this.LocId)
    this.searchValue = routeParams.searchvalue;
    this.selectedcityid = localStorage.getItem('cityId');
    this.selectedcategory = localStorage.getItem('categoryId');
    const currentPage = this.route.url;
    this.examFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.examfilter();
      });

    this.AllCollegesForm = this._formBuilder.group({
      location: [''],
      course: [''],
      ownership: [''],
      category_id: [''],
      search_value: ['']
    })

    this.searchLocControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.LocationArr = [];
            this.recordsTotal = 0;
            this.locLoader = true;
            this.CompareclgService.getCity(value).subscribe(res => {
              this.locLoader = false;
              this.LocationArr = res.data;
            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.locLoader = true;
        this.CompareclgService.getCity(value).subscribe(res => {
          this.locLoader = false;
          this.LocationArr = res.data;
        })
      });

    this.searchCourseControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.courseDataArr = [];
            this.recordsTotal = 0;
            this.courseLoader = true;
            this.CompareclgService.getCourseList(value).subscribe(res => {
              this.courseLoader = false;
              this.courseDataArr = res.data;

            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.courseLoader = true;
        this.CompareclgService.getCourseList(value).subscribe(res => {
          this.courseLoader = false;
          this.courseDataArr = res.data;

        })
      });

    this.searchOwnershipControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.OwnershipArr = [];
            this.recordsTotal = 0;
            this.ownershipLoader = true;
            this.CompareclgService.getOwnershipList(value).subscribe(res => {
              this.ownershipLoader = false;
              this.OwnershipArr = res.data;
            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.ownershipLoader = true;
        this.CompareclgService.getOwnershipList(value).subscribe(res => {
          this.ownershipLoader = false;
          this.OwnershipArr = res.data;
        })
      });

    this.searchCollegeControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length > 3) {
            this.resultSets = null;
            this.collegeArr = [];
            this.recordsTotal = 0;
            this.collegeLoader = true;
            let searchData = {
              clgname: value,
              loc: this.selectedFiltersLocation,
              ownerShip: this.selectedOwnership,
              rankCategory: this.AllCollegesForm.value.category_id,
              courseid: this.selectedCourse,
              categoryid: this.catid,
              rankid: this.selectedRanking
            }
            console.log(searchData)
            this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
              this.CompareclgService.saveSearchLog(
                '',
                'college',
                searchData,
                'web'
              ).subscribe(resp => {
                console.log('Search log saved:', resp);
              });
              this.collegeLoader = false;
              this.totalColleges = res.recordsFiltered;
              if (res.response_code == 2) {
                Swal.fire('', res.response_message, 'warning');
                return
              }
              else {
                this.collegeArr = res.data;
                let imgData = this.courseDataArr.split('.');
                console.log(imgData)
              }

            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        let searchData = {
          clgname: value,
          loc: this.selectedFiltersLocation,
          ownerShip: this.selectedOwnership,
          rankCategory: this.AllCollegesForm.value.category_id,
          courseid: this.selectedCourse,
          categoryid: this.catid,
          rankid: this.selectedRanking
        }
        this.collegeLoader = true;
        this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
          this.collegeLoader = false;
          this.totalColleges = res.recordsFiltered;
          if (res.response_code == 2) {
            Swal.fire('', res.response_message, 'warning');
            return
          }
          else {
            this.collegeArr = res.data;
          }

        })
      });

    this.predictAdmForm = this._formBuilder.group({
      name: ['', Validators.required],
      mobileno: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      course_category: ['', Validators.required],
      college: ['', Validators.required],
      course: ['', Validators.required],
      exam: ['', Validators.required],
      expected_rank: ['', Validators.required],
      expected_score: ['', Validators.required]
    })

    this.getLocationList();
    this.getRankCategory();
    this.getAllCourseList();
    this.getOwnershipList();

    this._activatedRoute.params.subscribe((params) => {
      console.log(params)
      this.courseid = params.courseid;
      this.searchValue = params.searchvalue;
      console.log(this.searchValue)
      console.log(this.LocId);
      console.log(this.catid);
      this.catid = params.id;
      this.LocId = params.catid;
      if (this.LocId != undefined) {
        this.onFilterSelection('', '', this.LocId)
      }
      if (this.LocId == undefined && this.catid == undefined && this.courseid == undefined && this.searchValue == undefined) {
        this.getCollegeList('');
      }
      // this.LocalCourseId = localStorage.getItem('CourseId')
      // this.selectedcityid = localStorage.getItem('cityId')
      // this.selectedcategory = localStorage.getItem('categoryId')

      if (this.LocId != undefined && this.catid != undefined) {
        this.getCollegeListforloc();
      }
      // localStorage.removeItem('cityId');
      // localStorage.removeItem('categoryId');

      if (this.courseid != undefined) {
        this.getCollegeList('');
      }
      // localStorage.removeItem('CourseId');

      if (this.searchValue != undefined) {
        this.getcollegebySearch();
      }

      this.getCourseCategory();
      // this.getExamList();
      this.getRatingList();
    })
  }

  ngAfterViewInit(): void {

  }


  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // console.log(6767676)
  }
  private examfilter() {
    if (!this.examListArr) {
      return;
    }

    // get the search keyword
    let search = this.examFilterCtrl.value;
    if (!search) {
      this.examTypeFilter.next(this.examListArr.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.examTypeFilter.next(
      this.examListArr.filter(bank => bank.title.toLowerCase().indexOf(search) > -1)
    );
  }

  loadData(catid: string, cityid: string): void {
    this.collegeLoader = true;
    let searchData = {
      clgname: '',
      loc: cityid,
      ownerShip: '',
      rankCategory: '',
      categoryid: catid,
      rankid: ''
    }
    this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.collegeLoader = false;
      this.totalColleges = res.recordsFiltered;
      if (res.response_code == 2) {
        Swal.fire('', res.response_message, 'warning');
        return
      }
      else {
        this.collegeArr = res.data;
      }
    })
  }

  clgSearchInput(event: KeyboardEvent) {

    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }
  onFilterSelection(event, filterValue: string, filterid): void {
    // console.log(event);
    const isChecked = this.selectedFilters.includes(filterValue);
    if (!isChecked) {
      this.selectedFilters.push(filterValue);
      // console.log('Added:', this.selectedFilters);


      if (!this.selectedFiltersArr.includes(filterid)) {
        this.selectedFiltersArr.push(filterid);
        // console.log('Added:', this.selectedFiltersArr);
        this.selectedFiltersLocation = this.selectedFiltersArr.join(',');
        // console.log('Location:', this.selectedFiltersLocation);
      }
    } else {
      const index = this.selectedFilters.indexOf(filterValue);
      if (index !== -1) {
        this.selectedFilters.splice(index, 1);
        // console.log('Removed:', this.selectedFilters);
      }

      const idIndex = this.selectedFiltersArr.indexOf(filterid);
      if (idIndex !== -1) {
        this.selectedFiltersArr.splice(idIndex, 1);
        this.selectedFiltersLocation = this.selectedFiltersArr.join(',');
        // console.log('Location:', this.selectedFiltersLocation);
      }
    }
  }

  onFilterSelectionCourse(filterValue: string, filterid): void {
    const isChecked = this.selectedFilterscourse.includes(filterValue);

    if (!isChecked) {
      this.selectedFilterscourse.push(filterValue);
      // console.log('Added:', this.selectedFilters);

      if (!this.selectedFiltersCourseArr.includes(filterid)) {
        this.selectedFiltersCourseArr.push(filterid);
        // console.log('Added:', this.selectedFiltersCourseArr);
        this.selectedCourse = this.selectedFiltersCourseArr.join(',');
        // console.log('Location:', this.selectedCourse);
      }
    } else {
      const index = this.selectedFilterscourse.indexOf(filterValue);
      if (index !== -1) {
        this.selectedFilterscourse.splice(index, 1);
        // console.log('Removed:', this.selectedFilters);
      }

      const idIndex = this.selectedFiltersCourseArr.indexOf(filterid);
      if (idIndex !== -1) {
        this.selectedFiltersCourseArr.splice(idIndex, 1);
        this.selectedCourse = this.selectedFiltersCourseArr.join(',');
        // console.log('Location:', this.selectedCourse);
      }
    }
  }


  onFilterSelectionOwnership(filterValue: string, filterid): void {
    const isChecked = this.selectedFiltersOwnership.includes(filterValue);

    if (!isChecked) {
      this.selectedFiltersOwnership.push(filterValue);
      // console.log('Added:', this.selectedFilters);

      if (!this.selectedFiltersOwnershipArr.includes(filterid)) {
        this.selectedFiltersOwnershipArr.push(filterid);
        // console.log('Added:', this.selectedFiltersOwnershipArr);
        this.selectedOwnership = this.selectedFiltersOwnershipArr.join(',');
        // console.log('Location:', this.selectedOwnership);
      }
    } else {
      const index = this.selectedFiltersOwnership.indexOf(filterValue);
      if (index !== -1) {
        this.selectedFiltersOwnership.splice(index, 1);
        // console.log('Removed:', this.selectedFilters);
      }

      const idIndex = this.selectedFiltersOwnershipArr.indexOf(filterid);
      if (idIndex !== -1) {
        this.selectedFiltersOwnershipArr.splice(idIndex, 1);
        this.selectedOwnership = this.selectedFiltersOwnershipArr.join(',');
        // console.log('Location:', this.selectedOwnership);
      }
    }
  }

  onFilterSelectionRanking(filterValue: string): void {
    const isChecked = this.selectedFiltersRating.includes(filterValue);

    if (!isChecked) {
      this.selectedFiltersRating.push(filterValue);
      // console.log('Added:', this.selectedFilters);

      if (!this.selectedFiltersRatingArr.includes(filterValue)) {
        this.selectedFiltersRatingArr.push(filterValue);
        // console.log('Added:', this.selectedFiltersOwnershipArr);
        this.selectedRanking = this.selectedFiltersRatingArr.join(',');
        // console.log('Rating:', this.selectedRanking);
      }
    } else {
      const index = this.selectedFiltersRating.indexOf(filterValue);
      if (index !== -1) {
        this.selectedFiltersRating.splice(index, 1);
        // console.log('Removed:', this.selectedFilters);
      }

      const idIndex = this.selectedFiltersRatingArr.indexOf(filterValue);
      if (idIndex !== -1) {
        this.selectedFiltersRatingArr.splice(idIndex, 1);
        this.selectedRanking = this.selectedFiltersRatingArr.join(',');
        // console.log('Rating:', this.selectedRanking);
      }
    }
  }

  removeFilter(filter: any) {
    const index = this.selectedFilters.indexOf(filter);
    if (index !== -1) {
      // Location already selected, remove it
      this.selectedFilters.splice(index, 1);
      // console.log(filter)
    }
  }

  clearFilter() {
    this.LocationArr.forEach(location => location.checked = false);
    this.courseDataArr.forEach(course => course.checked = false);
    this.RatingArr.forEach(item => item.checked = false);
    this.OwnershipArr.forEach(item => item.checked = false);
    let searchData = {
      clgname: this.searchCollegeControl.value,
      loc: '',
      ownerShip: '',
      rankCategory: this.AllCollegesForm.value.category_id,
      courseid: '',
      categoryid: this.catid,
      rankid: ''
    }

    // const searchValue = this.AllCollegesForm.value.search_value;
    // if (searchValue && searchValue.length >= 3) {
    //   this.collegeLoader = true;
    //   setTimeout(() => {
    //     this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
    //       this.collegeLoader = false;
    //       this.totalColleges = res.recordsFiltered;
    //       if (res.response_code == 2) {
    //         Swal.fire('', res.response_message, 'warning');
    //         return
    //       }
    //       else {
    //         this.collegeArr = res.data;

    //       }

    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    //   this.collegeLoader = true;
    this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.collegeLoader = false;
      this.totalColleges = res.recordsFiltered;
      if (res.response_code == 2) {
        Swal.fire('', res.response_message, 'warning');
        return
      }
      else {
        this.collegeArr = res.data;

      }

    })
    // }
  }

  onPageChange(event) {
    if (this.searchCollegeControl.value != " " && this.searchCollegeControl.value != null) {
      // alert(8888)
      // this.searchCollege == this.searchCollegeControl.value;
      this.page = event.pageIndex + 1;
      this.startNum = (this.pageSize * (event.pageIndex));
      this.collegeLoader = false;
      let searchData = {
        clgname: this.searchCollegeControl.value,
        loc: this.selectedFiltersLocation,
        ownerShip: this.selectedOwnership,
        rankCategory: this.AllCollegesForm.value.category_id,
        categoryid: this.catid,
        courseid: this.selectedCourse,
        rankid: this.selectedRanking
      }
      this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        console.log(searchData)

        this.collegeLoader = false;
        this.totalColleges = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.collegeArr = res.data;
        }
      })
    } else if (this.LocId != undefined && this.catid != undefined) {
      this.page = event.pageIndex + 1;
      this.startNum = (this.pageSize * (event.pageIndex));
      if (this.searchCollegeControl.value == null) {
        this.searchCollege == "";
      }
      if (this.searchCollegeControl.value != null) {
        this.searchCollege == this.searchCollegeControl.value;
      }
      this.collegeLoader = false;
      let searchData = {
        clgname: this.searchCollege,
        loc: this.LocId,
        ownerShip: this.selectedOwnership,
        rankCategory: this.AllCollegesForm.value.category_id,
        categoryid: this.catid,
        courseid: this.selectedCourse,
        rankid: this.selectedRanking
      }
      this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        this.collegeLoader = false;
        this.totalColleges = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.collegeArr = res.data;
        }
      })
    } else if (this.searchValue != undefined) {

      if (this.searchCollegeControl.value != " " && this.searchCollegeControl.value != null) return false;

      this.page = event.pageIndex + 1;
      this.startNum = (this.pageSize * (event.pageIndex));
      this.collegeLoader = false;
      let searchData = {
        clgname: this.searchValue,
        loc: this.selectedFiltersLocation,
        ownerShip: this.selectedOwnership,
        rankCategory: this.AllCollegesForm.value.category_id,
        categoryid: this.catid,
        courseid: this.selectedCourse,
        rankid: this.selectedRanking
      }
      this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        this.collegeLoader = false;
        this.totalColleges = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.collegeArr = res.data;
        }
      })
    } else if (this.courseid != undefined) {
      this.page = event.pageIndex + 1;
      this.startNum = (this.pageSize * (event.pageIndex));
      this.collegeLoader = false;
      let searchData = {
        clgname: this.searchCollege,
        loc: this.selectedFiltersLocation,
        ownerShip: this.selectedOwnership,
        rankCategory: this.AllCollegesForm.value.category_id,
        categoryid: this.catid,
        courseid: this.selectedCourse,
        rankid: this.selectedRanking
      }
      this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        this.collegeLoader = false;
        this.totalColleges = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.collegeArr = res.data;
        }
      })
    }
    else {
      // if (this.LocId == undefined && this.catid == undefined && this.courseid == undefined && this.searchValue == undefined && this.searchCollegeControl.value == " ") {
      // if (this.LocId == undefined && this.catid == undefined && this.courseid == undefined && this.searchValue == undefined) {
      this.page = event.pageIndex + 1;
      this.startNum = (this.pageSize * (event.pageIndex));
      this.collegeLoader = false;
      let searchData = {
        clgname: this.searchCollege,
        loc: this.selectedFiltersLocation,
        ownerShip: this.selectedOwnership,
        rankCategory: this.AllCollegesForm.value.category_id,
        courseid: this.selectedCourse,
        categoryid: '',
        rankid: this.selectedRanking
      }
      this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
        console.log(this.page, this.pageSize, this.start, this.order, searchData)

        this.collegeLoader = false;
        this.totalColleges = res.recordsFiltered;
        if (res.response_code == 2) {
          Swal.fire('', res.response_message, 'warning');
          return
        }
        else {
          this.collegeArr = res.data;
        }
      })
      // }
    }
    window.scrollTo(0, 0);
  }

  getCollegeList(type): void {
    if (this.courseid !== undefined) {
      this.selectedCourse = this.courseid;
    }
    // if (this.LocId != undefined && this.catid != undefined) {
    //   this.selectedFiltersLocation = this.LocId;
    // }
    console.log(this.searchCollegeControl)
    if (this.searchCollegeControl.value == null || this.searchCollegeControl.value == '') {
      // alert(this.searchValue)
      this.searchCollege = this.searchValue;
      // alert(this.searchCollege)
    }
    if (this.searchCollegeControl.value != null && this.searchCollegeControl.value != '') {
      // alert("fsdfsdfsdfs")
      this.searchCollege = this.searchCollegeControl.value;
    }
    let searchData = {
      clgname: this.searchCollege,
      loc: this.selectedFiltersLocation,
      ownerShip: this.selectedOwnership,
      rankCategory: this.AllCollegesForm.value.category_id,
      courseid: this.selectedCourse,
      categoryid: this.catid,
      rankid: this.selectedRanking
    }

    // const searchValue = this.AllCollegesForm.value.search_value;
    // if (searchValue && searchValue.length >= 3) {
    //   this.collegeLoader = true;
    //   setTimeout(() => {
    //     this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
    //       this.collegeLoader = false;
    //       this.totalColleges = res.recordsFiltered;
    //       if (res.response_code == 2) {
    //         Swal.fire('', res.response_message, 'warning');
    //         return
    //       }
    //       else {
    //         this.collegeArr = res.data;

    //       }

    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    this.collegeLoader = true;
    this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.collegeLoader = false;
      this.searchTypeArray.push(type)
      this.CompareclgService.saveSearchLog(
        '',
       this.searchTypeArray,
        'searchData',
        'web'
      ).subscribe(resp => {
        console.log('Search log saved:', resp);
      });
      this.totalColleges = res.recordsFiltered;
      if (res.response_code == 2) {
        Swal.fire('', res.response_message, 'warning');
        return
      }
      else {
        this.collegeArr = res.data;

      }

    })
    // }
  }


  //--------Get Location List--------//
  getLocationList() {
    const searchValue = this.AllCollegesForm.value.location;

    this.locLoader = true;
    this.CompareclgService.getCity(this.AllCollegesForm.value.location).subscribe(res => {
      this.locLoader = false;
      this.LocationArr = res.data;
    })

  }

  //Get Rank Category
  getRankCategory() {
    this.CompareclgService.getRankList().subscribe(res => {
      this.rankCatArr = res.data;
    })
  }

  geLocData(event: any, loc, city) {
    this.selectedcity = city;
    this.locationSelected = loc;
    this.getCollegeList('');
  }

  getCollegeListbyCourse() {
    // this.coursSelected = course;
    // this.courseid = courseId;
    this.collegeLoader = true;
    let searchData = {
      clgname: this.searchCollegeControl.value,
      loc: this.selectedFiltersLocation,
      ownerShip: this.selectedOwnership,
      rankCategory: this.AllCollegesForm.value.category_id,
      courseid: this.selectedCourse,
      categoryid: '',
      rankid: ''
    }
    this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.collegeLoader = false;
      this.totalColleges = res.recordsFiltered;
      if (res.response_code == 2) {
        Swal.fire('', res.response_message, 'warning');
        return
      }
      else {
        this.collegeArr = res.data;
      }

    })
  }

  //get all course list
  getAllCourseList() {
    this.searchcoursedata = '';
    const searchValue = this.AllCollegesForm.value.course;
    this.courseLoader = true;
    this.CompareclgService.getCourseList(this.AllCollegesForm.value.course).subscribe(res => {
      this.courseLoader = false;
      this.courseDataArr = res.data;
    })

  }

  getCollegeDetails(collageID) {
    this.collageID = collageID;
    this.tab = 0;
    this.route.navigate(['/collegeDetails', this.collageID]);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
  }

  //get all data
  getOwnershipList() {
    this.searchownership = '';
    const searchValue = this.AllCollegesForm.value.ownership;
    this.ownershipLoader = true;
    this.CompareclgService.getOwnershipList(this.AllCollegesForm.value.ownership).subscribe(res => {
      this.ownershipLoader = false;
      this.OwnershipArr = res.data;
    })
  }

  ownerShipSelected(ownership, nmae) {
    this.ownerShipselected = ownership;
    this.ownershipSelected = nmae
    this.getCollegeList('');
  }

  getCollegeListforloc(): void {
    this.collegeLoader = true;
    let searchData = {
      clgname: '',
      loc: this.LocId,
      ownerShip: '',
      rankCategory: '',
      categoryid: this.catid,
      rankid: ''
    }
    this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.collegeLoader = false;
      this.totalColleges = res.recordsFiltered;
      if (res.response_code == 2) {
        Swal.fire('', res.response_message, 'warning');
        return
      }
      else {
        this.collegeArr = res.data;
      }
    })
  }


  getcollegebySearch() {
    this.collegeLoader = true;
    let searchData = {
      clgname: this.searchValue,
      loc: '',
      ownerShip: '',
      rankCategory: '',
      categoryid: '',
      rankid: ''
    }
    this.CompareclgService.getCollegeList(this.page, this.pageSize, this.start, this.order, searchData).subscribe(res => {
      this.collegeLoader = false;
      this.totalColleges = res.recordsFiltered;
      if (res.response_code == 2) {
        Swal.fire('', res.response_message, 'warning');
        return
      }
      else {
        this.collegeArr = res.data;
      }
    })
  }



  getClgAdmInfo(collageID) {
    this.collageID = collageID;
    this.tab = 3;
    this.route.navigate(['/collegeDetails', this.collageID, 'Admissions']);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
  }

  getClgCourseInfo(collageID) {
    this.collageID = collageID;
    this.tab = 1;
    this.route.navigate(['/collegeDetails', this.collageID, 'CoursesFees']);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
  }

  getClgPlacementInfo(collageID) {
    this.collageID = collageID;
    this.tab = 4;
    this.route.navigate(['/collegeDetails', this.collageID, 'Placements']);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
  }


  //--------------------only Numbers are allowed---------------------//
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  predictAdm(collegeid, collegename, is_accept_entrance) {
    this.collegeid = collegeid
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
      if (is_accept_entrance == 1) {
        window.open('http://predictor.ohcampus.com/')
      }
      else {
        const dialogRef = this.dialog.open(this.callAPIDialogpredictAdm);
        this.predictAdmForm.get('college').setValue(collegename);
        dialogRef.afterClosed().subscribe((result) => { });
      }

    }
  }

  shouldShowRankDiv(ranks: any[]): boolean {
    // Check if all ranks are null
    return ranks.some(rank => rank.rank !== null);
  }

  getNonEmptyRanks(ranks: any[]): any[] {
    return ranks.filter(rank => rank.rank !== null);
  }

  getCourseCategory() {
    this.CompareclgService.getCourseCategory().subscribe(res => {
      this.CourseCategoryArr = res.data;
    })
  }

  getCourseByCategoryClg() {
    this.CompareclgService.getCourseByCategoryClg(this.predictAdmForm.value.course_category, this.collegeid).subscribe(res => {
      this.CoursesByCatArr = res.data

    })
  }
  close() {
    this.dialog.closeAll();
  }

  savPredictAdmission() {
    if (this.predictAdmForm.invalid) {
      this.predictAdmForm.markAllAsTouched();
      return
    }
    if (this.predictAdmForm.valid) {
      this.CompareclgService.savPredictAdmission(
        this.predictAdmForm.controls.name.value,
        this.predictAdmForm.controls.email.value,
        this.predictAdmForm.controls.mobileno.value,
        this.predictAdmForm.controls.course_category.value,
        this.collegeid,
        this.predictAdmForm.controls.course.value,
        this.predictAdmForm.controls.exam.value,
        this.predictAdmForm.controls.expected_rank.value,
        this.predictAdmForm.controls.expected_score.value,
      ).subscribe(res => {
        Swal.fire('', 'Your application has been submitted successfully. We will get back to you soon!', 'success');
        this.predictAdmForm.reset();
        this.close();
      })
    }
  }

  getExamList() {
    // this.ExamLoader = true;
    this.CompareclgService.getExamList('').subscribe(res => {
      // this.ExamLoader = false;
      this.examListArr = res.response_data;
      this.examTypeFilter.next(this.examListArr.slice());
    })
  }

  downloadBrochure(collegeid) {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
       let userId = localStorage.getItem('userId');
      this.CompareclgService.downloadBrochure(collegeid, userId).subscribe(res => {
        Swal.fire('', res.response_message, 'success');
      })
    }
  }

  getRatingList() {
    this.CompareclgService.getRatingList().subscribe(res => {
      this.RatingArr = res.Rating;
    })
  }
}