import { CommonModule } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { TourService } from '../services/tour-service.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  constructor(public authService:AuthService, public tourService: TourService) {}
  ngOnInit(): void {
    this.authService.getUser();
  };

  handleLogout() {
    console.log('[navbar] Logging out');
    this.authService.logout();
  }

  startTour() {
    this.tourService.startTour();
  }
}
