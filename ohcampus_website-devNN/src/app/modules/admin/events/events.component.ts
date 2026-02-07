import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  SearchForm: FormGroup;

  eventsArr: any = [];
  itemsToShow: number = 10;
  ArticlesToShow: number = 10;
  activeTabIndex: number = 0;
  activeTab: string;
  EventLoader: boolean = false;
  ArticleLoader: boolean = false;
  showShare: boolean[] = [];
  searchCategory = '';
  notification: any;
  searchevent: any;
  debounce: number = 300;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  resultSets: any[];
  searchControl: FormControl = new FormControl();
  recordsTotal: number;

  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
  ) {
    this.eventsArr.forEach(() => {
      this.showShare.push(false);
    });
  }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    const routeParams = this._activatedRoute.snapshot.params;
    this.searchevent = routeParams.searchevent
    this.SearchForm = this._formBuilder.group({
      searchtext: ['']
    })
    if (this.searchevent != undefined) {
      this.getEvent();
    }
    if (this.searchevent == undefined) {
      this.getEvents();
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        takeUntil(this._unsubscribeAll),
        map((value) => {
          if (!value || value.length < 3) {
            this.resultSets = null;
            this.eventsArr = [];
            this.recordsTotal = 0;
            this.CompareclgService.getEvents('').subscribe(res => {
              this.eventsArr = res.response_data;
            })
            return '';
          } else {
          }
          return value;
        }),
        filter(value => value && value.length >= 3)
      )
      .subscribe((value) => {
        this.CompareclgService.getEvents(value).subscribe(res => {
          this.eventsArr = res.response_data;
        })
      });

  }

  //get Events 
  getEvents() {
    // // this.EventLoader = true;

    // const searchValue = this.SearchForm.value.searchtext;
    // if (searchValue && searchValue.length >= 3) {
    //   setTimeout(() => {
    //     this.CompareclgService.getEvents(searchValue).subscribe(res => {
    //       // this.EventLoader = false;
    //       this.eventsArr = res.response_data;
    //     })
    //   }, 1500);
    // }
    // if (!searchValue) {
    this.CompareclgService.getEvents(this.SearchForm.value.searchtext).subscribe(res => {
      this.eventsArr = res.response_data;
    })
    // }
  }

  getEventDetails(event_id) {
    this.route.navigate(['/eventdetails', event_id])
  }

  toggleShare(index: number) {
    this.showShare[index] = !this.showShare[index];
  }

  showMoreEvents() {
    this.itemsToShow += 10;
  }

  searchEvent() {
    this.CompareclgService.getEvents(this.SearchForm.value.searchtext).subscribe(res => {
      this.EventLoader = false;
      this.eventsArr = res.response_data;
    })
  }

  getEvent() {
    this.CompareclgService.getEvents(this.searchevent).subscribe(res => {
      this.EventLoader = false;
      this.eventsArr = res.response_data;
    })
  }

  shareOnWhatsApp(eventId): void {
    // console.log(window.location.hostname,window.location.pathname)
    const shareText = `Check out this event: ${'https://ohcampus.com/'}${window.location.pathname}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id='+eventId+'&type=event' )}`;

    window.open(whatsappUrl, '_blank');
  }

  shareOnFacebook(eventId): void {
    // console.log(window.location.hostname,window.location.pathname)
    // const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareText)}`;
    //  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('http://api.ohcampus.com?id='+eventId+'&type=event' )}`;
     const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://win.k2key.in/ohcampus/create_html/createHtml?id='+eventId+'&type=event' )}`;
    window.open(url, '_blank');
  }

  shareOnTwitter(eventId): void {
    // console.log(window.location.hostname,window.location.pathname)
    const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareText)}`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent('http://api.ohcampus.com?id='+eventId+'&type=event' )}`;
    window.open(url, '_blank');
  }

  shareOnLinkedin(eventId): void {
    // console.log(window.location.hostname,window.location.pathname)
    const shareText = `Check out this exam: ${'https://ohcampus.com/'}${window.location.pathname}`;
    // const url = `https://www.linkedin.com/send?text=${encodeURIComponent(shareText)}`;
    const url = `https://www.linkedin.com/send?text=${encodeURIComponent('http://api.ohcampus.com?id='+eventId+'&type=event' )}`;
    window.open(url, '_blank');
  }


}
