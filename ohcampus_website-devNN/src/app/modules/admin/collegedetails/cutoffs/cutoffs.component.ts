import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cutoffs',
  templateUrl: './cutoffs.component.html',
  styleUrls: ['./cutoffs.component.scss']
})
export class CutoffsComponent implements OnInit {
  selectedThumb: string | null = null;

  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  studentForum: FormGroup;
  logo1: string = 'assets/images/logoclg.jpg';
  campusImagesArr: any = []; NotificationArr: any = []; latest_blogsArr: any = []; popular_blogsArr: any = []; CollegesAccordingCategoryArr: any = []; popularClgByLocArr: any = [];
  infraReviewsArr: any = []; Commonaly_Asked_QuestionsCutOff: any = []

  collegeId: any; image: any; collegename: any; categoryId: any; category: any; cityid: any; course_category: any; course: any;
  whats_new: any; round1: any; round3: any; round2: any; COMEDKround1: any; COMEDKround2: any; COMEDKround3: any; description: any; is_accept_entrance: any;
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
    this.studentForum = this._formBuilder.group({
      studentque: ['']
    })
    this.collegeId = routeParams.id;
    this.getCollegeDetailsByID();
    this.getExamNotificationForClg();
    this.getLatestBlogs();
    this.getInfrastructureRating();
    this.getKCETCutOff();
    this.getKCETCutOffByRound();
    this.getCOMEDKCutOffRoundWise();
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
      this.cityid = res.college_detail[0].cityid;
      
      this.category = res.college_detail[0].category;
      this.categoryId = res.college_detail[0].categoryid;
      this.getCollegesAccordingCategory();
      this.getPopularClgByLocation();
      this.whats_new = ((res.college_detail[0].what_new));
      this.description = res.college_detail[0].description;
      this.campusImagesArr = res.college_images;
      this.is_accept_entrance = res.college_detail[0].is_accept_entrance;
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

  getExamNotificationForClg() {
    this.CompareclgService.getExamNotificationForClg(this.collegeId,).subscribe(res => {
      // console.log(res);
      this.NotificationArr = res.response_data;
      if (res.response_code == 400) {
        this.NotificationArr = '';

      }
    })
  }

  getInfrastructureRating() {
    this.CompareclgService.getInfrastructureRating(this.collegeId).subscribe(res => {
      this.infraReviewsArr = res.data.infraReviews;
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

  getExamDetails(ExamId) {
    this.router.navigate(['/examsdetails', ExamId]);
  }


  getArticleDetails(BlogId) {
    this.router.navigate(['/articledetails', BlogId])
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
    this.CompareclgService.getPopularClgByLocation(this.cityid,this.courseid,'').subscribe(res => {
      this.popularClgByLocArr = res.CollegeListForCompare;
      if (res.response_code == 400) {
        this.popularClgByLocArr = '';
      }
    })
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

  getKCETCutOff() {
    this.CompareclgService.getKCETCutOff(this.collegeId, 1, 'GM').subscribe(res => {
      this.Commonaly_Asked_QuestionsCutOff = res.Commonaly_Asked_Questions;
      if (res.response_code == 400) {
        this.Commonaly_Asked_QuestionsCutOff = '';
      }
    })
  }

  getKCETCutOffByRound() {
    // if(this.is_accept_entrance==1){
    this.CompareclgService.getKCETCutOffByRound(this.collegeId).subscribe(res => {
      if (res.response_code == 200) {
        this.round1 = res.CoutOffRoundWise.round1;
        this.round2 = res.CoutOffRoundWise.round2;
        this.round3 = res.CoutOffRoundWise.round3;
      }
    })
    // }
  }

  getCOMEDKCutOffRoundWise() {
    // if(this.is_accept_entrance==1){
    this.CompareclgService.getCOMEDKCutOffRoundWise(this.collegeId).subscribe(res => {
      if (res.response_code == 200) {
        this.COMEDKround1 = res.CoutOffRoundWise.round1;
        this.COMEDKround2 = res.CoutOffRoundWise.round2;
        // this.COMEDKround3 = res.CoutOffRoundWise.round3;
      }
    })
    // }
  }

  getCompareTab(selectedcollegeid) {
    this.router.navigate(['/comparecollege/' + selectedcollegeid]);
  }
}
