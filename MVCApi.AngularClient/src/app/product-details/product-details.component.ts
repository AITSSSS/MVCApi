import { getLocaleCurrencyCode } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductDto, ProductService } from 'src/api';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  productId: string = "";
  productRes: Observable<ProductDto> | null = null;
  product: ProductDto | null = null;
  currency: string = getLocaleCurrencyCode(navigator.language) ?? "PLN";
  productHTMLCode : string = "";

  constructor(
    private readonly productService: ProductService,
    private readonly route: ActivatedRoute,
    private readonly uiFeedback: UiFeedbackService,
  ) { }

  ngOnInit(): void {
    this.productId = <string>this.route.snapshot.paramMap.get('productId')?.toString();
    this.fetchProducts();
  }

  private fetchProducts(): void {
    this.productRes = this.productService.apiProductGetProductByIdIdGet(
      this.productId,
      getLocaleCurrencyCode(navigator.language) ?? 'PLN'
    )
    this.productRes.subscribe({
      next: (res) => {
        this.product = res;
        this.productHTMLCode = this.generateHTMLCode();
      },
      error: () => this.uiFeedback.error('Could not load product details.'),
    })
  }

  private generateHTMLCode(): string {
    let imageURL : string = "";
      if(this.product?.image?.startsWith('http')){
        imageURL = this.product.image;
      }
      else {
        imageURL = 'http://localhost:4200' + '/assets' + this.product?.image
      }

    return `
      <div>
        <div class="col-md-4">
          <img
            src="${imageURL}"
            alt="${this.product?.name + '_image' }"
            class="img-fluid"
          />
        </div>
        <div class="col-md-6">
          <h4>${this.product?.name}</h4>
          <div>${this.product?.description}</div>
        </div>
      </div>`
  }

  copyMessage(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.productHTMLCode;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.uiFeedback.success('Product HTML copied to clipboard.');
  }

}
