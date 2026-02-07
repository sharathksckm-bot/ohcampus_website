import { NgModule } from '@angular/core';
import { BrowserModule, Meta } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { FaqsComponent } from './modules/admin/collegedetails/faqs/faqs.component';
import { AdmissionComponent } from './modules/admin/collegedetails/admission/admission.component';
import { AgmCoreModule } from '@agm/core';
import { LoginpopupComponent } from './loginpopup/loginpopup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
// import { ArticlesComponent } from './modules/admin/articles/articles.component';
// import { NgOtpInputModule } from  'ng-otp-input';
// import { NgImageSliderModule } from 'ng-image-slider';
import {IvyCarouselModule} from 'angular-responsive-carousel';
import { EventsComponent } from './modules/admin/events/events.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PrivacyPolicyComponent } from './modules/admin/privacy-policy/privacy-policy.component';
import { PageNotFoundComponent } from './modules/admin/page-not-found/page-not-found.component';
// import { AppRoutingModule } from './app-routing.module';

// import { SocialLoginModule } from 'angularx-social-login';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

const routerConfig: ExtraOptions = {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled'
};

@NgModule({
    declarations: [
        AppComponent,
        LoginpopupComponent,
        // StudyabroadComponent,
        // PageNotFoundComponent,
        // PrivacyPolicyComponent,
    ],
    imports: [
        // SocialLoginModule,
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),

        // Fuse, FuseConfig & FuseMockAPI
        FuseModule,
        FuseConfigModule.forRoot(appConfig),
        FuseMockApiModule.forRoot(mockApiServices),

        // Core module of your application
        CoreModule,

        // Layout module of your application
        LayoutModule,

        // 3rd party modules that require global configuration via forRoot
        MarkdownModule.forRoot({}),
        AgmCoreModule.forRoot({ apiKey: 'AIzaSyAMybtct7fx4uCZyrxiZ_ykI0cSihTjINg' }),
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatCheckboxModule,
        // SocialLoginModule
        
        // ShareButtonModule.withConfig({})
        // IvyCarouselModule
        // NgImageSliderModule
    ],
    bootstrap: [
        AppComponent
    ],
//     providers: [
//     {
//       provide: 'SocialAuthServiceConfig',
//       useValue: {
//         autoLogin: false,
//         providers: [
//           {
//             id: GoogleLoginProvider.PROVIDER_ID,
//             provider: new GoogleLoginProvider(
//               '1055111684626-2jj2vjuul76rqlgc3gbldpfnqsk91i9h.apps.googleusercontent.com'
//             )
//           }
//         ]
//       } as SocialAuthServiceConfig,
//     }
//   ]
})
export class AppModule {
}
