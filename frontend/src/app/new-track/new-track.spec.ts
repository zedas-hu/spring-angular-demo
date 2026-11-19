import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewTrack } from './new-track';

describe('NewTrack', () => {
  let component: NewTrack;
  let fixture: ComponentFixture<NewTrack>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewTrack],
    }).compileComponents();

    fixture = TestBed.createComponent(NewTrack);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
