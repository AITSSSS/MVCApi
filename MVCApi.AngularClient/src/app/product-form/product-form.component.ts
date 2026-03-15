import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AddProductToCategory, CategoryDto, CategoryService, CreateProduct, ProductService } from 'src/api';
import { isEmpty } from 'src/util';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})

export class ProductFormComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    image: new FormControl('', Validators.required),
    price: new FormControl('', [Validators.required, Validators.min(0)]),
    categories: new FormControl('', [Validators.required])
  });
  submitted : boolean = false;
  isSaving: boolean = false;
  saveStatus: 'idle' | 'saved' | 'error' = 'idle';
  categories: Observable<CategoryDto[]> = this.categoryService.apiCategoryGetAllCategoriesGet()

  constructor(
    private readonly productService: ProductService,
    private router: Router,
    private readonly categoryService: CategoryService,
  ) {}

  ngOnInit(): void {}

  submit(): void {
    this.submitted = true;
    var createProduct: CreateProduct = this.form.value;
    var addProductToCategory : AddProductToCategory;
    if (this.form.valid) {
      this.isSaving = true;
      this.saveStatus = 'idle';

      this.productService
        .apiProductCreateProductPost(createProduct)
        .subscribe({
          next: (res) => {
            addProductToCategory = {
              productId: res.toString(),
              categoryId: this.form.get('categories')?.value.toString()
            }
            this.categoryService.apiCategoryAddProductToCategoryPut(addProductToCategory).subscribe({
              next: () => {
                this.isSaving = false;
                this.saveStatus = 'saved';
                setTimeout(() => this.router.navigate(['/', 'products']), 700);
              },
              error: () => {
                this.isSaving = false;
                this.saveStatus = 'error';
              },
            })
          },
          error: () => {
            this.isSaving = false;
            this.saveStatus = 'error';
          },
        });
    }
  }

  get f(): { [key: string]: AbstractControl; }
  {
    return this.form.controls;
  }
}
