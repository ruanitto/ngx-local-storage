import { InjectionToken } from "@angular/core";

/**
 * Injection token that replaces the underlying browser storage with a
 * test double when provided (see `provideMockLocalStorage`).
 */
export const LOCAL_STORAGE_MOCK_STORAGE = new InjectionToken<Storage>(
  "LOCAL_STORAGE_MOCK_STORAGE"
);

/**
 * In-memory implementation of the Web Storage API.
 *
 * Entries are kept as own enumerable properties of the instance, mirroring
 * how browsers expose stored keys on the real `Storage` objects.
 */
export class LocalStorageMock implements Storage {
  [key: string]: any;

  public get length(): number {
    return Object.keys(this).length;
  }

  public clear(): void {
    Object.keys(this).forEach((key) => delete this[key]);
  }

  public getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this, key)
      ? String(this[key])
      : null;
  }

  public key(index: number): string | null {
    return Object.keys(this)[index] ?? null;
  }

  public removeItem(key: string): void {
    delete this[key];
  }

  public setItem(key: string, value: string): void {
    this[String(key)] = String(value);
  }
}
