import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import { Location } from '@angular/common';
import { BehaviorSubject, Observable, ReplaySubject, Subject, forkJoin, fromEvent } from 'rxjs';
import * as xlsx from 'xlsx';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { debounceTime, map, takeUntil, tap } from 'rxjs/operators';
// import { DomSanitizer } from '@angular/platform-browser';
declare var google: any;

interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
const VIDEO_URL =
  'https://youtu.be/P7dtJ2UlHa0?si=xWerKkLe4qBlEmuO';


const navigationExtras: NavigationExtras = {
  replaceUrl: true,
};
@Component({
  selector: 'app-collegedetails',
  templateUrl: './collegedetails.component.html',
  styleUrls: ['./collegedetails.component.scss']
})

export class CollegedetailsComponent implements OnInit {
  public examFilterCtrl: FormControl = new FormControl();
  public examTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  @Output() onClick = new EventEmitter();
  showBtn$ = fromEvent(document, 'scroll').pipe(
    debounceTime(50),
    map(() => window.scrollY > 500),
    tap(() => console.log('sas'))
  );
  address: any;
  link: any;
  categoryid: any;
  subcategory: any;
  selectedcourse: any;
  CollegeFac: any;
  CollegeFacArr: { id: string; title: string; icon: string; text: string; }[];
  CollegeFacFaqArr: any;
  CoursesByCatArr2: any;
  selectedcourse2: any;
  resData: any;
  tabName: any;


  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  @ViewChild('callAPIDialogapply') callAPIDialogapply: TemplateRef<any>;
  @ViewChild('callAPIDialogpredictAdm') callAPIDialogpredictAdm: TemplateRef<any>;
  @ViewChild('ImportantDates', { static: false }) ImportantDates: ElementRef;

  PlacementForm: FormGroup;
  CutoffForm: FormGroup;
  COMEDKCutoffForm: FormGroup;
  applicationForm: FormGroup;
  predictAdmForm: FormGroup;
  public courseFilterCtrl: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  public categoryTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  //DECLARE Arrays
  CoursesArr: any = []; CollegeHighlightArr: any = []; table_of_contentArr: any = []; PlacementCategoryArr2: any = []; PlacementCategoryArr: any = []; placementDataArr: any = []; campusImagesArr: any = []; tmpArr: any[] = [];
  NotificationArr: any = []; rankArr: any = []; coursesAndFeesArr: any = []; placement_faqsArr: any = []; displayedQuestions: any[] = []; phonearr: any = [];
  latest_blogsArr: any = []; CoursesFeesFaqsArr: any = []; CoursesForSameGroupArr: any = []; rankFaqsArr: any = []; popularProgramsFaqsArr: any = [];
  contactDetailsArr: any = []; collegeByLocationArr: any = []; collegeFAQsArr: any = []; AdmissionProcessArr: any = []; AdmissionProcessFAQArr: any = []; popular_blogsArr: any = [];
  ScholorshipFAQsArr: any = []; scholarship_dataArr: any = []; CollegeHighlightFaqArr: any = []; CollegeHighlight: any = []; Commonaly_Asked_QuestionsCutOff: any = []
  CourseCategoryArr: any = []; CoursesByCatArr: any = []; examListArr: any = []; reviews: any[] = []; KCETCutoffCatArr: any = []; KCETCutoffArr: any = []; counsellingfeeArr: any = [];
  COMDEKCutoffArr: any = []
  facilitiesArr: string[] = [];
  facilityTitlesArr: string[] = [];
  facilityIconsArr: string[] = [];
  //DECLARE VARIABLES
  videoWidget: any; collegeId: any; collegename: any; Estd: any; location: any; Collage_category: any; image: string = 'assets/images/banner.png'; logo: string = '';
  whats_new: SafeHtml; ALLFAQS: Boolean = false; TabselectedIndex: number = 0;
  image1: string = 'assets/images/banner.png';
  logo1: string = 'assets/images/Default-College-Logo.png';
  highlightExpanded: boolean = false;
  CourseIntoTab: boolean = false;
  compareTab: boolean = false;
  courseLoader: boolean = false;
  loader: boolean = false;

  currentYear = (new Date()).getFullYear();
  YearValue: any;
  visibleItemsCount: number = 10;
  showMore: boolean = true; cityid: any;
  shouldApplyTransLyer: boolean = true;
  initiallyDisplayedCount = 5; initialDisplayCount = 4; initialDisplayCountRanking = 4; initialDisplayFAQ = 4; initialDisplayPopularPrograms = 4; initialDisplayAdm = 4;
  initialDisplayCoursesFees = 4; selectedTabIndex = 4;
  // google maps zoom level
  zoom: number = 8;
  yearsArray: string[] = [];
  type: string;

  count: number = 0;
  // initial center position for the map
  lat: number = 13.014423532655991; lng: number = 77.5677750496948;

  collegename1: string; email: any; website: any; sub_category: any; description: any; TabId: number; TabLabel: string; scholarship_data: any; showLoader: boolean = true;
  isLoading = true; totalRateCount: any; totalReview: any; package_type: any; application_link: any; TotalComments: any; tab: number;
  is_accept_entrance: any;

  constructor(
    private loc: Location,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private route: Router,
    private _activatedRoute: ActivatedRoute,
    public CompareclgService: CompareclgService,
    private sanitizer: DomSanitizer,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 25; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      const yearLabel = `${startYear}-${String(endYear).slice(2)}`;
      this.yearsArray.push(yearLabel);
    }

  }


  ngOnInit(): void {
    let isMobile = window.innerWidth < 768; // Set this dynamically in ngOnInit

    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    localStorage.setItem('collegeId', routeParams.id)
    const storedTabIndex = localStorage.getItem('selectedTabIndex');
    // console.log(routeParams.course)
    if (storedTabIndex) {
      this.TabselectedIndex = +storedTabIndex;
    }
    if (routeParams.course == undefined) {
      this.TabselectedIndex = 0;
    }
    else {
      this.tabName = routeParams.course;
      this.gettabName(this.tabName);
    }


    this.PlacementForm = this._formBuilder.group({
      course_category: ['',],
      year: [''],
    })


    this.CutoffForm = this._formBuilder.group({
      round: ['',],
      category: [''],
    })

    this.COMEDKCutoffForm = this._formBuilder.group({
      round: ['',],
      category: [''],
    })

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


    this.predictAdmForm = this._formBuilder.group({
      name: ['', Validators.required],
      mobileno: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      course_category: ['', Validators.required],
      college: ['', Validators.required],
      course: ['', Validators.required],
      exam: ['', Validators.required],
      expected_rank: [''],
      expected_score: ['']
    });
    // this.getTabLabelByIndex();

    // this.PlacementForm.get('course_category').setValue('2');
    // this.PlacementForm.get('year').setValue('2024-25');

    this.CutoffForm.get('round').setValue('1');
    this.CutoffForm.get('category').setValue('GM');

    this.COMEDKCutoffForm.get('round').setValue('1');
    this.COMEDKCutoffForm.get('category').setValue('GM');

    this.collegeId = routeParams.id;

    this.courseFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {

        this.categoryfilter();
      });


    this.examFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {

        this.examfilter();
      });

    Promise.all([
      this.getCollegeDetailsByID(),
      this.getCollegeHighlightByID(),
      this.getCollegeFacilitiesByID(),
      this.getPlacementCategory(),
      this.getPlacementCategoryById(this.collegeId),
      this.getPlacementDataOfClg(),
      this.getKCETCutoffCat(),
      this.getKCETCutOff(),
      this.getCOMDEKCutOff(),
      this.getCounsellingFees(),
      //this.generateLink_req(),
      this.getExamNotificationForClg(),
      this.getRanktDataOfClg(),
      this.getCoursesAndFeesOfClg(),
      // this.getCollegeProgrammesByID(),
      this.coursesOfferedInSameGroup(),
      this.getCollegeContactDetails(),
      this.getFAQsOfClg(),
      this.getCollegeAdmissionProcess(),
      this.getLatestBlogs(),
      this.getScholarShipOfClg(),
      this.getCourseCategory(),
      this.getExamList(),
      this.getReviewsForPlace()
    ]);

  }


  getReviewsForPlace(): void {
    // this.CompareclgService.getPlaceReviews(this.collegeId).subscribe(
    //   (response: any) => {
    //     this.reviews = response.result.reviews;
    //   },
    //   (error) => {
    //     console.error('Error fetching reviews:', error);
    //   }
    // );

    // this.CompareclgService.getReviews('GhIJQWDl0CIeQUARxks3icF8U8A').subscribe((data: any) => {
    //   this.reviews = data.result.reviews;
    // });
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showLoader = false;
    }, 2000);
  }



  gettabName(tabName) {
    const tabs = ['', 'CoursesFees', 'Reviews', 'Admissions', 'Placements', 'CutOffs', 'Compare', 'QA', 'Scholarship', 'News','courseInfo'];
    const index = tabs.indexOf(tabName);
    // alert(index)
    this.TabselectedIndex = index !== -1 ? index : 0;

  }


  getUniqueYears(): number[] {
    const years = new Set<number>();
    if (this.KCETCutoffArr != '') {
      this.KCETCutoffArr.forEach(item => years.add(item.year));
      return Array.from(years);
    }
  }

  /*shareOnWhatsApp_bkp(collegeId): void {
    // console.log(window.location.hostname,window.location.pathname)
    const shareText = `Check out this event: ${'https://ohcampus.com/'}${window.location.pathname}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id=' + collegeId + '&type=college')}`;

    window.open(whatsappUrl, '_blank');
  }

  shareOnTwitter_bkp(collegeId): void {
    
    // console.log(window.location.hostname,window.location.pathname)
    const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareText)}`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent('http://api.ohcampus.com?id=' + collegeId + '&type=college')}`;
    window.open(url, '_blank');
  }

  shareOnLinkedin_bkp(collegeId): void {
   
    const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.linkedin.com/send?text=${encodeURIComponent(shareText)}`;
   const url = `https://www.linkedin.com/send?url=${encodeURIComponent('http://api.ohcampus.com?id=' + collegeId + '&type=college')}`;
    window.open(url, '_blank');
  }

*/



  // added by vaishnavi.....
  shareOnFacebook(collegeId: string): void {

    this.CompareclgService.generateLink_req(collegeId, 'college').subscribe(res => {

      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/collegeDetails/${collegeId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this college:\n ${title}\n image: ${image}\nRead here: ${blogLink}`;
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    })
    // this.CompareclgService.generateLink_req(collegeId, 'college').subscribe(res => {
    //     this.link = res.share_link;
    //     const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.link)}`;
    //     window.open(url, '_blank');
    // });
  }

  // added by vaishnavi.....

  shareOnTwitter(collegeId: string): void {

    this.CompareclgService.generateLink_req(collegeId, 'college').subscribe(res => {

      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/collegeDetails/${collegeId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this college:\n ${title}\n image: ${image}\nRead here: ${blogLink}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    })
    // this.CompareclgService.generateLink_req(collegeId, 'college').subscribe(res => {
    //     this.link = res.share_link;
    //     const shareText = `Check out this exam: ${this.link}`;
    //     const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.link)}`;
    //     window.open(url, '_blank');
    // });
  }


  // added by vaishnavi.....

  shareOnLinkedin(collegeId: string): void {

    this.CompareclgService.generateLink_req(collegeId, 'college').subscribe(res => {


      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/collegeDetails/${collegeId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this college:\n ${title}\n\n image: ${image}\n\nRead here: ${blogLink}`;
      const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    })
    // this.CompareclgService.generateLink_req(collegeId, 'college').subscribe(res => {
    //     this.link = res.share_link;
    //     const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.link)}`;
    //     window.open(url, '_blank');
    // });
  }

  shareOnWhatsApp(collegeId: string): void {


    this.CompareclgService.generateLink_req(collegeId, 'college').subscribe(res => {
      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/collegeDetails/${collegeId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this college:\n ${title}\n image: ${image}\nRead here: ${blogLink}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(blogData.share_link)}`;

      window.open(whatsappUrl, '_blank');
    });

  }

  COMDEKgetUniqueYears(): number[] {
    const years = new Set<number>();
    if (this.COMDEKCutoffArr != '') {
      this.COMDEKCutoffArr.forEach(item => years.add(item.year));
      return Array.from(years);
    }
  }

  private categoryfilter() {
    if (!this.CoursesArr) {
      return;
    }

    // get the search keyword
    let search = this.courseFilterCtrl.value;
    if (!search) {
      this.categoryTypeFilter.next(this.KCETCutoffCatArr.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.categoryTypeFilter.next(
      this.KCETCutoffCatArr.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
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
    // filter the banks
    this.examTypeFilter.next(
      this.examListArr.filter(bank => bank.title.toLowerCase().indexOf(search) > -1)
    );
  }


  panelOpenState = false;

  readonly VIDEO_URL = VIDEO_URL;
  onCourseClicked(courseId: string): void {

    this.CourseIntoTab = true;
    this.TabselectedIndex = 10;
    // localStorage.setItem('selectedTabIndex', this.TabselectedIndex.toString());
    // alert("Inside onCourseClicked "+this.TabselectedIndex+" course id "+courseId)

  }

  getcompare() {
    this.compareTab = true;
    this.TabselectedIndex = 6;
  }

  statusBarClick($event: MouseEvent) {
    const el = $event.target as HTMLElement;
    const clickX = $event.offsetX;
    const totalWidth = el.offsetWidth;

    this.videoWidget.duration$.pipe().subscribe(duration => {
      const percentComplete = clickX / totalWidth;
      this.videoWidget.seek(duration * percentComplete);
    });
  }

  mapClicked($event: MouseEvent) {
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: true
    // });
  }


  showNextQuestionPlacement() {
    this.initialDisplayCount += 1;
  }

  showNextQuestionRanking() {
    this.initialDisplayCountRanking += 1;
  }

  showNextQuestionFAQ() {
    this.initialDisplayFAQ += 1;
  }

  showNextQuestionPopularPrograms() {
    this.initialDisplayPopularPrograms += 1;
  }

  showNextQuestionAdm() {
    this.initialDisplayAdm += 1;
  }

  showNextQuestionCoursesFees() {
    this.initialDisplayCoursesFees += 1;
  }

  // Year = [
  //   { value: 'opt-1', viewValue: '2024-25' },
  //   { value: 'opt-2', viewValue: '2023-24' },
  //   { value: 'opt-3', viewValue: '2022-23' },
  //   { value: 'opt-4', viewValue: '2021-22' },
  //   { value: 'opt-5', viewValue: '2020-21' },
  //   { value: 'opt-6', viewValue: '2019-20' },

  // ];

  Round = [
    { value: 'opt-1', viewValue: '1' },
    { value: 'opt-2', viewValue: '2' },
    { value: 'opt-3', viewValue: '3' },

  ];

  COMEDKRound = [
    { value: 'opt-1', viewValue: '1' },
    { value: 'opt-2', viewValue: '2' },
    // { value: 'opt-3', viewValue: '3' },
  ];

  COMEDKCategory = [
    { value: 'KKR', viewValue: 'KKR ' },
    { value: 'GM', viewValue: 'GM' },
    // { value: 'opt-3', viewValue: '3' },
  ];

  getCollegeDetailsByID() {
    const element = this.el.nativeElement;
    this.loader = true;
    this.description = '';
    this.whats_new = '';
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.loader = false
      this.shouldApplyTransLyer = false;
      this.collegename = res.college_detail[0].title;
      this.collegename1 = this.collegename
      this.Estd = res.college_detail[0].estd;
      this.location = res.college_detail[0].city;
      this.Collage_category = res.college_detail[0].name;
      this.image = res.college_detail[0].banner;
      this.logo = res.college_detail[0].logo;
      this.cityid = res.college_detail[0].cityid;
      this.categoryid = res.college_detail[0].categoryid;
      this.subcategory = res.college_detail[0].subcategory;
      this.getcollegeByLocation();
      this.getCollegeProgrammesByID();
      this.description = res.college_detail[0].description
      this.package_type = res.college_detail[0].package_type
      this.application_link = res.college_detail[0].application_link;
      this.is_accept_entrance = res.college_detail[0].is_accept_entrance;
      this.table_of_contentArr = res.table_of_content;
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

  markers: marker[] = [
    {
      lat: 51.673858,
      lng: 7.815982,
      label: 'ABC',
      draggable: true
    },
    // {
    //   lat: 51.373858,
    //   lng: 7.215982,
    //   label: 'B',
    //   draggable: false
    // },
    // {
    //   lat: 51.723858,
    //   lng: 7.895982,
    //   label: 'C',
    //   draggable: true
    // }
  ]
  isHovered: boolean = false;

  onHover(value: boolean): void {
    this.isHovered = value;
  }


  getUniqueEntranceExams(item: any): string {
    if (item && item.entrance_exam_names) {
      const uniqueExams = Array.from(new Set(item.entrance_exam_names.split(',')));
      return uniqueExams.join(', ');
    } else {
      return '';
    }
  }

  openImageDialog(img) {
    const dialogRef = this.dialog.open(this.callAPIDialog1);
    dialogRef.afterClosed().subscribe((result) => { });
    this.image = img;
  }

  close() {
    this.dialog.closeAll();
  }

  getPlacementCategory() {
    this.CompareclgService.getPlacementCategory().subscribe(res => {
      this.PlacementCategoryArr = res.response_data;
    })
  }

  getPlacementCategoryById(clgId) {

    this.CompareclgService.getPlacementCategoryById(clgId).subscribe(res => {
      this.PlacementCategoryArr2 = res.response_data;
      if (res.response_code == 400) {
        // alert(89)
        this.PlacementCategoryArr2 = [];
      }
    })
  }
  getCollegeHighlightByID() {
    this.CompareclgService.getCollegeHighlightByID(this.collegeId).subscribe(res => {
      this.CollegeHighlightArr = res.CollegeHighlight;
      this.CollegeHighlightFaqArr = res.Commonaly_Asked_Questions;
      // if(res.response_code = '400'){
      //   this.PlacementCategoryArr2=''
      // }
    })
  }
  getCollegeFacilitiesByID() {
    this.CompareclgService.getCollegeFacilitiesByID(this.collegeId).subscribe(res => {
      this.CollegeFac = res;
      // console.log(this.CollegeFac);
      this.facilitiesArr = this.CollegeFac.CollegeFac.facilities.split(',');
      this.facilityTitlesArr = this.CollegeFac.CollegeFac.facility_titles.split(', ');
      this.facilityIconsArr = this.CollegeFac.CollegeFac.facility_icons.split(', ');
      this.CollegeFacFaqArr = res.Commonaly_Asked_Questions;

      // this.CollegeFacArr = this.facilitiesArr.map((facility, index) => ({
      //   id: facility,
      //   title: this.facilityTitlesArr[index],
      //   icon: this.facilityIconsArr[index],
      //   text: `<i class="${this.facilityIconsArr[index]}"></i> ${this.facilityTitlesArr[index]}`
      // }));

      this.CollegeFacArr = this.facilitiesArr.map((facility, index) => {
        const icon = this.facilityIconsArr[index];
        const isMaterialIcon = !icon.startsWith('fa-'); // Assuming Material Icons don't start with 'fa-'

        return {
          id: facility,
          title: this.facilityTitlesArr[index],
          icon,
          isMaterialIcon, // Flag to determine icon type
          text: `<span>${this.facilityTitlesArr[index]}</span>`
        };
      });


    })
  }

  isWordPresent(word: string): boolean {
    return this.table_of_contentArr.some(item => item.title.toLowerCase().includes(word.toLowerCase()));
  }

  //get all course tab on view all courses
  getAllCousesTab() {
    this.tabGroup.selectedIndex = 1;
  }

  //get admission course tab on view all admission
  getAdmissionTab() {
    this.tabGroup.selectedIndex = 3;
  }

  //get cutoff tab on view all cutoffs
  getCutoffsTab() {
    this.tabGroup.selectedIndex = 5;
  }

  getScholorshipTab() {
    this.tabGroup.selectedIndex = 8;
  }

  //getplacement tab on view all placements
  getPlacementTab() {
    this.tabGroup.selectedIndex = 4;
  }


  getCompareTab() {
    this.tabGroup.selectedIndex = 6;
  }

  safeHtml(value) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  getContent(index: number) {
    this.highlightExpanded = !this.highlightExpanded;
  }

  scrollTo(sectionName: string, id): void {
    // console.log(section);
    const element = this.el.nativeElement.querySelector(`[name="${sectionName}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }


  //Export to Excel
  exportToExcel() {
    const ws: xlsx.WorkSheet = xlsx.utils.table_to_sheet(this.ImportantDates.nativeElement);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    xlsx.writeFile(wb, 'ImportantDates.xlsx');
  }

  getCounsellingFees() {
    this.CompareclgService.getCounsellingFees(this.collegeId).subscribe(res => {
      this.counsellingfeeArr = res.counsellingfee;
    })
  }


  getPlacementDataOfClg() {
    // console.log(this.PlacementForm)
    this.CompareclgService.getPlacementDataOfClg(this.PlacementForm.value.year, this.PlacementForm.value.course_category.category_id, this.collegeId,).subscribe(res => {
      this.YearValue = this.PlacementForm.value.year;
      // this.placementDataArr = res.placementlist;

      if (res.placementlist.length != 0) {
        this.count++;
        this.placementDataArr = res.placementlist;
        if (this.count == 1) {
          this.tmpArr = res.placementlist;
        }
      } else {
        this.tmpArr.forEach(data => {
          if (data.year != this.PlacementForm.value.year) {
            this.resData = res.response_data;
          }
        })

        this.placementDataArr = [];
      }
      this.placement_faqsArr = res.Commonaly_Asked_Questions;
      if (res.response_code == 400) {
        this.placement_faqsArr = [];
      }
    })
  }

  getPlacementDataOfClg1() {
    this.CompareclgService.getPlacementDataOfClg("2024", "2", this.collegeId,).subscribe(res => {
      this.YearValue = this.PlacementForm.value.year;
      this.placementDataArr = res.placementlist;
      this.placement_faqsArr = res.Commonaly_Asked_Questions;
      if (res.response_code == 400) {
        this.placement_faqsArr = [];
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

  getRanktDataOfClg() {
    this.CompareclgService.getRanktDataOfClg(this.collegeId).subscribe(res => {
      // this.rankArr = res.rankList;
      // this.rankArr = res.rankList.sort((a,b)=> Number(a.display_order) - (b.display_order))
      this.rankArr = res.rankList;

      this.rankFaqsArr = res.Commonaly_Asked_Questions;
      if (res.response_code == 400) {
        this.rankArr = '';
      }
    })
  }

  getCoursesAndFeesOfClg() {
    this.CompareclgService.getCoursesAndFeesOfClg(this.collegeId).subscribe(res => {
      this.coursesAndFeesArr = res.courselist;

      this.CoursesFeesFaqsArr = res.Commonaly_Asked_Questions;
      if (res.response_code == 400) {
        this.coursesAndFeesArr = '';
      }
    })
  }

  getScholarShipOfClg() {
    this.CompareclgService.getScholarShipOfClg(this.collegeId).subscribe(res => {
      this.scholarship_dataArr = res.scholarship_data;
      this.scholarship_data = res.scholarship_data[0].scholarship;
      this.ScholorshipFAQsArr = res.Commonaly_Asked_Questions;
    })
  }

  getKCETCutoffCat() {
    this.CompareclgService.getKCETCutoffCat(this.CutoffForm.value.category).subscribe(res => {
      this.KCETCutoffCatArr = res.response_data;
      this.categoryTypeFilter.next(this.KCETCutoffCatArr.slice());
    })
  }

  getKCETCutoffCatSearch(event) {
    this.CompareclgService.getKCETCutoffCat(event.target.value).subscribe(res => {
      this.KCETCutoffCatArr = res.response_data;
      this.categoryTypeFilter.next(this.KCETCutoffCatArr.slice());
    })
  }

  getKCETCutOff() {
    this.CompareclgService.getKCETCutOff(this.collegeId, this.CutoffForm.value.round, this.CutoffForm.value.category).subscribe(res => {
      this.KCETCutoffArr = res.response_data;
      this.Commonaly_Asked_QuestionsCutOff = res.Commonaly_Asked_Questions;
      if (res.response_code == 400) {
        this.KCETCutoffArr = '';
        this.Commonaly_Asked_QuestionsCutOff = '';
      }
    })
  }

  getCOMDEKCutOff() {
    this.CompareclgService.getCOMDEKCutOff(this.collegeId, this.COMEDKCutoffForm.value.round, this.COMEDKCutoffForm.value.category).subscribe(res => {
      this.COMDEKCutoffArr = res.response_data;
      // this.Commonaly_Asked_QuestionsCutOff = res.Commonaly_Asked_Questions;
      if (res.response_code == 400) {
        // alert(787)
        this.COMDEKCutoffArr = '';
        // this.Commonaly_Asked_QuestionsCutOff = '';
      }
    })
  }



  toggleVisibility(): void {
    this.showMore = !this.showMore;
    if (this.showMore) {
      this.visibleItemsCount = 10;
    } else {
      this.visibleItemsCount = this.coursesAndFeesArr.length;
    }
  }

  getCollegeProgrammesByID() {
    this.CompareclgService.getCollegeProgrammesByID(this.collegeId, this.categoryid, this.subcategory).subscribe(res => {
      this.CoursesArr = res.popular_programmes;
      this.popularProgramsFaqsArr = res.Commonaly_Asked_Questions;
    })
  }

  coursesOfferedInSameGroup() {
    this.CompareclgService.coursesOfferedInSameGroup(this.collegeId).subscribe(res => {
      this.CoursesForSameGroupArr = res.coursesOfferedInSameGroup;
    })
  }

  getCollegeContactDetails() {
    this.CompareclgService.getCollegeContactDetails(this.collegeId).subscribe(res => {
      this.contactDetailsArr = res.ContactDetails[0].phone;
      this.phonearr = this.contactDetailsArr.split(',');
      this.email = res.ContactDetails[0].email;
      this.website = res.ContactDetails[0].web;
      this.address = res.ContactDetails[0].address;
    })
  }

  getcollegeByLocation() {
    this.CompareclgService.getcollegeByLocation(this.cityid, this.collegeId).subscribe(res => {
      this.collegeByLocationArr = res.collegeByLocation;
    })
  }

  getFAQsOfClg() {
    this.CompareclgService.getFAQsOfClg(this.collegeId).subscribe(res => {
      this.collegeFAQsArr = res.FAQs;
      if (res.response_message == 'Failed') {
        this.ALLFAQS = true;
      }
    })
  }

  getCollegeAdmissionProcess() {
    this.CompareclgService.getCollegeAdmissionProcess(this.collegeId).subscribe(res => {
      this.AdmissionProcessArr = res.AdmissionProcess;
      this.AdmissionProcessFAQArr = res.Commonaly_Asked_Questions;

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

  getCoursesBySubcategory(sub_category) {
    this.sub_category = sub_category;
    this.onTabChange(1);

    this.route.navigate(['/collegeDetails/' + this.collegeId, this.TabLabel, this.sub_category]);
  }

  getCollegeTotalRate() {
    this.CompareclgService.getCollegeTotalRate(this.collegeId).subscribe(res => {
      this.totalRateCount = res.data.totalRateCount;
      this.totalReview = res.data.totalReview;
      this.TotalComments = res.TotalComments[0].count_of_qa
    })
  }

  onTabChange(index: number) {
    // alert(index)
    this.TabselectedIndex = index;
    localStorage.setItem('selectedTabIndex', index.toString());
    const selectedTabLabel = this.getTabLabelByIndex(index);
    this.TabLabel = selectedTabLabel;

    this.route.navigate(['/collegeDetails/' + this.collegeId, selectedTabLabel])
    if (this.CourseIntoTab && selectedTabLabel == 'CoursesFees') {
      this.CourseIntoTab = false;
    }
    return;
  }

  private getTabLabelByIndex(index: number): string {
    this.TabId = index;
    const tabs = ['', 'CoursesFees', 'Reviews', 'Admissions', 'Placements', 'CutOffs', 'Compare', 'QA', 'Scholarship', 'News'];

    if (this.CourseIntoTab == true) {
      const tabs = ['', 'CoursesFees', 'Reviews', 'Admissions', 'Placements', 'CutOffs', 'Compare', 'QA', 'Scholarship', 'News', 'courseInfo'];
      return tabs[index];
    }
    return tabs[index];
  }


  apply(): void {
    setTimeout(() => {
      // console.log(this.authService.isLoggedIn())
      if (!this.authService.isLoggedIn()) {
        // console.log(this.LoginpopupService)
        this.LoginpopupService.openLoginPopup();
      }
      else {
        // console.log(this.application_link.trim())
        // if (this.application_link.trim() !== '') {
        //   window.open(this.application_link)
        // }
        // // if (this.application_link != null) {
        // //   window.open(this.application_link)
        // // }
        // else {
        // console.log(this.collegename)
        const dialogRef = this.dialog.open(this.callAPIDialogapply);
        this.applicationForm.get('college').setValue(this.collegename);
        dialogRef.afterClosed().subscribe((result) => { });
        // }
      }
    }, 100);

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
  getCourseselected2(event) {
    this.CoursesByCatArr2.forEach((element: any) => {
      if (element.id == event) {
        this.selectedcourse2 = element.name;
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

  predictAdmission() {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
      // if (this.application_link.trim() != '') {
      //   window.open(this.application_link)
      // }
      // if (this.is_accept_entrance == 1) {
      //   window.open('http://predictor.ohcampus.com/');
      // }
      // else {
      const dialogRef = this.dialog.open(this.callAPIDialogpredictAdm);
      this.predictAdmForm.get('college').setValue(this.collegename);
      dialogRef.afterClosed().subscribe((result) => { });
    }
  }
  // if (this.application_link != null || this.application_link != '') {
  //   // window.open(this.application_link);
  //   alert(778787)
  // }
  // else {
  //   alert(222)
  //   if (!this.authService.isLoggedIn()) {
  //     this.LoginpopupService.openLoginPopup();
  //   }
  //   else {
  //     const dialogRef = this.dialog.open(this.callAPIDialogpredictAdm);
  //     this.predictAdmForm.get('college').setValue(this.collegename);
  //     dialogRef.afterClosed().subscribe((result) => { });
  //   }
  // }


  downloadBrochure() {
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
  }

  getCourseByCategoryClg2() {
    this.courseLoader = true;
    this.CompareclgService.getCourseByCategoryClg(this.predictAdmForm.value.course_category, this.collegeId).subscribe(res => {
      this.courseLoader = false;
      this.CoursesByCatArr2 = res.data;
    })
  }

  getExamList() {
    this.CompareclgService.getExamList('').subscribe(res => {
      this.examListArr = res.response_data;
      this.examTypeFilter.next(this.examListArr.slice());
    })
  }


  savCourseApplication() {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
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
          Swal.fire('', 'Your application has been submitted successfully. We will get back to you soon!', 'success')
          this.applicationForm.reset();
          this.close();
        })
      }
    }
  }

  savPredictAdmission() {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    } else {
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
          this.collegeId,
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
  }

  getArticleDetails(BlogId) {
    this.route.navigate(['/articledetails', BlogId])
  }

  getCollegeDetails(collegeid) {
    this.collegeId = collegeid;
    this.tab = 0;

    this.route.navigate(['/collegeDetails', collegeid]);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.getCollegeDetailsByID();
  }

  getExamDetails(ExamId) {

    this.route.navigate(['/examsdetails', ExamId]);
  }

  AdmissionProcessImportantDatesPDF(sub_category) {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
      this.CompareclgService.AdmissionProcessImportantDatesPDF(this.collegeId, sub_category).subscribe(res => {
        let viewPDF = res;
        window.open(viewPDF.PDF, "_blank")
      })
    }
  }

  getcomparePage() {

    this.route.navigate(['/comparecollege', this.collegeId])
  }

  getUniqueCourses(): string[] {
    const uniqueCourses: string[] = [];
    this.KCETCutoffArr.forEach(item => {
      if (!uniqueCourses.includes(item.coursename)) {
        uniqueCourses.push(item.coursename);
      }
    });
    return uniqueCourses;
  }

  hasCourseYearCategory(course: string, year: number): boolean {
    return this.KCETCutoffArr.some(item => item.coursename === course && item.year === year);
  }

  getCourseYearCategory(course: string, year: number): string {
    const item = this.KCETCutoffArr.find(item => item.coursename === course && item.year === year);
    return item ? item.category : '';
  }

  getUniqueCoursesCOMEDK() {
    return [...new Set(this.COMDEKCutoffArr.map(item => item.coursename))];
  }

  hasCourseYearCategoryCOMEDK(course: string, year: number): boolean {
    return this.COMDEKCutoffArr.some(item => item.coursename === course && item.year === year);
  }

  getCourseYearCategoryCOMEDK(course: string, year: number): string {
    const item = this.COMDEKCutoffArr.find(item => item.coursename === course && item.year === year);
    return item ? item.rank : '';
  }
}
