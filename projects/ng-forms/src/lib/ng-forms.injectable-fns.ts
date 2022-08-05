import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TypedAbstractControl, UnrestrictedFormGroup } from './ng-forms.models';
import { NgFormsService } from './ng-forms.service';


export const getRootFormGroupValueChange = <T>(): Observable<T> =>
  inject(NgFormsService<T>).formChange$;

export const registerFormControl =
  <T>(key: keyof T, formGroup: TypedAbstractControl<T>): TypedAbstractControl<T> => {
    inject(NgFormsService<T>).registerFormControl<T>(key as any, formGroup);

    return formGroup;
  };

  export const getRootFormGroup = <T>(): UnrestrictedFormGroup<T> => inject(NgFormsService<T>).getRootForm()

  export const getControlFromRootForm = <T>(key: keyof T): any => inject(NgFormsService<T>).getFormControl(key) 