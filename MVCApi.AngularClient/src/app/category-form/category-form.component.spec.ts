import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { CategoryDto, CategoryService } from 'src/api';

import { CategoryFormComponent } from './category-form.component';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    categoryServiceMock = jasmine.createSpyObj<CategoryService>('CategoryService', [
      'apiCategoryGetAllCategoriesGet',
      'apiCategoryCreateCategoryPost',
      'apiCategoryCreateSubcategoryPost'
    ]);

    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    categoryServiceMock.apiCategoryGetAllCategoriesGet.and.returnValue(
      of(new HttpResponse<CategoryDto[]>({ body: [] }))
    );
    categoryServiceMock.apiCategoryCreateCategoryPost.and.returnValue(
      of(new HttpResponse<string>({ body: 'ok' }))
    );
    categoryServiceMock.apiCategoryCreateSubcategoryPost.and.returnValue(
      of(new HttpResponse<string>({ body: 'ok' }))
    );

    await TestBed.configureTestingModule({
      declarations: [CategoryFormComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(categoryServiceMock.apiCategoryGetAllCategoriesGet).toHaveBeenCalled();
  });

  it('should expose form controls via getter f', () => {
    expect(component.f['name']).toBe(component.form.controls['name']);
    expect(component.f['parent']).toBe(component.form.controls['parent']);
    expect(component.f['isChild']).toBe(component.form.controls['isChild']);
  });

  it('should enable subcategory when checkbox checked', () => {
    component.toggleEditable({ target: { checked: true } });

    expect(component.isSubCategory).toBeTrue();
  });

  it('should disable subcategory when checkbox unchecked', () => {
    component.isSubCategory = true;

    component.toggleEditable({ target: { checked: false } });

    expect(component.isSubCategory).toBeFalse();
  });

  it('should NOT submit when form is invalid', () => {
    component.form.patchValue({
      name: '',
      parent: '',
      isChild: false
    });

    component.submit();

    expect(categoryServiceMock.apiCategoryCreateCategoryPost).not.toHaveBeenCalled();
    expect(categoryServiceMock.apiCategoryCreateSubcategoryPost).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should create category when isChild = false', fakeAsync(() => {
    component.form.patchValue({
      name: 'Test Category',
      parent: '',
      isChild: false
    });

    component.submit();

    expect(categoryServiceMock.apiCategoryCreateCategoryPost).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'Test Category',
        isChild: false
      })
    );
    expect(categoryServiceMock.apiCategoryCreateSubcategoryPost).not.toHaveBeenCalled();
    expect(component.saveStatus).toBe('saved');

    tick(701);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/', 'categories']);
  }));

  it('should create subcategory when isChild = true', fakeAsync(() => {
    component.form.patchValue({
      name: 'Child',
      parent: '1',
      isChild: true
    });

    component.submit();

    expect(categoryServiceMock.apiCategoryCreateSubcategoryPost).toHaveBeenCalledWith({
      name: 'Child',
      parentId: '1'
    });
    expect(categoryServiceMock.apiCategoryCreateCategoryPost).not.toHaveBeenCalled();
    expect(component.saveStatus).toBe('saved');

    tick(701);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/', 'categories']);
  }));
});
