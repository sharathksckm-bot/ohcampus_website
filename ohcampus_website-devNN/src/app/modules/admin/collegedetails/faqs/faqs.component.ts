import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss']
})
export class FaqsComponent implements OnInit {
  collegeId: any;
  // FAQsOfClgArr: any=[];

  constructor(private _activatedRoute: ActivatedRoute, public CompareclgService: CompareclgService) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    // console.log(routeParams);
    this.collegeId = routeParams.id;
    // this.getFAQsOfClg();
  }
  // getFAQsOfClg() {
  //   this.CompareclgService.getFAQsOfClg(this.collegeId).subscribe(res => {
  //     // console.log(res);
  //     this.FAQsOfClgArr=res.FAQs
  //   })
  // }
}
