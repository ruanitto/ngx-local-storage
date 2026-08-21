import { Injector } from "@angular/core";
import { describe, expect, it } from "vitest";

import {
  ILocalStorageServiceConfig,
  LOCAL_STORAGE_SERVICE_CONFIG,
} from "./local-storage.config.interface";
import { LocalStorageService } from "./local-storage.service";
import {
  IMockLocalStorageOptions,
  provideLocalStorage,
  provideMockLocalStorage,
} from "./local-storage.providers";
import {
  LOCAL_STORAGE_MOCK_STORAGE,
  LocalStorageMock,
} from "./local-storage-mock.storage";

type AnyProvider = { provide: unknown; useValue?: unknown; useClass?: unknown };

/**
 * `makeEnvironmentProviders` returns an opaque wrapper (`{ ɵproviders }`) in
 * dev builds; tests unwrap it to inspect the registered providers.
 */
function unwrapProviders(providers: unknown): Array<AnyProvider> {
  const wrapped = providers as { ɵproviders?: unknown };
  const list = (wrapped?.ɵproviders ?? providers) as
    | Array<AnyProvider>
    | AnyProvider;

  return Array.isArray(list) ? list : [list];
}

function findConfigProvider(providers: unknown): AnyProvider | undefined {
  return unwrapProviders(providers).find(
    (provider) => provider.provide === LOCAL_STORAGE_SERVICE_CONFIG
  );
}

describe("provideLocalStorage", () => {
  it("provides the user configuration", () => {
    const config: ILocalStorageServiceConfig = { prefix: "app", encrypt: true };
    const provider = findConfigProvider(provideLocalStorage(config));

    expect(provider?.useValue).toBe(config);
  });

  it("resolves the config through an injector", () => {
    const config: ILocalStorageServiceConfig = { prefix: "app" };
    const injector = Injector.create({
      providers: unwrapProviders(provideLocalStorage(config)),
    });

    expect(injector.get(LOCAL_STORAGE_SERVICE_CONFIG)).toBe(config);
  });
});

describe("provideMockLocalStorage", () => {
  it("applies test-friendly defaults when no config is given", () => {
    expect(findConfigProvider(provideMockLocalStorage())?.useValue).toEqual({
      prefix: "test-app",
      storageType: "localStorage",
    });
  });

  it("passes a custom configuration through untouched", () => {
    const config: ILocalStorageServiceConfig = { prefix: "custom" };

    expect(findConfigProvider(provideMockLocalStorage(config))?.useValue).toBe(
      config
    );
  });

  it("does not register an in-memory backend by default", () => {
    const injector = Injector.create({
      providers: unwrapProviders(provideMockLocalStorage()),
    });

    expect(() => injector.get(LOCAL_STORAGE_MOCK_STORAGE)).toThrow();
  });

  describe("with inMemoryStorage enabled", () => {
    const options: IMockLocalStorageOptions = { inMemoryStorage: true };

    function createWiring(config?: ILocalStorageServiceConfig) {
      window.localStorage.clear();

      const providers = provideMockLocalStorage(config, options);

      // Resolves both value and class providers exactly like the Angular
      // injector would (LocalStorageMock has an empty constructor).
      const injector = Injector.create({
        providers: unwrapProviders(providers),
      });
      const resolvedConfig = injector.get(
        LOCAL_STORAGE_SERVICE_CONFIG
      ) as ILocalStorageServiceConfig;
      const mock = injector.get(LOCAL_STORAGE_MOCK_STORAGE);
      const service = new LocalStorageService(resolvedConfig, mock);

      return {
        providers: unwrapProviders(providers),
        mockProvider: unwrapProviders(providers).find(
          (provider) => provider.provide === LOCAL_STORAGE_MOCK_STORAGE
        ),
        mock,
        service,
      };
    }

    it("registers the mock class through the token", () => {
      const { mockProvider } = createWiring({ prefix: "app" });

      expect(mockProvider?.provide).toBe(LOCAL_STORAGE_MOCK_STORAGE);
      expect(mockProvider?.useClass).toBe(LocalStorageMock);
    });

    it("resolves a single shared LocalStorageMock instance", () => {
      const { mock } = createWiring();

      expect(mock).toBeInstanceOf(LocalStorageMock);
    });

    it("applies the test-friendly default prefix", () => {
      const { mock, service } = createWiring();

      service.set("k", 1);

      expect(service.deriveKey("k")).toBe("test-app.k");
      expect(mock.getItem("test-app.k")).toBe("1");
    });

    it("isolates the service from the real localStorage", () => {
      const { service } = createWiring({ prefix: "app" });

      expect(service.isSupported).toBe(true);

      service.set("k", { secret: true });

      expect(service.get<{ secret: boolean }>("k")).toEqual({ secret: true });
      expect(window.localStorage.getItem("app.k")).toBeNull();
    });
  });
});
