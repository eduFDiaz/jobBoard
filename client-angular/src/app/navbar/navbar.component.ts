import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { TourService } from '../services/tour-service.service';
import { AuthCognitoService } from '../services/auth.cognito.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, AfterViewInit {

  constructor(public cognitoAuthService:AuthCognitoService, public tourService: TourService, private router: Router) {}
  ngAfterViewInit(): void {
    console.log(`[navbar] ngAfterViewInit() isLoggedIn: ${JSON.stringify(this.cognitoAuthService.loggedIn(), null, 2)}`);
    console.log(`[navbar] ngAfterViewInit() user: ${JSON.stringify(this.cognitoAuthService.user(), null, 2)}`);
  }
  ngOnInit(): void {
    console.log(`[navbar] ngOnInit() isLoggedIn: ${JSON.stringify(this.cognitoAuthService.loggedIn(), null, 2)}`);
    console.log(`[navbar] ngOnInit() user: ${JSON.stringify(this.cognitoAuthService.user(), null, 2)}`);
    this.cognitoAuthService.refreshSignals();
  };

  handleLogout() {
    console.log('[navbar] Logging out');
    this.cognitoAuthService.signOut();
    this.router.navigate(['/']);
  }

  startTour() {
    this.tourService.startTour();
  }
}
