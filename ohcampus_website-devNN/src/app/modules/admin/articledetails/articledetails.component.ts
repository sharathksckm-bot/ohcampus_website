import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import Base64 from 'crypto-js/enc-base64';

@Component({
  selector: 'app-articledetails',
  templateUrl: './articledetails.component.html',
  styleUrls: ['./articledetails.component.scss']
})
export class ArticledetailsComponent implements OnInit {
  // @Input() blogsdescription: string = '';
  // @Input() blogstitle: string = '';
  // @Input() blogsimage: string = '';

  @ViewChild('EnqFormNgForm') EnqFormNgForm: NgForm;
  public stateFilterCtrl: FormControl = new FormControl();
  public cityFilterCtrl: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  public stateTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public cityTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  EnqForm: FormGroup;

  relatedblogArr: any = []; blogcategoryArr: any = []; latest_blogsArr: any = []; stateArr: any = []; cityArr: any = [];

  showInquiryMsg: any; BlogId: any; blogtitle: any; blogdescription: any; category_name: any;
  created_by_name: any;
  blogimage: string;
  created_date: any;
  updated_date: any;
  link: any;
  blogSubTitle: any;


  // ogTitle: string = 'Default Title';
  // ogDescription: string = 'Default Description';
  // blogimage: string = 'https://example.com/default-image.jpg';
  // ogUrl: string = window.location.href;

  constructor(public CompareclgService: CompareclgService, private _activatedRoute: ActivatedRoute, private route: Router, private _formBuilder: FormBuilder, private loaction: Location,
    private meta: Meta, private titleService: Title
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;

    this.BlogId = routeParams.BlogId;
    this.EnqForm = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      phone_no: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      message: ['', Validators.required],

    })


    // const text = 'Check out this awesome content!';
    // const imageUrl = 'https://campusapi.ohcampus.com//uploads/blogs/1715325116_ohcampus-Cyber-Security.jpg';
    // const url = `${'https://ohcampus.com/'}${window.location.pathname}`;
    // const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%0A${encodeURIComponent(imageUrl)}%0A${encodeURIComponent(url)}`;

    // this.titleService.setTitle('OhCampus');
    // this.meta.addTags([
    //   { property: 'og:title', content: text },
    //   { property: 'og:description', content: 'A brief description of the content.' },
    //   { property: 'og:image', content: imageUrl },
    //   { property: 'og:url', content: url },
    //   { property: 'og:type', content: 'website' }
    // ]);

    this.stateFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {

        this.statefilter();
      });

    this.cityFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {

        this.cityfilter();
      });

    this.getBlogsDetails();
    this.getBlogCategory();
    this.getLatestBlogs();
    this.getStateList();
    // this.shareOnWhatsApp();

  }

  base64Image: string;
  getBlogsDetails() {
    this.CompareclgService.getBlogsDetails(this.BlogId).subscribe(async res => {
      // console.log(res);
      this.blogtitle = res.blogdetails[0].title;
      this.blogSubTitle = res.blogdetails[0].subtitle;
      this.blogdescription = res.blogdetails[0].description;
      this.category_name = res.blogdetails[0].category_name;
      this.blogimage = res.blogdetails[0].image;
      this.created_by_name = res.blogdetails[0].created_by_name;
      this.created_date = res.blogdetails[0].created_date;
      this.updated_date = res.blogdetails[0].updated_date;
      this.relatedblogArr = res.relatedblog;
      this.base64Image = res.blogdetails[0].base64ImgString;
      // try {
      //   const base64Image = await this.CompareclgService.urlToBase64(this.blogimage);
      //   console.log(base64Image);

      // const data = {
      //   title: 'OhCampus',
      //   description: '',
      //   image: 'data:image/jpeg;base64,'+this.base64Image,
      //   url: 'https://ohcampus.com' + window.location.pathname
      // };

      // console.log(data);
      // this.CompareclgService.updateMetaTags(data);
      // } catch (error) {
      //   console.error('Error loading image:', error);
      // }
    })
  }

  //--------------------only Numbers are allowed---------------------//
  numberOnly(event): boolean {
    console.log(event.target.value)
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getBlogCategory() {
    this.CompareclgService.getBlogCategory().subscribe(res => {
      this.blogcategoryArr = res.blogcategory;
    })
  }

  getBlogByCat(catId) {
    this.route.navigate(['/exams', 1, catId]);
  }

  private statefilter() {
    if (!this.stateArr) {
      return;
    }
    let search = this.stateFilterCtrl.value;
    if (!search) {
      this.stateTypeFilter.next(this.stateArr.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.stateTypeFilter.next(
      this.stateArr.filter(bank => bank.statename.toLowerCase().indexOf(search) > -1)
    );
  }

  private cityfilter() {
    if (!this.cityArr) {
      return;
    }
    let search = this.cityFilterCtrl.value;
    if (!search) {
      this.cityTypeFilter.next(this.cityArr.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.cityTypeFilter.next(
      this.cityArr.filter(bank => bank.city.toLowerCase().indexOf(search) > -1)
    );
  }


  getStateList() {
    this.CompareclgService.getStateList('').subscribe(res => {
      // console.log(res);
      this.stateArr = res.data;
      this.stateTypeFilter.next(this.stateArr.slice());
    })
  }

  getCityByState() {
    this.CompareclgService.getCityByState('', this.EnqForm.value.state).subscribe(res => {
      // console.log(res);
      this.cityArr = res.data;
      this.cityTypeFilter.next(this.cityArr.slice());
    })
  }

  saveEnquiry() {
    if (this.EnqForm.invalid) {
      this.EnqForm.markAllAsTouched()
    }
    else {
      // console.log(this.EnqForm.value.state)
      this.CompareclgService.saveEnquiry(
        this.EnqForm.value.name,
        this.EnqForm.value.email,
        this.EnqForm.value.phone_no,
        this.EnqForm.value.state,
        this.EnqForm.value.city,
        this.EnqForm.value.message,
        this.BlogId,
        'blogs'
      ).subscribe(res => {
        this.showInquiryMsg = res.response_message
        console.log(res);
        this.EnqFormNgForm.resetForm();
      })
    }
  }

  clearFormErrors(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key).setErrors(null);
    });
  }

  getLatestBlogs() {
    this.CompareclgService.getLatestBlogs('').subscribe(res => {
      this.latest_blogsArr = res.latest_blogs;
    })
  }

  getArticleDetails(BlogId) {
    this.BlogId = BlogId
    this.route.navigate(['/articledetails', BlogId]);
    this.getBlogsDetails();
  }

  // setOpenGraphTags(title: string, image: string, url: string) {

  //   this.titleService.setTitle(title);
  //   this.meta.updateTag({ name: 'og:title', content: title });
  //   this.meta.updateTag({ name: 'og:description', content: title });
  //   this.meta.updateTag({ name: 'og:image', content: image });
  //   this.meta.updateTag({ name: 'og:url', content: url });
  // }

  shareOnWhatsApp(): void {
    this.CompareclgService.generateLink_req(this.BlogId, 'article').subscribe(res => {
      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/articledetails/${this.BlogId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this article:\n ${title}\n image: ${image}\nRead here: ${blogLink}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(blogData.share_link)}`;

      window.open(whatsappUrl, '_blank');
    });
  }

  shareOnFacebook(): void {
    this.CompareclgService.generateLink_req(this.BlogId, 'article').subscribe(res => {
      this.link = res.data;

      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/articledetails/${this.BlogId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this article:\n ${title}\n image: ${image}\nRead here: ${blogLink}`;

      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });
  }

  shareOnTwitter(): void {
    this.CompareclgService.generateLink_req(this.BlogId, 'article').subscribe(res => {
      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/articledetails/${this.BlogId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this article:\n ${title}\n image: ${image}\nRead here: ${blogLink}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });
  }

  shareOnLinkedin(): void {
    this.CompareclgService.generateLink_req(this.BlogId, 'article').subscribe(res => {
      const blogData = res.data;
      const title = blogData.title;
      const blogLink = `https://ohcampus.com/articledetails/${this.BlogId}`;
      const image = blogData.imagepath;
      const shareText = `Check out this article:\n ${title}\n image: ${image}\nRead here: ${blogLink}`;
      const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
    });
  }
}
