import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductPrice } from './product-price';

describe('ProductPrice', () => {
  let fixture: ComponentFixture<ProductPrice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPrice],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPrice);
    fixture.componentRef.setInput('presentationPrice', 57000);
    fixture.componentRef.setInput('unitPrice', 4750);
    await fixture.whenStable();
  });

  it('formats presentation and unit prices with Colombian thousands separators', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('COP 57.000');
    expect(text).toContain('COP 4.750 / unidad');
  });
});
