import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, of } from 'rxjs';
import { CategoryDto, CategoryService } from 'src/api';
import { CategoriesComponent } from './categories.component';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let categoryService: jasmine.SpyObj<CategoryService>;

  const rootCategoriesMock: CategoryDto[] = [
    { id: '1', name: 'Root 1' },
    { id: '2', name: 'Root 2' }
  ];

  beforeEach(async () => {
    categoryService = jasmine.createSpyObj<CategoryService>('CategoryService', [
      'apiCategoryGetRootCategoriesGet'
    ]);
    categoryService.apiCategoryGetRootCategoriesGet.and.returnValue(
      of(rootCategoriesMock) as unknown as ReturnType<CategoryService['apiCategoryGetRootCategoriesGet']>
    );

    await TestBed.configureTestingModule({
      declarations: [CategoriesComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: CategoryService, useValue: categoryService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load root categories when component is created', async () => {
    expect(categoryService.apiCategoryGetRootCategoriesGet).toHaveBeenCalledTimes(1);

    const result = await firstValueFrom(component.rootCategories);
    expect(result).toEqual(rootCategoriesMock);
  });

  it('should render add new category link', () => {
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('a.btn.btn-primary'));

    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent.trim()).toBe('Add new category');
  });

  it('should render one category tree per root category', () => {
    fixture.detectChanges();
    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css('app-category-tree'));

    expect(items.length).toBe(rootCategoriesMock.length);
  });
});
