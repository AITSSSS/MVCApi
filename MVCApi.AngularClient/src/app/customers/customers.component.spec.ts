import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, of } from 'rxjs';
import { CustomerDto, CustomerService } from 'src/api';
import { CustomersComponent } from './customers.component';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;
  let customerService: jasmine.SpyObj<CustomerService>;

  const customersMock: CustomerDto[] = [
    {
      id: 'customer-1',
      firstName: 'Jan',
      lastName: 'Kowalski',
      dateOfBirth: '2000-01-01T00:00:00'
    },
    {
      id: 'customer-2',
      firstName: 'Anna',
      lastName: 'Nowak',
      dateOfBirth: '1995-05-15T00:00:00'
    }
  ];

  beforeEach(async () => {
    customerService = jasmine.createSpyObj<CustomerService>('CustomerService', [
      'apiCustomerGetAllCustomersGet'
    ]);
    customerService.apiCustomerGetAllCustomersGet.and.returnValue(
      of(customersMock) as unknown as ReturnType<CustomerService['apiCustomerGetAllCustomersGet']>
    );

    await TestBed.configureTestingModule({
      declarations: [CustomersComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: CustomerService, useValue: customerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load customers when component is created', async () => {
    expect(customerService.apiCustomerGetAllCustomersGet).toHaveBeenCalledTimes(1);

    const result = await firstValueFrom(component.$customers);
    expect(result).toEqual(customersMock);
  });

  it('should render add customer link', () => {
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a.btn.btn-primary.ml-2'));
    const addLink = links[0].nativeElement as HTMLAnchorElement;

    expect(addLink.textContent?.trim()).toBe('Add customer');
    expect(addLink.getAttribute('href')).toContain('/customers/add');
  });

  it('should render customers data and edit links', () => {
    fixture.detectChanges();
    fixture.detectChanges();

    const customerRows = fixture.debugElement.queryAll(By.css('div.rounded.border.p-2'));
    const editLinks = fixture.debugElement.queryAll(By.css('div.rounded.border.p-2 a.btn.btn-primary.ml-2'));
    const content = fixture.nativeElement.textContent as string;

    expect(customerRows.length).toBe(customersMock.length);
    expect(editLinks.length).toBe(customersMock.length);
    expect(content).toContain('First name: Jan');
    expect(content).toContain('Last name: Kowalski');
    expect(content).toContain('First name: Anna');
    expect(content).toContain('Last name: Nowak');
    expect(editLinks[0].nativeElement.getAttribute('href')).toContain('/customers/edit/customer-1');
    expect(editLinks[1].nativeElement.getAttribute('href')).toContain('/customers/edit/customer-2');
  });
});

