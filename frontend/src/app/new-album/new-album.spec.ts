import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { Mock, vi } from 'vitest';
import { NewAlbumComponent } from './new-album';
import { ApiStubHandler, ApiStubResponse, provideApiStub } from '../testing/api-stub';

describe('NewAlbumComponent', () => {
  let fixture: ComponentFixture<NewAlbumComponent>;
  let apiMock: Mock<ApiStubHandler>;

  const typeInto = (id: string, value: string) => {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = async () => {
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await new Promise(resolve => setTimeout(resolve));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    apiMock = vi.fn<ApiStubHandler>(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/artists/keys') {
        return { body: [{ key: 3, value: 'Artist' }] };
      }
      if (url === '/api/albums/keys') {
        return { body: [{ key: 9, value: 'New' }] };
      }
      return {
        status: 201,
        body: { albumId: 9, title: 'New', artistId: 3, artistName: 'Artist', tracks: [] },
      };
    });

    await TestBed.configureTestingModule({
      imports: [NewAlbumComponent],
      providers: [provideApiStub(apiMock)],
    }).compileComponents();

    fixture = TestBed.createComponent(NewAlbumComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates the album with the selected artist ID and emits its ID', async () => {
    apiMock.mockReturnValue({ status: 201, body: { albumId: 9, title: 'New', artistId: 3, artistName: 'Artist', tracks: [] } });
    const created = vi.fn();
    fixture.componentInstance.created.subscribe(created);

    typeInto('album-title', 'New');
    typeInto('album-artist', 'Artist');
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(false);
    await submit();

    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/albums',
      body: { title: 'New', artistName: 'Artist', artistId: 3 },
    }));
    expect(fixture.nativeElement.querySelector('.field-warning')).toBeNull();
    expect(created).toHaveBeenCalledWith(9);
  });

  it('sends a null artist ID for a name that does not match an existing artist', async () => {
    typeInto('album-title', 'New');
    typeInto('album-artist', 'A new artist');
    await submit();

    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/albums',
      body: { title: 'New', artistName: 'A new artist', artistId: null },
    }));
    expect(fixture.nativeElement.querySelector('.field-warning').textContent).toContain(
      'No existing artist has this name; a new artist will be created.',
    );
  });

  it('shows server field errors next to the matching field', async () => {
    apiMock.mockImplementation(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/albums/keys') {
        return { body: [{ key: 9, value: 'New' }] };
      }
      return {
        status: 409,
        body: {
          detail: 'TITLE_DUPLICATION',
          fieldErrors: { title: 'TITLE_DUPLICATION' },
        },
      };
    });

    typeInto('album-title', 'New');
    typeInto('album-artist', 'Artist');
    const existingAlbum = vi.fn();
    fixture.componentInstance.existingAlbum.subscribe(existingAlbum);
    await submit();

    const errors = fixture.nativeElement.querySelectorAll('.field-error');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toContain('An album with the same title already exists.');
    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/albums/keys' }));
    expect(fixture.nativeElement.querySelector('#album-title').getAttribute('aria-invalid')).toBe('true');
    const openExistingButton = fixture.nativeElement.querySelector('.existing-album-button') as HTMLButtonElement;
    expect(openExistingButton.textContent).toContain('Open existing album');
    openExistingButton.click();
    expect(existingAlbum).toHaveBeenCalledWith(9);
  });

  it('does not call the API until the required fields are filled', async () => {
    const titleInput = fixture.nativeElement.querySelector('#album-title') as HTMLInputElement;
    const artistInput = fixture.nativeElement.querySelector('#album-artist') as HTMLInputElement;
    titleInput.dispatchEvent(new Event('blur'));
    artistInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await submit();

    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/artists/keys' }));
    expect(apiMock).not.toHaveBeenCalledWith(expect.objectContaining({ url: '/api/albums' }));
    expect((fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(2);
  });

  it('shows an artist error when only whitespace is entered', async () => {
    typeInto('album-title', 'New');
    typeInto('album-artist', '   ');
    (fixture.nativeElement.querySelector('#album-artist') as HTMLInputElement).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await submit();

    expect(apiMock).not.toHaveBeenCalledWith(expect.objectContaining({ url: '/api/albums' }));
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.field-error')[0].textContent).toContain('Enter an artist name.');
  });

  it('shows the required artist error after an empty artist field is blurred', () => {
    const artistInput = fixture.nativeElement.querySelector('#album-artist') as HTMLInputElement;
    artistInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.field-error').textContent).toContain('Enter an artist name.');
    expect(artistInput.getAttribute('aria-invalid')).toBe('true');
  });

  it('does not create an artist when the artist list cannot be loaded', async () => {
    apiMock.mockImplementation(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/artists/keys') {
        return { status: 500, body: {} };
      }
      return {
        status: 201,
        body: { albumId: 9, title: 'New', artistId: null, artistName: 'A new artist', tracks: [] },
      };
    });
    fixture = TestBed.createComponent(NewAlbumComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    typeInto('album-title', 'New');
    typeInto('album-artist', 'A new artist');
    await submit();

    expect(apiMock).not.toHaveBeenCalledWith(expect.objectContaining({ url: '/api/albums' }));
    expect(fixture.componentInstance.formError()).toBe('ARTIST_LOOKUP_FAILED');
  });

  it('uses the matching artist ID when the name was entered before the artist list loaded', async () => {
    let resolveArtists!: (response: ApiStubResponse) => void;
    apiMock.mockImplementation(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/artists/keys') {
        return new Promise(resolve => { resolveArtists = resolve; });
      }
      return {
        status: 201,
        body: { albumId: 9, title: 'New', artistId: 3, artistName: 'Artist', tracks: [] },
      };
    });
    fixture = TestBed.createComponent(NewAlbumComponent);
    fixture.detectChanges();

    typeInto('album-title', 'New');
    typeInto('album-artist', 'Artist');
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    resolveArtists({ body: [{ key: 3, value: 'Artist' }] });
    await new Promise(resolve => setTimeout(resolve));

    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/albums',
      body: { title: 'New', artistName: 'Artist', artistId: 3 },
    }));
  });

  it('opens the existing album when the title has surrounding spaces', async () => {
    apiMock.mockImplementation(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/albums/keys') {
        return { body: [{ key: 9, value: 'New' }] };
      }
      return { status: 409, body: { detail: 'TITLE_DUPLICATION', fieldErrors: { title: 'TITLE_DUPLICATION' } } };
    });
    const existingAlbum = vi.fn();
    fixture.componentInstance.existingAlbum.subscribe(existingAlbum);

    typeInto('album-title', '  New  ');
    typeInto('album-artist', 'Artist');
    await submit();

    const openExistingButton = fixture.nativeElement.querySelector('.existing-album-button') as HTMLButtonElement;
    expect(openExistingButton).not.toBeNull();
    openExistingButton.click();
    expect(existingAlbum).toHaveBeenCalledWith(9);
  });

  it('hides the existing album button once the title is changed', async () => {
    apiMock.mockImplementation(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/albums/keys') {
        return { body: [{ key: 9, value: 'New' }] };
      }
      return { status: 409, body: { detail: 'TITLE_DUPLICATION', fieldErrors: { title: 'TITLE_DUPLICATION' } } };
    });

    typeInto('album-title', 'New');
    typeInto('album-artist', 'Artist');
    await submit();
    expect(fixture.nativeElement.querySelector('.existing-album-button')).not.toBeNull();

    typeInto('album-title', 'Another title');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.existing-album-button')).toBeNull();
  });
});
