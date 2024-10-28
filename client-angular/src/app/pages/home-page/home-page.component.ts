import { Component } from '@angular/core';
import { ApolloService } from '../../services/apollo.service';
import { CommonModule } from '@angular/common';
import { JobListComponent } from "../../components/job-list/job-list.component";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { JobPageComponent } from '../job-page/job-page.component';
import { NgxSpinnerModule } from "ngx-spinner";

@Component({
    selector: 'app-home-page',
    standalone: true,
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
    imports: [CommonModule, JobListComponent, JobPageComponent, InfiniteScrollModule, NgxSpinnerModule]
})
export class HomePageComponent {
  jobs:any[] = [];
  selectedJob: any | null = null;
  
  loading:boolean = true;
  error:any = null;
  limit = 10;
  totalCount:number = 0;

  startKey: any = null;

  finished: Boolean = false;

  constructor(private apolloService:ApolloService) {
    this.loadJobs();
  }

  public loadJobs() {
    this.apolloService.getJobs(this.limit, this.startKey).then((response: any) => {
      if (response.data?.jobs.lastKey !== null) {
        this.startKey = { ...response.data?.jobs.lastKey };
        delete this.startKey.__typename;
      }

      let newJobs = response.data?.jobs.jobs || [];
      if (newJobs.length === 0) {
        this.finished = true;
      }
      this.jobs.push(...newJobs);
      this.totalCount = response.data?.jobs.count || 0;
      this.loading = response.loading;
      this.error = response.error;

      if (this.selectedJob === null && this.jobs.length > 0) {
        this.selectedJob = this.jobs[0];
      }
    });
  }

  public onScroll() {
    console.log(`[home-page] Scrolling...`);
    if (this.finished) {
      return;
    }
    this.loading = true;
    this.loadJobs()
  }

  onJobSelected(jobId: any): void {
    this.selectedJob = this.jobs.find((job) => job.id === jobId);
    console.log(`[home-page] Selected job: ${this.selectedJob}`);
  }


}
