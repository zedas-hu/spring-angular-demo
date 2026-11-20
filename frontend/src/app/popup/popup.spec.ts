import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Popup } from './popup';

describe('Popup', () => {
  let component: Popup;
  let fixture: ComponentFixture<Popup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Popup],
    }).compileComponents();

    fixture = TestBed.createComponent(Popup);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('class', 'order');
    fixture.componentRef.setInput('text', 'Order');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses the same anchor name for the trigger and popover', () => {
    fixture.componentRef.setInput('class', 'order');
    fixture.componentRef.setInput('text', 'Order');
    fixture.detectChanges();

    const anchorName = `--${component.uniqueId}-trigger`;
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const popover = fixture.nativeElement.querySelector('.inner') as HTMLDivElement;

    expect(trigger.style.getPropertyValue('anchor-name')).toBe(anchorName);
    expect(popover.style.getPropertyValue('position-anchor')).toBe(anchorName);
  });
});
