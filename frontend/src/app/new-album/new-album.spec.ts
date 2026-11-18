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
    fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/artists/keys') {
        return jsonResponse(200, [{ key: 3, value: 'Artist' }]);
      }
      return jsonResponse(201, {
        albumId: 9,
        title: 'New',
        artistId: 3,
        artistName: 'Artist',
        tracks: [],
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    await TestBed.configureTestingModule({
      imports: [NewAlbumComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAlbumComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates the album with the selected artist ID and emits its ID', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { albumId: 9, title: 'New', artistId: 3, artistName: 'Artist', tracks: [] }));
    const created = vi.fn();
    fixture.componentInstance.created.subscribe(created);

    typeInto('album-title', 'New');
    typeInto('album-artist', 'Artist');
    await submit();

    expect(fetchMock).toHaveBeenCalledWith('/api/albums', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'New', artistName: 'Artist', artistId: 3 }),
    }));
    expect(created).toHaveBeenCalledWith(9);
  });

  it('sends a null artist ID for a name that does not match an existing artist', async () => {
    typeInto('album-title', 'New');
    typeInto('album-artist', 'A new artist');
    await submit();

    expect(fetchMock).toHaveBeenCalledWith('/api/albums', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'New', artistName: 'A new artist', artistId: null }),
    }));
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

    expect(fetchMock).toHaveBeenCalledWith('/api/artists/keys');
    expect(fetchMock).not.toHaveBeenCalledWith('/api/albums', expect.anything());
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(2);
  });
});
