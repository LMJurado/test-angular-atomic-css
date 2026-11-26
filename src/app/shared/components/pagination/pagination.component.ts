import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages > 1) {
      <nav class="modern-pagination" aria-label="Paginación">
        <button type="button" class="btn btn--outline btn--sm" [disabled]="currentPage <= 1"
                (click)="selectPage(currentPage - 1)">Anterior</button>
        <span aria-live="polite">Página {{ currentPage }} de {{ totalPages }}</span>
        <button type="button" class="btn btn--outline btn--sm" [disabled]="currentPage >= totalPages"
                (click)="selectPage(currentPage + 1)">Siguiente</button>
      </nav>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 6;
  @Input() totalItems = 0;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / Math.max(1, this.pageSize));
  }

  selectPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
