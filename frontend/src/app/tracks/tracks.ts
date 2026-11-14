import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TracksService } from './tracks.service';
import { AsyncPipe } from '@angular/common';
import { switchMap } from 'rxjs';

@Component({
  imports: [AsyncPipe],
  selector: 'app-tracks',
  template: `
@if (page$ | async; as page) {
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Album</th>
        <th>Genre</th>
        <th>Media type</th>
      </tr>
    </thead>
    <tbody>
      @for (track of page.content; track track.trackId) {
        <tr>
          <td>{{ track.name }}</td>
          <td>{{ track.albumTitle }}</td>
          <td>{{ track.genreName }}</td>
          <td>{{ track.mediaTypeName }}</td>
        </tr>
      }
    </tbody>
  </table>
}
`
})
export class Tracks {
  private readonly tracksService = inject(TracksService);
  private readonly route = inject(ActivatedRoute);

  static readonly pageSize = 20;
  currentPage = 0;
  // readonly page$ = this.tracksService.getPage(this.currentPage, Tracks.pageSize);
  readonly page$ = this.route.queryParamMap.pipe(
    switchMap((params) =>
      this.tracksService.getPage(
        this.currentPage,
        Tracks.pageSize,
        params.get('sort') ?? undefined,
      ),
    ),
  );
}
