import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import Swal from 'sweetalert2';


function passwordMatchValidator(password: string): ValidatorFn {
  return (control: FormControl) => {
    // console.log(control)
    if (!control || !control.parent) {
      return null;
    }
    return control.parent.get(password).value === control.value ? null : { mismatch: true };
  };
}


@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss']
})
export class ForgotpasswordComponent implements OnInit {
  ResetpasswordForm: FormGroup;
  forgetpassEmail: string;

  constructor(private _formBuilder: FormBuilder,
    private CompareclgService: CompareclgService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this.forgetpassEmail = localStorage.getItem('forgetpassEmail')
    this.ResetpasswordForm = this._formBuilder.group({
      newpass: ['', [Validators.required,Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      confirmpass: ['', Validators.required,]
    })
  }

  UpdateNewPass() {
    if (this.ResetpasswordForm.invalid) {
      return
    }
    else {
      this.CompareclgService.UpdateNewPass(this.forgetpassEmail, this.ResetpasswordForm.value.newpass, this.ResetpasswordForm.value.confirmpass).subscribe(res => {
        console.log(res);
        if(res.response_code==200){
          Swal.fire('',res.response_message,'success');
          setTimeout(() => {
            this._router.navigate(['/home']); 
          }, 1000);
          
        }
        else{
          Swal.fire('',res.response_message,'warning');
          return
        }
        
      })
    }

  }

}

  