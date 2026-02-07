import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-placements',
    templateUrl: './placements.component.html',
    styleUrls: ['./placements.component.scss'],
})
export class PlacementsComponent implements OnInit {
    @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
    selectedThumb: string | null = null;
    logo1: string = 'assets/images/logoclg.jpg';

    campusImagesArr: any = [];
    NotificationArr: any = [];
    latest_blogsArr: any = [];
    popular_blogsArr: any = [];
    placementlistArr: any = [];
    popularClgByLocArr: any = [];
    Commonaly_Asked_QuestionsArr: any = [];
    placemeneratingArr: any = [];
    placemeneratingreviewsArr: any = [];
    CollegesAccordingCategoryArr: any = [];

    collegeId: any;
    collegename: any;
    image: any;
    placementCount: any;
    cityid: any;
    categoryId: any;
    whats_new: any;
    one2twoRate: any;
    two2threeRate: any;
    three2fourRate: any;
    four2fiveRate: any;
    category: any;
    tabLabels: string[] = [
        'Placement',
        'Infrastructure',
        'Faculty',
        'Hostel',
        'Campus',
        'Money',
    ];
    courseid: any;

    constructor(
        private router: Router,
        private _activatedRoute: ActivatedRoute,
        public CompareclgService: CompareclgService,
        private sanitizer: DomSanitizer,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
        localStorage.setItem(
            'defaultToken',
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig'
        );
        const routeParams = this._activatedRoute.snapshot.params;
        this.collegeId = routeParams.id;
        this.getCollegeDetailsByID();
        this.getExamNotificationForClg();
        this.getLastThreeYearsPlacementData();
        this.getPlacementRating();
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
        this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(
            (res) => {
                this.whats_new = res.college_detail[0].what_new;
                this.collegename = res.college_detail[0].title;
                this.cityid = res.college_detail[0].cityid;
                this.category = res.college_detail[0].category;
                
                this.categoryId = res.college_detail[0].categoryid;
                this.getCollegesAccordingCategory();
                this.getPopularClgByLocation();
                this.campusImagesArr = res.college_images;
                this.campusImagesArr = this.chunkArray(this.campusImagesArr, 2);
            }
        );
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

    getExamNotificationForClg() {
        this.CompareclgService.getExamNotificationForClg(
            this.collegeId
        ).subscribe((res) => {
            this.NotificationArr = res.response_data;
            if (res.response_code == 400) {
                this.NotificationArr = '';
            }
        });
    }

    onVote(item: any, vote: number) {
        item.vote = item.vote === vote ? null : vote; // click again to deselect
        this.voteReview(item.review_id, item.user_id, item.vote);
    }

    getLatestBlogs() {
        this.CompareclgService.getLatestBlogs(this.collegeId).subscribe(
            (res) => {
                this.latest_blogsArr = res.latest_blogs;
                this.popular_blogsArr = res.popular_blogs;
                if (res.response_code == 400) {
                    this.latest_blogsArr = '';
                    this.popular_blogsArr = '';
                }
            }
        );
    }

    getArticleDetails(BlogId) {
        this.router.navigate(['/articledetails', BlogId]);
    }

    getLastThreeYearsPlacementData() {
        this.CompareclgService.getLastThreeYearsPlacementData(
            this.collegeId
        ).subscribe((res) => {
            this.placementlistArr = res.placementlist;
            this.Commonaly_Asked_QuestionsArr = res.Commonaly_Asked_Questions;
            if (res.response_code == 400) {
                this.placementlistArr = '';
            }
        });
    }

    getExamDetails(ExamId) {
        this.router.navigate(['/examsdetails', ExamId]);
    }

    getPlacementRating() {
        this.CompareclgService.getPlacementRating(this.collegeId).subscribe(
            (res) => {
                this.placemeneratingArr = res.data;
                this.placemeneratingreviewsArr = res.data.reviews;
                this.placementCount = res.data.totalPlacementRate;
                this.one2twoRate = res.data.one2twoRate;
                this.two2threeRate = res.data.two2threeRate;
                this.three2fourRate = res.data.three2fourRate;
                this.four2fiveRate = res.data.four2fiveRate;
            }
        );
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

    getPopularClgByLocation() {
        this.CompareclgService.getPopularClgByLocation(
            this.cityid,
            this.courseid,''
        ).subscribe((res) => {
            this.popularClgByLocArr = res.CollegeListForCompare;
            if (res.response_code == 400) {
                this.popularClgByLocArr = '';
            }
        });
    }

    getCollegesAccordingCategory() {
        this.CompareclgService.getCollegesAccordingCategory(
            this.collegeId,
            this.categoryId
        ).subscribe((res) => {
            this.CollegesAccordingCategoryArr = res.bestSuitedColleges;
            if (res.response_code == 400) {
                this.CollegesAccordingCategoryArr = '';
            }
        });
    }

    voteReview(reviewId, userId, value: number) {
        this.CompareclgService.voteReview(userId, reviewId, value).subscribe(
            (res) => {
                if (res.response_code == 200) {
                    Swal.fire('Thank you for your feedback!', '', 'success');
                }
            }
        );
    }

    getCompareTab(selectedcollegeid) {
        this.router.navigate(['/comparecollege/' + selectedcollegeid]);
    }
}
