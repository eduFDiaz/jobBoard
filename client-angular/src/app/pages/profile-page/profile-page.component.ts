
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApolloService } from '../../services/apollo.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthCognitoService } from '../../services/auth.cognito.service';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-job-page',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, QuillModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit, AfterViewInit{

  loading:boolean = true;
  companies:any = [];
  selectedCompany:any = null;
  error:any = null;
  companyName: string = '';
  companyDescription: string = '';

  activeTab: string = 'tab1';
  searchQuery: string = '';
  createCompanyForm: FormGroup;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],
  
      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction
  
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
  
      ['clean'],                                         // remove formatting button
  
      ['link', 'image', 'video']                         // link and image, video
    ]
  };

  constructor(private fb: FormBuilder, private router:Router, private apolloService:ApolloService, public authService: AuthCognitoService) {
    this.createCompanyForm = this.fb.group({
      searchQuery: [''],
      selectedCompany: [''],
      companyName: ['', Validators.required],
      companyDescription: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.apolloService.getCompanies().then((response:any) => {
      this.companies = response.data?.companies;
      this.loading = response.loading;
      this.error = response.error;
    });
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  onSearchCompany(): void {
    const searchQuery = this.createCompanyForm.get('searchQuery')?.value;
    if (searchQuery && searchQuery.length > 2) { // Add a minimum length check to avoid too many requests
      this.loading = true;
      this.apolloService.searchCompanies(searchQuery).then(
        (results: any) => {
          this.companies = results?.data?.searchCompany;
          this.loading = false;
        },
        (error) => {
          this.error = 'Error fetching companies';
          this.loading = false;
        }
      );
    } else {
      this.companies = [];
    }
  }

  onSelectedCompany($event:any) {
    const companyId = $event.target.value;
    this.selectedCompany = this.companies.find((c:any) => c.id === companyId);
    console.log(`Selected company: ${JSON.stringify(this.selectedCompany, null, 2)}`);
  }

  onSubmitForm(): void {
    let input:any = {};
    if (this.activeTab === 'tab1') {
      const selectedCompanyId = this.createCompanyForm.get('selectedCompany')?.value;
      // console.log(`selectedCompanyId: ${selectedCompanyId}`);
      // console.log(`selectedCompany: ${JSON.stringify(this.selectedCompany, null, 2)}`);
      if (this.selectedCompany.id === selectedCompanyId) {  
        input = { ...this.selectedCompany };
        delete input.__typename;
        // console.log(`updating company: ${JSON.stringify(input, null, 2)}`);
      }
    } else if (this.activeTab === 'tab2') {
      if (this.createCompanyForm.valid) {
        const companyName = this.createCompanyForm.get('companyName')?.value;
        const companyDescription = this.createCompanyForm.get('companyDescription')?.value;

        input = {
          "name": companyName,
          "description": companyDescription,
          "id": null
        };
      }
    }
    // console.log(`saving company: ${JSON.stringify(input, null, 2)}`);
    this.apolloService.createCompany(input).then(
      (response: any) => {
        // console.log(this.activeTab === 'tab1' ? `Company updated: ${response}` : `Company created: ${response}`);
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Error creating company:', error);
      }
    );
  }
}
