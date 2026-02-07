import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { jwtDecode } from 'jwt-decode';
declare const google: any;

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            // email: ['', [Validators.required, Validators.email]],
            // password: ['', Validators.required],
            email: ['hughes.brian@company.com', [Validators.required, Validators.email]],
            password: ['admin', Validators.required],
            mobile_no: [''],
            rememberMe: ['']
        });
          this.loginWithGoogle();
    }

     loginWithGoogle() {
            if (!(window as any).google) {
                console.error('Google not loaded');
                return;
            }
    
            (window as any).google.accounts.id.initialize({
                client_id: '968720970334-tn30dt24t9v017ddqquagr2v1j42erb9.apps.googleusercontent.com',
                callback: (response: any) => {
                    console.log('TOKEN:', response);
                    const user = jwtDecode<any>(response.credential);
                    localStorage.setItem('defaultToken', (response.credential));
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem("username", user.email);
                    // this.CompareclgService.signInWithGoogle(user.email).subscribe(res => {
                    //     console.log(res)
                    // })
                    // this.close()
                }
            });
    
            (window as any).google.accounts.id.renderButton(
                document.getElementById('googleBtn'),
                {
                    theme: 'filled_blue',
                    size: 'large',
                    shape: 'rectangle',
                    width: 350
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

    //--------------------only Numbers are allowed---------------------//
    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    signIn(): void {
        // alert('0000')
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }
// alert(65)
        // Disable the form
        // this.signInForm.disable();
        this.signInNgForm.resetForm()
        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                () => {

                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);
                    localStorage.setItem("username", this.signInForm.value.email);
                },
                (response) => {
                    // alert(7878)
                    // Re-enable the form
                    // this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: 'Wrong email or password'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }
    /**
     * Sign in
     */
    signImn(): void {

        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        // this.signInForm.disable();
        this.signInNgForm.resetForm()

        // Hide the alert
        this.showAlert = false;

        this._authService.logindata(this.signInForm.value.email, this.signInForm.value.password,'')
            .subscribe(
                (res) => {
                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/home';
                    // console.log(this._activatedRoute)
                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);
                    localStorage.setItem("username", this.signInForm.value.email);
                    if (res.response_code == 2 || res.response_code == 3) {

                        // this.signInForm.enable();

                        // Reset the form
                        this.signInNgForm.resetForm();

                        // Set the alert
                        this.alert = {
                            type: 'error',
                            message: 'Wrong email or password '
                        };

                        // Show the alert
                        this.showAlert = true;

                    }

                },
                (response) => {
                    localStorage.setItem("username", this.signInForm.value.email);
                    console.log(response);

                    // Re-enable the form
                    // this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: 'Wrong email or password'
                    };

                    // Show the alert
                    this.showAlert = true;

                }
            );
    }
}
