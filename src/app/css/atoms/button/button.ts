import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'mint' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';
type IconPosition = 'start' | 'end';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './button.css'
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<ButtonType>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  icon = input<string | null>(null);
  iconPosition = input<IconPosition>('start');
  iconType = input<'solid' | 'brands'>('solid');
  iconOnly = input(false);

  buttonClasses = computed(() => [
    `btn--${this.variant()}`,
    `btn--${this.size()}`,
    this.fullWidth() ? 'btn--full' : '',
    this.iconOnly() ? 'btn--icon-only' : ''
  ].filter(Boolean).join(' '));

  isDisabled = computed(() => this.disabled() || this.loading());
  iconClasses = computed(() => `fa-${this.iconType()} ${this.icon()}`);
  classes = computed(() => `btn btn--${this.variant()} btn--${this.size()}${this.fullWidth() ? ' btn--full' : ''}${this.iconOnly() ? ' btn--icon-only' : ''}`);

}
