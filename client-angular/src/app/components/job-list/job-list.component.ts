import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent implements OnInit {
  
  @Input() jobs:any[] = [];
  @Input() totalCount:number = 0;
  @Output() onSelectedJob = new EventEmitter<any>();
  selectedJobId: number | null = null;
  isCompanyPage: boolean = false;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    if (this.jobs.length > 0) {
      this.selectedJobId = this.jobs[0].id;
      this.onSelectedJob.emit(this.jobs[0]);
    }
    this.activatedRoute.url.subscribe((urlSegments) => {
      this.isCompanyPage = urlSegments[0]?.path === 'companies';
      console.log(`[job-list] isCompanyPage: ${this.isCompanyPage}`);
    });
  }

  getTitle(job:any) {
    return job.company ? `${job.title} at ${job.company.name}` : `${job.title}`;
  }

  selectJob(selectedJob: any) {
    this.selectedJobId = selectedJob;
    this.onSelectedJob.emit(selectedJob);
  }
}
