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

#### 1. Better Typings

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

#### 2. Form Aggregator

The Form Aggregator is basically an `@Injectable()` service named `NgFormsService<T>` where `T` is an entity - `User` for example.

##### Usage

`NgFormService` is set in the providers array of `NgFormsModule`, which means you can import it in your lazy loaded module to get a per module instance of the service.

> Note that for this to work and not have data leak from one form to another this Service NEEDS to be singleton per feature or per component tree where you are using it.

Either import `NgFormsModule` in your lazy loaded module or set `NgFormService<T>` in the providers of your component from which you start your aggregated form.

Example:

````ts
// user.ts
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

interface Role {
  name: string;
}


/// user-form-root.component.ts
  @Component({
    selector: 'app-user-form-root```,
    providers: [NgFormService<User>]
  })
  export class UserFormRootComponent {
    constructor(private _formService: NgFormService<User>) {
      this.form = this._formService.getRootForm()
      // or you can get only the valueChanges.
      // NOTE that formChange will emit the getRawValue() call
      this._formService.formChange$.subscrible(console.log);
    }

    // will hold the entire aggregated form from all the subcomponents where you registered slices of the form.
    protected form: UntypedFormGroup<T>;
  }

  // user-history.component.ts
    export class UserHistoryComponent {
    constructor(private _formService: NgFormService<User>) {
      this.form = new SimpleFormGroup<User['history']>({
        hiredDate: FormControl<Date>(new Date(), { nonNullable: true }),
        position: FormControl<string>('', { nonNullable: true })
      });

      // you will get an error if you pass a key which doesn't exist on the User interface.
      this._formService.registerFormControl<User>('history', this.form)
    }

    protected form: SimpleFormGroup<User['history']>;
  }

  // user-roles.component.ts
    export class UserRolesComponent {
    constructor(private _formService: NgFormService<User>) {
      this.form = new FormArray<SimpleFormGroup<Role>>([]);

      // you will get an error if you pass a key which doesn't exist on the User interface.
      this._formService.registerFormControl<User>('roles', this.form)
    }

    protected form: FormArray<SimpleFormGroup<Role>>;
  }
````

#### Simpler usage.

Angular 14 also introduced constructor time usage of the `inject()` function. This library also provides an alternative to constructor injecting of the `NgFormService` by using `injectable functions`.
The above example becomes the following:

````ts
// user.ts
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

interface Role {
  name: string;
}


/// user-form-root.component.ts
  import { getRootFormGroupValueChange, getRootFormGroup, registerFormControl } from '@browsepedia/ng-forms';

  @Component({
    selector: 'app-user-form-root```,
    providers: [NgFormService<User>]
  })
  export class UserFormRootComponent {
    // will hold the entire aggregated form from all the subcomponents where you registered slices of the form.
    protected form = getRootFormGroup<User>();
    private _valueChange$ = getRootFormGroupValueChange<User>()
  }

  // user-history.component.ts
    export class UserHistoryComponent {
    protected form: SimpleFormGroup<User['history']> = registerFormControl(new SimpleFormGroup<User['history']>({
        hiredDate: FormControl<Date>(new Date(), { nonNullable: true }),
        position: FormControl<string>('', { nonNullable: true })
      }));
  }

  // user-roles.component.ts
    export class UserRolesComponent {
    constructor(private _formService: NgFormService<User>) {

    protected form: FormArray<SimpleFormGroup<Role>> = registerFormControl(new FormArray<SimpleFormGroup<Role>>([]));
  }
````
