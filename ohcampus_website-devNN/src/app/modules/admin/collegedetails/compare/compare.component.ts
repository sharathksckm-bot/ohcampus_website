import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})

export class CompareComponent implements OnInit {
  selectedThumb: string | null = null;
  logo1: string = 'assets/images/logoclg.jpg';
  @ViewChild('popupinfo') popupinfo: TemplateRef<any>;
  selectCollegeForm: FormGroup
  searchCollegeControl: FormControl = new FormControl();
  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  comparedata: boolean = true;

  featuredClgArr: any = []; NotificationArr: any = []; latest_blogsArr: any = []; popular_blogsArr: any = []; popularClgByLocArr: any = []; collageListArr: any = [];

  Collage_category: any; collegename: any; cityid: any; campusImagesArr: any; collegeId: any; searchclg: any; selectedcollage: any; IsSelected: boolean = false;
  logo: any; totalRateCount: any; totalReview: any; PopularCompareclgService: any; popularcollegestocampare: any; image: any; categoryid: any; CollegesAccordingCategoryArr: any; category: any;
  selectedcollegetype: any; selectedimage: any; selectedrate: any; selectedreview: any; selectedcollegeid: any; tab: number;
  resultSets: any[];
  recordsTotal: any;
  courseid: any;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public CompareclgService: CompareclgService) {
  }

  ngOnInit(): void {
    // alert("compare")
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.id;
    this.getCollegeDetailsByID();
    this.getCollegeListForCompare();
    this.getExamNotificationForClg();
    this.getLatestBlogs();
    this.getCollegeTotalRate();
    this.getCollegesAccordingCategory();
    this.getPopularClgByLocation();
    this.selectCollegeForm = this.fb.group({
      search_college: ['']
    })


    this.searchCollegeControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.collageListArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getCollegeListForCompare(value).subscribe(res => {
              this.collageListArr = res.CollegeListForCompare;
            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.CompareclgService.getCollegeListForCompare(value).subscribe(res => {
          this.collageListArr = res.CollegeListForCompare;
        })
      });


  }
  selectThumb(thumb: string): void {
    this.selectedThumb = thumb;
  }
  getPopularCollegeListForCompare() {
    this.CompareclgService.getPopularCollegeListForCompare(this.categoryid).subscribe((res) => {
      this.popularcollegestocampare = res.CollegeListForCompare;
    });
  }

  getCollegeTotalRate() {
    this.CompareclgService.getCollegeTotalRate(this.collegeId).subscribe(res => {
      this.totalRateCount = res.data.totalRateCount;
      this.totalReview = res.data.totalReview;
    })
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


  getCollegeDetailsByID(): void {
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.collegename = res.college_detail[0].title;
      this.Collage_category = res.college_detail[0].Collage_category;
      this.categoryid = res.college_detail[0].categoryid;
      this.getPopularCollegeListForCompare();
      this.getCollegesAccordingCategory();
      this.category = res.college_detail[0].category;
      this.cityid = res.college_detail[0].cityid;
      this.getPopularClgByLocation();
      this.logo = res.college_detail[0].logo;
      this.image = res.college_detail[0].image;
      this.campusImagesArr = res.college_images;
      this.campusImagesArr = this.chunkArray(this.campusImagesArr, 2);
    });
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

  getCompareTab() {
    this.router.navigate(['/collegeDetails/' + this.collegeId + '/compare/' + this.selectedcollegeid + '/comparecollege/compareDetails']);
  }

  getcollegeCompareTab(selectedcollegeid) {
    this.router.navigate(['/collegeDetails/' + this.collegeId + '/compare/' + selectedcollegeid + '/comparecollege/compareDetails']);
  }


  getComparecollegeTab(collegename, collegeid, collegetype, image, ratecount, reviewcount) {
    this.selectedcollage = collegename;
    this.selectedcollegeid = collegeid;

    this.selectedcollegetype = collegetype;
    this.selectedimage = image;
    this.selectedrate = ratecount;
    this.selectedreview = reviewcount;

    // this.IsSelected = true;
    // this.popupClose();
    // this.comparedata = false;
    this.router.navigate(['/collegeDetails/' + this.collegeId + '/compare/' + this.selectedcollegeid + '/comparecollege/compareDetails']);
  }


  getCollegesAccordingCategory() {
    this.CompareclgService.getCollegesAccordingCategory(this.collegeId, this.categoryid).subscribe(res => {
      this.CollegesAccordingCategoryArr = res.bestSuitedColleges;
      if (res.response_code == 400) {
        this.CollegesAccordingCategoryArr = '';
      }
    })
  }
  getCollegeListForCompare() {
    this.CompareclgService.getCollegeListForCompare(this.searchclg).subscribe(res => {
      this.collageListArr = res.CollegeListForCompare;
    })
  }

  searchCollegeList() {
    const searchValue = this.selectCollegeForm.value.search_college;
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getCollegeListForCompare(this.selectCollegeForm.value.search_college).subscribe(res => {
    //       this.collageListArr = res.CollegeListForCompare;
    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    this.CompareclgService.getCollegeListForCompare(this.selectCollegeForm.value.search_college).subscribe(res => {
      this.collageListArr = res.CollegeListForCompare;
    })
    // }
  }

  AddClg() {
    this.dialog.open(this.popupinfo);
    this.searchCollegeControl.reset();
  }

  clgList(collegename, collegeid, collegetype, image, ratecount, reviewcount) {

    this.selectedcollage = collegename;
    this.selectedcollegeid = collegeid;

    this.selectedcollegetype = collegetype;
    this.selectedimage = image;
    this.selectedrate = ratecount;
    this.selectedreview = reviewcount;

    this.IsSelected = true;

    this.popupClose();
    this.comparedata = false;

  }

  popupClose() {
    this.dialog.closeAll();
  }

  getExamNotificationForClg() {
    this.CompareclgService.getExamNotificationForClg(this.collegeId,).subscribe(res => {
      this.NotificationArr = res.response_data;
      if (res.response_code == 400) {
        this.NotificationArr = '';
      }
    })
  }
  getPopularClgByLocation() {
    this.CompareclgService.getPopularClgByLoc_cat(this.cityid, this.courseid).subscribe(res => {
      this.popularClgByLocArr = res.CollegeListForCompare;
      if (res.response_code == 400) {
        this.popularClgByLocArr = '';
      }
    })
  }
  getLatestBlogs() {
    this.CompareclgService.getLatestBlogs(this.collegeId).subscribe(res => {
      this.latest_blogsArr = res.latest_blogs;
      this.popular_blogsArr = res.popular_blogs;
      if (res.response_code == 400) {
        this.latest_blogsArr = '';
        this.popular_blogsArr = '';
      }
    })
  }

  getArticleDetails(BlogId) {
    this.router.navigate(['/articledetails', BlogId])
  }

  getExamDetails(ExamId) {
    this.router.navigate(['/examsdetails', ExamId]);
  }

  getScholorships() {
    this.tab = 1;
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', this.collegeId, 'CoursesFees']);
  }

  getCourseFees() {
    this.tab = 1;
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails', this.collegeId, 'CoursesFees']).then(() => {
      // Reload the page after routing is applied
      window.location.reload();
    });

  }
  getAdmTab() {
    this.tab = 3;
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails/' + this.collegeId, 'Admissions']).then(() => {
      window.location.reload();
    });
  }

  getPlacementTab() {
    this.tab = 4;
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails/' + this.collegeId, 'Placements']).then(() => {
      window.location.reload();
    });
  }

  getScholorshipTab() {
    this.tab = 8;
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.router.navigate(['/collegeDetails/' + this.collegeId, 'Scholarship']).then(() => {
      window.location.reload();
    });
  }

}
