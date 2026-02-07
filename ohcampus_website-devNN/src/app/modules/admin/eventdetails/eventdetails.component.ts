import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { AuthService } from 'app/core/auth/auth.service';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-eventdetails',
  templateUrl: './eventdetails.component.html',
  styleUrls: ['./eventdetails.component.scss']
})
export class EventdetailsComponent implements OnInit {
  @ViewChild('EnqFormNgForm') EnqFormNgForm: NgForm;
  public stateFilterCtrl: FormControl = new FormControl();
  public cityFilterCtrl: FormControl = new FormControl();
  private _onDestroy = new Subject<void>();
  public stateTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);
  public cityTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  eventId: any;
  EnqForm: FormGroup;
  showInquiryMsg: any;
  event_detailsArr: any = [];
  stateArr: any = [];
  cityArr: any = [];
  link: any;
  event_catArr: any;

  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService,
    public LoginpopupService: LoginpopupService,
  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.eventId = routeParams.eventId;

    this.EnqForm = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      phone_no: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      message: ['', Validators.required],
    })

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

    this.getEventDetails();
    this.getStateList();

  }

  onLoginButtonClick(): void {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.openLoginPopup();
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }


  clearFormErrors(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key).setErrors(null);
    });
  }

  private statefilter() {
    if (!this.stateArr) {
      return;
    }

    // get the search keyword
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

    // get the search keyword
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
      this.stateArr = res.data;
      this.stateTypeFilter.next(this.stateArr.slice());
    })
  }

  getCityByState() {
    this.CompareclgService.getCityByState('', this.EnqForm.value.state).subscribe(res => {
      this.cityArr = res.data;
      this.cityTypeFilter.next(this.cityArr.slice());
    })
  }

  saveEnquiry() {
    if (this.EnqForm.invalid) {
      return
    }
    else {
      this.CompareclgService.saveEnquiry(
        this.EnqForm.value.name,
        this.EnqForm.value.email,
        this.EnqForm.value.phone_no,
        this.EnqForm.value.state,
        this.EnqForm.value.city,
        this.EnqForm.value.message,
        this.eventId,
        'blogs'
      ).subscribe(res => {
        this.showInquiryMsg = res.response_message
        this.EnqFormNgForm.resetForm();
      })
    }

  }

  getEventDetails() {
    this.CompareclgService.getEventDetails(this.eventId).subscribe(res => {
      this.event_detailsArr = res.event_details;
      this.event_catArr = res.eventCatename;
      
    })
  }

  shareOnWhatsApp(): void {
    // const shareText = `Check out this event: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id='+this.eventId+'&type=event' )}`;
    // window.open(whatsappUrl, '_blank');

    this.CompareclgService.generateLink_req(this.eventId, 'event').subscribe(res => {
     const blogData = res.data;

      const shareText = `Check out this: ${this.link}`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(blogData.share_link)}`;

      window.open(whatsappUrl, '_blank');
  });
  }

  shareOnFacebook(): void {
    //  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://api.ohcampus.com?id='+this.eventId+'&type=event' )}`;
    //  window.open(url, '_blank');

    this.CompareclgService.generateLink_req(this.eventId, 'event').subscribe(res => {
      const blogData = res.data;
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
  });
  }

  shareOnTwitter(): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent('http://api.ohcampus.com?id='+this.eventId+'&type=event' )}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(this.eventId, 'event').subscribe(res => {
      const blogData = res.data;
      const shareText = `Check out this Event: ${this.link}`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
  });
  }

  shareOnLinkedin(): void {
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.linkedin.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id='+this.eventId+'&type=event' )}`;
    // window.open(url, '_blank');

    this.CompareclgService.generateLink_req(this.eventId, 'event').subscribe(res => {
     const blogData = res.data;
      const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(blogData.share_link)}`;
      window.open(url, '_blank');
  });
  }
}
