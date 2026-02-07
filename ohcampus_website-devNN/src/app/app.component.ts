import { Component } from '@angular/core';
// import { LoginpopupService } from './shared/login.service';
import { LoginpopupService } from './shared/loginpopup.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  showLoginPopup: boolean = false;

  constructor(private LoginpopupService: LoginpopupService, public authService: AuthService,) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.LoginpopupService.showLoginPopup$.subscribe((showPopup) => {
        this.showLoginPopup = showPopup;
      });
    }
    if (!this.authService.isLoggedIn()) {
      // alert(88)
      setInterval(() => {
        // alert(67)
        if (!this.authService.isLoggedIn()) {
        if (!this.authService.isSignInPageOpenStatus) {

          this.LoginpopupService.openLoginPopup();
        }

        }
      }, 180000);

    }
  }

  closeLoginPopup(): void {
    this.LoginpopupService.closeLoginPopup();
  }
}
