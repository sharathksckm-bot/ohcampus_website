import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { FuseAlertType } from '@fuse/components/alert';

@Injectable()
export class AuthService {
    apiurl = environment.apiurl;
    private _authenticated: boolean = false;
    public isSignInPageOpenStatus: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post('api/auth/sign-in', credentials).pipe(
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.accessToken;
                     
                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;
              
                // Return a new observable with the response
                return of(response);
            })
        );
    }

    public resendOTP(email): Observable<any> {
        const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
        return this._httpClient.post(
            `${this.apiurl}user/resendOTP`,
            {
                email: email,
                defaultToken: localStorage.getItem('defaultToken')
            }, { headers, responseType: 'json' }
        );
    }



    logindata(username, password,type) {
        return this._httpClient.post(`${this.apiurl}Authentication/validateUser`, {
            username: username, password: password,type: type
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {
                // alert(1);
                if (response.response_code == 2 || response.response_code == 3) {
                    // alert( JSON.stringify(response));
                    // this.alert = {
                    //     type: 'error',
                    //     message: 'Wrong email or password'
                    // };

                    return of(response);

                }
                // Store the access token in the local storage
                this.accessToken = response.response_message.token;
                // console.log(this.accessToken);
                // localStorage.setItem('username', response.data.UserName)
                // localStorage.setItem('password', response.data.Password)

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                // this._userService.user = response.response_data.user;

                // localStorage.setItem("currentUser",JSON.stringify(response.response_data.user));

                // console.log(this._userService.user);

                //  this.sessionExpireHnadler();

                // Return true
                return of(response);
            })
        );
    }

    isSignInPageOpen(value){

        this.isSignInPageOpenStatus = value;
        console.log(this.isSignInPageOpenStatus);
 }

    isLoggedIn(): boolean {
        // Implement logic to check if the user is logged in
        // For example, check if there is a stored authentication token
        return !!localStorage.getItem('accessToken');
    }
    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Renew token
        return this._httpClient.post(`${this.apiurl}Authentication/refresh_access_token`, {
            accessToken: this.accessToken
        }).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.response_data.token;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; }): Observable<any> {
        return this._httpClient.post(`${this.apiurl}user/createUser`, user);
    }
    /**
     * Sign up
     *
     * @param otpdata
     */
    verifyOTP(otpdata: { otp: string; }): Observable<any> {
        return this._httpClient.post(`${this.apiurl}user/verifyOTP`, otpdata);
    }
    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
