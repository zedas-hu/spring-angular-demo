import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NewAlbumComponent } from './new-album';

describe('NewAlbumComponent', () => {
  let fixture: ComponentFixture<NewAlbumComponent>;
  let fetchMock: ReturnType<typeof vi.fn>;

  const jsonResponse = (status: number, body: unknown) => ({
    ok: status < 400,
    status,
    json: async () => body,
  });
  const typeInto = (id: string, value: string) => {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = async () => {
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await new Promise(resolve => setTimeout(resolve));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({
      imports: [NewAlbumComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAlbumComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates the album with the entered title and artist name and emits its id', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { albumId: 9, title: 'New', artistId: 3, artistName: 'Artist', tracks: [] }));
    const created = vi.fn();
    fixture.componentInstance.created.subscribe(created);

    typeInto('album-title', 'New');
    typeInto('album-artist', 'Artist');
    await submit();

    expect(fetchMock).toHaveBeenCalledWith('/api/albums', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'New', artistName: 'Artist' }),
    }));
    expect(created).toHaveBeenCalledWith(9);
  });

  it('shows server field errors next to the matching field', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, {
      detail: 'TITLE_DUPLICATION',
      fieldErrors: { title: 'TITLE_DUPLICATION' },
    }));

    typeInto('album-title', 'New');
    typeInto('album-artist', 'Artist');
    await submit();

    const errors = fixture.nativeElement.querySelectorAll('.field-error');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toContain('An album with the same title already exists.');
    expect(fixture.nativeElement.querySelector('#album-title').getAttribute('aria-invalid')).toBe('true');
  });

  it('does not call the API until the required fields are filled', async () => {
    await submit();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(2);
  });
});
