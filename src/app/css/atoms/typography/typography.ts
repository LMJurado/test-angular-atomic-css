import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({ selector: 'app-typography', standalone: true, templateUrl: './typography.html', changeDetection: ChangeDetectionStrategy.Eager,
 styleUrl: './typography.css' })
export class Typography {
  variant = input<'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption'>('body');
  weight = input<'normal' | 'medium' | 'semibold' | 'bold'>('normal');
  color = input<'primary' | 'accent' | 'secondary' | 'mint' | 'text' | 'muted'>('text');
  align = input<'left' | 'center' | 'right'>('left');

  classes = computed(() => `typography typography-${this.variant()} weight-${this.weight()} color-${this.color()} text-${this.align()}`);
}