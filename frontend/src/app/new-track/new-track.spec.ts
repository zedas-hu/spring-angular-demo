import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { Mock, vi } from 'vitest';
import { NewTrack } from './new-track';
import { ApiStubHandler, provideApiStub } from '../testing/api-stub';

describe('NewTrack', () => {
  let fixture: ComponentFixture<NewTrack>;
  let apiMock: Mock<ApiStubHandler>;

  const setValue = (id: string, value: string) => {
    const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement | HTMLSelectElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    if (input instanceof HTMLSelectElement) {
      input.dispatchEvent(new Event('change'));
    }
  };
  const submit = async () => {
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await new Promise(resolve => setTimeout(resolve));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    apiMock = vi.fn<ApiStubHandler>(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/genres') {
        return { body: [{ genreId: 2, name: 'Rock' }] };
      }
      if (url === '/api/media-types') {
        return { body: [{ mediaTypeId: 1, name: 'MPEG audio file' }] };
      }
      return { status: 201, body: {} };
    });

    await TestBed.configureTestingModule({
      imports: [NewTrack],
      providers: [provideApiStub(apiMock)],
    }).compileComponents();

    fixture = TestBed.createComponent(NewTrack);
    fixture.componentRef.setInput('albumId', 7);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('creates a track using the current album and converts the entered duration to milliseconds', async () => {
    const created = vi.fn();
    fixture.componentInstance.created.subscribe(created);

    setValue('track-name', 'New track');
    setValue('track-genre', '2');
    setValue('track-media-type', '1');
    setValue('track-composer', 'Composer');
    setValue('track-duration', '3:45');
    expect(fixture.componentInstance.trackForm().value()).toEqual({
      name: 'New track',
      genreId: '2',
      mediaTypeId: '1',
      composer: 'Composer',
      duration: '3:45',
      unitPrice: 0.99,
    });
    expect(fixture.componentInstance.trackForm().invalid()).toBe(false);
    await submit();

    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/tracks',
      body: {
        name: 'New track',
        albumId: 7,
        genreId: 2,
        mediaTypeId: 1,
        composer: 'Composer',
        milliseconds: 225000,
        unitPrice: 0.99,
      },
    }));
    expect(created).toHaveBeenCalledOnce();
  });

  it('requires the duration to use minutes:seconds with seconds from 00 to 59', async () => {
    setValue('track-name', 'New track');
    setValue('track-genre', '2');
    setValue('track-media-type', '1');
    setValue('track-duration', '3:60');
    (fixture.nativeElement.querySelector('#track-duration') as HTMLInputElement).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await submit();

    expect(apiMock).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: '/api/tracks' }));
    expect(fixture.nativeElement.textContent).toContain('Enter the duration as minutes:seconds (for example, 3:45).');
  });

  it('shows the server error when the album already contains a track with that name', async () => {
    apiMock.mockImplementation(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/genres') {
        return { body: [{ genreId: 2, name: 'Rock' }] };
      }
      if (url === '/api/media-types') {
        return { body: [{ mediaTypeId: 1, name: 'MPEG audio file' }] };
      }
      return {
        status: 409,
        body: {
          detail: 'TRACK_NAME_DUPLICATION',
          fieldErrors: { name: 'TRACK_NAME_DUPLICATION' },
        },
      };
    });

    setValue('track-name', 'Duplicate');
    setValue('track-genre', '2');
    setValue('track-media-type', '1');
    setValue('track-duration', '3:45');
    await submit();

    expect(fixture.nativeElement.textContent).toContain('A track with the same name already exists in this album.');
  });

  it('accepts the largest unit price the backend accepts', async () => {
    setValue('track-name', 'New track');
    setValue('track-genre', '2');
    setValue('track-media-type', '1');
    setValue('track-duration', '3:45');
    setValue('track-unit-price', '99999999.99');
    await submit();

    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/tracks',
      body: expect.objectContaining({ unitPrice: 99999999.99 }),
    }));
  });

  it('rejects a unit price with more than 8 whole digits before submitting', async () => {
    setValue('track-name', 'New track');
    setValue('track-genre', '2');
    setValue('track-media-type', '1');
    setValue('track-duration', '3:45');
    setValue('track-unit-price', '100000000');
    (fixture.nativeElement.querySelector('#track-unit-price') as HTMLInputElement).dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await submit();

    expect(apiMock).not.toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: '/api/tracks' }));
    expect(fixture.nativeElement.textContent).toContain('Enter a non-negative price with at most 8 whole digits and 2 decimal places.');
  });

  it('shows the server unit price error next to the price field', async () => {
    apiMock.mockImplementation(({ url }: HttpRequest<unknown>) => {
      if (url === '/api/genres') {
        return { body: [{ genreId: 2, name: 'Rock' }] };
      }
      if (url === '/api/media-types') {
        return { body: [{ mediaTypeId: 1, name: 'MPEG audio file' }] };
      }
      return {
        status: 400,
        body: {
          detail: 'Validation failed',
          fieldErrors: { unitPrice: 'UNIT_PRICE_INVALID' },
        },
      };
    });

    setValue('track-name', 'New track');
    setValue('track-genre', '2');
    setValue('track-media-type', '1');
    setValue('track-duration', '3:45');
    await submit();

    expect(fixture.nativeElement.querySelector('.field-error').textContent).toContain('Enter a non-negative price with at most 8 whole digits and 2 decimal places.');
    expect(fixture.nativeElement.textContent).not.toContain('Validation failed');
  });

  it('updates an existing track and preserves its exact duration when unchanged', async () => {
    const updated = vi.fn();
    fixture.componentInstance.updated.subscribe(updated);
    fixture.componentRef.setInput('track', {
      trackId: 42,
      name: 'Old name',
      albumId: 7,
      albumTitle: 'Album',
      artistName: 'Artist',
      genreId: 2,
      genreName: 'Rock',
      mediaTypeId: 1,
      mediaTypeName: 'MPEG audio file',
      composer: 'Composer',
      milliseconds: 225500,
      unitPrice: 0.99,
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.trackForm().value()).toEqual({
      name: 'Old name',
      genreId: '2',
      mediaTypeId: '1',
      composer: 'Composer',
      duration: '3:45',
      unitPrice: 0.99,
    });

    setValue('track-name', 'Updated name');
    await submit();

    expect(apiMock).toHaveBeenCalledWith(expect.objectContaining({
      method: 'PUT',
      url: '/api/tracks/42',
      body: {
        name: 'Updated name',
        albumId: 7,
        genreId: 2,
        mediaTypeId: 1,
        composer: 'Composer',
        milliseconds: 225500,
        unitPrice: 0.99,
      },
    }));
    expect(updated).toHaveBeenCalledOnce();
  });
});
