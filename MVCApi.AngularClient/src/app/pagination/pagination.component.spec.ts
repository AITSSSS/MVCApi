import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaginationComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reflect provided pageSize in dropdown', async () => {
    component.pageSize = 10;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('#pageSizeSelect'))
      .nativeElement as HTMLSelectElement;

    expect(select.value).toBe('10');
  });

  it('should emit selected pageSize from dropdown changes', () => {
    spyOn(component.pageSizeChange, 'emit');

    component.onPageSizeChanged({ value: 25 });

    expect(component.pageSize).toBe(25);
    expect(component.pageSizeChange.emit).toHaveBeenCalledOnceWith(25);
  });
});
