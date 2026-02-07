
import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { MatTabGroup } from '@angular/material/tabs';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import { Subject } from 'rxjs';
import { debounceTime, elementAt, filter, map, takeUntil } from 'rxjs/operators';
// import { Console } from 'console';

@Component({
  selector: 'app-courses-and-fees',
  templateUrl: './courses-and-fees.component.html',
  styleUrls: ['./courses-and-fees.component.scss']
})

export class CoursesAndFeesComponent implements OnInit {
  searchCourseControl: FormControl = new FormControl();
  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  @ViewChild('popupFilter') popupFilter: TemplateRef<any>;
  @ViewChild('CourseFilter') CourseFilter: TemplateRef<any>;
  @Output() courseClicked = new EventEmitter<string>();
  @Output() compareClicked = new EventEmitter<string>();
  // @Output() courseClicked: EventEmitter<string> = new EventEmitter<string>();
  //DECLARE FORMGROUPS
  filterForm: FormGroup;
  seachform: FormGroup;

  //DECLARE ARRAYS
  CoursesArr: any = []; popularProgramsFaqsArr: any = []; CoursesFeesFaqsArr: any = []; NotificationArr: any = []; campusImagesArr: any = []; courses_listArr: any = [];
  latest_blogsArr: any = []; popular_blogsArr: any = []; SameCourseInSameCityArr: any = []; SubCategoryArr: any = []; CourseLevelArr: any = []; ExamAcceptedArr: any = []; fees_listArr: any = []; tmpFeesListArr: any = [];

  //DECLARE VARIABLES
  FilterLoadercourse: boolean = false;
  FilterLoadercourselevel: boolean = false;
  FilterLoaderfees: boolean = false;
  CourseIntoTab: boolean = false;

  image: any; cityid: any; collegeId: any; collegename: any; sub_category: string; subcatId: any; activeTabIndex: number = 0;

  highest_fee: any; lowest_fee: any; courseid: any[] = []; fees: any; feesArr: any[] = []; acceptedexam: any; acceptedexamArr: any[] = []; CourseLeve: any; CourseLeave: any[] = []; searchcourse: any; tab: number; location: any;
  resultSets: any[];
  recordsTotal: number;
  categoryid: any;
  subcategory: any;
  tmpArr: any;
  courseList: any;
  clgTypeId: any;
  catId: any;
  courses_listArrFilter: any[] = [];
  CourseLeveArr: any[] = [];
  college_typeid: any;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public CompareclgService: CompareclgService,
    private tabGroup: MatTabGroup,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.id;
    this.subcatId = routeParams.subcatId;

    console.log(this.subcatId)

    this.getCollegeDetailsByID();
    // this.getCollegeProgrammesByID();
    this.getCoursesAndFeesOfClg();
    this.getExamNotificationForClg();
    this.getLatestBlogs();
    // if (this.subcatId != undefined) {
    //   this.getCollegeProgrammesBySubCatID();
    // }
    if (this.subcatId == undefined) {
      setTimeout(() => {
        this.getCoursesOfCollege();
      }, 500)
    }
    this.seachform = this.fb.group({
      searchCourse: ['']
    })
    this.filterForm = this.fb.group({
      course: [''],
      courselevel: [''],
      fees: [''],
      examAccepted: ['']
    })

    this.searchCourseControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.courses_listArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getCoursesOfCollegeFilter(this.collegeId, this.courseid, this.CourseLeve, this.fees, this.acceptedexam, value, this.clgTypeId).subscribe(res => {
              this.popupClose();
              this.courses_listArr = res.courses_list;
              // this.courses_listArr = res.courses_list.filter(item => item.name && item.name.trim() !== '');

            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.CompareclgService.getCoursesOfCollegeFilter(this.collegeId, this.courseid, this.CourseLeve, this.fees, this.acceptedexam, value, this.clgTypeId).subscribe(res => {
          this.popupClose();
          this.courses_listArr = res.courses_list;
        })
      });

  }

  openFilter(tab: string) {
    this.dialog.open(this.CourseFilter);
    this.filterForm.reset();
    switch (tab) {
      case 'courselevel':
        this.activeTabIndex = 1;
        break;

      case 'totalfees':
        this.activeTabIndex = 2;
        break;

      default:
        this.activeTabIndex = 0;
        break;
    }
    this.getSubCategoryList();
    this.getCourseLevel();
    this.getExamAccepted();
    this.getFeesDataOfCollege();
  }

  ApplyFilter() {
    const searchValue = this.seachform.value.searchCourse;
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getCoursesOfCollegeFilter(this.collegeId, this.courseid, this.CourseLeve, this.fees, this.acceptedexam, this.seachform.value.searchCourse).subscribe(res => {
    //       this.popupClose();
    //       this.courses_listArr = res.courses_list;

    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {

    // console.log(this.courseid+"    "+this.CourseLevelArr.id+"    "+this.feesArr+"    "+this.acceptedexamArr)
    // console.log(this.courses_listArr)

    // this.courseid.forEach((data)=>{
    //     console.log(data)
    //     this.CourseLevelArr.forEach((data)=>{
    //       console.log(data)
    //       this.feesArr.forEach((data)=>{
    //         console.log(data)
    //         this.acceptedexamArr.forEach((data)=>{
    //           console.log(data)
    //         })
    //       })
    //     })
    // })



    // console.log(this.courses_listArr)
    // console.log(this.courseid)

    this.courses_listArr = this.courses_listArrFilter;
    // console.log(this.courses_listArrFilter)

    // filter for course
    console.log(this.courses_listArr)
    let matchedArr: any[] = [];
    // if (this.courseid) {
    //   this.courses_listArr.forEach((data) => {
    //     this.courseid.forEach((data2) => {
    //       // console.log(data.sub_category + "     " + data2.id)

    //       if (data.sub_category != null || data.sub_category) {
    //         let cIds = data.sub_category.split(',');
    //         for (let i = 0; i < cIds.length; i++) {
    //           if (cIds[i] === data2.id) {
    //             // console.log(34)
    //             matchedArr.push(data);
    //           }
    //         }
    //       }
    //     })
    //   })
    //   this.courseid = [];
    // }

    //  filter for course level
    console.log(this.CourseLeveArr)
    if (this.CourseLeveArr) {
      this.courses_listArr.forEach((data) => {
        this.CourseLeveArr.forEach((data2) => {
          if (data.level != null || data.level) {
            // console.log(data.level+"    "+data2.name)

            if (data.level === data2.name) {
              matchedArr.push(data)
            }
          }
        })
      })
      this.CourseLeveArr = [];
    }

    // filter for annual fees
    //  console.log(this.feesArr)
    //  console.log(this.courses_listArr)

    if (this.feesArr) {
      this.courses_listArr.forEach((data) => {
        this.feesArr.forEach((data2) => {
          // console.log(data.total_fees+" "+data.counselling_fees+"  "+data2.total_fees)
          if ((data.total_fees || data.counselling_fees) === data2.total_fees) {
            matchedArr.push(data);
          }


        })
      })
      this.feesArr = [];
    }
    //  console.log(matchedArr)


    //  if(this.feesArr){
    //   let tmpArr:any = [];
    //   tmpArr =  this.courses_listArr.filter((data)=> data.total_fees !== null && data.counseling_fees !== null )
    //    console.log(tmpArr)
    //   //  this.courses_listArr.forEach((data)=>{

    //   //   this.feesArr.forEach((data2)=>{

    //   //        if(data.total_fees != null || data.counseling_fees !=null){
    //   //         console.log(data)
    //   //         if(data.total_fees != null){
    //   //            if(data.total_fees === data2.total_fees){
    //   //              matchedArr.push(data)
    //   //            }
    //   //         }else if(data.counseling_fees != null){
    //   //           if(data.counseling_fees === data2.counseling_fees){
    //   //             matchedArr.push(data)
    //   //           }
    //   //         }
    //   //        }
    //   //   })
    //   //  })
    //    this.feesArr = [];
    //  }


    console.log(matchedArr)
    // filter for accepted exam
    console.log(this.acceptedexamArr)
    if (this.acceptedexamArr) {
      this.courses_listArr.forEach((data) => {
        this.acceptedexamArr.forEach((data2) => {

          if (data.entrance_exams != null || data.entrance_exams) {
            // console.log(data)
            // console.log(data.entrance_exams+"     "+data2.id)
            let eIds = data.entrance_exams.split(',')
            //  console.log(eIds)
            for (let i = 0; i < eIds.length; i++) {
              if (eIds[i] === data2.id) {
                // console.log(data)
                matchedArr.push(data)
              }
            }
          }
        })
      })
      this.acceptedexamArr = []
    }

    console.log(this.CourseLeveArr)
    // if(this.CourseLeveArr){
    //   this.courses_listArr.forEach((data)=>{
    //     this.CourseLeveArr.forEach((data2)=>{

    //     })
    //   })
    // }


    this.courses_listArr = matchedArr;
    this.CompareclgService.getCoursesOfCollegeFilter(this.collegeId, this.courseid, this.CourseLeve, this.fees, this.acceptedexam, this.seachform.value.searchCourse, this.clgTypeId).subscribe(res => {
      this.popupClose();
      this.courses_listArr = res.courses_list;

      this.acceptedexam = []
      this.fees = []
      this.CourseLeve = []
      this.courseid = []
    })
    // }

  }

  getCourses(item) {
    this.courseid.push(item);
    console.log(this.courseid)
  }

  getCourseLevellist(item) {
    this.CourseLeve = item.id;
    this.CourseLeveArr.push(item)
  }

  getFees(item) {
    this.fees = item.total_fees;
    this.feesArr.push(item);
  }

  gethighFees(item) {
    this.fees = '<' + item;
  }

  getlowFees(item) {
    this.fees = '>' + item;
  }


  getExamAcceptedlist(item) {
    this.acceptedexam = item.id
    this.acceptedexamArr.push(item);
  }

  openCourseFilter() {
    this.dialog.open(this.CourseFilter);
  }

  popupClose() {
    console.log(123)
    this.dialog.closeAll();
  }

  getCollegeDetailsByID(): void {
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.collegename = res.college_detail[0].title;
      this.cityid = res.college_detail[0].cityid;
      this.categoryid = res.college_detail[0].categoryid;
      this.college_typeid = res.college_detail[0].college_typeid;
      this.subcategory = res.college_detail[0].subcategory;
      this.getOtherCollegesOfferingSameCourseInSameCity();
      this.getCollegeProgrammesByID();
      this.location = res.college_detail[0].city;
      this.campusImagesArr = res.college_images;
      if (this.subcatId != undefined) {
        this.getCollegeProgrammesBySubCatID();
      }
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

  //Get College programs by college id 
  getCollegeProgrammesByID() {
    this.CompareclgService.getCollegeProgrammesByID(this.collegeId, this.categoryid, this.subcategory).subscribe(res => {

      this.CoursesArr = res.popular_programmes;

      // console.log(tmpArr)
      // tmpArr.forEach((element)=>{
      //   console.log(element)
      //   if(element.sub_category != this.subcatId){
      //      this.CoursesArr.push(element)
      //   }
      // })

      // this.CoursesArr = res.popular_programmes;
      console.log(this.CoursesArr)
      this.popularProgramsFaqsArr = res.Commonaly_Asked_Questions;
    })
  }


  getcourses(subcategory) {

    this.CompareclgService.getCoursesBySubcategory(this.collegeId, subcategory, this.categoryid, this.clgTypeId).subscribe(res => {


      this.courses_listArr = res.courses_list;

      console.log(this.courses_listArr)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
  }

  //get courses by subcategory form college info page 
  getCollegeProgrammesBySubCatID() {
    // alert(this.categoryid )
    this.CompareclgService.getCoursesBySubcategory(this.collegeId, this.subcatId, this.categoryid, this.college_typeid).subscribe(res => {
      this.courses_listArr = res.courses_list;
      console.log(this.courses_listArr);
    })
  }

  //For courses display
  getCoursesOfCollege() {
    console.log(this.catId + "  " + this.clgTypeId)
    this.CompareclgService.getCoursesOfCollege(this.collegeId, this.catId, this.clgTypeId).subscribe(res => {
      this.courses_listArr = res.courses_list;
      this.courses_listArrFilter = res.courses_list;

      console.log(this.courses_listArr)
      // this.courses_listArr = this.courses_listArr.sort((a,b)=> a.courseid - b.courseid)
    })
  }

  //For FAQs of courses and Fees
  getCoursesAndFeesOfClg() {
    this.CompareclgService.getCoursesAndFeesOfClg(this.collegeId).subscribe(res => {
      this.CoursesFeesFaqsArr = res.Commonaly_Asked_Questions;
      this.courseList = res.courselist;
      this.catId = this.courseList[0].categoryid;
      this.clgTypeId = this.courseList[0].college_typeid
      // console.log(this.courseList)

      if (this.subcatId == undefined) {
        this.getCoursesOfCollege();
      }
    })
  }

  getCollegeDetails(collegeid) {
    this.tab = 0;
    this.router.navigate(['/collegeDetails', collegeid]);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
  }


  getExamNotificationForClg() {
    this.CompareclgService.getExamNotificationForClg(this.collegeId,).subscribe(res => {
      this.NotificationArr = res.response_data;
      if (res.response_code == 400) {
        this.NotificationArr = '';
      }
    })
  }

  getOtherCollegesOfferingSameCourseInSameCity() {
    this.CompareclgService.getOtherCollegesOfferingSameCourseInSameCity(this.cityid, this.collegeId, this.categoryid).subscribe(res => {
      this.SameCourseInSameCityArr = res.courses_list;
      if (res.response_code == 400) {
        this.SameCourseInSameCityArr = [];
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

  getExamDetails(ExamId) {
    this.router.navigate(['/examsdetails', ExamId]);
  }


  openImageDialog(img) {
    const dialogRef = this.dialog.open(this.callAPIDialog1);
    dialogRef.afterClosed().subscribe((result) => { });
    this.image = img;
  }

  close() {
    this.dialog.closeAll();
  }


  //APIs for Filter Dropdown
  getSubCategoryList() {
    this.FilterLoadercourse = true;
    this.CompareclgService.getSubCategoryList(this.collegeId).subscribe(res => {
      this.SubCategoryArr = res.SubCategory;
      this.FilterLoadercourse = false;
    })
  }

  getCourseLevel() {
    this.FilterLoadercourselevel = true;
    this.CompareclgService.getCourseLevel(this.collegeId).subscribe(res => {
      this.CourseLevelArr = res.SubCategory;
      this.FilterLoadercourselevel = false;
    })
  }

  getExamAccepted() {
    this.CompareclgService.getExamAccepted(this.collegeId).subscribe(res => {
      this.ExamAcceptedArr = res.SubCategory;
    })
  }

  getFeesDataOfCollege() {
    this.FilterLoaderfees = true;
    this.CompareclgService.getFeesDataOfCollege(this.collegeId).subscribe(res => {
      this.FilterLoaderfees = false;
      // this.fees_listArr = res.fees_list;
      let tmpArr = res.fees_list;
      this.fees_listArr = [];

      for (let i = 0; i < tmpArr.length; i++) {
        let isDuplicate = false;

        for (let j = 0; j < this.fees_listArr.length; j++) {
          if (tmpArr[i].total_fees === this.fees_listArr[j].total_fees) {
            isDuplicate = true;
            break;
          }
        }

        if (!isDuplicate) {
          this.fees_listArr.push(tmpArr[i]);
        }
      }



      console.log(this.fees_listArr)
      this.highest_fee = res.fees_list.highest_fee;
      this.lowest_fee = res.fees_list.lowest_fee;
    })
  }

  AddCourseIntoTabe(courseId: string, courseName, categoryid) {
    // alert(courseId+" "+courseName)
    localStorage.setItem('CourseID', courseId);
    localStorage.setItem('courseName', courseName);
    this.courseClicked.emit(courseId);
    // alert(8989)
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

  getArticleDetails(BlogId) {
    this.router.navigate(['/articledetails', BlogId])
  }

  getCompareTab(value) {
    this.tab = 6;
    // alert(this.tab)
    // this.router.navigate(['/collegeDetails', this.collegeId, 'Compare']);
    localStorage.setItem('selectedTabIndex', this.tab.toString());
    this.compareClicked.emit();
    // window.location.reload();
  }


}
