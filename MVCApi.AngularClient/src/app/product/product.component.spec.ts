import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { ProductComponent } from './product.component';
import { of } from 'rxjs';
import { ProductDto } from 'src/api';

registerLocaleData(localePl, 'pl-PL');

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set base64 image when imageURL starts with http', () => {
    component.product = {
      image: 'http://example.com/test.jpg'
    } as ProductDto;

    spyOn(component, 'getBase64ImageFromURL')
      .and.returnValue(of('fakebase64'));

    component.ngOnInit();

    expect(component.getBase64ImageFromURL)
      .toHaveBeenCalledWith('http://example.com/test.jpg');

    expect(component.base64Image)
      .toBe('data:image/jpg;base64,fakebase64');
  });

  it('should set base64 image with /assets prefix imageURL does not start with http', () => {
    component.product = {
      image:'/img/test.jpg'
    } as ProductDto;

    spyOn(component, 'getBase64ImageFromURL')
      .and.returnValue(of('fakebase64'));

    component.ngOnInit();

    expect(component.getBase64ImageFromURL)
      .toHaveBeenCalledWith('/assets/img/test.jpg');

    expect(component.base64Image)
      .toBe('data:image/jpg;base64,fakebase64');
  });

  it('should load image from http URL if image is not complete and return base64', () => {
    const fakeImg = {
      complete: false
    } as HTMLImageElement;

    spyOn(window as any, 'Image')
      .and.returnValue(fakeImg);

    spyOn(component, 'getBase64Image')
      .and.returnValue('fakebase64');

    const obs = component.getBase64ImageFromURL('http://example.com/test.jpg');

    let nextCalled = false;
    let errorCalled = false;

    obs.subscribe({
      next: (data: string) => {
        nextCalled = true;
        expect(component.getBase64Image).toHaveBeenCalledOnceWith(fakeImg);
        expect(data).toBe('fakebase64');
      },
      error: () => {
        errorCalled = true;
      }
    });

    (fakeImg.onload as any)();
    expect(window.Image).toHaveBeenCalled();
    expect(nextCalled).toBeTrue();
    expect(errorCalled).toBeFalse();
  });

  it('should try to load image from http URL and throw error', () => {
    const fakeImg = {
      complete: false
    } as HTMLImageElement;

    spyOn(window as any, 'Image')
      .and.returnValue(fakeImg);

    spyOn(component, 'getBase64Image')
      .and.returnValue('fakebase64');

    const obs = component.getBase64ImageFromURL('http://example.com/test.jpg');

    let nextCalled = false;
    let errorCalled = false;

    obs.subscribe({
      next: (data: string) => {
        nextCalled = true;
      },
      error: () => {
        errorCalled = true;
      }
    });

    (fakeImg.onerror as any)(new Error('Failure'));

    expect(window.Image).toHaveBeenCalled();
    expect(nextCalled).toBeFalse();
    expect(errorCalled).toBeTrue();
  });

  it('should return base64 if image is complete', () => {
    const fakeImg = {
      complete: true
    } as HTMLImageElement;

    spyOn(window as any, 'Image')
      .and.returnValue(fakeImg);

    spyOn(component, 'getBase64Image')
      .and.returnValue('fakebase64');

    const obs = component.getBase64ImageFromURL('http://example.com/test.jpg');

    let nextCalled = false;
    let errorCalled = false;

    obs.subscribe({
      next: (data: string) => {
        nextCalled = true;
        expect(component.getBase64Image).toHaveBeenCalledOnceWith(fakeImg);
        expect(data).toBe('fakebase64');
      },
      error: () => {
        errorCalled = true;
      }
    });

    expect(window.Image).toHaveBeenCalled();
    expect(nextCalled).toBeTrue();
    expect(errorCalled).toBeFalse();
  });

  it('should convert html image to base64', () => {
    const img = {
      width: 100,
      height: 100
    } as HTMLImageElement;

    const drawImageSpy = jasmine.createSpy('drawImage');
    const fakeCtx = {
      drawImage: drawImageSpy
    }

    const getContextSpy = jasmine.createSpy('getContext')
      .and.returnValue(fakeCtx);
    const toDataURLSpy = jasmine.createSpy('toDataURL')
      .and.returnValue('data:image/png;base64,fakebase64');
    
    const fakeCanvas = {
      getContext: getContextSpy,
      toDataURL: toDataURLSpy
    };

    spyOn(document, 'createElement')
      .and.returnValue(fakeCanvas as any);

    const returnVal = component.getBase64Image(img);

    expect(fakeCanvas.getContext)
      .toHaveBeenCalledWith('2d');

    expect(fakeCtx.drawImage)
      .toHaveBeenCalledWith(img, 0, 0, jasmine.any(Number), jasmine.any(Number));

    expect(fakeCanvas.toDataURL)
      .toHaveBeenCalledWith('image/png');

    expect(document.createElement)
      .toHaveBeenCalledWith('canvas');

    expect(returnVal).toBe('fakebase64');
  });

  it('should return correct width', () => {
    const width = (component as any).getWidth(100, 2);
    expect(width).toBe(Math.round((100) / Math.sqrt((1) / (Math.pow(2, 2) + 1))));
  });

  it('should return correct height', () => {
    const height = (component as any).getHeight(100, 2);
    expect(height).toBe(Math.round((100) / Math.sqrt((Math.pow(2, 2) + 1))));
  });

});