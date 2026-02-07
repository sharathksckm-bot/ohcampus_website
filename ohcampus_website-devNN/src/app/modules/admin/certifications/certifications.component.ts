import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';


@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.scss']
})
export class CertificationsComponent implements OnInit {
  certificateId: any;
  name: any;
  descritpion: any;
  image: any;
  latest_blogsArr: any = [];
  popular_blogsArr: any = [];
  BlogId: any;

  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,

  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    // console.log(routeParams);
    this.certificateId = routeParams.certificateId;
    this._activatedRoute.params.subscribe(param => {
      this.certificateId = param.certificateId;
      this.getCertificationDatabyId();
    })
    // this.getCertificationDatabyId();
    this.getLatestBlogs();
  }

  getCertificationDatabyId() {
    this.CompareclgService.getCertificationDatabyId(this.certificateId).subscribe(res => {
      // console.log(res);
      this.name = res.certificateDetails.name;
      this.image = res.certificateDetails.image;
      this.descritpion = res.certificateDetails.descritpion;
    })
  }

  getLatestBlogs() {
    this.CompareclgService.getLatestBlogs('').subscribe(res => {
      this.latest_blogsArr = res.latest_blogs;
      this.popular_blogsArr = res.popular_blogs;
    })
  }

  getArticleDetails(BlogId) {
    this.BlogId = BlogId
    this.route.navigate(['/articledetails', BlogId]);
  }

}
