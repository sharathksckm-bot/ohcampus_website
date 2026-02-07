import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseAlertType } from '@fuse/components/alert';
import { LoginpopupService } from 'app/shared/loginpopup.service';
import { AuthService } from 'app/core/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { jwtDecode } from 'jwt-decode';
declare const google: any;

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
  selector: 'app-loginpopup',
  templateUrl: './loginpopup.component.html',
  styleUrls: ['./loginpopup.component.scss']
})
export class LoginpopupComponent implements OnInit {
  @ViewChild('signInNgForm') signInNgForm: NgForm;
  @ViewChild('signUpNgForm') signUpNgForm: NgForm;
  @ViewChild('callsignInForm') callsignInForm: TemplateRef<any>;
  @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: ''
  };
  forgotpassword: FormGroup;
  signInForm: FormGroup;
  showLoginPopup: boolean = false;
  showAlert: boolean = false;
  showSignIn: boolean = true;
  showSignUp: boolean = false;
  signUpForm: FormGroup;
  isOtpSent: boolean = false;
  isScreenSmall: boolean;
  navigation: Navigation;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isDataSubmit: boolean = true;
  router: any;
  showmsg: any;
  username: string;

  constructor(private LoginpopupService: LoginpopupService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _navigationService: NavigationService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService,
    public dialog: MatDialog,
    private _authService: AuthService,
    private CompareclgService: CompareclgService,
    private ngZone: NgZone
    // private CompareclgService: CompareclgService
  ) { }

  ngOnInit(): void {
    this.LoginpopupService.showLoginPopup$.subscribe((showPopup) => {
      this.showLoginPopup = showPopup;
    });

    this.signInForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      mobile_no: [''],
      rememberMe: ['']
    });

    this.signUpForm = this._formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmpassword: ['', [Validators.required, passwordMatchValidator('password')]],
      // company: [''],
      mobile_no: [''],
      agreements: ['', Validators.requiredTrue],
      Otp: [''],
    }
    );

    this.forgotpassword = this._formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]],
    });


    // Subscribe to navigation data
    this._navigationService.navigation$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((navigation: Navigation) => {
        this.navigation = navigation;
      });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {

        // Check if the screen is small
        this.isScreenSmall = !matchingAliases.includes('md');
      });
  }

  closeLoginPopup(): void {
    this.LoginpopupService.closeLoginPopup();
  }

  loginWithGoogle() {

    if (!(window as any).google) {
      console.error('Google not loaded');
      return;
    }

    (window as any).google.accounts.id.initialize({
      client_id: '968720970334-tn30dt24t9v017ddqquagr2v1j42erb9.apps.googleusercontent.com',
      callback: (response: any) => {
        this.ngZone.run(() => {
          console.log('TOKEN:', response);
          const user = jwtDecode<any>(response.credential);
          localStorage.setItem('defaultToken', (response.credential));
          localStorage.setItem('user', JSON.stringify(user));
          console.log(user);
          localStorage.setItem("username", user.email);
          this.username = localStorage.getItem('username');
          this._authService.logindata(user.email, '', 'google').subscribe(res => {
            // localStorage.setItem("username", user.email); // //
            localStorage.setItem("userId", res.response_message.userId); // 
            this.username = localStorage.getItem('username');
          })
          this.dialog.closeAll();
        });
      }
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'filled_blue',
        size: 'large',
        shape: 'rectangle',
        width: 250
      }
    );
    google.accounts.id.prompt();
  }
  private decodetoken(token: string) {
    return JSON.parse(atob(token.split(".")[1]))
  }
  handleresponse(response: any) {
    if (response) {
      const payload = this.decodetoken(response.credential);
      sessionStorage.setItem("loggeduser", JSON.stringify(payload))
      this._router.navigate(['home'])
    }
  }


  OpenDialog() {
    this.signinclose();
    this.forgotpassword.reset();
    this.dialog.open(this.callAPIDialog1, {
      //     disableClose: true ,
      //    backdropClass: "hello",
      //        autoFocus: false
    });


  }

  signIn(): void {

    // Return if the form is invalid
    if (this.signInForm.invalid) {
      return;
    }

    // Disable the form
    this.signInForm.disable();

    // Hide the alert
    this.showAlert = false;

    this._authService.logindata(this.signInForm.value.email, this.signInForm.value.password, '')
      .subscribe(
        (res) => {
          // console.log('login response', res);
          // const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/home';
          // this._router.navigateByUrl(redirectURL);


          if (res.response_code == 200) {
            localStorage.setItem('username', this.signInForm.value.email);

            this.signInNgForm.resetForm();
            this.showLoginPopup = false;

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            this._router.routeReuseStrategy.shouldReuseRoute = () => false;
            const currentUrl = this._router.url + '?';
            this._router.navigateByUrl(currentUrl)
              .then(() => {
                this._router.navigated = false;
                this._router.navigate([this._router.url]);
              });
          } else if (res.response_code == 2 || res.response_code == 3) {
            this.signInForm.enable();
            this.signInNgForm.resetForm();
            this.showAlert = true;
            this.alert = {
              type: 'error',
              message: 'Incorrect email or password To continue , press F5 to re-enter the user name and password '
            };

          }
        },
        (error) => {
          // alert('error');
          // console.log(error);
          // Set the alert
          this.showAlert = true;
          this.alert = {
            type: 'error',
            message: error
          };
        }
      );

  }

  //--------------------only Numbers are allowed---------------------//
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  showsign() {
    this.dialog.open(this.callsignInForm);
    this.showSignUp = false;
    this.showSignIn = true;
  }

  signinclose() {
    this.showLoginPopup = false;
    // this.location.reload;
    // this.signInNgForm.resetForm();
    // this.signUpNgForm.resetForm();
  }

  sign_up() {
    this.showAlert = false;
    this.showSignUp = true;
    this.showSignIn = false;
  }

  sign_in() {
    this.showAlert = false;
    this.showSignUp = false;
    this.showSignIn = true;
  }

  showsignup() {
    this.dialog.open(this.callsignInForm);
    this.showSignUp = true;
    this.showSignIn = false;
  }

  sendOtp() {
    this.isOtpSent = true;
    this.isDataSubmit = false;

  }

  signUp(): void {
    // Do nothing if the form is invalid
    if (this.signUpForm.invalid) {
      return;
    }

    // Disable the form
    // this.signUpForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Sign up
    this._authService.signUp(this.signUpForm.value)
      .subscribe(

        (response) => {
          // Navigate to the confirmation required page
          // console.log(response);
          if (response.response_code == 400) {
            // alert(67845);
            this.signUpForm.enable();

            // Reset the form
            this.signUpNgForm.resetForm();

            // Set the alert
            this.alert = {
              type: 'error',
              message: 'Something went wrong, please try again. '
            };

            // Show the alert
            this.showAlert = true;
          }
          if (response.response_code == 300) {
            // Reset the form
            this.signUpNgForm.resetForm();
            this.showAlert = true;
            this.signUpForm.enable();

            // Set the alert
            this.alert = {
              type: 'error',
              message: response.response_message
            };
          }

          if (response.response_code == 200) {
            this.isOtpSent = true;
            this.isDataSubmit = false;
            // this.showSignUp = false;
            // this.showSignIn = true;
            this.showAlert = true;
            this.alert = {
              type: 'success',
              message: response.response_message
            };

          }

          // else {
          //     this._router.navigateByUrl('/confirmation-required');
          // }

        },
        // (response) => {

        //     // Re-enable the form
        //     this.signUpForm.enable();

        //     // Reset the form
        //     this.signUpNgForm.resetForm();

        //     // Set the alert
        //     this.alert = {
        //         type: 'error',
        //         message: 'Something went wrong, please try again.'
        //     };

        //     // Show the alert
        //     this.showAlert = true;
        // }
      );
  }

  verifyOTP(): void {
    this._authService.verifyOTP(this.signUpForm.value)
      .subscribe(
        (response) => {
          // console.log(response);
          if (response.response_code == 200) {
            this.showSignUp = false;
            this.showSignIn = true;
            this.showAlert = true;
            this.alert = {
              type: 'success',
              message: response.response_message
            };

          }
          else {
            this.showAlert = true;
            this.alert = {
              type: 'error',
              message: response.response_message
            };
          }
        },
        (error) => {
          this.showAlert = true;
          this.alert = {
            type: 'error',
            message: error
          };
        }
      );
  }

  ResendOTP() {
    this._authService.resendOTP(this.signUpForm.value.email).subscribe(res => {
      // console.log(res)
      Swal.fire(res.response_message)
    })
  }
  close() {
    this.dialog.closeAll()
  }

  ResetPass() {
    if (this.forgotpassword.invalid) {
      return;
    }
    else {
      const baseUrl = environment.production ? 'https://ohcampus.com/' : 'http://localhost:4200/';
      const forgetPasswordLink = `${baseUrl}forgotpassword`;

      // Now you can use forgetPasswordLink in your navigation logic or payload
      // console.log(forgetPasswordLink);
      this.CompareclgService.ResetPass(this.forgotpassword.value.emailId, forgetPasswordLink).subscribe(res => {
        localStorage.setItem('forgetpassEmail', this.forgotpassword.value.emailId)
        // console.log(res);
        if (res.response_code == 200) {
          this.close();
          Swal.fire('', res.response_message, 'success');
        }
        else {
          this.showmsg = res.res.response_message;
          // this.close();
          // Swal.fire('',res.response_message,'warning');
        }


      })
    }

  }
}
