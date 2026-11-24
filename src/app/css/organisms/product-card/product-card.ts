import { Component, inject, input } from '@angular/core';
import { Badge } from '../../atoms/badge/badge';
import { Button } from '../../atoms/button/button';
import { ProductController } from '../../controllers/ProductController';
import { Product } from '../../models/Product';
import { ProductPrice } from '../../molecules/product-price/product-price';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [Badge, Button, ProductPrice],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  private readonly productController = inject(ProductController);

  product = input.required<Product>();

  orderOnWhatsApp(): void {
    const orderUrl = this.productController.getWhatsAppOrderUrl(this.product(), window.location.origin);
    window.open(orderUrl, '_blank', 'noopener,noreferrer');
  }
}
