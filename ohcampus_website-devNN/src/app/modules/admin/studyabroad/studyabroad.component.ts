import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-studyabroad',
  templateUrl: './studyabroad.component.html',
  styleUrls: ['./studyabroad.component.scss']
})
export class StudyabroadComponent implements OnInit {
  studyabroadform: FormGroup;
  stateArr: any = [];
  cityArr: any = [];
  CoursesArr: any = [];
  CourseCategoryArr: any = [];
  countryArr: any = [];

  constructor(private fb: FormBuilder, private CompareclgService: CompareclgService, private route: Router) { }

  ngOnInit(): void {
    this.studyabroadform = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      course_category: ['', Validators.required],
      course: ['', Validators.required]
    });
    this.getStateList();
    this.getCourseCategory();
    this.getCountries();
  }

  getStateList() {
    this.CompareclgService.getStateList('').subscribe(res => {
      this.stateArr = res.data;
      // this.stateTypeFilter.next(this.stateArr.slice());
    })
  }

  getCityByState() {
    this.CompareclgService.getCityByState('', this.studyabroadform.value.state.id).subscribe(res => {
      this.cityArr = res.data;
      // this.cityTypeFilter.next(this.cityArr.slice());
    })
  }

  getCourseCategory() {
    this.CompareclgService.getCourseCategory().subscribe(res => {
      this.CourseCategoryArr = res.data;
    })
  }

  getCourseByCategory() {
    this.CompareclgService.getCourseByCategory(this.studyabroadform.value.course_category.category_id, '').subscribe(res => {
      this.CoursesArr = res.data;
      // this.courseTypeFilter.next(this.CoursesArr.slice());
    })
  }

  saveStudyAbroad(event: Event) {
    // event.preventDefault();
    this.CompareclgService.saveStudyAbroad(
      this.studyabroadform.value.name,
      this.studyabroadform.value.email,
      this.studyabroadform.value.contactNo,
      this.studyabroadform.value.state.statename,
      this.studyabroadform.value.city,
      this.studyabroadform.value.course_category.name,
      this.studyabroadform.value.course.name,
      this.studyabroadform.value.country
    ).subscribe(res => {
      console.log(res);
      if (res.response_code == 200) {
        Swal.fire('', res.response_message, 'success')
        this.studyabroadform.reset();
        this.route.navigate
          (['/home'])
        // this.studyabroadform.markAsPristine();
        // this.studyabroadform.markAsUntouched();
        // this.studyabroadform.updateValueAndValidity();

      }
    })
  }

  getCountries() {
    this.CompareclgService.getCountries().subscribe(res => {
      console.log(res);
      this.countryArr = res.data;
    })
  }

}
