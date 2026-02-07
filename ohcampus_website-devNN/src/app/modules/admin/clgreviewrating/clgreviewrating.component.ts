import { isDataSource } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';

interface Gender {
  value: string;
  viewValue: string;
}
interface Country {
  value: string;
  viewValue: string;
}
interface Passouts {
  value: string;
  viewValue: string;
}
interface Mobno {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-clgreviewrating',
  templateUrl: './clgreviewrating.component.html',
  styleUrls: ['./clgreviewrating.component.scss']
})

export class ClgreviewratingComponent implements OnInit {
  @Input() stars = [0, 1.0, 2.0, 3.0, 4.0];
  reviewForm: FormGroup;
  currentPlacementRating: number = 0;
  RatingInfrastructure: number = 0;
  RatingFaculty: number = 0;
  RatingMoney: number = 0;
  RatingCampus: number = 0;
  RatingHostel: number = 0;

  @Output() ratingChange = new EventEmitter<number>();
  CourseCategoryArr: any = [];
  CoursesArr: any = [];
  collegeId: any;
  cityid: any;
  collegename: any;

  constructor(
    // private _formBuilder: FormBuilder,
    private _formBuilder: FormBuilder,
    private CompareclgService: CompareclgService,
    private route: Router,
    private _activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.collegeid;
    this.reviewForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      fullname: ['', Validators.required],
      gender: ['', Validators.required],
      mobileno: ['', Validators.required],
      course_category: ['', Validators.required],
      collegename: ['', Validators.required],
      course: ['', Validators.required],
      placement_description: ['', Validators.required],
      infrastructure_description: ['', Validators.required],
      faculty_description: ['', Validators.required],
      campus_description: ['', Validators.required],
      money_description: ['', Validators.required],
      hostel_description: ['', Validators.required],
      title: ['', Validators.required]
    })

    this.getCourseCategory();
    this.getCollegeDetailsByID();
  }

  genders: Gender[] = [
    { value: 'opt-0', viewValue: 'Male' },
    { value: 'opt-1', viewValue: 'Female' },
    { value: 'opt-2', viewValue: 'Other' },
  ];
  country: Country[] = [
    { value: 'opt-0', viewValue: 'India' },
    { value: 'opt-1', viewValue: 'Afghanistan' },
    { value: 'opt-2', viewValue: 'Albania' },
    { value: 'opt-3', viewValue: 'Angola' },
    { value: 'opt-4', viewValue: 'Armenia' },
  ];
  passouts: Passouts[] = [
    { value: 'opt-0', viewValue: '2017' },
    { value: 'opt-1', viewValue: '2018' },
    { value: 'opt-2', viewValue: '2019' },
    { value: 'opt-3', viewValue: '2020' },
    { value: 'opt-4', viewValue: '2021' },
  ];
  mobno: Mobno[] = [
    { value: 'opt-0', viewValue: '+91' },
    { value: 'opt-1', viewValue: '+61' },
    { value: 'opt-2', viewValue: '+51' },
    { value: 'opt-3', viewValue: '+71' },
    { value: 'opt-4', viewValue: '+81' },
  ];

  getCollegeDetailsByID() {
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.collegename = res.college_detail[0].title;
      this.cityid = res.college_detail[0].cityid;
      this.reviewForm.get('collegename').setValue(this.collegename);
    });
  }

  //--------------------only Numbers are allowed---------------------//
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getCourseCategory() {
    this.CompareclgService.getCourseCategory().subscribe(res => {
      this.CourseCategoryArr = res.data;
    })
  }

  getCourseByCategory() {
    this.CompareclgService.getCourseByCategory(this.reviewForm.value.course_category, '').subscribe(res => {
      this.CoursesArr = res.data;
    })
  }

  ratePlacement(rating: number) {
    this.currentPlacementRating = rating;
    this.ratingChange.emit(this.currentPlacementRating);
  }

  rateInfrastructure(rating: number) {
    this.RatingInfrastructure = rating;
    this.ratingChange.emit(this.RatingInfrastructure);
  }

  rateFaculty(rating: number) {
    this.RatingFaculty = rating;
    this.ratingChange.emit(this.RatingFaculty);
  }

  rateMoney(rating: number) {
    this.RatingMoney = rating;
    this.ratingChange.emit(this.RatingMoney);
  }

  rateCampus(rating: number) {
    this.RatingCampus = rating;
    this.ratingChange.emit(this.RatingCampus);
  }

  rateHostel(rating: number) {
    this.RatingHostel = rating;
    this.ratingChange.emit(this.RatingHostel);
  }


  addReview() {
    if (this.reviewForm)
      this.CompareclgService.addReview(
        '123',
        this.collegeId,
        this.reviewForm.controls.course_category.value,
        this.reviewForm.controls.course.value,
        this.reviewForm.controls.title.value,
        this.currentPlacementRating,
        this.reviewForm.controls.placement_description.value,
        this.RatingInfrastructure,
        this.reviewForm.controls.infrastructure_description.value,
        this.RatingFaculty,
        this.reviewForm.controls.faculty_description.value,
        this.RatingHostel,
        this.reviewForm.controls.hostel_description.value,
        this.RatingCampus,
        this.reviewForm.controls.campus_description.value,
        this.RatingMoney,
        this.reviewForm.controls.money_description.value,
      ).subscribe(res => {
        // console.log(res);
      })
  }


}
