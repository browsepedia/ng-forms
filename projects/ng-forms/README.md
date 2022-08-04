# @browsepedia/ng-forms

Better typed Angular 14 Forms + aggregating form data accross multiple pages/components.

### Installation

```npm
    npm install --save @browsepedia/ng-forms
```

### Usage

This library has 2 funcionalities:

1. Better typings for the already typed Angular 14 Reactive Forms.
2. An @Injectable() service that lets you aggregate Reactive Forms data accross multiple components/pages.

#### Better Typings

Angular 14 shipped a new feature that every Angular developer craved: typing FormGroups. Unfortunatelly, these are very loosely typed, meaning you cannot pass an entity type to a FormGroup generic type, you must pass a ` Record<string, AbstractControl<T>>` to the FormGroup generic.

```ts
const form = new FormGroup<{
    firstName: FormControl<string>(''),
    lastName: FormControl<string>('')
}>


// works fine
const firstName = form.controls.firstName.value
const lastName = form.controls.lastName.value
```

This is ok, but not ideal. We would very much like to have the option to pass an entity to the generic type of FormGroup. But this is not that easy to achieve, because we dont always know the type that the FormControl should manage, and `any` is out of the question.

##### Thats where @browsepedia/ng-forms comes to the rescue.

There are 5 FormGroup extending classes inside @browsepedia/ng-forms"

1. `SimpleFormGroup<T>` - each key stores a FormControl with the coresponding type.

```ts
interface User {
  name: string;
  age: number;
}

SimpleFormGroup<User>()
// is the equivalent of
FormGroup<{
    name: FormControl<string>,
    age: FormControl<number>
}>
```

2. `BasicFormControl<T>` - each key stores either a FormControl or a FormGroup.

```ts
interface User {
  name: string;
  age: number;
  history: {
    hiredDate: Date;
    position: string;
  };
}

BasicFormControl<T>
// is the equivalent of
FormGroup<{
    name: FormControl<string>,
    age: FormControl<number>,
    history: FormGroup<{
        hiredDate: FormControl<Date>,
        position: FormControl<string>
    }>
}>
```

> Note that Date, null and array types are still converted to FormControl instances using BasicFormControl.

3. `FlatFormGroup<T>` - each key stores the same AbstractControl type as a `BasicFormControl<T>` with the addition of FormArrays being used for `Array<Record<string, any>>` This means that a type of `number[]`, `boolean[]`, `Date[]` and `string[]` would still be converted to `FormControl<number[]>`, `FormControl<boolean[]>`,`FormControl<Date[]>` or `FormControl<string[]>`

```ts
interface Role {
  name: string;
}

interface User {
  name: string;
  age: number;
  history: {
    hiredDate: Date;
    position: string;
  };
  roles: Role[];
  jobTitles: string[];
}

FlatFormGroup<User>
// is the equivalent of
FormGroup<{
    name: FormControl<string>,
    age: FormControl<number>,
    history: FormGroup<{
        hiredDate: FormControl<Date>,
        position: FormControl<string>
    }>,
    roles: FormArray<FormGroup<{
        name: FormControl<string>
    }>>,
    jobTitles: FormControl<string> // primitive arrays are still FormControls
}>
```

4. `StrictFormGroup<T>` each key stores the AbstractControl based on the type, primitive type arrays become FormArrays.

```ts
interface Role {
  name: string;
}

interface User {
  name: string;
  age: number;
  history: {
    hiredDate: Date;
    position: string;
  };
  roles: Role[];
  jobTitles: string[];
}

FlatFormGroup<User>
// is the equivalent of
FormGroup<{
    name: FormControl<string>,
    age: FormControl<number>,
    history: FormGroup<{
        hiredDate: FormControl<Date>,
        position: FormControl<string>
    }>,
    roles: FormArray<FormGroup<{
        name: FormControl<string>
    }>>,
    jobTitles: FormArray<FormControl<string>>
}>
```

5. `UnrestrictedFormGroup<T>` - each key stores any AbstractControl class based on the type. Meaning I can have one primitive array as a FormArray, and another as a FormControl. In addition, I can store Record<string, any> types into FormControls Or FormGroups, its totally unrestricted.

```ts
interface User {
  roles: string[];
  jobTitles: string[];
  history: {
    hiredDate: Date;
    position: string;
  };
}

FlatFormGroup<User>
// is the equivalent of
FormGroup<{
    roles: FormControl<string[]>,
    jobTitles: FormArray<FormControl<string>>,
    history: FormControl<User['history']>
}>

// OR

FormGroup<{
    roles: FormControl<string[]>,
    jobTitles: FormArray<FormControl<string>>,
    history: SimpleFormGroup<User['history']>
}>

```
