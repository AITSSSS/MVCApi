import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { ProductComponent } from './product.component';
import { of } from 'rxjs';

registerLocaleData(localePl, 'pl-PL')

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductComponent ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load base64 image when image URL starts with http', () => {
    component.product = {
      image: 'http://example.com/test.jpg'
    } as any;

    spyOn(component, 'getBase64ImageFromURL')
      .and.returnValue(of('fakebase64'));

    component.ngOnInit();

    expect(component.getBase64ImageFromURL)
      .toHaveBeenCalledWith('http://example.com/test.jpg');

    expect(component.base64Image)
      .toBe('data:image/jpg;base64,fakebase64');
  });

});