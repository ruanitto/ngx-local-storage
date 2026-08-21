<a name="18.0.0"></a>
# 18.0.0 (2026-08-21)

### Breaking changes

* **Updated dependencies** - now targeting Angular ^18.0.0 (ng-packagr ^18.2, TypeScript ~5.5)

<a name="17.0.0"></a>
# 17.0.0 (2026-08-21)

### Breaking changes

* **Updated dependencies** - now targeting Angular ^17.0.0 and RxJs ^6.5.3 || ^7.4.0
* **Versioning** - starting from this release, the package major version follows the targeted Angular major version (similar to Angular itself). For Angular < 17, use previous releases.

### Features

* **standalone:** added `provideLocalStorage()` for standalone apps / `ApplicationConfig` providers
* **testing:** added `provideMockLocalStorage()` with optional in-memory storage backend (`LocalStorageMock` + `LOCAL_STORAGE_MOCK_STORAGE` token)
* **tests:** full unit test suite (Vitest + jsdom) with 100% statement/branch/function coverage

### Performance

* **crypto-es:** import only `AES`/`Utf8` modules instead of the whole library (smaller consumer bundles)
* **clearAll:** snapshot keys before mutating the storage, avoiding skipped entries during iteration; removed an unreachable error branch
* **set:** skip JSON serialization when storage is not supported

<a name="4.0.0"></a>
# 4.0.0 (2020-07-09)

### Breaking changes

* **Updated dependencies** - now using Angular ^10.0.0 and RxJs ^6.6.0

<a name="2.0.0"></a>
# 2.0.0 (2018-05-04)


### Chore

* **changelog:** added this file

### Breaking changes

* **Updated dependencies** - now using Angular ^6.0.0 and RxJs ^6.0.0

<a name="1.x.x"></a>
# 1.x.x

The past is a mystery, check the repo history
