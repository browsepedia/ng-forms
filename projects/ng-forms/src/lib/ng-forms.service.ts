import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable } from 'rxjs';
import {
  UnrestrictedFormGroup,
  TypedAbstractControl,
  TypedFormGroup,
} from './ng-forms.models';

@Injectable()
export class NgFormsService<T extends Record<any, any>> {
  constructor() {
    this.formChange$ = this._form.valueChanges.pipe(
      map(() => this._form.getRawValue())
    ) as Observable<T>;
  }

  public formChange$: Observable<T>;

  public _form: UnrestrictedFormGroup<T> = new UnrestrictedFormGroup<T>(
    {} as any
  );

  registerFormControl<T>(
    key: keyof T,
    formGroup: TypedAbstractControl<T>
  ): void {
    this._form.setControl(key as any, formGroup);
  }

  getFormControl(
    key: keyof T
  ): TypedFormGroup<T[keyof T]> | FormControl<T[keyof T]> {
    const formGroup = this._form.get(key as any) as TypedFormGroup<T[keyof T]>;

    if (!formGroup) {
      throw new Error(
        `No FormGroup found for key ${key.toString()}. 
        Did you call registerFormGroup(${key.toString()}, formGroup) before calling getFormGroup(${key.toString()})
        `
      );
    }

    return formGroup;
  }

  getRootForm(): UnrestrictedFormGroup<T> {
    return this._form;
  }
}
