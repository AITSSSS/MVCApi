import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CategoryDto } from 'src/api';
import { CategoryTreeComponent } from './category-tree.component';

describe('CategoryTreeComponent', () => {
  let component: CategoryTreeComponent;
  let fixture: ComponentFixture<CategoryTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryTreeComponent],
      imports: [RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryTreeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render category item when category is undefined', () => {
    component.category = undefined;

    fixture.detectChanges();

    const item = fixture.debugElement.query(By.css('li.list-group-item'));
    expect(item).toBeNull();
  });

  it('should render category name', () => {
    component.category = {
      id: 'root',
      name: 'Root category',
      children: []
    } as CategoryDto;

    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('a.category-tree-element'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent.trim()).toBe('Root category');
  });

  it('should render products link with categoryId query param', () => {
    component.category = {
      id: 'root-1',
      name: 'Root category',
      children: []
    } as CategoryDto;

    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.debugElement.query(
      By.css('a.category-tree-element')
    ).nativeElement;

    expect(link.getAttribute('href')).toContain('/products');
    expect(link.getAttribute('href')).toContain('categoryId=root-1');
  });

  it('should render nested child categories recursively', () => {
    component.category = {
      id: 'root',
      name: 'Root',
      children: [
        {
          id: 'child-1',
          name: 'Child 1',
          children: []
        },
        {
          id: 'child-2',
          name: 'Child 2',
          children: [
            {
              id: 'grandchild-1',
              name: 'Grandchild 1',
              children: []
            } as CategoryDto
          ]
        }
      ]
    } as CategoryDto;

    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a.category-tree-element'));
    const text = links.map(x => x.nativeElement.textContent.trim());

    expect(links.length).toBe(4);
    expect(text).toEqual(['Root', 'Child 1', 'Child 2', 'Grandchild 1']);
  });
});

