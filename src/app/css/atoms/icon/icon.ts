import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({ selector: 'app-icon', standalone: true, templateUrl: './icon.html', changeDetection: ChangeDetectionStrategy.Eager,
 styleUrl: './icon.css' })
export class Icon {
  name = input.required<string>();
  type = input<'solid' | 'brands'>('solid');
  size = input<'sm' | 'md' | 'lg'>('md');
  ariaLabel = input<string | null>(null);

  iconClasses = computed(() => `fa-${this.type()} ${this.name()} icon-${this.size()}`);
}