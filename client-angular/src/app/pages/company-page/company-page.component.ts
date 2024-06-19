import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApolloService } from '../../services/apollo.service';
import { JobListComponent } from "../../components/job-list/job-list.component";

@Component({
  selector: 'app-company-page',
  standalone: true,
  imports: [RouterLink, JobListComponent],
  templateUrl: './company-page.component.html',
  styleUrl: './company-page.component.scss'
})
export class CompanyPageComponent implements OnInit {
  loading:boolean = true;
  company:any = {};
  error:any = null;
  constructor(private route: ActivatedRoute, private apolloService:ApolloService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        const companyId = params.get('companyId');
        console.log(companyId);
        if (!companyId) return;
        this.apolloService.getCompanyById(companyId).then((response:any) => {
          this.company = response.data?.company;
          this.loading = response.loading;
          this.error = response.error;
          console.log(this.company);
        } );
      }
    );
  }
}
