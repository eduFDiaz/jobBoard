import { TestBed } from '@angular/core/testing';

import { TourService } from './tour-service.service';

describe('TourServiceService', () => {
  let service: TourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
