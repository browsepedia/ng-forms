import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { registerFormControl } from './ng-forms.injectable-fns';

type NoUndefined<Type> = Type extends undefined ? never : Type;

/**
 * Remove the undefined portion of a FormControl value since undefined is not a valid value
 * for a form field since it should ONLY represent an uninitialized field or function implicit return type.
 * Example: Given Type = any | undefined, the NonOptionalFOrmControlValue = FormControl<any>
 */
type NonOptionalFormControl<Type> = FormControl<NoUndefined<Type>>;

/**
 * Given an type T, it generates the FormGroup T argument based on the values of each keys
 * without mapping the object values to its corresponding AbstractControl instance.
 * Primitive values are mapped to FormControl
 * Arrays are mapped to FormControl.
 * Objects are mapped to FormControl.
 */
export type SimpleFormControlsFor<T extends Record<any, any>> = {
  [K in keyof T]-?: FormControl<T[K]>;
};

/**
 * Given an type T, it generates the FormGroup T argument based on the values of each keys
 * without mapping array values to FormArray instances.
 * Primitive values are mapped to FormControl
 * Arrays are mapped to FormControl.
 * Objects are mapped to FormGroup.
 */
export type FormControlsFor<T extends Record<any, any>> = {
  [K in keyof T]-?: T[K] extends any[]
    ? NonOptionalFormControl<T[K]>
    : T[K] extends Date
    ? NonOptionalFormControl<Date>
    : T[K] extends null
    ? NonOptionalFormControl<T[K]>
    : T[K] extends Record<any, any> | undefined
    ? FormGroup<FormControlsFor<NoUndefined<T[K]>>>
    : NonOptionalFormControl<T[K]>;
};

/**
 * Given an type T, it generates the FormGroup T argument based on the values of each keys
 * mapping each value in the object to the corresponding AbstractControl implementation.
 * Primitive values are mapped to FormControl
 * Arrays are mapped to FormArray.
 * Objects are mapped to FormGroup.
 */
export type StrictFormControlsFor<T extends Record<any, any>> = {
  [K in keyof T]-?: T[K] extends (infer ArrayElementType)[]
    ? ArrayElementType extends string | number | boolean | null
      ? FormArray<NonOptionalFormControl<ArrayElementType>>
      : FormArray<StrictFormGroup<ArrayElementType>>
    : T[K] extends Date
    ? NonOptionalFormControl<Date>
    : T[K] extends null
    ? NonOptionalFormControl<T[K]>
    : T[K] extends Record<any, any> | undefined
    ? FormGroup<StrictFormControlsFor<T[K]>>
    : NonOptionalFormControl<T[K]>;
};

/**
 * Given an type T, it generates the FormGroup T argument based on the values of each keys
 * mapping each value in the object to the corresponding AbstractControl implementation,
 * with the exception of primitive value arrays, which are mapped to FormControl.
 * Primitive values are mapped to FormControl
 * Object Arrays are mapped to FormArray.
 * Primitive type arrays, including Date and null (number[], Date[], etc) are mapped to FormControl
 * Objects are mapped to FormGroup.
 */
export type FlatFormControlsForm<T extends Record<any, any>> = {
  [K in keyof T]-?: T[K] extends (infer ArrayElementType)[]
    ? ToFlatStrictFormArray<T[K], ArrayElementType>
    : T[K] extends Date
    ? NonOptionalFormControl<Date>
    : T[K] extends null
    ? NonOptionalFormControl<T[K]>
    : T[K] extends Record<any, any> | undefined
    ? FormGroup<FlatFormControlsForm<NoUndefined<T[K]>>>
    : NonOptionalFormControl<T[K]>;
};

type ToFlatStrictFormArray<Type, ArrayElementType> =
  ArrayElementType extends Date
    ? NonOptionalFormControl<Date>
    : ArrayElementType extends null
    ? NonOptionalFormControl<Type>
    : ArrayElementType extends Record<any, any> | undefined
    ? FormArray<FlatFormGroup<ArrayElementType>>
    : NonOptionalFormControl<Type>;

export type TypedFormGroup<Type> =
  | BasicFormGroup<Type>
  | SimpleFormGroup<Type>
  | StrictFormGroup<Type>
  | FlatFormGroup<Type>;

export type TypedAbstractControl<T> = TypedFormGroup<T> | FormControl<T>;

export class BasicFormGroup<Type> extends FormGroup<FormControlsFor<Type>> {}

export class SimpleFormGroup<Type> extends FormGroup<
  SimpleFormControlsFor<Type>
> {}

export class StrictFormGroup<T> extends FormGroup<StrictFormControlsFor<T>> {}

export class FlatFormGroup<T> extends FormGroup<FlatFormControlsForm<T>> {}

/**
 * This FormGroup type should be used when you want type safety in your FormGroup
 * without restricting the AbstractControl type an entity type.
 * Example, you can define a FormControl to store complex object arrays, not only
 * primite value arrays, as is the case for FlatFormGroup which converts primitive arrays
 * to FormControls, while using FormArray for T extends Record<any, any>.
 * Use this when your FormGroup has an iregular shape.
 */
export class UnrestrictedFormGroup<Type> extends FormGroup<{
  [Key in keyof Type]-?: Type[Key] extends (infer ArrayElementType)[]
    ?
        | FormArray<TypedFormGroup<ArrayElementType>>
        | FormArray<NonOptionalFormControl<ArrayElementType>>
        | NonOptionalFormControl<ArrayElementType[]>
    : TypedAbstractControl<Type[Key]>;
}> {}
