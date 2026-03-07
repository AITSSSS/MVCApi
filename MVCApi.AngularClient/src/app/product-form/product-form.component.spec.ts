import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { of, throwError } from 'rxjs';
import localePl from '@angular/common/locales/pl';
import { ProductFormComponent } from './product-form.component';

registerLocaleData(localePl, 'pl-PL');

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => '123'  // <- tu ustawiasz testowy productId
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ ProductFormComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule.withRoutes([]) ],
      providers: [ { provide: ActivatedRoute, useValue: mockActivatedRoute } ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not throw when initializing', () => {
    expect(() => component.ngOnInit())
      .not.toThrow();
  });

  it('should correctly submit product', () => {
    component.form = {
      value: {
        name: 'fakeP',
        description: 'aaa',
        image: 'http://example.com/test.jpg',
        price: '1',
        categories: '123'
      },
      valid: true,
      get: (field: string) => ({ value: 123 })
    } as any;
    
    spyOn((component as any).productService, 'apiProductCreateProductPost')
      .and.returnValue(of('fakeObs'));
    spyOn((component as any).categoryService, 'apiCategoryAddProductToCategoryPut')
      .and.returnValue(of('fakeObs2'));
    spyOn((component as any).router, 'navigate');

    component.submit();

    expect((component as any).productService.apiProductCreateProductPost)
      .toHaveBeenCalledOnceWith(component.form.value);
    
    expect((component as any).categoryService.apiCategoryAddProductToCategoryPut)
      .toHaveBeenCalledOnceWith({ productId: 'fakeObs', categoryId: '123'});
    
    expect((component as any).router.navigate)
      .toHaveBeenCalledOnceWith(['/', 'products']);
  });

  it('should throw error when submiting product', () => {
    component.form = {
      value: {
        name: 'fakeP',
        description: 'aaa',
        image: 'http://example.com/test.jpg',
        price: '1',
        categories: '123'
      },
      valid: true
    } as any;
    
    spyOn((component as any).productService, 'apiProductCreateProductPost')
      .and.returnValue(throwError(() => new Error('Fake error')));
    spyOn(console, 'log');

    component.submit();

    expect((component as any).productService.apiProductCreateProductPost)
      .toHaveBeenCalledOnceWith(component.form.value);
    
    expect(console.log)
      .toHaveBeenCalledOnceWith(jasmine.any(Error));
  });
});
