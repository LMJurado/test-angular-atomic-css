import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({ selector: 'app-badge', standalone: true, templateUrl: './badge.html', changeDetection: ChangeDetectionStrategy.Eager,
 styleUrl: './badge.css' })
export class Badge {
  variant = input<'primary' | 'secondary' | 'accent' | 'mint' | 'neutral' | 'outline'>('primary');
  size = input<'sm' | 'md'>('md');

  classes = computed(() => `badge badge--${this.variant()} badge--${this.size()}`);
}