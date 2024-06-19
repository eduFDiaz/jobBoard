
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApolloService } from '../../services/apollo.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-page',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './job-page.component.html',
  styleUrl: './job-page.component.scss'
})
export class JobPageComponent implements OnInit{

  loading:boolean = true;
  job:any = {};
  error:any = null;
  constructor(private activeRoute: ActivatedRoute, private router:Router, private apolloService:ApolloService, public authService: AuthService) {}
  
  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe(
      (params) => {
        const jobId = params.get('jobId');
        console.log(jobId);
        if (!jobId) return;
        this.apolloService.getJobById(jobId).then((response:any) => {
          this.job = response.data?.job;
          this.loading = response.loading;
          this.error = response.error;
          console.log(this.job);
        });
      }
    );
  }

  deleteJob() {
    this.apolloService.deleteJob(this.job.id).then((response:any) => {
      console.log(response);
      this.loading = response.loading;
      this.router.navigate(['/']);
    }).catch((error:any) => {
      console.log(error);
      this.error = error;
    });
  }

  resetError() {
    this.error = null;
  }

  upercase(arg0: string) {
    return arg0.toUpperCase();
  }
}
