import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
@Component({
  selector: 'app-listcolleges',
  templateUrl: './listcolleges.component.html',
  styleUrls: ['./listcolleges.component.scss']
})
export class ListcollegesComponent implements OnInit {
  roundId: any;
  // @Input() DATASEND: any;

  // @Input() childMessage: any;
  constructor(private _formBuilder: FormBuilder, private _router: Router, public CompareclgService: CompareclgService, private _activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // this._activatedroute.params.subscribe(rr=>{
    //   console.log(rr);
    // })
    const routeParams = this._activatedRoute.snapshot.params;
    console.log(routeParams);
    //   let data=this._router.getCurrentNavigation()?.extras.queryParams;
    //   if(data){
    //     this.roundId=JSON.parse(JSON.stringify(data));
    //     console.log(this.roundId)
    // }
  }
}
