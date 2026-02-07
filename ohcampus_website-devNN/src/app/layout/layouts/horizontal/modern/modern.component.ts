/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, TemplateRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { CompareclgService } from 'app/modules/service/compareclg.service';
import { Location, getLocaleFirstDayOfWeek } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { LoginpopupService } from 'app/shared/loginpopup.service';
declare const google: any;
import { SocialAuthService, GoogleLoginProvider } from 'angularx-social-login';
import { jwtDecode } from 'jwt-decode';
import { fuseAnimations } from '@fuse/animations';

import { AuthSignInComponent } from 'app/modules/auth/sign-in/sign-in.component';
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
    selector: 'modern-layout',
    templateUrl: './modern.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ModernLayoutComponent implements OnInit, OnDestroy {

    public examFilterCtrl: FormControl = new FormControl();
    public examTypeFilter: ReplaySubject<[]> = new ReplaySubject<[]>(1);


    @ViewChild('callAPIDialog1') callAPIDialog1: TemplateRef<any>;
    categoryArr: any = [];

    @ViewChild('signInNgForm') signInNgForm: NgForm;
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;
    @ViewChild('callsignInForm') callsignInForm: TemplateRef<any>;
    @ViewChild('callAPIDialogapply') callAPIDialogapply: TemplateRef<any>;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };

    signInForm: FormGroup;
    signUpForm: FormGroup;
    forgotpassword: FormGroup;
    isOtpSent: boolean = false;
    showSignIn: boolean = true;
    showSignUp: boolean = false;
    showAlert: boolean = false;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // OTP: boolean = true;
    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    isDataSubmit: boolean = true;
    username: any;
    link: any;
    showmsg: any;
    accesstoken: string;
    applicationForm: FormGroup;
    collegename: any;
    courseLoader: boolean;
    CoursesByCatArr: any = [];
    collegeId: any;
    CourseCategoryArr: any = [];
    examListArr: any = [];
    /**
     * Constructor
     */
    user: any = null;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        public dialog: MatDialog,
        private _authService: AuthService,
        private CompareclgService: CompareclgService,
        private location: Location,
        private LoginpopupService: LoginpopupService,
        private ngZone: NgZone
        // private authService: SocialAuthService
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.getCategory();
        this.getCourseCategory();
        this.username = localStorage.getItem('username');
        this.accesstoken = localStorage.getItem('accessToken');
        this.collegeId = localStorage.getItem('collegeId')
        this.getCollegeDetailsByID();
        this.getExamList();

        // console.log(this.collegeId)
        // console.log(this.username);
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

        this.applicationForm = this._formBuilder.group({
            name: ['', Validators.required],
            mobileno: ['', Validators.required],
            email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
            course_category: ['', Validators.required],
            college: ['', Validators.required],
            course: ['', Validators.required],
            exam: [''],
            expected_rank: [''],
            expected_score: ['']
        })

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

    //      loginWithGoogle() {
    //     if ((window as any).google) {
    //       (window as any).google.accounts.id.initialize({
    //         client_id: '968720970334-tn30dt24t9v017ddqquagr2v1j42erb9.apps.googleusercontent.com',
    //         callback: (response: any) => this.handleCredentialResponse(response),
    //         ux_mode: 'popup'
    //       });

    //       // Request a credential token programmatically
    //       (window as any).google.accounts.id.prompt(); 
    //     } else {
    //       console.error('Google script not loaded');
    //     }
    //   }

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

    ngAfterViewInit() {

    }


    // private decodeToken(token: string) {
    //     return JSON.parse(atob(token.split('.')[1]));
    // }

    // handleResponse(response: any) {
    //     if (response?.credential) {
    //         const payload = this.decodeToken(response.credential);
    //         sessionStorage.setItem('loggeduser', JSON.stringify(payload));
    //         this._router.navigate(['home']);
    //     }
    // }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // signInWithGoogle(): void {
    //     this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
    //         .then(user => {
    //             // this.user = user;
    //             console.log('Logged in user:', user);
    //         })


    // }

    getCollegeDetailsByID() {
        this.CompareclgService.getCollegeDetailsByID(this.collegeId).subscribe(res => {
            this.collegename = res.college_detail[0].title;
        })
    }

    getExamList() {
        this.CompareclgService.getExamList('').subscribe(res => {
            this.examListArr = res.response_data;
            this.examTypeFilter.next(this.examListArr.slice());
        })
    }

    apply(): void {
        setTimeout(() => {
            // console.log(this.authService.isLoggedIn())
            if (!this._authService.isLoggedIn()) {
                // console.log(this.LoginpopupService)
                this.LoginpopupService.openLoginPopup();
            }
            else {
                // console.log(this.application_link.trim())
                // if (this.application_link.trim() !== '') {
                //   window.open(this.application_link)
                // }
                // // if (this.application_link != null) {
                // //   window.open(this.application_link)
                // // }
                // else {
                const dialogRef = this.dialog.open(this.callAPIDialogapply);
                this.applicationForm.get('college').setValue(this.collegename);
                dialogRef.afterClosed().subscribe((result) => { });
                // }
            }
        }, 100);

    }




    getCourseByCategoryClg() {
        this.courseLoader = true;
        // console.log(123)
        this.CompareclgService.getCourseByCategoryClg(this.applicationForm.value.course_category, this.collegeId).subscribe(res => {
            this.courseLoader = false;
            this.CoursesByCatArr = res.data
            //   console.log(this.CoursesByCatArr)

        })
    }

    getCourseCategory() {
        this.CompareclgService.getCourseCategory().subscribe(res => {
            this.CourseCategoryArr = res.data;
            console.log(this.CourseCategoryArr)
        })
    }
    getCategory() {
        this.CompareclgService.getCategory().subscribe(res => {
            this.categoryArr = res.response_data;
        })
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);
        console.log(navigation)
        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
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

    showsign() {

        this._authService.isSignInPageOpen(true);
        console.log("open")
        this.showAlert = false;
        this.dialog.open(this.callsignInForm);
        this.showSignUp = false;
        this.showSignIn = true;
        this.loginWithGoogle();
    }

    signinclose() {
        this.dialog.closeAll();
        this._authService.isSignInPageOpen(false);
        console.log("close")
        // this.signInNgForm.resetForm();
    }

    close() {
        this.dialog.closeAll();

        // this.signInNgForm.resetForm();
    }

    sign_up() {
        this.showAlert = false;
        this.showSignUp = true;
        this.showSignIn = false;
    }

    savCourseApplication() {
        if (!this._authService.isLoggedIn()) {
            this.LoginpopupService.openLoginPopup();
        }
        else {
            if (this.applicationForm.invalid) {
                this.applicationForm.markAllAsTouched();
                return
            }
            if (this.applicationForm.valid) {
                this.CompareclgService.savCourseApplication(
                    this.applicationForm.controls.name.value,
                    this.applicationForm.controls.email.value,
                    this.applicationForm.controls.mobileno.value,
                    this.applicationForm.controls.course_category.value,
                    this.collegeId,
                    this.applicationForm.controls.course.value,
                    this.applicationForm.controls.exam.value,
                    this.applicationForm.controls.expected_rank.value,
                    this.applicationForm.controls.expected_score.value,
                ).subscribe(res => {
                    Swal.fire('', 'Your application has been submitted successfully. We will get back to you soon!', 'success')
                    this.applicationForm.reset();
                    this.close();
                })
            }
        }
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

    OpenDialog() {
        this.signinclose();
        this.forgotpassword.reset();
        this.dialog.open(this.callAPIDialog1, {
            //     disableClose: true ,
            //    backdropClass: "hello",
            //        autoFocus: false
        });


    }

    /**
        * Sign in
        */
    signIn(): void {

        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        // this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;
        // this._authService.logindata(this.signInForm.value.email, this.signInForm.value.password).subscribe(res => {
        //     console.log(res);
        // })
        // Sign in
        this._authService.logindata(this.signInForm.value.email, this.signInForm.value.password, '')
            .subscribe(
                (res) => {
                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/home';
                    // console.log(this._activatedRoute)
                    // Navigate to the redirect url
                    // this._router.navigateByUrl(redirectURL);
                    if (res.response_code == 200) {
                        localStorage.setItem("username", this.signInForm.value.email);
                        localStorage.setItem("userId", res.response_message.userId);
                        this.username = localStorage.getItem('username');
                    }
                    if (res.response_code == 2 || res.response_code == 3) {

                        // this.signInForm.enable();

                        // Reset the form
                        this.signInNgForm.resetForm();

                        // Set the alert
                        this.alert = {
                            type: 'error',
                            message: 'Incorrect email or password To continue , press F5 to re-enter the user name and password '
                        };

                        // Show the alert
                        this.showAlert = true;

                    }
                    else {
                        this.signinclose();
                    }

                },
                (response) => {
                    console.log(response);

                    // Re-enable the form
                    // this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: 'Incorrect email or password To continue , press F5 to re-enter the user name and password '
                    };

                    // Show the alert
                    this.showAlert = true;

                }
            );
    }


    // showsign() {
    //     this._authService.isSignInPageOpen(true);
    //     console.log("open")
    //     this.showAlert = false;
    //     this.dialog.open(this.callsignInForm);
    //     this.showSignUp = false;
    //     this.showSignIn = true;
    // }

    // signinclose() {
    //     this.dialog.closeAll();
    //     this._authService.isSignInPageOpen(false);
    //     console.log("close")
    //     // this.signInNgForm.resetForm();
    // }

    /**
    * Sign up
    */
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
                    console.log(response);
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
                    console.log(response);
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

    getScholarships() {

        this._router.navigate(['/scholorships'])
    }


    shareOnWhatsApp(): void {

        const whatsappUrl = `https://wa.me/918884560456?text= &source=''&data=''`;

        window.open(whatsappUrl, '_blank');
    }

    getloans() {
        this._router.navigate(['/loans'])
    }

    getFaqs() {
        this._router.navigate(['/faqs'])
    }

    ResendOTP() {
        this._authService.resendOTP(this.signUpForm.value.email).subscribe(res => {
            console.log(res);
            Swal.fire(res.response_message)
        })
    }

    ResetPass() {
        if (this.forgotpassword.invalid) {
            return;
        }
        else {
            const baseUrl = environment.production ? 'https://ohcampus.com/' : 'http://localhost:4200/';
            const forgetPasswordLink = `${baseUrl}forgotpassword`;

            // Now you can use forgetPasswordLink in your navigation logic or payload
            console.log(forgetPasswordLink);
            this.CompareclgService.ResetPass(this.forgotpassword.value.emailId, forgetPasswordLink).subscribe(res => {
                localStorage.setItem('forgetpassEmail', this.forgotpassword.value.emailId)
                console.log(res);
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

    goToHome() {
        this._router.navigate(['/home'])
    }

    getAllCourses(categoryid) {
        // alert(categoryid)
        this._router.navigate(['/courselist/bycat', categoryid]);

    }


    /////////////////////////////////////////////////////////////////////////////////////////////////

    // async googleSignIn() {
    //     if (this.platform.is('android')) {
    //       const loading = await this.loadingController.create({
    //         message: `
    //           <div class="custom-spinner-container">
    //             <img src="assets/icon/logo11_50x38-removebg-preview.png" class="custom-spinner-icon" style="border-radius: 50%;">
    //             <ion-spinner name="crescent" class="custom-spinner"></ion-spinner>
    //           </div>
    //            <span style="margin-top: 10px;"></span>`,
    //         spinner: null, // Disable the default spinner
    //         translucent: true,
    //         cssClass: 'custom-loading' // Optional: custom CSS class for additional styling
    //       });

    //       try {
    //         await loading.present(); // Show the loading spinner

    //         const fingerprint = await this.googlePlus.getSigningCertificateFingerprint();
    //         console.log(fingerprint);

    //         const result = await this.googlePlus.login({
    //           offline: true  // Ensures account selection each time
    //         });
    //         this.response_data = result;
    //         console.log(this.response_data);

    //         const selectPara = {
    //           fname: this.response_data.displayName,
    //           email: this.response_data.email,
    //           loginuserId: this.response_data.userId,
    //           device_id: localStorage.getItem('device_token'),
    //           platform: 'android',
    //           login_with: 'gmail'
    //         };

    //         // localStorage.setItem('111response_data', JSON.stringify(this.response_data));
    //         this.service.googleusercreat(
    //           'loginwithgoogle',
    //           '',
    //           'true',
    //           '',
    //           this.response_data.email,
    //           '',
    //           this.response_data.displayName,
    //           ''
    //         ).subscribe(
    //           async (response) => {
    //             console.log('User creation response:', response);
    //             if (response && response.response_data) {
    //                localStorage.setItem('response_data', JSON.stringify(response.response_data));
    //             }

    //             await loading.dismiss(); // Dismiss loading spinner
    //             await this.presentToast('Login successful!', 'success');
    //             this.router.navigateByUrl('/preferedcourses');  // Redirect to edit profile page
    //           },
    //           async (error) => {
    //             console.error('API error:', error);
    //             await loading.dismiss(); // Dismiss loading spinner
    //             await this.presentToast('Google login failed. Please try again.', 'danger');
    //           }
    //         );
    //       } catch (err) {

    //         console.error('Google Login Error:', JSON.stringify(err));
    //         await loading.dismiss();
    //         await this.presentToast(`Error: ${JSON.stringify(err)}`, 'danger');

    //         this.googlePlus.logout()
    //         .then(res => {
    //           console.log(res);
    //         }, err => {
    //           console.log(err);

    //         })
    //       }
    //     }
    //   }


}



