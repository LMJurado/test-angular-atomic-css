import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
    selector: 'app-input', imports: [Icon], templateUrl: './input.html', changeDetection: ChangeDetectionStrategy.Eager,
 styleUrl: './input.css'
})
export class Input {
  type = input<'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'>('text');
  label = input('');
  placeholder = input('');
  value = input('');
  name = input('');
  id = input('');
  autocomplete = input('off');
  size = input<'sm' | 'md' | 'lg'>('md');
  variant = input<'default' | 'outline'>('default');
  disabled = input(false);
  readonly = input(false);
  required = input(false);
  error = input('');
  fullWidth = input(false);
  helperText = input('');
  helpText = input('');
  valueChange = output<string>();

  classes = computed(() => `input input--${this.size()} input--${this.variant()}${this.fullWidth() ? ' input--full' : ''}${this.error() ? ' input--error' : ''}`);

  onInput(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}