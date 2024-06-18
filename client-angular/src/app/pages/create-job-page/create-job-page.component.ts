import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ApolloService } from '../../services/apollo.service';
import { Blur, QuillModule, SelectionChange } from 'ngx-quill';

@Component({
  selector: 'app-create-job-page',
  standalone: true,
  imports: [ReactiveFormsModule, QuillModule],
  templateUrl: './create-job-page.component.html',
  styleUrl: './create-job-page.component.scss',
})
export class CreateJobPageComponent implements OnInit {
  loading: boolean = false;
  error: any = null;
  editMode: boolean = false;
  editJobId: string = '';
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
  createJobForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  constructor(private apolloService: ApolloService, private router: Router) {}

  ngOnInit(): void {
    this.createJobForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });

    if (this.router.url.includes('edit')) {
      this.editMode = true;
      this.editJobId = this.router.url.split('/')[2];
      this.apolloService.getJobById(this.router.url.split('/')[2]).then(
        (response: any) => {
          this.createJobForm.setValue({
            title: response.data?.job.title,
            description: response.data?.job.description,
          });
        }
      );
    }
  }

  createJob($event: any) {
    $event.preventDefault();
    this.loading = true;
    const createJobInput = {
      title: this.createJobForm.value.title,
      description: this.createJobForm.value.description,
    };
    if (this.editMode) {
      this.apolloService
        .updateJob(this.editJobId, createJobInput)
        .then((response: any) => {
          console.log(response);
          this.loading = response.loading;
          this.router.navigate(['/jobs', response.data.job.id]);
        })
        .catch((error: any) => {
          console.log(error);
          this.error = error;
        });
      return;
    } else {
      this.apolloService.createJob(createJobInput).then((response: any) => {
        console.log(response);
        this.loading = response.loading;
        this.router.navigate(['/jobs', response.data.job.id]);
      }).catch((error:any) => {
        console.log(error);
        this.error = error;
      });
    }
  }

    onEditorFocused($event: SelectionChange) {
      console.log('editor focus!', $event);
    }

    onEditorBlurred($event: Blur) {
     console.log('editor blur!', $event);
    }
}
