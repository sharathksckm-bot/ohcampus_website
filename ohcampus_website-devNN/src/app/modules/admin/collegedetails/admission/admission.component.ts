import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import * as xlsx from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admission',
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.scss']
})
export class AdmissionComponent implements OnInit {
  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  @ViewChild('ImportantDates', { static: false }) ImportantDates: ElementRef;
  selectedThumb: string | null = null;

  logo1: string = 'assets/images/logoclg.jpg';
  studentForum: FormGroup;
  //DECLARE ARRAYS
  CoursesArr: any = []; campusImagesArr: any = []; NotificationArr: any = []; latest_blogsArr: any = []; popular_blogsArr: any = []; AdmissionProcessArr: any = [];
  CollegesAccordingCategoryArr: any = []; AdmissionProcessFAQArr: any = []; EntranceExamsArr: any = []; popularClgByLocArr: any = []; QueAnsAboutAdmissionsArr: any = [];
  whats_new: SafeHtml;
  expandedStatesCourse: boolean[] = new Array(this.popularClgByLocArr.length).fill(false);

  //DECLARE VARIABLES
  image: any; collegeId: any; collegename: any; currentYear = (new Date()).getFullYear(); cityid: any; category: any; categoryId: any; course_category: any;
  course: any; sub_category: any; tab: number;
  courseid: any;
  submitLoader:boolean  = false;
  constructor(
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    public CompareclgService: CompareclgService,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.id;
    this.studentForum = this._formBuilder.group({
      studentque: ['', Validators.required]
    })


    this.getCollegeDetailsByID();
    this.getExamNotificationForClg();
    this.getLatestBlogs();
    this.getCollegeAdmissionProcess();
    // this.getPopularClgByLocation();
    this.getCollegesAccordingCategory();
    this.getQueAnsAboutAdmissions();
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

  onShowCourse(index: number): void {
    this.expandedStatesCourse[index] = !this.expandedStatesCourse[index];
  }

  getCollegeDetailsByID(): void {
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.collegename = res.college_detail[0].title;
      this.cityid = res.college_detail[0].cityid;
      this.getPopularClgByLocation();
      this.category = res.college_detail[0].category;
      this.categoryId = res.college_detail[0].categoryid;
      this.getCollegesAccordingCategory();
      // this.CoursesArr = res.college_detail[0].Courses;
      this.whats_new = ((res.college_detail[0].what_new));
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

  safeHtml(value) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  getExamNotificationForClg() {
    this.CompareclgService.getExamNotificationForClg(this.collegeId,).subscribe(res => {
      this.NotificationArr = res.response_data;
      if (res.response_code == 400) {
        this.NotificationArr = '';
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

  getCollegeAdmissionProcess() {
    this.CompareclgService.getCollegeAdmissionProcess(this.collegeId).subscribe(res => {
      this.AdmissionProcessArr = res.AdmissionProcess;
      this.EntranceExamsArr = res.AdmissionProcess.entrance_exams;
      this.AdmissionProcessFAQArr = res.Commonaly_Asked_Questions;

    })
  }

  getPopularClgByLocation() {
    this.CompareclgService.getPopularClgByLocation(this.cityid,this.courseid,this.categoryId).subscribe(res => {
      this.popularClgByLocArr = res.CollegeListForCompare;
      if (res.response_code == 400) {
        this.popularClgByLocArr = '';
      }
    })
  }

  getCollegesAccordingCategory() {
    this.CompareclgService.getCollegesAccordingCategory(this.collegeId, this.categoryId).subscribe(res => {
      this.CollegesAccordingCategoryArr = res.bestSuitedColleges;
      if (res.response_code == 400) {
        this.CollegesAccordingCategoryArr = '';
      }
    })
  }

  getQueAnsAboutAdmissions() {
    this.CompareclgService.getQueAnsAboutAdmissions(this.collegeId).subscribe(res => {
      this.QueAnsAboutAdmissionsArr = res.QueAnsAboutAdmissions;
    })
  }

  getAllanswers(QueId) {
    this.router.navigate(['/allanswers', this.collegeId, QueId]);
  }

  postQuestion() {
    if (this.studentForum.invalid) {
      this.studentForum.markAllAsTouched();
    }
    else {
      this.submitLoader = true;
      this.CompareclgService.postQuestion(this.collegeId, this.course_category, this.course, '22', this.studentForum.value.studentque).subscribe(res => {
        this.submitLoader = false;
        Swal.fire('', 'Question has been submitted. We will get back to you soon!', 'success');
        this.studentForum.reset();
      })
    }
  }

  getExamDetails(examId) {
    this.router.navigate(['/examsdetails', examId])
  }

  //Export to Excel
  exportToExcel() {
    const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.ImportantDates.nativeElement);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    xlsx.writeFile(wb, 'ImportantDates.xlsx');
  }


  getCoursesBySubcategory(sub_category) {
    this.sub_category = sub_category;
    this.tab = 1;
    this.router.navigate(['/collegeDetails', this.collegeId, 'CoursesFees', this.sub_category]);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
  }

  getArticleDetails(BlogId) {
    this.router.navigate(['/articledetails', BlogId])
  }

  AdmissionProcessImportantDatesPDF(sub_category) {
    this.CompareclgService.AdmissionProcessImportantDatesPDF(this.collegeId, sub_category).subscribe(res => {
      let viewPDF = res;
      window.open(viewPDF.PDF, "_blank")
    })
  }

  getCompareTab(selectedcollegeid) {
    this.router.navigate(['/comparecollege/' + selectedcollegeid]);
  }
}
