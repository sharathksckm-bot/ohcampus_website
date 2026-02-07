import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';


@Component({
  selector: 'app-anspage',
  templateUrl: './anspage.component.html',
  styleUrls: ['./anspage.component.scss']
})
export class AnspageComponent implements OnInit {
  @ViewChild('popupFilter') popupFilter: TemplateRef<any>;
  @ViewChild('popupReview') popupReview: TemplateRef<any>;

  //DECLARE FORMGROUP
  AnswerForm: FormGroup;
  CommentForm: FormGroup;

  //DECLARE ARRAYS 
  allAnswersArr: any = [];
  related_questionArr: any = [];
  ansArr: any = [];
  commentSections: boolean[] = new Array(this.ansArr.length).fill(false);
  isHovered: boolean[] = [];
  isClicked: boolean[] = [];
  isHovered2: boolean[] = [];
  isClicked2: boolean[] = [];

  //DECLARE VARIABLES 
  QueId: any; collegeId: any; question: any; views: any; question_asked: any; fullname: any; Clgcount: any; Coursescount: any; Examcount: any;
  text: string; ans_id: any; isFollowing: boolean = false;

  constructor(
    public dialog: MatDialog, private router: Router,
    private _activatedRoute: ActivatedRoute,
    public CompareclgService: CompareclgService,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    // console.log(routeParams);
    this.QueId = routeParams.QueId;
    this.collegeId = routeParams.id;

    this.AnswerForm = this._formBuilder.group({
      answer: [''],
    })

    this.CommentForm = this._formBuilder.group({
      comment: [''],
    })
    this.getQADataByQueId();
    this.getTotalCount();
  }

  openFilter() {
    this.dialog.open(this.popupFilter);
  }

  opencommentpopup() {
    this.dialog.open(this.popupFilter);
  }

  openpopupReview(type) {
    this.ans_id = type
    if (type == 2) {
      this.text = 'Write your Review'
    }
    else {
      this.text = 'Write your Comment'
    }
    this.dialog.open(this.popupReview);
  }

  popupClose() {
    this.dialog.closeAll();
  }

  onLoginButtonClick(): void {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
  }

  getQADataByQueId(): void {
    this.CompareclgService.getQADataByQueId(this.collegeId, this.QueId).subscribe(res => {
      this.allAnswersArr = res.response_data;
      this.related_questionArr = res.related_question;
      this.ansArr = this.allAnswersArr[0].Answeres;
      this.question = this.allAnswersArr[0].question;
      this.views = this.allAnswersArr[0].views;
      this.question_asked = this.allAnswersArr[0].question_asked;
      this.fullname = this.allAnswersArr[0].fullname;
    })
  }

  getTotalCount() {
    this.CompareclgService.getTotalCount().subscribe(res => {
      this.Clgcount = res.Clgcount;
      this.Coursescount = res.Coursescount;
      this.Examcount = res.Examcount;
    })
  }

  getcomments(index: number) {
    this.commentSections[index] = !this.commentSections[index];
  }

  postAnswere() {
    this.CompareclgService.postAnswere(this.AnswerForm.value.answer, '1', this.QueId).subscribe(res => {
      this.popupClose();
    })
  }

  postAnsComment() {
    this.CompareclgService.postAnsComment(this.CommentForm.value.comment, '1', this.ans_id).subscribe(res => {
    })
  }

  followQuestion(action) {
    if (action === 'follow') {
      this.isFollowing = !this.isFollowing;
    } else if (action === 'unfollow') {
      this.isFollowing = !this.isFollowing;
    }
    this.CompareclgService.followQuestion(action, '1', this.QueId).subscribe(res => {
    })
  }

  voteAnswere(action: string, answerId: any, index: number) {
    if (action == 'like') {
      this.isClicked[index] = !this.isClicked[index];

    }
    if (action == 'dislike') {
      this.isClicked2[index] = !this.isClicked2[index];
    }
    this.CompareclgService.voteAnswere(action, answerId, '1').subscribe(res => {
      this.getQADataByQueId();
    })
  }

  getAns(QueId) {
    this.QueId = QueId;
    this.router.navigate(['/allanswers', this.collegeId, this.QueId]);
    this.getQADataByQueId();
  }

  reviewrating() {
    this.router.navigate(['/reviewrating', this.collegeId]);
  }
}
