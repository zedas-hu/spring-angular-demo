import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Selector } from './selector';

describe('Selector', () => {
  let component: Selector;
  let fixture: ComponentFixture<Selector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Selector],
    }).compileComponents();

    fixture = TestBed.createComponent(Selector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders provider keys as datalist options', async () => {
    fixture.componentRef.setInput('keyProvider', {
      getKeyList: vi.fn().mockResolvedValue([
        { key: 1, value: 'Example album' },
      ]),
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const options = fixture.nativeElement.querySelectorAll('datalist option') as NodeListOf<HTMLOptionElement>;
    expect(options).toHaveLength(1);
    expect(options[0].value).toBe('Example album');
    expect(options[0].textContent).toBe('Example album');

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Example album';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.key()).toBe(1);

    input.value = 'Not an album';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.key()).toBeUndefined();
  });
});
