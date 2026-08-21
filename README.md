# @ruanitto/ngx-local-storage

LocalStorageService for Angular with mostly the same API (and most of the code) from [angular-local-storage](https://github.com/grevory/angular-local-storage).

AoT compatible. Compatible with Angular 17.* (Ivy partial compilation).

## Versioning

Following a versioning scheme similar to Angular itself, starting from `17.0.0` this package follows the major version of Angular it targets:

| Package version | Angular version |
| --------------- | --------------- |
| `17.x`          | `^17.0.0`       |
| `< 17` (e.g. `1.3.6`) | `>=10 <17` (use previous releases) |

For Angular versions below 17, please use the previous package versions (e.g. `npm install @ruanitto/ngx-local-storage@1.3.6`).

## NEW Feature added

* Addeded feature to encrypt/decrypt storage data

## Differences

* No events broadcast on $rootScope - LocalStorageService exposes observables for `errors$`,`removeItems$`, `setItems$` and `warning$` if you really need something to happen when something happens.
* The `bind` function doesn't work anymore (there is a stub so this can still be a drop-in, but it'll do nothing).

## Install

`npm install @ruanitto/ngx-local-storage`

## Usage

You can optionally configure the module:

```typescript
import { LocalStorageModule } from '@ruanitto/ngx-local-storage';

@NgModule({
    imports: [
        LocalStorageModule.forRoot({
            prefix: 'my-app',
            storageType: 'localStorage',
            encrypt: true,
            encryptKey: 'securekey'
        })
    ],
    declarations: [
        ..
    ],
    providers: [
        ..
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

Or, for standalone apps (Angular 17 default), configure via `provideLocalStorage`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideLocalStorage } from '@ruanitto/ngx-local-storage';

export const appConfig: ApplicationConfig = {
    providers: [
        provideLocalStorage({
            prefix: 'my-app',
            storageType: 'localStorage',
            encrypt: true,
            encryptKey: 'securekey'
        })
    ]
};
```

Then you can use it in a component:

```typescript
import { LocalStorageService } from '@ruanitto/ngx-local-storage';

@Component({
    // ...
})
export class SomeComponent {
    constructor (
        private localStorageService: LocalStorageService
    ) {
        // YAY!
    }
}

```

### Configuration options

`import { ILocalStorageServiceConfig } from '@ruanitto/ngx-local-storage';` for type information about the configuration object.
