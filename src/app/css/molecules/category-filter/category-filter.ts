import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  templateUrl: './category-filter.html',
  styleUrl: './category-filter.css'
})
export class CategoryFilter {
  categories = input.required<readonly { id: number; name: string }[]>();
  selectedCategory = input<number | null>(null);
  categoryChange = output<number | null>();

  selectCategory(id: number | null) {
    this.categoryChange.emit(id);
  }
}