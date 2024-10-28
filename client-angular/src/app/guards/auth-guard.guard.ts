import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthCognitoService } from "../services/auth.cognito.service";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthCognitoService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const isAuthenticated = this.authService.loggedIn();
    if (isAuthenticated) {
      return true;
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}