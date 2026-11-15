import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TracksService, SortType, SortDirection } from './tracks.service';

@Component({
  selector: 'app-tracks',
  styleUrls: ['./tracks.css'],
  templateUrl: './tracks.html'
})
export class Tracks {
  private readonly tracksService = inject(TracksService);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  constructor() {
    this.syncSort();
    effect(() => this.syncSort());
  }

  private syncSort(): void {
    const sp = this.routeParams().get('sort');
    const [sort = 'name', direction = 'asc'] = (sp ? sp.split(',') : []);
    this.tracksService.setSort(sort as SortType, direction as SortDirection);
  }

  readonly pageResource = this.tracksService.pageData;

  convertToMinutes(milliseconds: number | null): string {
    if (milliseconds === null) return '';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  previousPage(): void {
    this.tracksService.previousPage();
  }

  nextPage(): void {
    this.tracksService.nextPage();
  }

  firstPage(): void {
    this.tracksService.setCurrentPage(0);
  }

  lastPage(): void {
    this.tracksService.setCurrentPage((this.pageResource.value()?.totalPages ?? 1) - 1);
  }
}
