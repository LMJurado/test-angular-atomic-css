import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-product-price',
  standalone: true,
  templateUrl: './product-price.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-price.css'
})
export class ProductPrice {
  private readonly numberFormatter = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0
  });

  presentationPrice = input.required<number>();
  unitPrice = input<number | null>(null);
  quantity = input<number | null>(null);

  formatPrice(price: number): string {
    return this.numberFormatter.format(price);
  }
}