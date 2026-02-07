import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  selectedThumb: string | null = null;
  logo1: string = 'assets/images/logoclg.jpg';
  studentForum: FormGroup;
  latest_blogsArr: any = []; popular_blogsArr: any = []; campusImagesArr: any = []; NotificationArr: any = []; reviewsArr: any = []; reviewsssArr: any = []; popularClgByLocArr: any = [];
  CollegesAccordingCategoryArr: any = [];

  collegeId: any; collegename: any; image: any; totalRateCount: any; totalPlacementRateCount: any; totalInfrastructureRateCount: any; totalFacultyRateCount: any; totalHostelRateCount: any;
  totalMoneyRateCount: any; totalCampusRateCount: any; one2twoRate: any; two2threeRate: any; three2fourRate: any; four2fiveRate: any; course_category: any;
  course: any; faculty_desc: any; infrastructure_desc: any; placement_desc: any; category: any; categoryId: any; cityid: any;
  courseid: any;

  constructor(
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    public CompareclgService: CompareclgService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.id;
    this.studentForum = this._formBuilder.group({
      studentque: ['', Validators.required]
    })
    this.getLatestBlogs();
    this.getCollegeDetailsByID();
    this.getExamNotificationForClg();
    this.getReviewDetails();
  }
  selectThumb(thumb: string): void {
    this.selectedThumb = thumb;
  }
  openImageDialog(img) {
    const dialogRef = this.dialog.open(this.callAPIDialog1);
    dialogRef.afterClosed().subscribe((result) => { });
    this.image = img;
  }

  close() {
    this.dialog.closeAll();
  }

  getCollegeDetailsByID() {
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.collegename = res.college_detail[0].title;
      this.category = res.college_detail[0].category;
      this.cityid = res.college_detail[0].cityid;
      
      this.categoryId = res.college_detail[0].categoryid;
      this.getCollegesAccordingCategory();
      this.getPopularClgByLocation();
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

  getExamNotificationForClg() {
    this.CompareclgService.getExamNotificationForClg(this.collegeId,).subscribe(res => {
      this.NotificationArr = res.response_data;
      if (res.response_code == 400) {
        this.NotificationArr = '';
      }
    })
  }

  getReviewDetails() {
    this.CompareclgService.getReviewDetails(this.collegeId).subscribe(res => {
      this.reviewsArr = res.data.reviews;
      this.totalRateCount = res.data.totalRateCount;
      this.totalPlacementRateCount = res.data.totalPlacementRateCount;
      this.totalInfrastructureRateCount = res.data.totalInfrastructureRateCount;
      this.totalFacultyRateCount = res.data.totalFacultyRateCount;
      this.totalHostelRateCount = res.data.totalHostelRateCount;
      this.totalCampusRateCount = res.data.totalCampusRateCount;
      this.totalMoneyRateCount = res.data.totalMoneyRateCount;
      this.one2twoRate = res.data.one2twoRate;
      this.two2threeRate = res.data.two2threeRate;
      this.three2fourRate = res.data.three2fourRate;
      this.four2fiveRate = res.data.four2fiveRate;
      this.reviewsssArr = res.data.reviews;
      this.faculty_desc = this.reviewsssArr[0]?.faculty_desc
      this.infrastructure_desc = this.reviewsssArr[0]?.infrastructure_desc
      this.placement_desc = this.reviewsssArr[0]?.placement_desc
    })
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

  postQuestion() {
    if (this.studentForum.invalid) {
      this.studentForum.markAllAsTouched();
    }
    else {
      this.CompareclgService.postQuestion(this.collegeId, this.course_category, this.course, '22', this.studentForum.value.studentque).subscribe(res => {
        Swal.fire('', 'Question has been submited. We will get back to you soon!', 'success');
        this.studentForum.reset();
      })
    }
  }

  getArticleDetails(BlogId) {
    this.router.navigate(['/articledetails', BlogId])
  }

  getExamDetails(ExamId) {
    this.router.navigate(['/examsdetails', ExamId]);
  }

  getCollegesAccordingCategory() {
    this.CompareclgService.getCollegesAccordingCategory(this.collegeId, this.categoryId).subscribe(res => {
      this.CollegesAccordingCategoryArr = res.bestSuitedColleges;
      if (res.response_code == 400) {
        this.CollegesAccordingCategoryArr = '';
      }
    })
  }

  getPopularClgByLocation() {
    this.CompareclgService.getPopularClgByLocation(this.cityid, this.courseid,this.categoryId).subscribe(res => {
      this.popularClgByLocArr = res.CollegeListForCompare;
      if (res.response_code == 400) {
        this.popularClgByLocArr = '';
      }
    })
  }

  getCompareTab(selectedcollegeid) {
    this.router.navigate(['/comparecollege/' + selectedcollegeid]);
  }
}
