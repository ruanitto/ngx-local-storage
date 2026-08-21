import { describe, expect, it } from "vitest";

import { LocalStorageMock } from "./local-storage-mock.storage";

describe("LocalStorageMock", () => {
  it("stores and retrieves string values", () => {
    const storage = new LocalStorageMock();

    storage.setItem("a", "1");

    expect(storage.getItem("a")).toBe("1");
  });

  it("coerces keys and values to strings", () => {
    const storage = new LocalStorageMock();

    (storage.setItem as (key: unknown, value: unknown) => void)(123, 456);

    expect(storage.getItem("123")).toBe("456");
  });

  it("returns null for missing or removed keys", () => {
    const storage = new LocalStorageMock();

    expect(storage.getItem("missing")).toBeNull();

    storage.setItem("gone", "1");
    storage.removeItem("gone");

    expect(storage.getItem("gone")).toBeNull();
    expect(storage.length).toBe(0);
  });

  it("removing a non-existent key is a no-op", () => {
    const storage = new LocalStorageMock();

    expect(() => storage.removeItem("ghost")).not.toThrow();
    expect(storage.length).toBe(0);
  });

  it("overwrites values for the same key", () => {
    const storage = new LocalStorageMock();

    storage.setItem("k", "first");
    storage.setItem("k", "second");

    expect(storage.getItem("k")).toBe("second");
    expect(storage.length).toBe(1);
  });

  it("reports the insertion order through key()", () => {
    const storage = new LocalStorageMock();

    storage.setItem("b", "2");
    storage.setItem("a", "1");

    expect(storage.key(0)).toBe("b");
    expect(storage.key(1)).toBe("a");
    expect(storage.key(2)).toBeNull();
    expect(storage.key(-1)).toBeNull();
  });

  it("exposes entries as enumerable properties like real Storage", () => {
    const storage = new LocalStorageMock();

    storage.setItem("enumerable", "yes");

    const enumerated: Array<string> = [];

    for (const key in storage) {
      if (Object.prototype.hasOwnProperty.call(storage, key)) {
        enumerated.push(key);
      }
    }

    expect(enumerated).toContain("enumerable");
    expect(Object.keys(storage as unknown as Record<string, unknown>)).toContain(
      "enumerable"
    );
  });

  it("clears every entry", () => {
    const storage = new LocalStorageMock();

    storage.setItem("a", "1");
    storage.setItem("b", "2");
    storage.clear();

    expect(storage.length).toBe(0);
    expect(storage.getItem("a")).toBeNull();
    expect(storage.getItem("b")).toBeNull();
  });
});
