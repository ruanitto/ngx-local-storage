import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import type { Observable } from "rxjs";

import {
  ILocalStorageServiceConfig,
} from "./local-storage.config.interface";
import { LocalStorageMock } from "./local-storage-mock.storage";
import { LocalStorageService } from "./local-storage.service";

type Spec<T> = { values: Array<T>; unsubscribe: () => void };

function collect<T>(observable: Observable<T>): Spec<T> {
  const values: Array<T> = [];
  const subscription = observable.subscribe((value: T) => values.push(value));

  return { values, unsubscribe: () => subscription.unsubscribe() };
}

function makeService(
  config: ILocalStorageServiceConfig = {},
  mockedStorage?: Storage | null
): LocalStorageService {
  return new LocalStorageService(config, mockedStorage);
}

const originalLocalStorage = Object.getOwnPropertyDescriptor(
  window,
  "localStorage"
);

describe("LocalStorageService", () => {
  let warnSpy: MockInstance;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.restoreAllMocks();
    restoreStorage();
  });

  function restoreStorage(): void {
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
  }

  function disableStorage(): void {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: null,
      writable: false,
    });
  }

  describe("initialization", () => {
    it("detects a supported environment", () => {
      expect(makeService().isSupported).toBe(true);
    });

    it("applies the default configuration", () => {
      const service = makeService();

      // Historical quirk kept for backwards compatibility: the default
      // prefix does NOT include a trailing period.
      expect(service.deriveKey("foo")).toBe("lsfoo");
      expect(service.getStorageType()).toBe("localStorage");
    });

    it("appends a period to prefixes without one", () => {
      expect(makeService({ prefix: "app" }).deriveKey("k")).toBe("app.k");
    });

    it("keeps prefixes that already end with a period", () => {
      expect(makeService({ prefix: "app." }).deriveKey("k")).toBe("app.k");
    });

    it("uses the configured storage type", () => {
      const service = makeService({
        prefix: "app",
        storageType: "sessionStorage",
      });

      service.set("k", 42);

      expect(window.sessionStorage.getItem("app.k")).toBe("42");
      expect(window.localStorage.getItem("app.k")).toBeNull();
    });

    it("warns when encryption is enabled without a key", () => {
      const service = makeService({ prefix: "app", encrypt: true });
      const warnings = collect(service.warnings$);

      service.set("k", { plain: true });

      expect(warnSpy).toHaveBeenCalledWith(
        "To use this function encryptKey must be set!"
      );
      expect(window.localStorage.getItem("app.k")).toBe('{"plain":true}');
      warnings.unsubscribe();
    });

    it("reports being unsupported when the probe write fails", () => {
      vi
        .spyOn(window.Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new DOMException("quota exceeded", "QuotaExceededError");
        });

      expect(makeService().isSupported).toBe(false);
    });
  });

  describe("set / get", () => {
    it("round-trips every JSON-compatible type", () => {
      const service = makeService();

      service.set("obj", { name: "Rafael", roles: ["admin"] });
      service.set("arr", [1, 2, 3]);
      service.set("str", "hello");
      service.set("num", 42);
      service.set("bool", false);

      expect(service.get("obj")).toEqual({ name: "Rafael", roles: ["admin"] });
      expect(service.get("arr")).toEqual([1, 2, 3]);
      expect(service.get<string>("str")).toBe("hello");
      expect(service.get<number>("num")).toBe(42);
      expect(service.get<boolean>("bool")).toBe(false);
    });

    it("stores undefined as a null tombstone", () => {
      const service = makeService({ prefix: "app" });

      service.set("k", undefined);

      expect(window.localStorage.getItem("app.k")).toBe("null");
      expect(service.get("k")).toBeNull();
    });

    it("round-trips explicit null through the string form", () => {
      const service = makeService({ prefix: "app" });

      service.set("k", null);

      expect(window.localStorage.getItem("app.k")).toBe("null");
      expect(service.get("k")).toBeNull();
    });

    it("treats a stored literal 'null' as null on read", () => {
      const service = makeService({ prefix: "app" });
      window.localStorage.setItem("app.k", "null");

      expect(service.get("k")).toBeNull();
    });

    it("returns null instead of throwing on corrupted payloads", () => {
      const service = makeService({ prefix: "app" });
      window.localStorage.setItem("app.k", "{not-json");

      expect(service.get("k")).toBeNull();
    });

    it("returns null for missing keys without warning", () => {
      const service = makeService();
      const warnings = collect(service.warnings$);

      expect(service.get("missing")).toBeNull();
      expect(warnings.values).toEqual([]);
      warnings.unsubscribe();
    });

    it("reads through a null backend without crashing", () => {
      const service = makeService();
      (service as unknown as { webStorage: Storage | null }).webStorage = null;

      expect(service.get("k")).toBeNull();
    });
  });

  describe("encryption", () => {
    const config: ILocalStorageServiceConfig = {
      prefix: "app",
      encrypt: true,
      encryptKey: "unit-test-key",
    };

    it("persists ciphertext, never plaintext", () => {
      const service = makeService(config);

      service.set("secret", { token: "abc" });

      const raw = window.localStorage.getItem("app.secret") ?? "";

      expect(raw).not.toContain("abc");
      expect(raw.startsWith("U2FsdGVk")).toBe(true);
    });

    it("round-trips encrypted values", () => {
      const service = makeService(config);

      service.set("secret", { token: "abc", n: 1 });

      expect(service.get("secret")).toEqual({ token: "abc", n: 1 });
    });

    it("returns null when decrypted with the wrong key", () => {
      makeService(config).set("secret", { token: "abc" });
      const attacker = makeService({ ...config, encryptKey: "wrong" });

      expect(attacker.get("secret")).toBeNull();
    });
  });

  describe("notifications", () => {
    it("emits setItems$ when enabled", () => {
      const service = makeService({
        notifyOptions: { setItem: true, removeItem: false },
      });
      const sets = collect(service.setItems$);

      service.set("k", { a: 1 });

      expect(sets.values).toEqual([
        { key: "k", newvalue: '{"a":1}', storageType: "localStorage" },
      ]);
      sets.unsubscribe();
    });

    it("emits removeItems$ when enabled", () => {
      const service = makeService({
        notifyOptions: { setItem: false, removeItem: true },
      });
      const removals = collect(service.removeItems$);

      service.remove("k");

      expect(removals.values).toEqual([
        { key: "k", storageType: "localStorage" },
      ]);
      removals.unsubscribe();
    });

    it("does not emit anything by default", () => {
      const service = makeService();
      const sets = collect(service.setItems$);
      const removals = collect(service.removeItems$);

      service.set("k", 1);
      service.remove("k");

      expect(sets.values).toEqual([]);
      expect(removals.values).toEqual([]);
      sets.unsubscribe();
      removals.unsubscribe();
    });
  });

  describe("error streams", () => {
    it("emits on errors$ and returns false when set fails", () => {
      const service = makeService();
      const errors = collect(service.errors$);

      vi
        .spyOn(window.Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new DOMException("quota exceeded", "QuotaExceededError");
        });

      expect(service.set("k", 1)).toBe(false);
      expect(errors.values).toEqual(["quota exceeded"]);
      errors.unsubscribe();
    });

    it("emits on errors$ and returns false when remove fails", () => {
      const service = makeService();
      const errors = collect(service.errors$);

      vi
        .spyOn(window.Storage.prototype, "removeItem")
        .mockImplementation(() => {
          throw new Error("boom");
        });

      expect(service.remove("k")).toBe(false);
      expect(errors.values).toEqual(["boom"]);
      errors.unsubscribe();
    });

    it("emits on errors$ and yields an empty key list when enumeration throws", () => {
      const service = makeService();
      const errors = collect(service.errors$);

      (
        service as unknown as { webStorage: { length: number; key: () => never } }
      ).webStorage = {
        length: 2,
        key: () => {
          throw new Error("boom");
        },
      };

      expect(service.keys()).toEqual([]);
      expect(errors.values).toEqual(["boom"]);
      errors.unsubscribe();
    });
  });

  describe("unsupported environments", () => {
    it("guards every operation with warnings and neutral results", () => {
      disableStorage();
      const service = makeService();
      const warnings = collect(service.warnings$);

      expect(service.isSupported).toBe(false);
      expect(service.set("k", 1)).toBe(false);
      expect(service.get("k")).toBeNull();
      expect(service.remove("k")).toBe(false);
      expect(service.keys()).toEqual([]);
      expect(service.clearAll()).toBe(false);
      expect(service.length()).toBe(0);

      expect(warnings.values).toEqual(
        Array(5).fill("LOCAL_STORAGE_NOT_SUPPORTED")
      );
      warnings.unsubscribe();
    });
  });

  describe("clearAll", () => {
    it("removes only keys of this app", () => {
      const service = makeService();

      service.set("a", 1);
      service.set("b", 2);
      window.localStorage.setItem("other.c", "keep-me");
      window.sessionStorage.setItem("ls.d", "keep-me-too");

      expect(service.clearAll()).toBe(true);

      expect(service.keys()).toEqual([]);
      expect(window.localStorage.getItem("other.c")).toBe("keep-me");
      expect(window.sessionStorage.getItem("ls.d")).toBe("keep-me-too");
    });

    it("honors the regular expression filter", () => {
      const service = makeService();

      service.set("temp-1", "x");
      service.set("temp-2", "y");
      service.set("persist", "z");

      expect(service.clearAll("^temp-\\d+$")).toBe(true);

      expect(service.keys()).toEqual(["persist"]);
    });
  });

  describe("keys / length", () => {
    it("lists unprefixed keys of this app only", () => {
      const service = makeService({ prefix: "app" });

      service.set("b", 2);
      service.set("a", 1);
      window.localStorage.setItem("foreign.key", "x");

      expect(service.keys().sort()).toEqual(["a", "b"]);
      expect(service.length()).toBe(2);
    });

    it("ignores foreign entries in length()", () => {
      const service = makeService();

      window.localStorage.setItem("unrelated", "x");

      expect(service.length()).toBe(0);
    });
  });

  describe("remove", () => {
    it("removes multiple keys", () => {
      const service = makeService();

      service.set("a", 1);
      service.set("b", 2);
      service.set("c", 3);

      expect(service.remove("a", "c")).toBe(true);
      expect(service.keys()).toEqual(["b"]);
    });
  });

  describe("add (deprecated)", () => {
    it("warns and delegates to set", () => {
      const service = makeService();

      expect(service.add("legacy", { v: 1 })).toBe(true);

      expect(warnSpy).toHaveBeenNthCalledWith(1, "This function is deprecated.");
      expect(warnSpy).toHaveBeenNthCalledWith(
        2,
        "Use `LocalStorageService.set` instead."
      );
      expect(service.get("legacy")).toEqual({ v: 1 });
    });
  });

  describe("setStorageType", () => {
    it("updates the reported storage type", () => {
      const service = makeService();

      service.setStorageType("sessionStorage");

      expect(service.getStorageType()).toBe("sessionStorage");
    });
  });

  describe("mocked storage injection", () => {
    it("uses the injected storage instead of the browser's", () => {
      const mock = new LocalStorageMock();
      const service = makeService({ prefix: "app" }, mock);

      expect(service.isSupported).toBe(true);

      service.set("k", { a: 1 });

      expect(mock.getItem("app.k")).toBe('{"a":1}');
      expect(window.localStorage.getItem("app.k")).toBeNull();
      expect(service.get<{ a: number }>("k")).toEqual({ a: 1 });
    });

    it("works even when the browser reports no storage", () => {
      disableStorage();
      const mock = new LocalStorageMock();
      const service = makeService({ prefix: "app" }, mock);

      expect(service.isSupported).toBe(true);

      service.set("k", 1);

      expect(mock.getItem("app.k")).toBe("1");
    });
  });
});
