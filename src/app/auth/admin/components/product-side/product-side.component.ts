import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Product, ProductInterface } from '../../interfaces/products.interface';
import { ProductsComponent } from '../../pages/products/products.component';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-side',
  templateUrl: './product-side.component.html',
  styles: [],
})
export class ProductSideComponent implements OnInit, OnChanges {
  @Input() editProduct!: Product | null;
  title: string = 'New Product';
  categories!: ProductInterface;
  isClean = true;
  deleteImage = false;
  idProduct!: number | null;
  editImage!: string | null;
  imageFile!: File | null;
  oneMegaByte: number = 1048576;
  formatCategory = {
    idCategory: 0,
  };
  alterableProduct: Product = {
    idProduct: 0,
    name: '',
    calories: 0,
    description: '',
    price: 0,
    duration: '',
    highlight: 0,
    discountPoint: 0,
    status: '',
    category: this.formatCategory,
    imageUrl: null,
  };

  product: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    calories: [],
    description: ['', [Validators.required]],
    price: ['', [Validators.required]],
    duration: [, Validators.max(90)],
    highlight: [, Validators.max(10)],
    discountPoint: [, Validators.max(10000)],
    status: ['ACTIVE', [Validators.required]],
    imageUrl: [],
    category: [[0], [Validators.required, this.validateCategory]],
  });

  validate(variable: string) {
    return this.product.controls[variable].errors && this.product.controls[variable].touched;
  }

  validateCategory(argument: FormControl) {
    const category = argument.value;
    if (category != 0) {
      return null;
    }
    return {
      noCategoryValid: true,
    };
  }

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductsService,
    private productPage: ProductsComponent
  ) {}

  onFileChange(event: any) {
    this.imageFile = event.target.files[0];
    const fr = new FileReader();
    fr.onload = (event: any) => {
      this.editImage = event.target.result;
    };
    fr.readAsDataURL(this.imageFile!);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editProduct'].currentValue != null) {
      this.title = 'Edit product';
      this.isClean = false;
      this.idProduct = this.editProduct!.idProduct;
      this.editImage = this.editProduct!.imageUrl;
      this.product.patchValue(this.editProduct!);
      this.product.patchValue({
        category: this.editProduct!.category.idCategory,
      });
    }
  }

  ngOnInit(): void {
    this.productService.getCategories().subscribe((listCategories) => (this.categories = listCategories));
  }
  removeImage() {
    this.deleteImage = true;
    this.imageFile = null;
    this.editImage = null;
  }

  clean() {
    this.title = 'New Product';
    this.isClean = true;
    this.imageFile = null;
    this.editImage = null;
    this.idProduct = null;
    this.product.reset({ status: 'ACTIVE', category: [0] });
  }

  createProduct() {
    if (this.imageFile == null) {
      this.productService.createProduct(this.setAlterProduct(), null).subscribe(() => {
        this.productPage.filterByCategory(null);
      });
      this.clean();
    }

    if (this.imageFile?.size! < this.oneMegaByte) {
      this.productService.createProduct(this.setAlterProduct(), this.imageFile).subscribe(() => {
        this.productPage.filterByCategory(null);
      });
      this.clean();
    }
    if (this.imageFile?.size! > this.oneMegaByte) {
      Swal.fire('Error', 'Unable to upload image', 'error');
      this.imageFile = null;
      this.editImage = null;
    }
  }

  updateProducts() {
    if (this.imageFile == null) {
      this.productService.updateProduct(this.editProduct!.idProduct, this.setAlterProduct(), null).subscribe(() => {
        this.productPage.filterByCategory(null);
      });
      this.clean();
    }

    if (this.imageFile?.size! < this.oneMegaByte) {
      this.productService
        .updateProduct(this.editProduct!.idProduct, this.setAlterProduct(), this.imageFile)
        .subscribe(() => {
          this.productPage.filterByCategory(null);
        });
      this.clean();
    }
    if (this.imageFile?.size! > this.oneMegaByte) {
      Swal.fire('Error', 'Unable to upload image', 'error');
      this.imageFile = null;
      this.editImage = null;
    }
  }

  deleteProduct() {
    Swal.fire({
      title: 'Are you sure you want to delete the product?',
      text: `This change can't be reversed`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(this.editProduct!.idProduct).subscribe(() => {
          this.productPage.filterByCategory(null);
        });
        this.clean();
        Swal.fire('Deleted!', `The product ${this.editProduct!.name} has been deleted successfully`, 'success');
      }
    });
  }

  setAlterProduct() {
    this.alterableProduct.name = this.product.value['name'];
    this.alterableProduct.calories = this.product.value['calories'];
    this.alterableProduct.description = this.product.value['description'];
    this.alterableProduct.price = this.product.value['price'];
    this.alterableProduct.duration = this.product.value['duration'];
    this.alterableProduct.highlight = this.product.value['highlight'];
    this.alterableProduct.discountPoint = this.product.value['discountPoint'];
    this.alterableProduct.status = this.product.value['status'];
    this.alterableProduct.category.idCategory = this.product.value['category'];
    if (this.deleteImage) {
      this.alterableProduct.imageUrl = null;
    } else {
      this.alterableProduct.imageUrl = this.product.value['imageUrl'];
    }
    return this.alterableProduct;
  }
}
