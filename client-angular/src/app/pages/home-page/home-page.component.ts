import { Component } from '@angular/core';
import { ApolloService } from '../../services/apollo.service';
import { CommonModule } from '@angular/common';
import { JobListComponent } from "../../components/job-list/job-list.component";

@Component({
    selector: 'app-home-page',
    standalone: true,
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
    imports: [CommonModule, JobListComponent]
})
export class HomePageComponent {
  jobs:any[] = [];
  totalCount:number = 0;
  loading:boolean = true;
  error:any = null;
  limit = 10;
  offset = 0;
  initPage = 1;
  pageCount = 0;
  currentPage = 1;
  pageRange:number[] = [];
  constructor(private apolloService:ApolloService) {
    this.currentPage = this.initPage;
    this.loadJobs(this.initPage);
  }

  private calcPageRange() {
    return Array.from({length: this.pageCount}, (v, k) => k + 1);
  }

  private updatePagination() {
    this.pageCount = Math.ceil(this.totalCount / this.limit);
    this.pageRange = this.calcPageRange();
  }

  public loadJobs(page:number = 0) {
    this.currentPage = page;
    this.offset = (page - this.initPage) * this.limit;
    this.apolloService.getJobs(this.limit, this.offset).then((response: any) => {
      this.jobs = response.data?.jobs.jobs || [];
      this.totalCount = response.data?.jobs.totalCount || 0;
      this.loading = response.loading;
      this.error = response.error;
      this.updatePagination();
      console.log(this.jobs);
    });
  }



}
