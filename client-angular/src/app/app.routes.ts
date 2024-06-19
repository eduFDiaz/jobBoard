import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CompanyPageComponent } from './pages/company-page/company-page.component';
import { CreateJobPageComponent } from './pages/create-job-page/create-job-page.component';
import { JobPageComponent } from './pages/job-page/job-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

export const routes: Routes = [
    { path: "" , component: HomePageComponent},
    { path: "companies/:companyId", component: CompanyPageComponent},
    { path: "jobs/new", component: CreateJobPageComponent},
    { path: "jobs/:jobId", component: JobPageComponent},
    { path: "jobs/:jobId/edit", component: CreateJobPageComponent},
    { path: "login", component: LoginPageComponent },
];
