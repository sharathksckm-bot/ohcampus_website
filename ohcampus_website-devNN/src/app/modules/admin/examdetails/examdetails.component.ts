import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { param } from 'jquery';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-examdetails',
  templateUrl: './examdetails.component.html',
  styleUrls: ['./examdetails.component.scss']
})
export class ExamdetailsComponent implements OnInit {

  ExamId: any; examName: any; examImage: any; examCateegory: any; examdescription: any; examCriteria: any; exampattern: any; examprocess: any; relatedExamsArr: any = [];
  numSlides: number;
  ExamLoader: boolean = false;
  ogUrl: string;
  link: any;
  qutionPapers: any;
  questionPapers: any;

  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    private authService:AuthService,
    private loginPopupService:LoginpopupService,
) {
    this.numSlides = Math.ceil(this.relatedExamsArr.length / 3);
  }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.ExamId = routeParams.examid;
    // this.getExamDetails();
    this._activatedRoute.params.subscribe(param => {
      this.ExamId = param.examid;
      this.getExamDetails();
    })
  }

  getExamDetails() {
    this.ExamLoader = true;
    this.CompareclgService.getExamDetails(this.ExamId).subscribe(res => {
      this.ExamLoader = false;
      this.examName = res.examdetails[0].title;
      this.examImage = res.examdetails[0].image;
      this.examCateegory = res.examdetails[0].catname;
      this.examdescription = res.examdetails[0].description;
      this.examCriteria = res.examdetails[0].criteria;
      this.examprocess = res.examdetails[0].process;
      this.exampattern = res.examdetails[0].pattern;
      this.questionPapers = res.docsData;
      // console.log(this.questionPapers)
      
      this.relatedExamsArr = res.relatedExams;
      this.ogUrl = window.location.href;
    })
  }


  get numSlidesArray(): number[] {
    return Array(this.numSlides).fill(0).map((x, i) => i + 1);
  }

  downloadPaper(paperId){
    if(!this.authService.isLoggedIn()){
        this.loginPopupService.openLoginPopup();
    }else{
       this.CompareclgService.downloadQutionPaper(paperId).subscribe((res)=>{
        Swal.fire('',res.response_message,'success')
       })
    }
  }
  shareOnWhatsApp(): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id='+this.ExamId+'&type=exam' )}`;
    // window.open(whatsappUrl, '_blank');

    this.CompareclgService.generateLink_req(this.ExamId, 'exam').subscribe(res => {
     const blogData = res.data;

      const shareText = `Check out this: ${this.link}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(blogData.share_link)}`;

      window.open(whatsappUrl, '_blank');
  });
  }

  shareOnFacebook(): void {
    // const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://api.ohcampus.com?id='+this.ExamId+'&type=exam' )}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(this.ExamId, 'exam').subscribe(res => {
      const blogData = res.data;
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
  });
  }

  shareOnTwitter(): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent('http://api.ohcampus.com?id='+this.ExamId+'&type=exam' )}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(this.ExamId, 'exam').subscribe(res => {
      const blogData = res.data;
      const shareText = `Check out this Article: ${this.link}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
  });
  }

  shareOnLinkedin(): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.linkedin.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id='+this.ExamId+'&type=exam' )}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(this.ExamId, 'exam').subscribe(res => {
      const blogData = res.data;
      const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
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
}
