import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CategoryDto, CategoryService, CreateCategory, CreateSubcategory } from 'src/api';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    parent: new FormControl(''),
    isChild: new FormControl(false),
  });
  submitted : boolean = false;
  isSubCategory : boolean = false;
  isSaving: boolean = false;
  saveStatus: 'idle' | 'saved' | 'error' = 'idle';

  constructor(
    private readonly categoryService: CategoryService,
    private router: Router
    ) { }

  categories: Observable<CategoryDto[]> = this.categoryService.apiCategoryGetAllCategoriesGet()

  ngOnInit(): void {
  }

  get f(): { [key: string]: AbstractControl; }
  {
    return this.form.controls;
  }

  toggleEditable(event: { target: { checked: boolean; }; }) {
    this.isSubCategory = event.target.checked;
  }

  submit():void{
    if (this.form.valid) {
      this.isSaving = true;
      this.saveStatus = 'idle';

      var createCategory: CreateCategory = this.form.value;
      if(this.form.get('isChild')?.value===false){
        this.categoryService
        .apiCategoryCreateCategoryPost(createCategory)
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.saveStatus = 'saved';
            setTimeout(() => this.router.navigate(['/', 'categories']), 700);
          },
          error: () => {
            this.isSaving = false;
            this.saveStatus = 'error';
          },
        });
      }
      else{
        var createSubcategory: CreateSubcategory = {name: this.form.get('name')?.value.toString(), parentId: this.form.get('parent')?.value.toString()}

        this.categoryService
        .apiCategoryCreateSubcategoryPost(createSubcategory)
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.saveStatus = 'saved';
            setTimeout(() => this.router.navigate(['/', 'categories']), 700);
          },
          error: () => {
            this.isSaving = false;
            this.saveStatus = 'error';
          },
        });
      }

    }
  }
}
