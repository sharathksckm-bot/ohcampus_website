import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { param } from 'jquery';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';


@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss']
})
export class ExamsComponent implements OnInit {

  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
  @ViewChild('callAPIDialogQuePapers') callAPIDialogQuePapers: TemplateRef<any>;

  SearchExamForm: FormGroup;
  SearchArticleForm: FormGroup;
  examListArr: any = []; showShare: boolean[] = [];
  articlesArr: any = [];
  questionpaper: any = [];

  itemsToShow: number = 10; ArticlesToShow: number = 10; activeTabIndex: number = 0;
  activeTab: string; ExamLoader: boolean = false; ArticleLoader: boolean = false;
  // showShare:boolean=false;

  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  resultSets: any[];
  ExamsearchControl: FormControl = new FormControl();
  ArticlesearchControl: FormControl = new FormControl();
  recordsTotal: number;

  searchCategory = ''; notification: any; searchexam: any; searchedexam: any; searchedarticle: any;
  link: any;


  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService,
    private _formBuilder: FormBuilder,) {
    this.examListArr.forEach(() => {
      this.showShare.push(false);
    });
  }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    this.SearchExamForm = this._formBuilder.group({
      searchexamtext: ['']
    }),

      this.SearchArticleForm = this._formBuilder.group({
        searchtext: ['']
      })

    const routeParams = this._activatedRoute.snapshot.params;
    this.searchedexam = routeParams.searchedexam;
    this.searchedarticle = routeParams.searchedarticle;
    this.searchCategory = routeParams.blogcatid;

    if (this.searchCategory == undefined) {
      this.searchCategory = '';
    }
    if (routeParams.tabno == 1) {
      this.activeTabIndex = 1;
    }

    if (this.searchedexam == undefined) {
      this.getExamList();
    }
    else {
      this.searchExamList()
    }

    if (this.searchedarticle == undefined) {
      this.getBlogs();
    }
    else {
      this.getArticleList()
    }


    this.ExamsearchControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.examListArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getExamList('').subscribe(res => {
              // this.ExamLoader = false;
              this.examListArr = res.response_data;
            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.CompareclgService.getExamList(value).subscribe(res => {
          // this.ExamLoader = false;
          this.examListArr = res.response_data;
        })
      });


    this.ArticlesearchControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.examListArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getBlogsbyCat(this.searchCategory, '').subscribe(res => {
              this.articlesArr = res.response_data;
            })
            return '';
          } else {

          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.CompareclgService.getBlogsbyCat(this.searchCategory, value).subscribe(res => {
          this.articlesArr = res.response_data;
        })
      });

  }

  openDialog(notification) {
    const dialogRef = this.dialog.open(this.callAPIDialog1);
    dialogRef.afterClosed().subscribe((result) => { });
    this.notification = notification;
  }

  openDialogQuePpaers(item) {
    // Check if the user is logged in
    if (!this.authService.isLoggedIn()) {
      // If not logged in, open the login popup
      this.LoginpopupService.openLoginPopup();
    } else {
      // If logged in, proceed with the dialog opening
      console.log(item);
      this.questionpaper = item.documents;  // Assuming `item.questionpaper` holds the question paper details

      const dialogRef = this.dialog.open(this.callAPIDialogQuePapers);

      dialogRef.afterClosed().subscribe((result) => {
        // Handle any actions after the dialog is closed (if needed)
      });
    }
  }

  close() {
    this.dialog.closeAll();
  }

  getExamList() {
    // this.ExamLoader = true;
    // const searchValue = this.SearchExamForm.value.searchexamtext;
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getExamList(searchValue).subscribe(res => {
    //       // this.ExamLoader = false;
    //       this.examListArr = res.response_data;
    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    this.CompareclgService.getExamList(this.SearchExamForm.value.searchexamtext).subscribe(res => {
      // this.ExamLoader = false;
      this.examListArr = res.response_data;

    })
    // }
  }


  searchExamList() {
    this.CompareclgService.getExamList(this.searchedexam).subscribe(res => {
      this.examListArr = res.response_data;
    })
  }

  getBlogs() {
    // // this.ArticleLoader = true;
    // const searchValue = this.SearchArticleForm.value.searchtext;
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getBlogsbyCat(this.searchCategory, searchValue).subscribe(res => {
    //       // this.ArticleLoader = false;
    //       this.articlesArr = res.response_data;
    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    this.CompareclgService.getBlogsbyCat(this.searchCategory, this.SearchArticleForm.value.searchtext).subscribe(res => {
      this.articlesArr = res.response_data;
    })
    // }

  }


  getArticleList() {
    this.CompareclgService.getBlogsbyCat(this.searchCategory, this.searchedarticle).subscribe(res => {
      this.articlesArr = res.response_data;
    })
  }


  showMoreExams() {
    this.itemsToShow += 10;
  }

  showMoreArticles() {
    this.ArticlesToShow += 10;
  }

  toggleShare(index: number) {
    this.showShare[index] = !this.showShare[index];
  }

  getExamDetails(ExamId) {
    this.route.navigate(['/examsdetails', ExamId]);
  }

  getArticleDetails(BlogId) {

    this.route.navigate(['/articledetails', BlogId]);
    // const foundElement = this.articlesArr.find(element => element.id === BlogId);
    // if (foundElement) {
    //   console.log(foundElement);
    // } else {
    //   console.log('Element not found');
    // }
    // const data = {
    //   title: 'OhCampus',
    //   description: 'Dynamic Description',
    //   image: foundElement.image,
    //   url: `${'https://ohcampus.com'}${window.location.pathname}`
    // };
    // console.log(data)
    // this.CompareclgService.updateMetaTags(data);
  }


  examshareOnWhatsApp(ExamId): void {
    // console.log(window.location.hostname,window.location.pathname)
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id=' + ExamId + '&type=exam')}`;
    // window.open(whatsappUrl, '_blank');

    this.CompareclgService.generateLink_req(ExamId, 'exam').subscribe(res => {
     const blogData = res.data;

      const shareText = `Check out this: ${this.link}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(blogData.share_link)}`;

      window.open(whatsappUrl, '_blank');
    });
  }

  examshareOnFacebook(ExamId): void {
    // console.log(window.location.hostname,window.location.pathname)
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareText)}`;
    // const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://api.ohcampus.com?id=' + ExamId + '&type=exam')}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(ExamId, 'exam').subscribe(res => {
     const blogData = res.data;
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });
  }

  examshareOnTwitter(ExamId): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent('http://api.ohcampus.com?id=' + ExamId + '&type=exam')}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(ExamId, 'exam').subscribe(res => {
      const blogData = res.data;
      const shareText = `Check out this exam: ${this.link}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });
  }

  examshareOnLinkedin(ExamId): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.linkedin.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id=' + ExamId + '&type=exam')}`;
    // window.open(url, '_blank');


    this.CompareclgService.generateLink_req(ExamId, 'exam').subscribe(res => {
      const blogData = res.data;
      const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });
  }

  ArticleshareOnWhatsApp(ArticleId): void {
    // console.log(window.location.hostname,window.location.pathname)
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id=' + ArticleId + '&type=article')}`;
    // window.open(whatsappUrl, '_blank');

    this.CompareclgService.generateLink_req(ArticleId, 'article').subscribe(res => {
      const blogData = res.data;

      const shareText = `Check out this: ${this.link}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(blogData.share_link)}`;

      window.open(whatsappUrl, '_blank');
    });

    // const whatsappUrl = `https://api.whatsapp.com/send?text=https://ohcampus.com/articledetails/${ArticleId}`;

    //  setTimeout(()=>{
    //   window.open(whatsappUrl, '_blank');

    //  },400)
  }

  ArticleshareOnFacebook(ArticleId): void {
    // const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://api.ohcampus.com?id=' + ArticleId + '&type=article')}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(ArticleId, 'article').subscribe(res => {
      const blogData = res.data;
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });


    // const whatsappUrl = `https://www.facebook.com/sharer/sharer.php?u=https://ohcampus.com/articledetails/${ArticleId}`;

    //    setTimeout(()=>{
    //     window.open(whatsappUrl, '_blank');

    //    },400)
  }

  ArticleshareOnTwitter(ArticleId): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent('http://api.ohcampus.com?id=' + ArticleId + '&type=article')}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(ArticleId, 'article').subscribe(res => {
     const blogData = res.data;
      const shareText = `Check out this Article: ${this.link}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });



    // const whatsappUrl = `https://twitter.com/intent/tweet?text=https://ohcampus.com/articledetails/${ArticleId}`;

    // setTimeout(() => {
    //   window.open(whatsappUrl, '_blank');

    // }, 400)
  }

  ArticleshareOnLinkedin(ArticleId): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.linkedin.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id=' + ArticleId + '&type=article')}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(ArticleId, 'article').subscribe(res => {
      const blogData = res.data;
      const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });


    // const whatsappUrl = `https://www.linkedin.com/shareArticle?mini=true&url=https://ohcampus.com/articledetails/${ArticleId}`;

    // setTimeout(() => {
    //   window.open(whatsappUrl, '_blank');

    // }, 400)
  }



}
