import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss'
})
export class JobListComponent {
  @Input() jobs:any[] = [];
  @Input() totalCount:number = 0;

  getTitle(job:any) {
    return job.company ? `${job.title} at ${job.company.name}` : `${job.title}`;
  }
}
