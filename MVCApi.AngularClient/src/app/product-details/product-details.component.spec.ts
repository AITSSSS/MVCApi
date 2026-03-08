import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getLocaleCurrencyCode, registerLocaleData } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import localePl from '@angular/common/locales/pl';
import { of } from 'rxjs';
import { ProductDetailsComponent } from './product-details.component';
import { ProductDto } from 'src/api';

registerLocaleData(localePl, 'pl-PL');

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => '123'  // <- tu ustawiasz testowy productId
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ ProductDetailsComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule.withRoutes([]) ],
      providers: [ { provide: ActivatedRoute, useValue: mockActivatedRoute } ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should on init set product id and fetch product', () => {
    spyOn((component as any), 'fetchProducts');

    component.ngOnInit();

    expect(component.productId).toBe('123');
    expect((component as any).fetchProducts)
      .toHaveBeenCalled();
  });

  it('should fetch a single productDto', () => {
    const fakeProductDto = {
      id: '123'
    } as any;
    const fakeObservable = of(fakeProductDto);
    
    spyOn((component as any).productService, 'apiProductGetProductByIdIdGet')
      .and.returnValue(fakeObservable);

    (component as any).fetchProducts();

    expect((component as any).productService.apiProductGetProductByIdIdGet)
      .toHaveBeenCalledOnceWith(component.productId, getLocaleCurrencyCode(navigator.language) ?? 'PLN');

    expect(component.productRes)
      .toBe(fakeObservable);
      
    expect(component.product)
      .toBe(fakeProductDto);
    expect(component.productHTMLCode)
      .toBeDefined();
  });

  it('should generate html code with product.image starting with http', () => {
    const fakeProduct = {
      image: 'http://example.com/test.jpg'
    } as ProductDto;
    component.product = fakeProduct;

    const htmlCode = (component as any).generateHTMLCode();

    expect(htmlCode)
      .toContain(fakeProduct.image);
  });

  it('should generate html code with product.image being local', () => {
    const fakeProduct = {
      image: '/img/test.jpg'
    } as ProductDto;
    component.product = fakeProduct;

    const htmlCode = (component as any).generateHTMLCode();

    expect(htmlCode)
      .toContain('http://localhost:4200' + '/assets' + fakeProduct.image);
  });

  it('copyMessage should work', () => {
    const realTextarea = document.createElement('textarea');

    spyOn(document, 'createElement')
      .and.returnValue(realTextarea);
    spyOn(document, 'execCommand');

    const focusSpy = spyOn(realTextarea, 'focus')
      .and.callThrough();
    const selectSpy = spyOn(realTextarea, 'select')
      .and.callThrough();

    component.copyMessage();

    expect(document.createElement)
      .toHaveBeenCalledOnceWith('textarea');
    expect(focusSpy)
      .toHaveBeenCalled();
    expect(selectSpy)
      .toHaveBeenCalled();
    expect(document.execCommand)
      .toHaveBeenCalledOnceWith('copy');
  });

});
