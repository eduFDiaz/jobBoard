import { Injectable } from '@angular/core';
// import { JoyrideService } from 'ngx-joyride';

@Injectable({
  providedIn: 'root',
})
export class TourService {

  constructor() { }

  // constructor(private readonly joyrideService: JoyrideService) { }

  startTour() {
    console.log('Starting tour');
    // this.joyrideService.startTour({ steps: ['firstStep', 'secondStep'] }  );
  }
}
