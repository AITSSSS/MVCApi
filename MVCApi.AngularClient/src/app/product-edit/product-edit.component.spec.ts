import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { getLocaleCurrencyCode, registerLocaleData } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import localePl from '@angular/common/locales/pl';
import { Observable, of } from 'rxjs';
import { ProductEditComponent } from './product-edit.component';

registerLocaleData(localePl, 'pl-PL');

describe('ProductEditComponent', () => {
  let component: ProductEditComponent;
  let fixture: ComponentFixture<ProductEditComponent>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => '123'  // <- tu ustawiasz testowy productId
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ ProductEditComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule.withRoutes([]) ],
      providers: [ { provide: ActivatedRoute, useValue: mockActivatedRoute } ] 
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should on init set product id and fetch product', () => {
    spyOn((component as any), 'fetchProducts');

    component.ngOnInit();

    expect(component.productId)
      .toBe('123');
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
    spyOn(component.form, 'patchValue')
      .and.callThrough();

    (component as any).fetchProducts();

    expect((component as any).productService.apiProductGetProductByIdIdGet)
      .toHaveBeenCalledOnceWith(component.productId, getLocaleCurrencyCode(navigator.language) ?? 'PLN');

    expect(component.product)
      .toBe(fakeObservable);
      
    expect(component.form.patchValue)
        .toHaveBeenCalledTimes(3);
  });
});
