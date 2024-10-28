import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CompanyPageComponent } from './pages/company-page/company-page.component';
import { CreateJobPageComponent } from './pages/create-job-page/create-job-page.component';
import { JobPageComponent } from './pages/job-page/job-page.component';
import { LoginCognitoPageComponent } from './pages/login-cognito/login-cognito.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AuthGuard } from './guards/auth-guard.guard';

export const routes: Routes = [
    { path: "" , component: HomePageComponent},
    { path: "companies/:companyId", component: CompanyPageComponent},
    { path: "jobs/new", component: CreateJobPageComponent, canActivate: [AuthGuard] },
    { path: "jobs/:jobId", component: JobPageComponent},
    { path: "jobs/:jobId/edit", component: CreateJobPageComponent, canActivate: [AuthGuard] },
    { path: "login", component: LoginCognitoPageComponent },
    { path: "profile", component: ProfilePageComponent, canActivate: [AuthGuard] },
];
