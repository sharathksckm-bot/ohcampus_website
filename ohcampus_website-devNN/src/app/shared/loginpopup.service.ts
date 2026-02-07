import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginpopupService {
  private showLoginPopupSource = new Subject<boolean>();
  showLoginPopup$ = this.showLoginPopupSource.asObservable();

  constructor(private authService: AuthService) {}

  openLoginPopup(): void {
    // console.log(this.showLoginPopupSource)
    // this.showLoginPopupSource.next(true);
    // if (!this.authService.isLoggedIn) {
      this.showLoginPopupSource.next(true);  
    // }
  }

  closeLoginPopup(): void {
    this.showLoginPopupSource.next(false);
  }
}
