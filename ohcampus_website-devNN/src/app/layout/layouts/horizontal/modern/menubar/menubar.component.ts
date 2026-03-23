import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss']
})
export class MenubarComponent implements OnInit {

  private menudata = 'menu.json';

  categoryArr: any = [];
  cityArr: any = [];
  categoryArrMore: any = [];
  remainingData: any[] = [];
  coursesArr: any = [];
  examsArr: any = [];
  TrendingSpecilizationArr: any = [];
  certificatesArr: any = [];
  itemsToShowInitially: number = 6;
  startIndex: number = 0;

  constructor(private location: Location, public CompareclgService: CompareclgService, private _formBuilder: FormBuilder, private route: Router, private _activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    // this.CompareclgService.getMenuData().subscribe(data => {
    //   // console.log(data);
    //   this.categoryArr = data;
    //   this.categoryArrMore = this.categoryArr.slice(4);
    // });

    this.categoryArr=[
      {
        "id": "91",
        "catname": "Engineering",
        "menuorder": "1",
        "type": "college"
      },
      {
        "id": "96",
        "catname": "Management",
        "menuorder": "2",
        "type": "college"
      },
      {
        "id": "97",
        "catname": "Medicine & Health Sciences",
        "menuorder": "3",
        "type": "college"
      },
      {
        "id": "164",
        "catname": "Nursing",
        "menuorder": "4",
        "type": "college"
      },]
    const routeParams = this._activatedRoute.snapshot.params;
    this.getCategoryList();
    this.getCityList();
    this.getTrendingSpecilization();
    this.getlistofCertificate();
  }


  showLess() {
    this.startIndex -= 10;
    if (this.startIndex < 0) {
      this.startIndex = 0;
    }
  }

  showMore() {
    this.startIndex += 10;
    if (this.startIndex >= this.categoryArrMore.length) {
      this.startIndex = this.categoryArrMore.length - 10;
    }
  }

  getCategoryList() {
    this.CompareclgService.getCategoryForMenu().subscribe(res => {
      this.categoryArr = res?.response_data || [];
      // if (this.categoryArr.length > 4) {
        this.categoryArrMore = this.categoryArr.slice(4) || [];
    // }
      // this.remainingData=this.categoryArrMore.slice(6);
      // console.log(this.categoryArrMore);
    })
  }

  getCityList() {
    this.CompareclgService.getCityList().subscribe(res => {
      this.cityArr = res?.data || [];
    })
  }

  getCoursesForCategory(categoryid) {
    this.CompareclgService.getCoursesForCategory(categoryid).subscribe(res => {
      this.coursesArr = res.response_data;
    })
  }

  getExamForCategory(categoryid) {
    this.CompareclgService.getExamForCategory(Number(categoryid)).subscribe(res => {
      this.examsArr = res.response_data;
    })
  }

  getCourseDetails(courseid) {
    localStorage.setItem('CourseId', courseid);
    this.route.navigate(['allCollegeList/bycategory/course', courseid]);

  }

  // routerLink="/allCollegeList/{{city.id}}/{{item.id}}"
  getcolleges(catid: string, cityid: string): void {
    localStorage.setItem('categoryId', catid);
    localStorage.setItem('cityId', cityid);
    this.route.navigate(['/allCollegeList/menu', catid, cityid]).then(() => {
      // window.location.reload();
    });
  }

  getExamDetails(ExamId) {
    this.route.navigate(['/examsdetails', ExamId]);
  }

  getTrendingSpecilization() {
    this.CompareclgService.getTrendingSpecilization().subscribe(res => {
      this.TrendingSpecilizationArr = res.TrendingSpecilization;
    })
  }

  getlistofCertificate() {
    this.CompareclgService.getlistofCertificate().subscribe(res => {
      this.certificatesArr = res.certificates;
    })
  }

  getcourseList(value) {
    this.route.navigate(['/courselist', value]).then(() => {
      // window.location.reload();
    });
  }

  getCertificate(id) {
    this.route.navigate(['/certifications', id]).then(() => {
      // window.location.reload();
    });
  }
}
