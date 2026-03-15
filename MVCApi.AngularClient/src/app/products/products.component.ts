import { getLocaleCurrencyCode } from '@angular/common';
import { Component, OnInit, SimpleChange, ViewChild, ElementRef  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import {
  CartService,
  CategoryDto,
  CategoryService,
  ProductDto,
  ProductDtoIPaginatedList,
  ProductService,
} from 'src/api';
import { ShoppingCartService } from '../shopping-cart.service';
import { jsPDF } from 'jspdf';
import { UiFeedbackService } from '../ui-feedback.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  products: Observable<ProductDtoIPaginatedList> | null = null;
  categories: Observable<CategoryDto[]> =
    this.categoryService.apiCategoryGetRootCategoriesGet();

  categoryId: string | null = null;
  pdfProducts: ProductDtoIPaginatedList | null = null;

  pageIndex: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly cartService: CartService,
    private readonly shoppingCartService: ShoppingCartService,
    private readonly route: ActivatedRoute,
    private readonly uiFeedback: UiFeedbackService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.categoryId = params['categoryId'];
      this.fetchProducts();
    });
  }

  ngOnChanges(changes: SimpleChange) {

  }

  pageIndexChange() {
    this.fetchProducts()
  }

  totalPagesChange() {
    this.fetchProducts()
  }

  pageSizeChange() {
    this.fetchProducts()
  }

  addToCart(id: string | undefined) {
    if (!id) return;

    this.shoppingCartService.getOrCreateCart().then((cart) => {
      this.cartService
        .apiCartAddProductToCartPut({
          cartId: cart?.id,
          productId: id,
          count: 1,
        })
        .subscribe({
          next: () => this.uiFeedback.success('Product added to cart.'),
          error: () => this.uiFeedback.error('Could not add product to cart.'),
        });
    });
  }

  private fetchProducts() {
    if (this.categoryId) {
      this.products =
        this.productService.apiProductGetPaginatedProductsByCategoryGet(
          this.pageIndex,
          this.pageSize,
          getLocaleCurrencyCode(navigator.language) ?? 'PLN',
          this.categoryId
        );
    } else {
      this.products = this.productService.apiProductGetPaginatedProductsGet(
        this.pageIndex,
        this.pageSize,
        getLocaleCurrencyCode(navigator.language) ?? 'PLN'
      );
    }

    this.products.subscribe({
      next: (res) => {
        this.pageIndex = res.pageIndex ?? 1;
        this.pageSize = res.pageSize ?? 10;
        this.totalPages = res.totalPages ?? 1;
        this.hasNextPage = res.hasNextPage ?? false;
        this.hasPreviousPage = res.hasPreviousPage ?? false;
      },
      error: () => this.uiFeedback.error('Could not load products.'),
    });
  }


}
