import { Component, ElementRef, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import Swal from 'sweetalert2';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-question-ans',
    templateUrl: './question-ans.component.html',
    styleUrls: ['./question-ans.component.scss']
})
export class QuestionAnsComponent implements OnInit {

    public examFilterCtrl: FormControl = new FormControl();
    public examTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    private _onDestroy = new Subject<void>();
    @ViewChild('QAformNgForm') QAformNgForm: NgForm;
    @ViewChild('questionSection') questionSection: ElementRef;
    @ViewChild('callAPIDialogapply') callAPIDialogapply: TemplateRef<any>;
    @Output() compareClicked = new EventEmitter<string>();

    applicationForm: FormGroup;
    QAform: FormGroup;
    readmore: boolean = false; readmore1: boolean = false; readmore2: boolean = false; readmore3: boolean = false; courseLoader: boolean = false; showmsg: boolean = false;

    collegename: any; collegeId: any; Estd: any; Collage_category: any;

    CourseCategoryArr: any = []; CoursesArr: any = []; QaCollegeArr: any = []; UnAnsweredQueArr: any = [];
    isFollowing: boolean[] = new Array(this.QaCollegeArr.length).fill(false); isHovered: boolean[] = [];
    isClicked: boolean[] = []; isHovered2: boolean[] = []; isClicked2: boolean[] = []; CoursesByCatArr: boolean[] = []; examListArr: any = []; CourseByCatArr: boolean[] = [];

    page: number = 1; pageSize: number = 10; startNum: number = 0; sortValue: string = "desc";
    totalQuestion: any;
    application_link: any;
    tab: number;
    submitLoader: boolean = false;

    constructor(
        private router: Router,
        private _activatedRoute: ActivatedRoute,
        public CompareclgService: CompareclgService,
        public authService: AuthService,
        public LoginpopupService: LoginpopupService,
        private sanitizer: DomSanitizer,
        private _formBuilder: FormBuilder,
        private el: ElementRef,
        public dialog: MatDialog,

    ) { }

    ngOnInit(): void {
        localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
        const routeParams = this._activatedRoute.snapshot.params;
        // console.log(routeParams);
        this.collegeId = routeParams.id;

        this.QAform = this._formBuilder.group({
            course_category: ['', Validators.required],
            course: ['', Validators.required],
            questionInput: ['']
        }),

            this.examFilterCtrl.valueChanges
                .pipe(takeUntil(this._onDestroy))
                .subscribe(() => {

                    this.examfilter();
                });

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

        this.getCollegeDetailsByID();
        this.getCourseCategory();
        this.getQAofCollege();
        this.getUnAnsweredQueofCollege();
        this.getExamList();
    }


    getCollegeDetailsByID(): void {
        this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
            this.collegename = res.college_detail[0].title;
            this.Estd = res.college_detail[0].estd;
            this.Collage_category = res.college_detail[0].Collage_category;
            this.application_link = res.application_link;
            this.getTotalQuestionForCollege();
        });
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


    getTotalQuestionForCollege() {
        this.CompareclgService.getTotalQuestionForCollege(this.collegeId).subscribe(res => {
            this.totalQuestion = res.totalQuestion.TOTALQUESTION;
        })
    }
    onPageChange(event) {
        this.page = event.pageIndex + 1;
        this.startNum = (this.pageSize * (event.pageIndex));
        this.getQAofCollege();
    }

    onPageChangeUn(event) {
        this.page = event.pageIndex + 1;
        this.startNum = (this.pageSize * (event.pageIndex));
        this.getUnAnsweredQueofCollege();
    }


    scrollToQuestion() {
        if (this.questionSection && this.questionSection.nativeElement) {
            this.questionSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    onLoginButtonClick(): void {
        if (!this.authService.isLoggedIn()) {
            this.LoginpopupService.openLoginPopup();
        }
    }

    readMore() {
        this.readmore = true;
    }

    readLess() {
        this.readmore = false;
    }

    readMore1() {
        this.readmore1 = true;
    }

    readLess1() {
        this.readmore1 = false;
    }

    readMore2() {
        this.readmore2 = true;
    }

    readLess2() {
        this.readmore2 = false;
    }

    readMore3() {
        this.readmore3 = true;
    }

    readLess3() {
        this.readmore3 = false;
    }

    getCourseCategory() {
        this.CompareclgService.getCourseCategory().subscribe(res => {
            this.CourseCategoryArr = res.data;
        })
    }

    getCourseByCategoryClg() {
        this.CompareclgService.getCourseByCategoryClg(this.QAform.value.course_category, this.collegeId).subscribe(res => {
            this.CoursesArr = res.data

        })
    }

    getQAofCollege(): void {
        this.CompareclgService.getQAofCollege(this.pageSize, this.page, this.collegeId).subscribe(res => {
            this.QaCollegeArr = res.response_data;
            if (res.response_message == 'Failed') {
                this.QaCollegeArr = [];
            }
        })

    }

    getUnAnsweredQueofCollege(): void {
        this.CompareclgService.getUnAnsweredQueofCollege(this.pageSize, this.page, this.collegeId).subscribe(res => {
            this.UnAnsweredQueArr = res.response_data;
            if (res.response_code == 400) {
                this.UnAnsweredQueArr = [];
            }
        })
    }

    getAllanswers(QueId) {
        this.router.navigate(['/allanswers', this.collegeId, QueId]);
    }

    postQuestion() {
        if (!this.authService.isLoggedIn()) {
            this.LoginpopupService.openLoginPopup();
        }
        else {
            this.submitLoader = true;
            // console.log(1)
            this.CompareclgService.postQuestion(this.collegeId, this.QAform.value.course_category, this.QAform.value.course, '22', this.QAform.value.questionInput).subscribe(res => {
                this.submitLoader = false;
                // console.log(2)
                Swal.fire('', 'Question has been submited. We will get back to you soon!', 'success');
                // this.studentForum.reset();
                this.QAformNgForm.resetForm();
                this.showmsg = true
            })
        }
    }

    followQuestion(action: string, answerId: any, index: number): void {
        if (action === 'follow') {
            this.isFollowing[index] = !this.isFollowing[index];
        } else if (action === 'unfollow') {
            this.isFollowing[index] = !this.isFollowing[index];
        }
        this.CompareclgService.followQuestion(action, '1', answerId).subscribe(res => {
            // console.log(res);
            this.getQAofCollege();
        })
    }

    followUnAnsQuestion(action: string, answerId: any, index: number): void {
        if (action === 'follow') {
            this.isFollowing[index] = !this.isFollowing[index];
        } else if (action === 'unfollow') {
            this.isFollowing[index] = !this.isFollowing[index];
        }
        this.CompareclgService.followQuestion(action, '1', answerId).subscribe(res => {
            this.getUnAnsweredQueofCollege();
        })
    }


    voteAnswere(action: string, answerId: any, index: number) {
        if (action == 'like') {
            this.isClicked[index] = !this.isClicked[index];

        }
        if (action == 'dislike') {
            this.isClicked2[index] = !this.isClicked2[index];
        }
        this.CompareclgService.voteAnswere(action, answerId, '1').subscribe(res => {
            this.getQAofCollege();
        })
    }

    getCourseByCategorybyClg() {
        this.courseLoader = true;
        this.CompareclgService.getCourseByCategoryClg(this.applicationForm.value.course_category, this.collegeId).subscribe(res => {
            this.courseLoader = false;
            this.CourseByCatArr = res.data

        })
    }

    getExamList() {
        this.CompareclgService.getExamList('').subscribe(res => {
            this.examListArr = res.response_data;
            this.examTypeFilter.next(this.examListArr.slice());
        })
    }

    apply() {
        if (!this.authService.isLoggedIn()) {
            this.LoginpopupService.openLoginPopup();
        }
        else {
            // if (this.application_link.trim() !== '') {
            //     window.open(this.application_link)
            // }
            // else {
            const dialogRef = this.dialog.open(this.callAPIDialogapply);
            this.applicationForm.get('college').setValue(this.collegename);
            dialogRef.afterClosed().subscribe((result) => { });

            // }
        }
    }

    close() {
        this.dialog.closeAll();
    }

    savCourseApplication() {
        if (this.applicationForm.invalid) {
            this.applicationForm.markAllAsTouched();
            return
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


    //--------------------only Numbers are allowed---------------------//
    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    getCollegeInfo() {
        this.tab = 0;
        this.router.navigate(['/collegeDetails', this.collegeId,]);
        localStorage.setItem('selectedTabIndex', this.tab.toString());
    }

    getCourseFees() {
        this.tab = 1;
        localStorage.setItem('selectedTabIndex', this.tab.toString());
        this.router.navigate(['/collegeDetails', this.collegeId, 'CoursesFees']).then(() => {
            // Reload the page after routing is applied
            window.location.reload();
        });

    }

    getReviews() {
        this.tab = 2;
        localStorage.setItem('selectedTabIndex', this.tab.toString());
        this.router.navigate(['/collegeDetails', this.collegeId, 'Reviews']).then(() => {
            // Reload the page after routing is applied
            window.location.reload();
        });
    }

    onTabChange(index) {
        if (index == 1) {
            this.getUnAnsweredQueofCollege();
        }
    }

    getcompareTab() {
        this.tab = 7;
        localStorage.setItem('selectedTabIndex', this.tab.toString());
        this.router.navigate(['/collegeDetails/' + this.collegeId, 'compare']).then(() => {
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

    getCuoffTab() {
        this.tab = 5;
        localStorage.setItem('selectedTabIndex', this.tab.toString());
        this.router.navigate(['/collegeDetails/' + this.collegeId, 'CutOffs']).then(() => {
            window.location.reload();
        });
    }

    getScholorshipTab() {
        this.tab = 9;
        localStorage.setItem('selectedTabIndex', this.tab.toString());
        this.router.navigate(['/collegeDetails/' + this.collegeId, 'Scholarship']).then(() => {
            window.location.reload();
        });
    }

    getArticleTab() {
        this.tab = 10;
        localStorage.setItem('selectedTabIndex', this.tab.toString());
        this.router.navigate(['/collegeDetails/' + this.collegeId, 'News']).then(() => {
            window.location.reload();
        });
    }

    // getHostelTab() {
    //     this.tab = 6;
    //     localStorage.setItem('selectedTabIndex', this.tab.toString());
    //     this.router.navigate(['/collegeDetails/' + this.collegeId, 'CutOffs']).then(() => {
    //         window.location.reload();
    //     });
    // }
}
