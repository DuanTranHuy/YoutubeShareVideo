import { TestBed } from '@angular/core/testing';

import { TruncatePipeService } from './truncate-pipe.service';

describe('TruncatePipeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TruncatePipeService = TestBed.get(TruncatePipeService);
    expect(service).toBeTruthy();
  });
});
