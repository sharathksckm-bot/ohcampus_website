
import { Component, OnInit, ViewChild, TemplateRef, ElementRef, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';

@Component({
  selector: 'app-courseinfo',
  templateUrl: './courseinfo.component.html',
  styleUrls: ['./courseinfo.component.scss']
})

export class CourseinfoComponent implements OnInit {
  selectedThumb: string | null = null;

  public examFilterCtrl: FormControl = new FormControl();
  public examTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  private _onDestroy = new Subject<void>();
  @ViewChild('nameElement', { static: false }) nameElementRef: ElementRef;
  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  @ViewChild('popupFilter') popupFilter: TemplateRef<any>;
  @ViewChild('callAPIDialogapply') callAPIDialogapply: TemplateRef<any>;

  applicationForm: FormGroup;
  studentForum: FormGroup;
  @Output() compareClicked = new EventEmitter<string>();
  loader: boolean = false;

  CourseCategoryArr: any = []; CoursesByCatArr: any = []; examListArr: any = []; campusImagesArr: any = []; NotificationArr: any = []; latest_blogsArr: any = []; popular_blogsArr: any = [];
  coursefeesArr: any = []; courseinfoArr: any = []; coursefeesArray: any = []; commanlyaskedqaeArr: any = []; EntranceExamsArr: any = []; popularClgByLocArr: any = [];
  colleges_Offereing_SameCourseArr: any = []; CollegesAccordingCategoryArr: any = []; QueAnsAboutCoursesArray: any = []; CoursesArr: any = [];
  courses_listArr: any = [];

  image: any; application_link: any; collegeId: any; collegename: any; courseId: string; courseName: string; cityid: any; location: any; course_category: any;
  category: any; categoryId: any; tab: number;
  // @Input() courseId: any;
  courseLoader: boolean = false;
  submitLoader: boolean = false;
  categoryid: any;
  college_typeid: any;
  subcategory: any;
  selectedcourse: any;
  logo1: string = 'assets/images/logoclg.jpg';
  sub_category: any;
  constructor(
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    public CompareclgService: CompareclgService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private el: ElementRef,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService,) { }

    
  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.id;
    this.examFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {

        this.examfilter();
      });

    this.courseId = localStorage.getItem('CourseID');
    this.courseName = localStorage.getItem('courseName');
    this.categoryid
    this.applicationForm = this._formBuilder.group({
      name: ['', Validators.required],
      mobileno: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      course_category: ['', Validators.required],
      college: ['', Validators.required],
      course: ['', Validators.required],
      exam: [''],
      expected_rank: [''],
      expected_score: ['']
    })

    this.studentForum = this._formBuilder.group({
      studentque: ['', Validators.required]
    })

    this.getCollegeDetailsByID();
    this.getExamNotificationForClg();
    this.getCourseCategory();
    this.getExamList();
    this.getLatestBlogs();
    this.getCoursesFeeStructure();
    // this.getCoursesInfo();
    this.getCoursesAdmissionProcess();
    this.getQueAnsAboutCourses();
    this.getEntranceExamsForCourse();
    // this.getCollegeProgrammesByID();
  }


  private examfilter() {
    if (!this.examListArr) {
      return;
    }

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
  selectThumb(thumb: string): void {
    this.selectedThumb = thumb;
  }

  openFilter() {
    this.dialog.open(this.popupFilter);
  }

  popupClose() {
    this.dialog.closeAll();
  }

  openImageDialog(img) {
    const dialogRef = this.dialog.open(this.callAPIDialog1);
    dialogRef.afterClosed().subscribe((result) => { });
    this.image = img;
  }

  close() {
    this.dialog.closeAll();
  }

  getCollegeDetailsByID(): void {
    this.loader = true;
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.loader = false
      this.collegename = res.college_detail[0].title;
      this.location = res.college_detail[0].city;
      this.cityid = res.college_detail[0].cityid;
      this.college_typeid = res.college_detail[0].college_typeid;
      this.categoryid = res.college_detail[0].categoryid;
      this.subcategory = res.college_detail[0].subcategory;
      this.collegesOffereingSameCourseAtSameCity();
      this.getCoursesInfo();
      this.getPopularClgByLocation();
      this.getCollegeProgrammesByID();
      this.category = res.college_detail[0].category;
      this.categoryId = res.college_detail[0].categoryid;
      this.getCollegesAccordingCategory();
      this.application_link = res.application_link;
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

  getExamNotificationForClg() {
    this.CompareclgService.getExamNotificationForClg(this.collegeId,).subscribe(res => {
      this.NotificationArr = res.response_data;
      if (res.response_code == 400) {
        this.NotificationArr = '';
      }
    })
  }

  //--------------------only Numbers are allowed---------------------//
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }


  apply() {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
      // console.log(this.application_link)
      // if (this.application_link !== '' && this.application_link != undefined) {
      //   window.open(this.application_link)
      // }
      // else {
      const dialogRef = this.dialog.open(this.callAPIDialogapply);
      this.applicationForm.get('college').setValue(this.collegename);
      dialogRef.afterClosed().subscribe((result) => { });
      // }
    }
  }

  getCourseCategory() {
    this.CompareclgService.getCourseCategory().subscribe(res => {
      this.CourseCategoryArr = res.data;
    })
  }

 
  getCourseByCategoryClg() {
    this.courseLoader = true;
    this.CompareclgService.getCourseByCategoryClg(this.applicationForm.value.course_category, this.collegeId).subscribe(res => {
      this.courseLoader = false;
      this.CoursesByCatArr = res.data

    })
    // alert(this.CoursesByCatArr)
  }

  getExamList() {
    this.CompareclgService.getExamList('').subscribe(res => {
      this.examListArr = res.response_data;
      this.examTypeFilter.next(this.examListArr.slice());
    })
  }

  getCourseselected(event) {
    // console.log(event)
    this.CoursesByCatArr.forEach((element: any) => {
      // console.log(element)
      if (element.id == event) {
        // alert(8980)
        this.selectedcourse = element.name
      }
    })
  }

  savCourseApplication() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }
    if (this.applicationForm.valid) {
      this.CompareclgService.savCourseApplication(
        this.applicationForm.controls.name.value,
        this.applicationForm.controls.email.value,
        this.applicationForm.controls.mobileno.value,
        this.applicationForm.controls.course_category.value,
        this.collegeId,
        this.applicationForm.controls.course.value,
        this.applicationForm.controls.exam.value,
        this.applicationForm.controls.expected_rank.value,
        this.applicationForm.controls.expected_score.value,
      ).subscribe(res => {
        Swal.fire('', 'Your application has been submitted successfully. We will get back to you soon!', 'success');
        this.applicationForm.reset();
        this.close();
      })
    }
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

  getCoursesFeeStructure() {
    // console.log(this.courseId)
    this.CompareclgService.getCoursesFeeStructure(this.courseId, this.collegeId).subscribe(res => {
      this.coursefeesArr = res.coursefees;
      if (res.response_code == 400) {
        this.coursefeesArr = '';
      }
    })
  }

  getCoursesInfo() {
    this.CompareclgService.getCoursesInfo(this.courseId, this.collegeId, this.college_typeid, this.categoryid).subscribe(res => {
      this.courseinfoArr = res.courseinfo;
      this.course_category = res.courseinfo[0]?.levelid;
    })
  }

  getCoursesAdmissionProcess() {
    this.CompareclgService.getCoursesAdmissionProcess(this.courseId, this.collegeId).subscribe(res => {
      this.coursefeesArray = res.coursefees;
      
      // const jsonString = this.serializedData.replace('a:3:', '');
      // return JSON.parse(jsonString);
      // console.log(this.coursefeesArray[0]?.eligibility)
      this.sub_category = this.coursefeesArray[0].sub_category
      // console.log(this.sub_category)

      this.commanlyaskedqaeArr = res.Commonaly_Asked_Questions;


    })
  }

  getcourses(subcategory) {
    this.CompareclgService.getCoursesBySubcategory(this.collegeId, subcategory,this.categoryid,this.college_typeid).subscribe(res => {
      this.courses_listArr = res.courses_list;
      setTimeout(() => {
        if (this.nameElementRef && this.nameElementRef.nativeElement) {
          this.nameElementRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    })
  }

  getQueAnsAboutCourses() {
    this.CompareclgService.getQueAnsAboutCourses(this.collegeId, this.courseId,).subscribe(res => {
      this.QueAnsAboutCoursesArray = res;
      if (res.response_code == 400) {
        this.QueAnsAboutCoursesArray = [];
      }
    })
  }

  getEntranceExamsForCourse() {
    this.CompareclgService.getEntranceExamsForCourse(this.courseId, this.collegeId,).subscribe(res => {
      this.EntranceExamsArr = res.EntranceExams;
      if (res.response_code == 400) {
        this.EntranceExamsArr = [];
      }
    })
  }

  getExamDetails(ExamId) {
    this.router.navigate(['/examsdetails', ExamId]);
  }

  collegesOffereingSameCourseAtSameCity() {
    this.CompareclgService.collegesOffereingSameCourseAtSameCity(this.courseId, this.cityid, this.collegeId).subscribe(res => {
      this.colleges_Offereing_SameCourseArr = res.colleges_Offereing_SameCourse;
      if (res.response_code == 400) {
        this.colleges_Offereing_SameCourseArr = '';
      }
    })
  }

  postQuestion() {
    if (this.studentForum.status == 'INVALID') {
      Swal.fire('', 'Please enter data', 'error');


    }
    else {
      this.submitLoader = true;
      this.CompareclgService.postQuestion(this.collegeId, this.course_category, this.courseId, '22', this.studentForum.value.studentque).subscribe(res => {
        this.submitLoader = false;
        Swal.fire('', 'Question has been submited. We will get back to you soon!', 'success');
        this.studentForum.reset();
      })
    }
  }

  getPopularClgByLocation() {
  
    this.CompareclgService.getPopularClgByLoc_cat(this.cityid,this.courseId).subscribe(res => {
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

  getArticleDetails(ArticleId) {
    this.router.navigate(['/articledetails', ArticleId]);
  }

  getCollegeDetails(collegeid) {
    this.tab = 0;
    this.router.navigate(['/collegeDetails', collegeid]);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
  }

  getCollegeProgrammesByID() {
    this.CompareclgService.getCollegeProgrammesByID(this.collegeId, this.categoryid, this.subcategory).subscribe(res => {
      this.CoursesArr = res.popular_programmes;
    })
  }

  getCourseInfo(courseId, courseName) {
    localStorage.setItem('CourseID', courseId);
    localStorage.setItem('courseName', courseName);
    window.location.reload();
  }

  downloadBrochure() {
    // this.CompareclgService.downloadBrochure(this.collegeId, '1').subscribe(res => {
    //   Swal.fire(res.response_message);
    // })
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
       let userId = localStorage.getItem('userId');
      this.CompareclgService.downloadBrochure(this.collegeId, userId).subscribe((res) => {
        Swal.fire('', res.response_message, 'success');
      })
    }
  }


  getCompareTab() {
    this.tab = 7;
    // this.router.navigate(['/collegeDetails', this.collegeId, 'Compare']);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.compareClicked.emit();
    // window.location.reload();
  }



}
