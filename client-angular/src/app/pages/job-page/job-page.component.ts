
import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApolloService } from '../../services/apollo.service';
import { CommonModule } from '@angular/common';
import { AuthCognitoService } from '../../services/auth.cognito.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-job-page',
  standalone: true,
  imports: [RouterLink, CommonModule, NgxSpinnerModule],
  templateUrl: './job-page.component.html',
  styleUrl: './job-page.component.scss'
})
export class JobPageComponent implements OnInit, AfterViewInit, OnChanges {

  loading:boolean = true;
  error:any = null;
  @Input() job:any = {};
  isJobsByIdPage: boolean = false;
  constructor(private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute, private router:Router, private apolloService:ApolloService, public authService: AuthCognitoService) {}
  
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.activatedRoute.url.subscribe((params) => {
      if (params.length > 0) {
        console.log(`[job-page] Loading job with id: ${params}`);
        this.apolloService.getJobById(params[1]?.path).then((response:any) => {
          this.isJobsByIdPage = true;
          this.loading = response.loading;
          this.job = response.data?.job;
          // this.spinner.hide();
        }).catch((error:any) => {
          this.loading = error.loading;
          this.error = error;
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loading = true;
    this.spinner.show();
    if (changes['job']) {
      this.loadJob();
    }
  }

  loadJob() {
    if (this.job === null) {
      return;
    }
    this.apolloService.getJobById(this.job.id).then((response:any) => {
      this.loading = response.loading;
      this.job = response.data?.job;
      // this.spinner.hide();
    }).catch((error:any) => {
      this.loading = error.loading;
      this.error = error;
    });
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

  toUpperCase(arg0: string) {
    return arg0.toUpperCase();
  }
}
