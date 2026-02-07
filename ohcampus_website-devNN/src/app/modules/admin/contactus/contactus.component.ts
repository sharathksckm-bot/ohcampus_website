import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss']
})
export class ContactusComponent implements OnInit {

  @ViewChild('contactUsNgForm') contactUsNgForm: NgForm;

  contactUsForm: FormGroup;
  showInquiryMsg: any;
  constructor(
    public CompareclgService: CompareclgService,
    private _activatedRoute: ActivatedRoute,
    private route: Router,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,

  ) { }

  ngOnInit(): void {
    localStorage.setItem('defaultToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzMjYiLCJkYXRhIjp7ImlkIjoiMTMyNiIsImVtYWlsIjoidXNlckBnbWFpbC5jb20iLCJwYXNzd29yZCI6IjQ0OGRkZDUxN2QzYWJiNzAwNDVhZWE2OTI5ZjAyMzY3IiwibmFtZSI6IkFjdGl2ZSJ9LCJpYXQiOjE3MDkxODgxNjEsImV4cCI6MTcxMDA4ODE2MX0.szKRS-BGgVl0TX_UVQm2Yg2_J8p5lXjeUBnCTSAp1Ig');
    this.contactUsForm = this._formBuilder.group({
      name: ['', Validators.required],
      contactNo: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    })
  }

  contactUs() {
    if (this.contactUsForm.invalid) {
      Swal.fire('', 'Please fill all mandatory data', 'warning');
      return;
    }
    else {
      this.CompareclgService.sendContactMail(
        this.contactUsForm.value.name,
        this.contactUsForm.value.contactNo,
        this.contactUsForm.value.email,
        this.contactUsForm.value.subject,
        this.contactUsForm.value.message,
      ).subscribe(res => {
        this.showInquiryMsg = res.response_message;
        this.contactUsNgForm.resetForm();
      })
    }

  }


  //--------------------only Numbers are allowed---------------------//
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
