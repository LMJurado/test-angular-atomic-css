import { Component, input, output } from '@angular/core';
import { Input } from '../../atoms/input/input';
import { Button } from '../../atoms/button/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [Input, Button],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar {
  placeholder = input('Buscar productos...');
  buttonLabel = input('Buscar');
  fullWidth = input(false);
  value = input('');
  search = output<string>();

  onSearch() {
    const query = this.value().trim();
    if (query) this.search.emit(query);
  }

  onValueChange(value: string) {
    this.search.emit(value.trim());
  }
}
