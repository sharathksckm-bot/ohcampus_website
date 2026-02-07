/* eslint-disable @typescript-eslint/naming-convention */

import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';


interface Coursecat {
  value: string;
  viewValue: string;
}
interface States {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-comparecolleges',
  templateUrl: './comparecolleges.component.html',
  styleUrls: ['./comparecolleges.component.scss']
})
export class ComparecollegesComponent implements OnInit {
  searchCollegeControl: FormControl = new FormControl();
  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  resultSets: any[];
  recordsTotal: any;
  @ViewChild('compareSection') compareSection: ElementRef;
  selectedCourses_Count: any;
  selectedCollage_category: any;
  selectedestd: any;
  level: any;
  duration: any;
  selectedlevel: any;
  selectedduration: any;
  noData: boolean = false;

  @ViewChild('popupinfo') popupinfo: TemplateRef<any>;

  selectCollegeForm: FormGroup;

  collageListArr: any = []; degreeArr: any = []; coursesArr: any = []; featuredClgArr: any = []; RatingArr: any = []; RankArr: any = [];
  coursesandfeesArr: any = []; Academic_DateArr: any = []; AdminssionprocessArr: any = []; selectedclgRankArr: any = []; selectedclgAdminssionprocessArr: any = [];
  selectedclgfacilities: any = []; facilitiesArr: any = []
  selectedclgcoursesandfeesArr: any = []; college4facilitiesArr: any = []
  college3coursesandfeesArr: any = []
  college3RankArr: any = [];
  college3AdminssionprocessArr: any = [];
  college3facilitiesArr: any = [];
  college4RankArr: any = [];
  college4coursesandfeesArr: any = [];
  college4AdminssionprocessArr: any = [];

  coolegeList: boolean = true; comparedata: boolean = false; comparedata1: boolean = true; comparedata2: boolean = true; comparedata3: boolean = true; collegeForm: boolean = false;
  collegeLoader: boolean = false; degreeLoader: boolean = false; courseLoader: boolean = false; getDAtaLoader: boolean = false; showDiv1: boolean = true;

  category_id: any; searchValue: any; searchText; selectedcollage: any;
  pageSize: number = 10; start = 0; collegeId: any;


  divType: any; collegeName: any; courseName: any; collegeLocation: any; collegeLogo: any; Collage_category: any; Courses_Count: any; estd: any; Rating: any; NIRF: any; indiaTodayRank: any;
  placement_rate: any; infrastructure_rate: any; faculty_rate: any; campus_rate: any; money_rate: any; popularcollegestocampare: any; categoryid: any; image: any; FirstCourse: any;
  selectedcollegeId: any; selectedcollegeName: any; selectedimage: any; selectedcollegeLocation: any; selectedFirstCourse: any; reviewsArr: any; totalRateCount: any; totalPlacementRateCount: any;
  totalInfrastructureRateCount: any; totalFacultyRateCount: any; totalHostelRateCount: any; totalCampusRateCount: any; totalMoneyRateCount: any; one2twoRate: any; two2threeRate: any;
  three2fourRate: any; four2fiveRate: any; totalReview: any; latest_blogsArr: any; collegeimage: any;
  tab: number; Academic_Date: any; median_salary: any; no_of_companies_visited: any; no_of_student_selected: any; no_of_students_placed: any; year: any; selectedcollegeLogo: any;
  selectedclgRating: any; selectedclgtotalReview: any; selectedclgmedian_salary: any; selectedclgno_of_companies_visited: any; selectedclgno_of_student_selected: any;
  selectedclgno_of_students_placed: any; selectedclgyear: any;

  college3Name: any; college3courseName: any; college3collegeLocation: any; college3estd: any; college3level: any; college3duration: any; college3collegeLogo: any; college3collegeimage: any;
  college3Collage_category: any; college3Courses_Count: any; college3Rating: any; college3totalReview: any; college3median_salary: any; college3no_of_companies_visited: any;
  college3no_of_student_selected: any; college3no_of_students_placed: any; college3year: any;

  college4Name: any; college4courseName: any; college4collegeLocation: any; college4estd: any; college4level: any; college4duration: any; college4collegeLogo: any; college4collegeimage: any;
  college4Collage_category: any; college4Courses_Count: any; college4Rating: any; college4totalReview: any; college4median_salary: any; college4no_of_companies_visited: any;
  college4no_of_student_selected: any; college4no_of_students_placed: any; college4year: any;

  college1Id: any; college2Id: any; college3Id: any; college4Id: any;


  constructor(private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    public CompareclgService: CompareclgService) {
  }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.id;
    this.selectedcollegeId = routeParams.selectedid;

    this.selectCollegeForm = this._formBuilder.group({
      search_college: [''],
      degree: ['', Validators.required],
      course: ['', Validators.required],
    });
    // this.getCollegedetailtoCompare();
    // 
    // this.CompareLoader = true;
    if (this.collegeId == undefined) {
      this.comparedata = true;
    }
    this.getCompareCollegeDetailsByID();
    if (this.selectedcollegeId != undefined) {
      this.comparedata1 = false;
      setTimeout(() => {
        this.getSelectedCollegeDetails();
      }, 1000);
    }

    this.searchCollegeControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.collageListArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getCollegelistCompare(value, this.start, this.pageSize,).subscribe(res => {
              this.collegeLoader = false;
              this.collageListArr = res.data;
            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.CompareclgService.getCollegelistCompare(value, this.start, this.pageSize,).subscribe(res => {
          this.coolegeList = true;
          this.collegeLoader = false;
          this.collageListArr = res.data;
        })
      });
    // this.getFeaturedColleges();
    // this.getReviewDetails();
    this.getLatestBlogs();
    // console.log(this.popularcollegestocampare)
  }

  coursecat: Coursecat[] = [
    { value: 'opt-0', viewValue: 'Engineering' },
    { value: 'opt-1', viewValue: 'Management' },
    { value: 'opt-2', viewValue: 'Arts & Science' },
    { value: 'opt-3', viewValue: 'Agriculture' },
    { value: 'opt-4', viewValue: 'Commerce' },
  ];

  state: States[] = [
    { value: 'opt-0', viewValue: 'Maharashtra' },
    { value: 'opt-1', viewValue: 'Karnataka' },
    { value: 'opt-2', viewValue: 'Uttar Pradesh' },
    { value: 'opt-3', viewValue: 'Andhra Pradesh' },
    { value: 'opt-4', viewValue: 'Gujrat' },
  ];

  modifySelection(type) {
    this.divType = type;
    this.dialog.open(this.popupinfo);
  }


  getCompareCollegeDetailsByID() {
    // this.CompareLoader=false;
    this.CompareclgService.getCompareCollegeDetailsByID(this.collegeId, this.selectCollegeForm.value.degree, this.selectCollegeForm.value.course).subscribe(res => {
      if (res.response_code == 400) {
        // this.noData=true
      }
      else {
        this.collegeName = res.college_detail[0].title;
        this.courseName = this.selectCollegeForm.value.course;
        this.collegeLocation = res.college_detail[0].city;
        this.college1Id = res.college_detail[0].id;
        this.estd = res.college_detail[0].estd;
        this.categoryid = res.college_detail[0].categoryid;
        this.getPopularCollegeListForCompare();
        this.level = res.college_detail[0]?.Courses_list[0]?.level;
        this.duration = res.college_detail[0]?.Courses_list[0]?.duration;
        this.collegeLogo = res.college_detail[0].logo;
        this.collegeimage = res.college_detail[0].image;
        this.Collage_category = res.college_detail[0].Collage_category;
        this.Courses_Count = res.college_detail[0].Courses_Count;
        this.Rating = res.college_detail[0].ReviewRating.totalRateCount;
        this.totalReview = res.college_detail[0].ReviewRating.totalReview;
        this.RankArr = res.college_detail[0].Rank;
        this.coursesandfeesArr = res.college_detail[0]?.coursesandfees;
        this.AdminssionprocessArr = res.college_detail[0]?.Adminssionprocess;
        this.median_salary = res.college_detail[0]?.Academic_Date[0]?.median_salary;
        this.no_of_companies_visited = res.college_detail[0]?.Academic_Date[0]?.no_of_companies_visited;
        this.no_of_student_selected = res.college_detail[0]?.Academic_Date[0]?.no_of_student_selected;
        this.no_of_students_placed = res.college_detail[0]?.Academic_Date[0]?.no_of_students_placed;
        this.year = res.college_detail[0]?.Academic_Date[0]?.year;
        this.facilitiesArr = res.college_detail[0].facilities;
        this.image = res.college_detail[0].image;
      }

    })
  }


  getcoursesFees(college1Id) {
    this.tab = 1
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college1Id])
  }

  getcoursesFeesForselectedclg(college2Id) {
    this.tab = 1
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college2Id])
  }

  getcoursesFeesForcollege3(college3Id) {
    this.tab = 1
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college3Id])
  }

  getcoursesFeesForcollege4(college4Id) {
    this.tab = 1
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college4Id])
  }

  getLatestBlogs() {
    if (this.collegeId != undefined) {
      this.CompareclgService.getLatestBlogs(this.collegeId).subscribe(res => {
        this.latest_blogsArr = res.latest_blogs;
        if (res.response_code == 400) {
          this.latest_blogsArr = '';
        }
      })
    }
    this.CompareclgService.getLatestBlogs('2829').subscribe(res => {
      this.latest_blogsArr = res.latest_blogs;
      if (res.response_code == 400) {
        this.latest_blogsArr = '';
      }
    })
  }

  getadmissiontab(college1Id) {
    this.tab = 3
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college1Id])
  }

  getadmissiontabForselectedclg(college2Id) {
    this.tab = 3
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college2Id])
  }

  getcollege3adm(college3Id) {
    this.tab = 3
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college3Id])
  }

  getcollege4adm(college4Id) {
    this.tab = 3
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', +college4Id])
  }

  AddClg(type) {
    this.divType = type;
    this.dialog.open(this.popupinfo);
    this.selectCollegeForm.reset();
    this.selectedcollage = '';
    this.searchCollegeList();
  }

  popupClose() {
    this.dialog.closeAll();
    this.coolegeList = true;
    this.collegeForm = false;
  }

  clgList(collegename, collegeid) {
    this.collegeId = collegeid;
    console.log(this.selectedcollage)
    this.selectedcollage = collegename;
    this.coolegeList = false;
    this.collegeForm = true;
    this.getDegreeData();
  }

  toggleDivs(type) {
    if (type == 'first') {
      this.comparedata = true;
    }
    if (type == 'second') {
      this.comparedata1 = true;
    }
    if (type == 'third') {
      this.comparedata2 = true;
    }
    if (type == 'fourth') {
      this.comparedata3 = true;
    }
  }

  searchCollegeList() {
    this.coolegeList = true;
    this.collegeLoader = true;
    this.category_id = '';
    this.CompareclgService.getCollegelistCompare(this.selectCollegeForm.value.search_college, this.start, this.pageSize,).subscribe(res => {
      this.collegeLoader = false;
      this.collageListArr = res.data;
    })

  }

  gotoQuote() {
    this.dialog.closeAll();
    if (this.divType == 'one') {
      this.comparedata = false;
      this.getCompareCollegeDetailsByID();
    }
    if (this.divType == 'two') {
      this.comparedata1 = false;
      this.CompareclgService.getCompareCollegeDetailsByID(this.collegeId, this.selectCollegeForm.value.degree, this.selectCollegeForm.value.course).subscribe(res => {
        this.selectedcollegeName = res.college_detail[0]?.title;
        this.selectedcollegeLocation = res.college_detail[0]?.city;
        this.selectedestd = res.college_detail[0]?.estd;
        this.selectedlevel = res.college_detail[0]?.Courses_list[0]?.level;
        this.selectedduration = res.college_detail[0]?.Courses_list[0]?.duration;
        this.selectedcollegeLogo = res.college_detail[0]?.logo;
        this.selectedimage = res.college_detail[0]?.image;
        this.selectedCollage_category = res.college_detail[0]?.Collage_category;
        this.selectedCourses_Count = res.college_detail[0]?.Courses_Count;
        this.selectedclgRating = res.college_detail[0]?.ReviewRating.totalRateCount;
        this.selectedclgtotalReview = res.college_detail[0]?.ReviewRating.totalReview;
        this.selectedclgRankArr = res.college_detail[0]?.Rank;
        this.selectedclgcoursesandfeesArr = res.college_detail[0]?.coursesandfees;
        this.selectedclgAdminssionprocessArr = res.college_detail[0]?.Adminssionprocess;
        this.selectedclgmedian_salary = res.college_detail[0]?.Academic_Date[0]?.median_salary;
        this.selectedclgno_of_companies_visited = res.college_detail[0]?.Academic_Date[0]?.no_of_companies_visited;
        this.selectedclgno_of_student_selected = res.college_detail[0]?.Academic_Date[0]?.no_of_student_selected;
        this.selectedclgno_of_students_placed = res.college_detail[0]?.Academic_Date[0]?.no_of_students_placed;
        this.selectedclgyear = res.college_detail[0]?.Academic_Date[0]?.year;
        this.selectedclgfacilities = res.college_detail[0].facilities;
        this.image = res.college_detail[0].image;

      });
    }
    if (this.divType == 'three') {
      // console.log(this.selectCollegeForm);
      this.comparedata2 = false;
      this.CompareclgService.getCompareCollegeDetailsByID(this.collegeId, this.selectCollegeForm.value.degree, this.selectCollegeForm.value.course).subscribe(res => {
        this.college3Name = res.college_detail[0]?.title;
        this.college3courseName = this.selectCollegeForm.value.course;
        this.college3collegeLocation = res.college_detail[0]?.city;
        this.college3estd = res.college_detail[0]?.estd;
        this.college3Id = res.college_detail[0]?.id;
        this.college3level = res.college_detail[0]?.Courses_list[0]?.level;
        this.college3duration = res.college_detail[0]?.Courses_list[0]?.duration;
        this.college3collegeLogo = res.college_detail[0]?.logo;
        this.college3collegeimage = res.college_detail[0]?.image;
        this.college3Collage_category = res.college_detail[0]?.Collage_category;
        this.college3Courses_Count = res.college_detail[0]?.Courses_Count;
        this.college3Rating = res.college_detail[0]?.ReviewRating.totalRateCount;
        this.college3totalReview = res.college_detail[0]?.ReviewRating.totalReview;
        this.college3RankArr = res.college_detail[0]?.Rank;
        this.college3coursesandfeesArr = res.college_detail[0]?.coursesandfees;
        this.college3AdminssionprocessArr = res.college_detail[0]?.Adminssionprocess;
        if (res.college_detail[0].Academic_Date != '') {
          this.college3median_salary = res.college_detail[0]?.Academic_Date[0]?.median_salary;
          this.college3no_of_companies_visited = res.college_detail[0]?.Academic_Date[0]?.no_of_companies_visited;
          this.college3no_of_student_selected = res.college_detail[0]?.Academic_Date[0]?.no_of_student_selected;
          this.college3no_of_students_placed = res.college_detail[0]?.Academic_Date[0]?.no_of_students_placed;
          this.college3year = res.college_detail[0]?.Academic_Date[0]?.year;
        }

        this.college3facilitiesArr = res.college_detail[0].facilities;
        this.image = res.college_detail[0].image;
      })
    }
    if (this.divType == 'four') {
      this.comparedata3 = false;
      this.CompareclgService.getCompareCollegeDetailsByID(this.collegeId, this.selectCollegeForm.value.degree, this.selectCollegeForm.value.course).subscribe(res => {
        this.college4Name = res.college_detail[0].title;
        this.college4courseName = this.selectCollegeForm.value.course;
        this.college4collegeLocation = res.college_detail[0]?.city;
        this.college4estd = res.college_detail[0]?.estd;
        this.college4Id = res.college_detail[0]?.id;
        this.college4level = res.college_detail[0]?.Courses_list[0]?.level;
        this.college4duration = res.college_detail[0]?.Courses_list[0]?.duration;
        this.college4collegeLogo = res.college_detail[0]?.logo;
        this.college4collegeimage = res.college_detail[0]?.image;
        this.college4Collage_category = res.college_detail[0]?.Collage_category;
        this.college4Courses_Count = res.college_detail[0]?.Courses_Count;
        this.college4Rating = res.college_detail[0]?.ReviewRating?.totalRateCount;
        this.college4totalReview = res.college_detail[0]?.ReviewRating.totalReview;
        this.college4RankArr = res.college_detail[0]?.Rank;
        this.college4coursesandfeesArr = res.college_detail[0]?.coursesandfees;
        this.college4AdminssionprocessArr = res.college_detail[0]?.Adminssionprocess;
        if (res.college_detail[0].Academic_Date != '') {
          this.college4median_salary = res.college_detail[0]?.Academic_Date[0]?.median_salary;
          this.college4no_of_companies_visited = res.college_detail[0]?.Academic_Date[0]?.no_of_companies_visited;
          this.college4no_of_student_selected = res.college_detail[0]?.Academic_Date[0]?.no_of_student_selected;
          this.college4no_of_students_placed = res.college_detail[0]?.Academic_Date[0]?.no_of_students_placed;
          this.college4year = res.college_detail[0]?.Academic_Date[0]?.year;
        }

        this.college4facilitiesArr = res.college_detail[0].facilities;
        this.image = res.college_detail[0].image;
      })
    }
    this.searchCollegeList();
  }

  //getDegreeList
  getDegreeData() {
    this.degreeLoader = true;;
    this.CompareclgService.getLevelById(this.collegeId).subscribe(res => {
      this.degreeLoader = false;
      this.degreeArr = res.data;
    })
  }

  //getcourseList
  getcourseData() {
    this.courseLoader = true;
    this.CompareclgService.getCoursesbyCollege(this.selectCollegeForm.value.degree, this.collegeId).subscribe(res => {
      this.courseLoader = false;
      this.coursesArr = res.data;
    })

  }

  //gET fEATURED cOLEGE List
  getFeaturedColleges() {
    this.CompareclgService.CompareCollege().subscribe(res => {
      this.featuredClgArr = res.data;
    });
  }


  getStars(rating: number) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push({ icon: 'mat_solid:star' });
    }
    if (halfStar) {
      stars.push({ icon: 'mat_solid:star_half' });
    }
    return stars;
  }


  generateStars(count: number): string[] {
    const stars: string[] = [];
    const fullStarsCount = Math.floor(count);
    const hasHalfStar = count - fullStarsCount >= 0.5;

    for (let i = 0; i < fullStarsCount; i++) {
      stars.push('mat_solid:star');
    }

    if (hasHalfStar) {
      stars.push('mat_solid:star_half');
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push('mat_outline:star_border');
    }

    return stars;
  }


  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getSelectedCollegeDetails() {
    this.CompareclgService.getCompareCollegeDetailsByID(this.selectedcollegeId, this.selectCollegeForm.value.degree, this.selectCollegeForm.value.course).subscribe(res => {
      this.selectedcollegeName = res.college_detail[0].title;
      this.selectedcollegeLocation = res.college_detail[0].city;
      this.selectedestd = res.college_detail[0].estd;
      this.college2Id = res.college_detail[0].id;
      this.selectedlevel = res.college_detail[0].Courses_list[0].level;
      this.selectedduration = res.college_detail[0].Courses_list[0].duration;
      this.selectedcollegeLogo = res.college_detail[0].logo;
      this.selectedimage = res.college_detail[0].image;
      this.selectedCollage_category = res.college_detail[0].Collage_category;
      this.selectedCourses_Count = res.college_detail[0].Courses_Count;
      this.selectedclgRating = res.college_detail[0].ReviewRating.totalRateCount;
      this.selectedclgtotalReview = res.college_detail[0].ReviewRating.totalReview;
      this.selectedclgRankArr = res.college_detail[0].Rank;
      // console.log(this.selectedclgRankArr)
      this.selectedclgcoursesandfeesArr = res.college_detail[0].coursesandfees;
      this.selectedclgAdminssionprocessArr = res.college_detail[0].Adminssionprocess;
      this.selectedclgmedian_salary = res.college_detail[0]?.Academic_Date[0]?.median_salary;
      this.selectedclgno_of_companies_visited = res.college_detail[0]?.Academic_Date[0]?.no_of_companies_visited;
      this.selectedclgno_of_student_selected = res.college_detail[0]?.Academic_Date[0]?.no_of_student_selected;
      this.selectedclgno_of_students_placed = res.college_detail[0]?.Academic_Date[0]?.no_of_students_placed;
      this.selectedclgyear = res.college_detail[0]?.Academic_Date[0]?.year;
      this.selectedclgfacilities = res.college_detail[0].facilities;
      this.image = res.college_detail[0].image;

    });
  }

  getPopularCollegeListForCompare() {
    this.CompareclgService.getPopularCollegeListForCompare(this.categoryid).subscribe((res) => {
      this.popularcollegestocampare = res.CollegeListForCompare;
      this.popularcollegestocampare = this.chunkArray(this.popularcollegestocampare, 3);
    });
  }

  getCollegeTotalRate() {
    this.CompareclgService.getCollegeTotalRate(this.collegeId).subscribe(res => {
      this.totalRateCount = res.data.totalRateCount;
      this.totalReview = res.data.totalReview;
    })
  }


  chunkArray(array: any[], size: number): any[] {
    const chunkedArr = [];
    let index = 0;
    while (index < array.length) {
      chunkedArr.push(array.slice(index, index + size));
      index += size;
    }
    return chunkedArr;
  }

  compareClg(selectedcollegeid) {
    this.selectedcollegeId = selectedcollegeid;
    this.router.navigate(['/collegeDetails/' + this.collegeId + '/compare/' + this.selectedcollegeId + '/comparecollege/compareDetails']);
    this.getSelectedCollegeDetails();
    setTimeout(() => {
      this.scrollToCompare();
    }, 100);
  }

  scrollToCompare() {
    if (this.compareSection && this.compareSection.nativeElement) {
      this.compareSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
