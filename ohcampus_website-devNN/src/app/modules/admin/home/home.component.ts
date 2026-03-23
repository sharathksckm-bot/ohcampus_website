import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { MatTooltip } from '@angular/material/tooltip';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject, Subscription } from 'rxjs';

import { defaultNavigation } from 'app/mock-api/common/navigation/data';

import { GoogleMapsAPIWrapper } from '@agm/core';
import { takeUntil } from 'rxjs/operators';

interface Course {
  value: string;
  viewValue: string;
}



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],

  animations: [
    trigger('textAnimation', [
      state('0', style({ transform: 'translateX(0)' })),
      state('1', style({ transform: 'translateX(-100%)' })),
      transition('* => *', animate('500ms ease-out'))
    ])
  ]
})
export class HomeComponent implements OnInit {

  @ViewChild('EnquiryNgForm') EnquiryNgForm: NgForm;
  public courseFilterCtrl: FormControl = new FormControl();
  public stateFilterCtrl: FormControl = new FormControl();
  public cityFilterCtrl: FormControl = new FormControl();

  private _onDestroy = new Subject<void>();
  public courseTypeFilter: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public stateTypeFilter: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  public cityTypeFilter: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  projectcountstop: any = setInterval(() => {
    this.collegecount = this.collegecount + 10;

    if (this.collegecount == this.Clgcount) {
      clearInterval(this.projectcountstop);
    }
  },
    1)

  @ViewChild("myTooltip") myTooltip: MatTooltip
  EnquiryForm: FormGroup;
  SearchForm: FormGroup;

  //DECLARE ARRAYS
  featuredClgArr: any = []; trendingClgArr: any = []; eventsArr: any = []; categoryArr: any = []; CourseByCatArr: any = []; CourseCategoryArr: any = []; CoursesArr: any = [];
  expandedStates: boolean[] = new Array(this.featuredClgArr.length).fill(false);
  expandedStatesCourse: boolean[] = new Array(this.CourseByCatArr.length).fill(false); ArticleArr: any = [];
  TrendingSpecilizationArr: any = []; stateArr: any = []; cityArr: any = []
  certificatesArr: any = [];

  //DECLARE VARIABLES
  Clgcount: any; Coursescount: any; Examcount: any;
  last_index = 100; counter = 100; showTxt = "Show More"; collegecount: number = 0; coursecount: number = 0; examcount: number = 0; info: any; catId: any;
  showMore = false;
  courseLoader: boolean = false;
  state = 'initial';
  itemsToShow: number = 10;
  certificateToShow: number = 10;
  private formSubscription: Subscription;
  selectedCategoryId: number | null = null;
  predictLink = "https://predictor.ohcampus.com";
  captchaText: string = '';
  collageID: any; imagebyCat: any; articleTitle: any; articleimage: any; articlepost_rate_date: any; eventImage: any;
  eventName: any; eventEndDate: any; eventStartDate: any; searchCategory = ''; showInquiryMsg: any; currentImageIndex = 0; imageSrc = ''; messageText = '';

  imageButtons = [
    {
      src: 'assets/images/Banner.jpeg',
      name: 'image-1',
    },
    // {
    //   src: 'assets/images/banner1.jpg',
    //   name: 'image-2',
    // },
    // {
    //   src: 'assets/images/banner2.jpg',
    //   name: 'image-3',
    // },
  ];
  activeButton: string | null = null;
  articleId: any;
  eventId: any;
  selectedcourse: any;
  footernotoficationArr: any = [];

  // ============================================================
  // LEAD GENERATION PROPERTIES
  // ============================================================
  showScholarshipPopup = false;
  showManagementPopup = false;
  leadPopupType: 'scholarship' | 'management' = 'scholarship';
  // ============================================================

  constructor(
    private _formBuilder: FormBuilder,
    private CompareclgService: CompareclgService,
    private route: Router,
    private _activatedRoute: ActivatedRoute,) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;

    this.SearchForm = this._formBuilder.group({
      searchtext: ['']
    });

    this.EnquiryForm = this._formBuilder.group({
      fname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      phone_number: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      course_category: ['', Validators.required],
      course: ['', Validators.required],
      interstedIn: ['', Validators.required],
      // captcha: ['', Validators.required] 
      captcha: ['', [Validators.required, this.captchaMatchValidator.bind(this)]]
    })

    this.courseFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.coursefilter();
      });

    this.stateFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.statefilter();
      });

    this.cityFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.cityfilter();
      });

    this.getTotalCount();
    this.getFeaturedColleges();
    this.getTrendingClgs();
    this.getBlogs();
    this.getEvents();
    this.getStateList();
    this.getCategory();
    this.getCourseCategory();
    this.rotateImages();
    this.getTrendingSpecilization();
    this.getlistofCertificate();
    this.generateCaptcha();
    this.getfooterNotification();
  }

  rotateImages() {
    setInterval(() => {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.imageButtons.length;
      this.imageSrc = this.imageButtons[this.currentImageIndex].src;
      this.messageText = this.imageButtons[this.currentImageIndex].name;
    }, 2000);
  }

  course: Course[] = [
    { value: 'opt-0', viewValue: 'Engineering' },
    { value: 'opt-1', viewValue: 'Management' },
    { value: 'opt-2', viewValue: 'Arts & Science' },
    { value: 'opt-3', viewValue: 'Agriculture' },
    { value: 'opt-4', viewValue: 'Commerce' },
  ];

  interstedIn = [
    { value: 'opt-1', viewValue: 'Management Seat' },
    { value: 'opt-2', viewValue: 'Govt Seat' },
  ];

  captchaMatchValidator(control: AbstractControl) {
    if (!control.value) return null;

    return control.value === this.captchaText
      ? null
      : { captchaMismatch: true };
  }

  placeholderText: string = 'Search Colleges';

  // Method to update placeholder text based on button click
  SearchData(buttonType: string): void {
    this.activeButton = buttonType;
    if (buttonType === 'colleges') {
      this.placeholderText = 'Search Colleges';
    } else if (buttonType === 'events') {
      this.placeholderText = 'Search Events';
    } else if (buttonType === 'exams') {
      this.placeholderText = 'Search Exams';
    }
    else if (buttonType === 'articles') {
      this.placeholderText = 'Search Articles';
    }

  }

  generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.captchaText = '';
    for (let i = 0; i < 5; i++) {
      this.captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }


  searchAllData() {
    const searchData = this.SearchForm.get('searchtext').value.trim();
    if (searchData) {
      if (this.placeholderText.includes('Exams')) {
        this.route.navigate(['/exams', '0', 'searchexam', searchData]);
      } else if (this.placeholderText.includes('Colleges')) {
        this.route.navigate(['/allCollegeList/searchcollege', searchData]);
      } else if (this.placeholderText.includes('Events')) {
        this.route.navigate(['/events', searchData]);
      } else if (this.placeholderText.includes('Articles')) {
        this.route.navigate(['/exams', '1', 'searchedarticle', searchData]);
      }
    }
  }


  //---Total Count
  getTotalCount() {
    this.CompareclgService.getTotalCount().subscribe(res => {
      this.Clgcount = res.Clgcount;
      this.Coursescount = res.Coursescount;
      this.Examcount = res.Examcount;
    })
  }

  //gET fEATURED cOLEGE List
  getFeaturedColleges() {
    this.CompareclgService.getFeaturedColleges().subscribe(res => {
      this.featuredClgArr = res?.data || [];
      // this.featuredClgArr.slice(0, 8);
    })
  }

  //Show more content
  onShow(index: number): void {
    this.expandedStates[index] = !this.expandedStates[index];
  }

  onShowCourse(index: number): void {
    this.expandedStatesCourse[index] = !this.expandedStatesCourse[index];
  }

  //Get Treanding College List
  getTrendingClgs() {
    this.CompareclgService.getTrendingColleges().subscribe(res => {
      this.trendingClgArr = res?.trendingClg || [];
      console.log(this.trendingClgArr)
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

  getAllArticles() {
    this.route.navigate(['/exams', 1]);
  }

  getAllExams() {
    this.route.navigate(['/exams', 0]);
  }

  getBlogs() {
    this.CompareclgService.getBlogsbyCat(this.searchCategory, '').subscribe(res => {
      this.ArticleArr = res?.response_data || [];
      if (this.ArticleArr.length > 0) {
        this.articleimage = this.ArticleArr[0]?.image || '';
        this.articleTitle = this.ArticleArr[0]?.title || '';
        this.articleId = this.ArticleArr[0]?.id || '';
        this.articlepost_rate_date = this.ArticleArr[0]?.updated_date || '';

        this.ArticleArr.splice(0, 1);
      }
    })
  }

  //get Events
  getEvents() {
    this.CompareclgService.getEvents('').subscribe(res => {
      this.eventsArr = res?.response_data || [];
      if (this.eventsArr.length > 0) {
        this.eventName = this.eventsArr[0]?.event_name || '';
        this.eventId = this.eventsArr[0]?.event_id || '';
        this.eventImage = this.eventsArr[0]?.image || '';
        this.eventStartDate = this.eventsArr[0]?.event_start_date || '';
        this.eventEndDate = this.eventsArr[0]?.event_end_date || '';
      }
    })
  }

  //get category
  getCategory() {
    this.CompareclgService.getCategory().subscribe(res => {
      this.categoryArr = res?.response_data || [];
    })
  }

  //Get Tab data
  onTabChange(event: any): void {
    if (this.categoryArr && this.categoryArr.length > event.index) {
      this.catId = this.categoryArr[event.index]?.id;
      this.imagebyCat = this.categoryArr[event.index]?.catname;
      this.selectedCategoryId = event.tab?.categoryId;
      if (this.selectedCategoryId !== null) {
        this.getCoursesByCatId(this.catId);
      }
    }
  }

  //Get course by category
  getCoursesByCatId(categoryId) {
    this.CompareclgService.getCoursesByCatId(categoryId).subscribe(res => {
      this.CourseByCatArr = res?.data || [];
    })
  }

  markControlsAsUntouched() {
    Object.keys(this.EnquiryForm.controls).forEach(key => {
      this.EnquiryForm.controls[key].markAsPristine();
      this.EnquiryForm.controls[key].clearValidators();
    });
  }



  submitEnquiry() {

    let formdata = {
      firstName: this.EnquiryForm.value.fname,
      email: this.EnquiryForm.value.email,
      phone: this.EnquiryForm.value.phone_number,
      courseCategory: this.EnquiryForm.value.course_category,
      course: this.EnquiryForm.value.course,
      intrestedIn: this.EnquiryForm.value.interstedIn
    }
    if (this.EnquiryForm.value.captcha !== this.captchaText) {
      this.EnquiryForm.get('captcha')?.setErrors({ captchaMismatch: true });
      return;
    }
    if (this.EnquiryForm.valid) {
      this.CompareclgService.saveCourseInquiry(
        this.EnquiryForm.value.fname,
        '',
        this.EnquiryForm.value.email,
        this.EnquiryForm.value.phone_number,
        this.EnquiryForm.value.state,
        this.EnquiryForm.value.city,
        this.EnquiryForm.value.course_category,
        this.EnquiryForm.value.course,
        this.EnquiryForm.value.interstedIn
      ).subscribe(res => {
        this.showInquiryMsg = res.response_message
        this.EnquiryForm.reset();
        this.clearFormErrors(this.EnquiryForm);

      })
    }
  }
  clearFormErrors(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key).setErrors(null);
    });
  }

  getColleges() {
    this.route.navigate(['/allCollegeList']);
  }

  getCollegeDetails(collegeId) {
    this.collageID = collegeId;
    this.route.navigate(['/collegeDetails', this.collageID]);
  }

  getDtaOfClg() {
    this.route.navigate(['/collegeDetails', '1332']);
  }

  getCourseCategory() {
    this.CompareclgService.getCourseCategory().subscribe(res => {
      this.CourseCategoryArr = res?.data || [];
    })
  }


  private coursefilter() {
    if (!this.CoursesArr || !Array.isArray(this.CoursesArr)) {
      return;
    }

    // get the search keyword
    let search = this.courseFilterCtrl.value;
    if (!search) {
      this.courseTypeFilter.next(this.CoursesArr.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks

    this.courseTypeFilter.next(
      this.CoursesArr.filter(bank => bank?.name?.toLowerCase()?.indexOf(search) > -1)
    );
  }

  private statefilter() {
    if (!this.stateArr || !Array.isArray(this.stateArr)) {
      return;
    }

    // get the search keyword
    let search = this.stateFilterCtrl.value;
    if (!search) {
      this.stateTypeFilter.next(this.stateArr.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks

    this.stateTypeFilter.next(
      this.stateArr.filter(bank => bank?.statename?.toLowerCase()?.indexOf(search) > -1)
    );
  }

  private cityfilter() {
    if (!this.cityArr || !Array.isArray(this.cityArr)) {
      return;
    }

    // get the search keyword
    let search = this.cityFilterCtrl.value;
    if (!search) {
      this.cityTypeFilter.next(this.cityArr.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks

    this.cityTypeFilter.next(
      this.cityArr.filter(bank => bank?.city?.toLowerCase()?.indexOf(search) > -1)
    );
  }


  getCourseByCategory() {
    this.courseLoader = true;
    this.CompareclgService.getCourseByCategory(this.EnquiryForm.value.course_category, '').subscribe(res => {
      this.courseLoader = false;
      this.CoursesArr = res?.data || [];
      this.courseTypeFilter.next(this.CoursesArr.slice());
    })
  }

  getStateList() {
    this.CompareclgService.getStateList('').subscribe(res => {
      this.stateArr = res?.data || [];
      this.stateTypeFilter.next(this.stateArr.slice());
    })
  }


  getCourseselected(event) {
    // console.log(event)
    this.CoursesArr.forEach((element: any) => {
      console.log(element)
      if (element.id == event) {
        // alert(8980)
        this.selectedcourse = element.name
      }
    })
  }

  getCityByState() {
    this.CompareclgService.getCityByState('', this.EnquiryForm.value.state).subscribe(res => {
      this.cityArr = res?.data || [];
      this.cityTypeFilter.next(this.cityArr.slice());
    })
  }

  getAllEvents() {
    this.route.navigate(['/events']);
  }

  getAllColleges(courseid) {
    // localStorage.setItem('CourseId', courseid);
    this.route.navigate(['allCollegeList/course/bycat', courseid]).then(() => {
      window.location.reload();
    });
  }

  getCourses() {
    this.route.navigate(['/courselist']);
  }

  getcourseList(value) {
    this.route.navigate(['/courselist', value]);
  }

  getCertificate(id) {
    this.route.navigate(['/certifications', id]);
  }


  getTrendingSpecilization() {
    this.CompareclgService.getTrendingSpecilization().subscribe(res => {
      this.TrendingSpecilizationArr = res?.TrendingSpecilization || [];
    })
  }

  getAllSpecilizations() {
    this.itemsToShow += 10;
  }

  getlistofCertificate() {
    this.CompareclgService.getlistofCertificate().subscribe(res => {
      this.certificatesArr = res?.certificates || [];
    })
  }

  getAllCertificate() {
    this.certificateToShow += 10;
  }

  getArticleDetails(BlogId) {
    this.route.navigate(['/articledetails', BlogId])
  }

  getEventDetails(event_id) {
    this.route.navigate(['/eventdetails', event_id])
  }

  getAllCourses(categoryid) {
    // alert(categoryid)
    this.route.navigate(['/courselist/bycat', categoryid]);

  }


  getfooterNotification() {
    this.CompareclgService.getfooterNotification().subscribe((res) => {
      console.log(res);
      if (res?.response_code == 200 && res?.response_data?.length > 0) {
        this.footernotoficationArr = res.response_data[0];
      }
      else{
        this.footernotoficationArr='';
      }
    })
  }

  // ============================================================
  // LEAD GENERATION METHODS
  // ============================================================
  
  openScholarshipForm(): void {
    this.leadPopupType = 'scholarship';
    this.showScholarshipPopup = true;
    this.trackLeadEvent('scholarship_popup_opened');
  }

  openManagementSeatForm(): void {
    this.leadPopupType = 'management';
    this.showManagementPopup = true;
    this.trackLeadEvent('management_popup_opened');
  }

  closeLeadPopup(): void {
    this.showScholarshipPopup = false;
    this.showManagementPopup = false;
  }

  onLeadSubmitted(data: any): void {
    console.log('Lead submitted:', data);
    this.trackLeadEvent('lead_submitted', data.type);
  }

  private trackLeadEvent(eventName: string, label?: string): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        'event_category': 'lead_generation',
        'event_label': label || 'homepage'
      });
    }
  }
  // ============================================================
}

declare function gtag(...args: any[]): void;
