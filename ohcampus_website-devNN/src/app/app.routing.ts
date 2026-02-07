import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { CoursesAndFeesComponent } from './modules/admin/collegedetails/courses-and-fees/courses-and-fees.component';
import { PageNotFoundComponent } from './modules/admin/page-not-found/page-not-found.component';
// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'home' },

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'home' },

    // Auth routes for guests
    {
        path: '',
        // canActivate: [NoAuthGuard],
        // canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule) },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule) },
            { path: 'forgotpassword', loadChildren: () => import('app/modules/auth/forgotpassword/forgotpassword.module').then(m => m.ForgotpasswordModule) },
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        // canActivate: [AuthGuard],
        // canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule) }
        ]
    },

    // Landing routes
    // {
    //     path: '',
    //     component  : LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children   : [
    //         {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
    //     ]
    // },

    // Admin routes
    {
        path: '',
        // canActivate: [AuthGuard],
        // canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            { path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule) },
            { path: 'home', loadChildren: () => import('app/modules/admin/home/home.module').then(m => m.HomeModule) },
            { path: 'comparecollege', loadChildren: () => import('app/modules/admin/comparecolleges/comparecolleges.module').then(m => m.ComparecollegesModule) },
            { path: 'comparecollege/:id', loadChildren: () => import('app/modules/admin/comparecolleges/comparecolleges.module').then(m => m.ComparecollegesModule) },
            // { path: 'colleges', loadChildren: () => import('app/modules/admin/listcolleges/listcolleges.module').then(m => m.ListcollegesModule) },
            { path: 'allCollegeList', loadChildren: () => import('app/modules/admin/allcolleges/allcolleges.module').then(m => m.AllcollegesModule) },
            { path: 'allCollegeList/:All', loadChildren: () => import('app/modules/admin/allcolleges/allcolleges.module').then(m => m.AllcollegesModule) },
            { path: 'allCollegeList/menu/:id/:catid', loadChildren: () => import('app/modules/admin/allcolleges/allcolleges.module').then(m => m.AllcollegesModule) },
            { path: 'allCollegeList/course/bycat/:courseid', loadChildren: () => import('app/modules/admin/allcolleges/allcolleges.module').then(m => m.AllcollegesModule) },
            { path: 'allCollegeList/bycategory/course/:courseid', loadChildren: () => import('app/modules/admin/allcolleges/allcolleges.module').then(m => m.AllcollegesModule) },
            { path: 'allCollegeList/searchcollege/:searchvalue', loadChildren: () => import('app/modules/admin/allcolleges/allcolleges.module').then(m => m.AllcollegesModule) },
            // { path: 'comparison', loadChildren: () => import('app/modules/admin/comparison/comparison.module').then(m => m.ComparisonModule) },
            // {path: 'collegeDetails', loadChildren: () => import('app/modules/admin/collegedetails/collegedetails.module').then(m => m.CollegedetailsModule)},
            { path: 'collegeDetails', loadChildren: () => import('app/modules/admin/collegedetails/collegedetails.module').then(m => m.CollegedetailsModule) },
            { path: 'collegeDetails/:id', loadChildren: () => import('app/modules/admin/collegedetails/collegedetails.module').then(m => m.CollegedetailsModule) },
            { path: 'collegeDetails/:id/:course', loadChildren: () => import('app/modules/admin/collegedetails/collegedetails.module').then(m => m.CollegedetailsModule) },
            { path: 'collegeDetails/:id/courseinfo/:courseId', loadChildren: () => import('app/modules/admin/collegedetails/collegedetails.module').then(m => m.CollegedetailsModule) },
            { path: 'collegeDetails/:id/:course/:subcatId', loadChildren: () => import('app/modules/admin/collegedetails/collegedetails.module').then(m => m.CollegedetailsModule) },
            // { path: 'collegeDetails/:id/courses', component: CoursesAndFeesComponent }
            // {path:'Faqs',loadChildren:()=>import('app/modules/admin/collegedetails/faqs/faqs.module').then(m=>m.FaqsModule)}
            // {path:'admission',loadChildren:()=>import('app/modules/admin/collegedetails/admission/admission.module').then(m=>m.AdmissionModule)}
            { path: 'exams', loadChildren: () => import('app/modules/admin/exams/exams.module').then(m => m.ExamsModule) },
            { path: 'exams/:tabno', loadChildren: () => import('app/modules/admin/exams/exams.module').then(m => m.ExamsModule) },
            { path: 'exams/:tabno/searchexam/:searchedexam', loadChildren: () => import('app/modules/admin/exams/exams.module').then(m => m.ExamsModule) },
            { path: 'exams/:tabno/searchedarticle/:searchedarticle', loadChildren: () => import('app/modules/admin/exams/exams.module').then(m => m.ExamsModule) },
            // { path: 'exams/:tabno/:searchexam', loadChildren: () => import('app/modules/admin/exams/exams.module').then(m => m.ExamsModule) },
            { path: 'exams/:tabno/:blogcatid', loadChildren: () => import('app/modules/admin/exams/exams.module').then(m => m.ExamsModule) },
            // {path: 'articles', loadChildren: () => import('app/modules/admin/articles/articles.module').then(m => m.ArticlesModule)},
            { path: 'events', loadChildren: () => import('app/modules/admin/events/events.module').then(m => m.EventsModule) },
            { path: 'events/:searchevent', loadChildren: () => import('app/modules/admin/events/events.module').then(m => m.EventsModule) },
            { path: 'eventdetails/:eventId', loadChildren: () => import('app/modules/admin/eventdetails/eventdetails.module').then(m => m.EventdetailsModule) },
            { path: 'examsdetails/:examid', loadChildren: () => import('app/modules/admin/examdetails/examdetails.module').then(m => m.ExamdetailsModule) },
            { path: 'collegeDetails/:id/:course/comparecollege/compareDetails', loadChildren: () => import('app/modules/admin/comparecolleges/comparecolleges.module').then(m => m.ComparecollegesModule) },
            { path: 'articledetails/:BlogId', loadChildren: () => import('app/modules/admin/articledetails/articledetails.module').then(m => m.ArticledetailsModule) },

            { path: 'hosteldetails', loadChildren: () => import('app/modules/admin/hosteldetails/hosteldetails.module').then(m => m.HosteldetailsModule) },
            { path: 'hosteldetails/:hostelId', loadChildren: () => import('app/modules/admin/hosteldetails/hosteldetails.module').then(m => m.HosteldetailsModule) },
            { path: 'allanswers/:id/:QueId', loadChildren: () => import('app/modules/admin/anspage/anspage.module').then(m => m.AnspageModule) },
            { path: 'reviewrating', loadChildren: () => import('app/modules/admin/clgreviewrating/clgreviewrating.module').then(m => m.ClgreviewratingModule) },
            { path: 'reviewrating/:collegeid', loadChildren: () => import('app/modules/admin/clgreviewrating/clgreviewrating.module').then(m => m.ClgreviewratingModule) },
            { path: 'courselist', loadChildren: () => import('app/modules/admin/courselist/courselist.module').then(m => m.CourselistModule) },
            { path: 'courselist/bycat/:categoryid', loadChildren: () => import('app/modules/admin/courselist/courselist.module').then(m => m.CourselistModule) },
            { path: 'courselist/:searchedcourse', loadChildren: () => import('app/modules/admin/courselist/courselist.module').then(m => m.CourselistModule) },
            { path: 'certifications', loadChildren: () => import('app/modules/admin/certifications/certifications.module').then(m => m.CertificationsModule) },
            { path: 'certifications/:certificateId', loadChildren: () => import('app/modules/admin/certifications/certifications.module').then(m => m.CertificationsModule) },
            { path: 'contactus', loadChildren: () => import('app/modules/admin/contactus/contactus.module').then(m => m.ContactusModule) },
            { path: 'termsncondition', loadChildren: () => import('app/modules/admin/termsncondition/termsncondition.module').then(m => m.TermsnconditionModule) },
            { path: 'loans', loadChildren: () => import('app/modules/admin/loans/loans.module').then(m => m.LoansModule) },
            { path: 'scholorships', loadChildren: () => import('app/modules/admin/scholarships/scholarships.module').then(m => m.ScholarshipsModule) },
            { path: 'whoweare', loadChildren: () => import('app/modules/admin/whoweare/whoweare.module').then(m => m.WhoweareModule) },
            { path: 'faqs', loadChildren: () => import('app/modules/admin/faq/faq.module').then(m => m.FaqModule) },
            { path: 'collegeDetails/:id/compare/:selectedid/comparecollege/compareDetails', loadChildren: () => import('app/modules/admin/comparecolleges/comparecolleges.module').then(m => m.ComparecollegesModule) },

            { path: 'privacy-policy', loadChildren: () => import('app/modules/admin/privacy-policy/privacy-policy.module').then(m => m.PrivacypolicyModule) },
            { path: 'study-abroad', loadChildren: () => import('app/modules/admin/studyabroad/studyabroad.module').then(m => m.StudyabroadModule) },

        ]
    },
    { path: '**', component: PageNotFoundComponent },

];
