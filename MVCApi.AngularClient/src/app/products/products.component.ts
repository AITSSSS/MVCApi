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
import { UiFeedbackService } from '../ui-feedback.service';

interface ProductsPaginationSettings {
  pageNumber: number;
  pageSize: number;
}

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

  private readonly paginationSessionKey = 'productsPaginationSettings';

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
    this.loadPaginationSettings();

    this.route.queryParams.subscribe((params) => {
      this.categoryId = params['categoryId'];
      this.fetchProducts();
    });
  }

  ngOnChanges(changes: SimpleChange) {

  }

  pageIndexChange(pageIndex?: number) {
    if (typeof pageIndex === 'number' && pageIndex > 0) {
      this.pageIndex = pageIndex;
    }
    this.savePaginationSettings();
    this.fetchProducts()
  }

  totalPagesChange() {
    this.fetchProducts()
  }

  pageSizeChange(pageSize?: number) {
    if (typeof pageSize === 'number' && pageSize > 0) {
      this.pageSize = pageSize;
    }
    this.pageIndex = 1;
    this.savePaginationSettings();
    this.fetchProducts()
  }

  addToCart(id: string | undefined, count: string) {
    if (!id) return;

    this.shoppingCartService.getOrCreateCart().then((cart) => {
      this.cartService
        .apiCartAddProductToCartPut({
          cartId: cart?.id,
          productId: id,
          count: parseInt(count),
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
        this.savePaginationSettings();
      },
      error: () => this.uiFeedback.error('Could not load products.'),
    });
  }

  private loadPaginationSettings(): void {
    const stored = sessionStorage.getItem(this.paginationSessionKey);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<ProductsPaginationSettings>;
      if (typeof parsed.pageNumber === 'number' && parsed.pageNumber > 0) {
        this.pageIndex = parsed.pageNumber;
      }
      if (typeof parsed.pageSize === 'number' && parsed.pageSize > 0) {
        this.pageSize = parsed.pageSize;
      }
    } catch {
      sessionStorage.removeItem(this.paginationSessionKey);
    }
  }

  private savePaginationSettings(): void {
    const settings: ProductsPaginationSettings = {
      pageNumber: this.pageIndex,
      pageSize: this.pageSize,
    };

    sessionStorage.setItem(this.paginationSessionKey, JSON.stringify(settings));
  }


}
