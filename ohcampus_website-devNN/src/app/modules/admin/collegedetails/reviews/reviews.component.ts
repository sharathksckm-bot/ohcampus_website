import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  selectedThumb: string | null = null;

  logo1: string = 'assets/images/logoclg.jpg';
  reviewsArr: any = []; campusImagesArr: any = []; NotificationArr: any = []; latest_blogsArr: any = []; popular_blogsArr: any = []; popularClgByLocArr: any = []; CollegesAccordingCategoryArr: any = [];

  totalRateCount: any; collegeId: any; totalPlacementRateCount: any; totalInfrastructureRateCount: any; totalFacultyRateCount: any; totalHostelRateCount: any;
  totalCampusRateCount: any; totalMoneyRateCount: any; one2twoRate: any; two2threeRate: any; three2fourRate: any; four2fiveRate: any; collegename: any;
  cityid: any; image: any; category: any; categoryId: any;

  tabLabels: string[] = ['Placement', 'Infrastructure', 'Faculty', 'Hostel', 'Campus', 'Money'];
  courseid: any;

  constructor(
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    public CompareclgService: CompareclgService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private el: ElementRef,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.collegeId = routeParams.id;
    this.getReviewDetails();
    this.getCollegeDetailsByID();
    this.getExamNotificationForClg();
    this.getLatestBlogs();
  }


  openImageDialog(img) {
    const dialogRef = this.dialog.open(this.callAPIDialog1);
    dialogRef.afterClosed().subscribe((result) => { });
    this.image = img;
  }

  close() {
    this.dialog.closeAll();
  }

  selectThumb(thumb: string): void {
    this.selectedThumb = thumb;
  }
  getCollegeDetailsByID() {
    this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
      this.collegename = res.college_detail[0].title;
      this.cityid = res.college_detail[0].cityid;

      this.category = res.college_detail[0].category;
      this.categoryId = res.college_detail[0].categoryid;
      this.getCollegesAccordingCategory();
      this.getPopularClgByLocation();
      this.campusImagesArr = res.college_images;
      this.campusImagesArr = this.chunkArray(this.campusImagesArr, 2);
    });
  }

  onVote(item: any, vote: number) {
    item.vote = item.vote === vote ? null : vote; // click again to deselect
    this.voteReview(item.review_id, item.user_id, item.vote);
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

  getReviewDetails() {
    this.CompareclgService.getReviewDetails(this.collegeId).subscribe(res => {
      this.reviewsArr = res.data.reviews;
      this.totalRateCount = res.data.totalRateCount;
      this.totalPlacementRateCount = res.data.totalPlacementRateCount;
      this.totalInfrastructureRateCount = res.data.totalInfrastructureRateCount;
      this.totalFacultyRateCount = res.data.totalFacultyRateCount;
      this.totalHostelRateCount = res.data.totalHostelRateCount;
      this.totalCampusRateCount = res.data.totalCampusRateCount;
      this.totalMoneyRateCount = res.data.totalMoneyRateCount;
      this.one2twoRate = res.data.one2twoRate;
      this.two2threeRate = res.data.two2threeRate;
      this.three2fourRate = res.data.three2fourRate;
      this.four2fiveRate = res.data.four2fiveRate;
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

  getExamDetails(ExamId) {
    this.router.navigate(['/examsdetails', ExamId]);
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

  getArticleDetails(BlogId) {
    this.router.navigate(['/articledetails', BlogId])
  }

  generateStars(count: number): string[] {
    const stars: string[] = [];
    const fullStarsCount = Math.floor(count);
    const hasHalfStar = count - fullStarsCount >= 0.5;

    for (let i = 0; i < fullStarsCount; i++) {
      stars.push('mat_solid:star');
    }

    if (hasHalfStar) {
      stars.push('mat_solid:star_half');
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push('mat_outline:star_border');
    }

    return stars;
  }

  voteReview(reviewId, userId, value: number) {
    this.CompareclgService.voteReview(userId, reviewId, value).subscribe(res => {
      if (res.response_code == 200) {
        Swal.fire('Thank you for your feedback!', '', 'success');
      }
    })
  }

  reviewrating() {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
    else {
      this.router.navigate(['/reviewrating', this.collegeId]);
    }
  }

  getPopularClgByLocation() {
    this.CompareclgService.getPopularClgByLocation(this.cityid, this.courseid, this.categoryId).subscribe(res => {
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

  getCompareTab(selectedcollegeid) {
    this.router.navigate(['/comparecollege/' + selectedcollegeid]);
  }

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
  }
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

  }

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


}
