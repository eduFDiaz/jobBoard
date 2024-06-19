import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from "./navbar/navbar.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [CommonModule, NavbarComponent]
})
export class AppComponent {
}
