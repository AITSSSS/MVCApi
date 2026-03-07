import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import {registerLocaleData, getLocaleCurrencyCode } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import localePl from '@angular/common/locales/pl';
import { ProductsComponent } from './products.component';

registerLocaleData(localePl, 'pl-PL');

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      queryParams: of({ categoryId: '123'})
      }

    await TestBed.configureTestingModule({
      declarations: [ ProductsComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule.withRoutes([]) ],
      providers: [ { provide: ActivatedRoute, useValue: mockActivatedRoute } ]
      })
      .compileComponents();
    });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and set categoryId and fetch products', () => {
    spyOn((component as any), 'fetchProducts');

    component.ngOnInit();

    expect((component as any).categoryId)
      .toBe('123')
    expect((component as any).fetchProducts)
      .toHaveBeenCalled();
  });

  it('should call ngOnChanges without errors', () => {
    const changesObj: any = {
      prop1: new SimpleChange("1", "2", false),
    };

    expect(() => component.ngOnChanges(changesObj))
      .not.toThrow();
  });

  it('should page index change', () => {
    spyOn((component as any), 'fetchProducts');
    
    component.pageIndexChange();

    expect((component as any).fetchProducts)
      .toHaveBeenCalled();
  });

  it('should total pages change', () => {
    spyOn((component as any), 'fetchProducts');
    
    component.totalPagesChange();

    expect((component as any).fetchProducts)
      .toHaveBeenCalled();
  });

  it('should page size change', () => {
    spyOn((component as any), 'fetchProducts');
    
    component.pageSizeChange();

    expect((component as any).fetchProducts)
      .toHaveBeenCalled();
  });

  it('product should be added to cart', fakeAsync(() => {
    const fakeCart = { id: 'cart123' };

    spyOn((component as any).shoppingCartService, 'getOrCreateCart')
      .and.returnValue(Promise.resolve(fakeCart));
    spyOn((component as any).cartService, 'apiCartAddProductToCartPut')
      .and.returnValue(of('123'));
    spyOn(console, 'log');

    component.addToCart('1');
    tick();

    expect((component as any).shoppingCartService.getOrCreateCart)
      .toHaveBeenCalled();
    expect((component as any).cartService.apiCartAddProductToCartPut)
      .toHaveBeenCalledOnceWith({ cartId: fakeCart?.id, productId: '1', count: 1 });
    expect(console.log)
      .toHaveBeenCalledOnceWith('Added');
  }));

  it('product does not get added to card because of no id', () => {
    spyOn((component as any).shoppingCartService, 'getOrCreateCart');
    spyOn((component as any).cartService, 'apiCartAddProductToCartPut');
    
    component.addToCart(undefined);

    expect((component as any).shoppingCartService.getOrCreateCart).not.toHaveBeenCalled();
    expect((component as any).cartService.apiCartAddProductToCartPut).not.toHaveBeenCalled();
  });

  it('product should be added to cart', fakeAsync(() => {
    const fakeCart = { id: 'cart123' };

    spyOn((component as any).shoppingCartService, 'getOrCreateCart')
      .and.returnValue(Promise.resolve(fakeCart));
    spyOn((component as any).cartService, 'apiCartAddProductToCartPut')
      .and.returnValue(throwError(() => new Error('Fake error')));
    spyOn(console, 'log');

    component.addToCart('1');
    tick();

    expect((component as any).shoppingCartService.getOrCreateCart)
      .toHaveBeenCalled();
    expect((component as any).cartService.apiCartAddProductToCartPut)
      .toHaveBeenCalledOnceWith({ cartId: fakeCart?.id, productId: '1', count: 1 });
    expect(console.log)
      .toHaveBeenCalledOnceWith(jasmine.any(Error));
  }));

  it('should fetch products with a categoryId', () => {
    const fakeCurrCode = getLocaleCurrencyCode(navigator.language) ?? 'PLN';
    component.categoryId = '123';

    spyOn((component as any).productService, 'apiProductGetPaginatedProductsByCategoryGet')
      .and.returnValue(of({}));
    spyOn(console, 'log');

    (component as any).fetchProducts();

    expect((component as any).productService.apiProductGetPaginatedProductsByCategoryGet)
      .toHaveBeenCalledOnceWith(jasmine.any(Number), jasmine.any(Number), fakeCurrCode, component.categoryId);
    expect(console.log)
      .toHaveBeenCalled();  
  });

  it('should fetch products without categoryId', () => {
    const fakeCurrCode = getLocaleCurrencyCode(navigator.language) ?? 'PLN';
    component.categoryId = null;

    spyOn((component as any).productService, 'apiProductGetPaginatedProductsGet')
      .and.returnValue(of({}));
    spyOn(console, 'log');

    (component as any).fetchProducts();

    expect((component as any).productService.apiProductGetPaginatedProductsGet)
      .toHaveBeenCalledOnceWith(jasmine.any(Number), jasmine.any(Number), fakeCurrCode);
    expect(console.log)
      .toHaveBeenCalled();  
  });
});