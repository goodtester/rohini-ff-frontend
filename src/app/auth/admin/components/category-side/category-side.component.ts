import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Category } from '../../interfaces/category.interface';
import { CategoryComponent } from '../../pages/category/category.component';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-side',
  templateUrl: './category-side.component.html',
  styles: [],
})
export class CategorySideComponent implements OnInit, OnChanges {
  @Input() editCategory!: Category | null;
  isClean = true;
  title: string = 'New Category';
  idCategory!: number | null;
  deleteImage = false;
  oneMegaByte: number = 1048576;
  editImage!: string | null;
  imageFile!: File | null;

  category: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    status: ['ACTIVE', [Validators.required]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private categoryPage: CategoryComponent
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editCategory'].currentValue != null) {
      this.title = 'Editar categoría';
      this.isClean = false;
      this.idCategory = this.editCategory!.idCategory;
      this.editImage = this.editCategory!.imageUrl;
      this.category.patchValue(this.editCategory!);
    }
  }

  validate(variable: string) {
    return this.category.controls[variable].errors && this.category.controls[variable].touched;
  }

  ngOnInit(): void {}

  removeImage() {
    this.deleteImage = true;
    this.imageFile = null;
    this.editImage = null;
  }
  clean() {
    this.title = 'New Category';
    this.isClean = true;
    this.imageFile = null;
    this.idCategory = null;
    this.editImage = null;
    this.editCategory = null;
    this.category.reset({ status: 'ACTIVE' });
  }

  onFileChange(event: any) {
    this.imageFile = event.target.files[0];
    const fr = new FileReader();
    fr.onload = (event: any) => {
      this.editImage = event.target.result;
    };
    fr.readAsDataURL(this.imageFile!);
    this.imageFile?.name;
  }

  createCategory() {
    if (this.imageFile == null) {
      this.editCategory = this.category.value;
      this.categoryService.createCategory(this.editCategory!, null).subscribe(() => this.categoryPage.ngOnInit());
    } else {
      if (this.imageFile?.size! < this.oneMegaByte) {
        this.editCategory = this.category.value;
        this.categoryService
          .createCategory(this.editCategory!, this.imageFile)
          .subscribe(() => this.categoryPage.ngOnInit());
      } else {
        this.imageFile = null;
        this.editImage = null;
        Swal.fire('Error', 'Unable to upload image', 'error');
      }
    }
    this.clean();
  }
  updateCategory() {
    if (this.deleteImage) {
      this.category.value['imageUrl'] = null;
    }

    if (this.imageFile == null) {
      this.categoryService
        .updateCategory(this.category.value, this.editCategory!.idCategory, null)
        .subscribe(() => this.categoryPage.ngOnInit());
    } else {
      if (this.imageFile?.size! < this.oneMegaByte) {
        this.categoryService
          .updateCategory(this.category.value, this.editCategory!.idCategory, this.imageFile)
          .subscribe(() => this.categoryPage.ngOnInit());
      } else {
        this.imageFile = null;
        this.editImage = null;
        Swal.fire('Error', 'Unable to upload image', 'error');
      }
    }

    this.clean();
  }
  deleteCategory() {
    Swal.fire({
      title: 'Are you sure you want to delete this category?',
      text: "This change can't be reversed",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ok, Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService
          .deleteCategory(this.editCategory!.idCategory)
          .subscribe(() => this.categoryPage.ngOnInit());
        this.clean();
        Swal.fire('Deleted', `The category has been deleted`, 'success');
      }
    });
  }
}
