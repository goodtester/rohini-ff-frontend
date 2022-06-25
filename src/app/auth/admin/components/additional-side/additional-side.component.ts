import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Additional, CategoriesValue } from '../../interfaces/additional.interface';
import { AdditionalComponent } from '../../pages/additional/additional.component';
import { AdditionalService } from '../../services/additional.service';

@Component({
  selector: 'app-additional-side',
  templateUrl: './additional-side.component.html',
  styles: [],
})
export class AdditionalSideComponent implements OnInit, OnChanges {
  @Input() editAdditional!: Additional;
  isClean: boolean = true;
  title: string = 'New Additionals';
  idAdditional!: number | null;
  //this CategoriesValues is a craft Interface for the status of the checkbox
  //and have a lot of uses in the class is for the edit and create news categories
  editCategories: CategoriesValue[] = [];
  editImage!: string | null;
  imageFile!: File | null;
  oneMegaByte: number = 1048576;

  alterableAdditional: Additional = {
    idAdditional: 0,
    name: '',
    imageUrl: null,
    price: 0,
    category: [],
    status: '',
  };

  additional: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    price: ['', [Validators.required]],
    category: [, this.checkCategory],
    status: ['ACTIVE', Validators.required],
  });

  checkCategory(argument: FormControl) {
    const category = argument.value;
    if (category) {
      return null;
    }
    return {
      noCategoryValid: true,
    };
  }
  constructor(
    private formBuilder: FormBuilder,
    private additionalService: AdditionalService,
    private additionalPage: AdditionalComponent
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.editCategories.forEach((element) => {
      element.check = false;
    });
    if (changes['editAdditional'].currentValue != null) {
      this.isClean = false;
      this.title = 'Edit Additional';
      this.editAdditional.category.forEach((category) => {
        this.editCategories.forEach((element) => {
          if (element.idCategory == category.idCategory) {
            element.check = true;
          }
        });
      });
      this.idAdditional = this.editAdditional.idAdditional;
      this.editImage = this.editAdditional.imageUrl;
      this.additional.patchValue(this.editAdditional!);
    }
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

  removeImage() {
    this.imageFile = null;
    this.editImage = null;
  }

  ngOnInit(): void {
    this.additionalService.getCategories().subscribe((listCategory) => {
      listCategory.data.category!.forEach((category) => {
        this.editCategories.push({
          check: false,
          idCategory: category!.idCategory,
          name: category!.name,
        });
      });
    });
  }

  onChecked(idCategory: number, isChecked: any) {
    if (isChecked.target.checked) {
      this.editCategories.forEach((element) => {
        if (element.idCategory === idCategory) {
          element.check = true;
        }
      });
    }
    if (!isChecked.target.checked) {
      this.editCategories.forEach((element) => {
        if (element.idCategory === idCategory) {
          element.check = false;
        }
      });
    }
  }
  validate(variable: string) {
    return this.additional.controls[variable].errors && this.additional.controls[variable].touched;
  }

  clean() {
    this.editCategories.forEach((element) => {
      element.check = false;
    });
    this.title = 'Create Additional';
    this.idAdditional = null;
    this.imageFile = null;
    this.editImage = null;
    this.isClean = true;
    this.additional.reset({ status: 'ACTIVE' });
    this.alterableAdditional = {
      idAdditional: 0,
      name: '',
      imageUrl: null,
      price: 0,
      category: [],
      status: '',
    };
  }

  validCategory() {
    let valido: number = 0;
    this.editCategories.forEach((element) => {
      if (element.check == false) {
        valido += 1;
      }
    });
    if (this.editCategories.length == valido) {
      Swal.fire('Error', 'Additional must have a category', 'error');
      return false;
    }
    return true;
  }

  createAdditional() {
    if (this.validCategory()) {
      if (this.imageFile == null) {
        this.additionalService.createAdditional(this.alterData(), null).subscribe(() => this.additionalPage.ngOnInit());
        this.clean();
      } else {
        if (this.imageFile?.size! < this.oneMegaByte) {
          this.additionalService
            .createAdditional(this.alterData(), this.imageFile)
            .subscribe(() => this.additionalPage.ngOnInit());
          this.clean();
        }
        if (this.imageFile?.size! > this.oneMegaByte) {
          Swal.fire('Error', 'Unable to upload image', 'error');
          this.removeImage();
        }
      }
    }
  }
  updateAdditionals() {
    if (this.validCategory()) {
      if (this.imageFile == null) {
        this.additionalService
          .editAdditional(this.alterData(), this.editAdditional.idAdditional, null)
          .subscribe(() => {
            this.additionalPage.ngOnInit();
          });
        this.clean();
      } else {
        if (this.imageFile?.size! < this.oneMegaByte) {
          this.additionalService
            .editAdditional(this.alterData(), this.editAdditional.idAdditional, this.imageFile)
            .subscribe(() => {
              this.additionalPage.ngOnInit();
            });
          this.clean();
        }
        if (this.imageFile?.size! > this.oneMegaByte) {
          Swal.fire('Error', 'Unable to upload image', 'error');
          this.removeImage();
        }
      }
    }
  }

  deleteAdditional() {
    Swal.fire({
      title: 'Are you sure you want to delete this additional?',
      text: "The change can't be reversed",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.additionalService.deleteAdditional(this.editAdditional.idAdditional).subscribe(() => {
          this.additionalPage.ngOnInit();
        });
        this.clean();
        Swal.fire('Delete', `The additional ${this.editAdditional.name} has been deleted`, 'success');
      }
    });
  }

  alterData() {
    this.alterableAdditional.name = this.additional.value['name'];
    this.alterableAdditional.price = this.additional.value['price'];
    this.alterableAdditional.status = this.additional.value['status'];
    //Set empty the category because the user could add and remove manytimes so could duplicate data
    this.alterableAdditional.category = [];
    this.editCategories.forEach((addCategories) => {
      if (addCategories.check) {
        this.alterableAdditional.category.push({
          idCategory: addCategories.idCategory,
        });
      }
    });
    return this.alterableAdditional;
  }
}
