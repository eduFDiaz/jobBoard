import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCognitoPageComponent } from './login-cognito.component';

describe('LoginPageComponent', () => {
  let component: LoginCognitoPageComponent;
  let fixture: ComponentFixture<LoginCognitoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCognitoPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginCognitoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
